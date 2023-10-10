<script lang="ts" setup>
import { ref } from 'vue'
import _ from 'lodash'
import api from '@/api'
import type { Context } from '@/api/types'
import TorrentCard from '@/components/cards/TorrentCard.vue'
import NoDataFound from '@/components/NoDataFound.vue'
import store from '@/store'

//  Defining input parameters
const props = defineProps({
  //  Keywords orTMDBID
  keyword: String,

  //  Typology
  type: String,

  //  Search fields
  area: String,
})

interface SearchTorrent extends Context {
  more?: Array<Context>
}

//  Data sheet
const dataList = ref <Array<SearchTorrent>>([])

//  List of grouped data
const groupedDataList = ref<Map<string, Context[]>>()

//  Is it refreshed
const isRefreshed = ref(false)

//  Loading progress text
const progressText = ref('')

//  Loading progress
const progressValue = ref(0)

//  Loading progressSSE
const progressEventSource = ref<EventSource>()

//  Filter forms
const filterForm = reactive({
  //  Website
  site: [] as string[],

  //  Classifier for seasonal crop yield or seasons of a tv series
  season: [] as string[],

  //  Production team
  releaseGroup: [] as string[],

  //  Video encoding
  videoCode: [] as string[],

  //  Promotion status
  freeState: [] as string[],

  //  Mass (in physics)
  edition: [] as string[],

  //  Resolution (of a photo)
  resolution: [] as string[],
})

//  Get site filtering options
const siteFilterOptions = ref<Array<string>>([])
//  Get seasonal filtering options
const seasonFilterOptions = ref<Array<string>>([])
//  Get production group filtering options
const releaseGroupFilterOptions = ref<Array<string>>([])
//  Get video encoding filtering options
const videoCodeFilterOptions = ref<Array<string>>([])
//  Get promotion status filtering options
const freeStateFilterOptions = ref<Array<string>>([])
//  Get quality filtering options
const editionFilterOptions = ref<Array<string>>([])
//  Get resolution filtering options
const resolutionFilterOptions = ref<Array<string>>([])

//  Filter cards by filter
watchEffect(() => {
  //  Empty data
  dataList.value.splice(0)

  const match = (filter: Array<string>, value: string | undefined) =>
    filter.length === 0 || (value && filter.includes(value))

  groupedDataList.value?.forEach((value) => {
    if (value.length > 0) {
      const matchData = value.filter((data) => {
        const { meta_info, torrent_info } = data
        //  Classifier for seasonal crop yield or seasons of a tv series、制作组、视频编码
        const { season_episode, resource_team, video_encode } = meta_info
        return (
          //  Website过滤
          match(filterForm.site, torrent_info.site_name)
          //  Promotion status过滤
          && match(filterForm.freeState, torrent_info.volume_factor)
          //  Classifier for seasonal crop yield or seasons of a tv series过滤
          && match(filterForm.season, season_episode)
          //  Production team过滤
          && match(filterForm.releaseGroup, resource_team)
          //  Video encoding过滤
          && match(filterForm.videoCode, video_encode)
          //  Resolution (of a photo)过滤
          && match(filterForm.resolution, meta_info.resource_pix)
          //  Mass (in physics)过滤
          && match(filterForm.edition, meta_info.edition)
        )
      })
      if (matchData.length > 0) {
        const firstData = _.cloneDeepWith(matchData[0]) as SearchTorrent
        if (matchData.length > 1)
          firstData.more = matchData.slice(1)

        dataList.value.push(firstData)
      }
    }
  })
})

//  Get subscription list data
async function fetchData(): Promise<Array<Context>> {
  try {
    let searchData: Array<Context>
    const keyword = props.keyword ?? ''
    const mtype = props.type ?? ''
    const area = props.area ?? ''
    if (!keyword) {
      //  Query last search result
      searchData = await api.get('search/last')
    }
    else {
      startLoadingProgress()
      //  PrioritizationTMDBID Precision search
      if (props.keyword?.startsWith('tmdb:') || props.keyword?.startsWith('douban:')) {
        searchData = await api.get(`search/media/${props.keyword}`, {
          params: {
            mtype,
            area,
          },
        })
      }
      else {
        //  Fuzzy search by title
        searchData = await api.get(`search/title/${props.keyword}`)
      }
      stopLoadingProgress()
    }
    isRefreshed.value = true
    return Promise.resolve(searchData)
  }
  catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

function initData() {
  // load data
  fetchData().then((data) => {
    const groupMap = new Map<string, Context[]>()

    data.forEach((item) => {
      const { torrent_info } = item
      // init options
      initOptions(item)
      // group data
      const key = `${torrent_info.title}_${torrent_info.size}`
      if (groupMap.has(key)) {
        //  Groups of the same title and size already exist， Add the current context information to the group
        const group = groupMap.get(key)
        group?.push(item)
      }
      else {
        //  Creating a new group， And add the current context information to the grouping
        groupMap.set(key, [item])
      }
    })
    groupedDataList.value = groupMap
  })
}

function initOptions(data: Context) {
  const { torrent_info, meta_info } = data
  const optionValue = (options: Array<string>, value: string | undefined) => {
    value && !options.includes(value) && options.push(value)
  }
  optionValue(siteFilterOptions.value, torrent_info?.site_name)
  optionValue(seasonFilterOptions.value, meta_info?.season_episode)
  optionValue(releaseGroupFilterOptions.value, meta_info?.resource_team)
  optionValue(videoCodeFilterOptions.value, meta_info?.video_encode)
  optionValue(freeStateFilterOptions.value, torrent_info?.volume_factor)
  optionValue(editionFilterOptions.value, meta_info?.edition)
  optionValue(resolutionFilterOptions.value, meta_info?.resource_pix)
}

//  UtilizationSSE Listening to loading progress
function startLoadingProgress() {
  progressText.value = ' Searching， Please wait....'

  const token = store.state.auth.token

  progressEventSource.value = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}system/progress/search?token=${token}`,
  )
  progressEventSource.value.onmessage = (event) => {
    const progress = JSON.parse(event.data)
    if (progress) {
      progressText.value = progress.text
      progressValue.value = progress.value
    }
  }
}

//  Stop listening for loading progress
function stopLoadingProgress() {
  progressEventSource.value?.close()
}

//  Getting data on load
onMounted(initData)
</script>

<template>
  <VCard class="bg-transparent mb-3 pt-2 shadow-none">
    <VRow>
      <VCol v-if="siteFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.site"
          :items="siteFilterOptions"
          size="small"
          density="compact"
          chips
          label=" Website"
          multiple
        />
      </VCol>
      <VCol v-if="seasonFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.season"
          :items="seasonFilterOptions"
          size="small"
          density="compact"
          chips
          label=" End of a season"
          multiple
        />
      </VCol>
      <VCol v-if="releaseGroupFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.releaseGroup"
          :items="releaseGroupFilterOptions"
          size="small"
          density="compact"
          chips
          label=" Production team"
          multiple
        />
      </VCol>
      <VCol v-if="editionFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.edition"
          :items="editionFilterOptions"
          size="small"
          density="compact"
          chips
          label=" Mass (in physics)"
          multiple
        />
      </VCol>
      <VCol v-if="resolutionFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.resolution"
          :items="resolutionFilterOptions"
          size="small"
          density="compact"
          chips
          label=" Resolution (of a photo)"
          multiple
        />
      </VCol>
      <VCol v-if="videoCodeFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.videoCode"
          :items="videoCodeFilterOptions"
          size="small"
          density="compact"
          chips
          label=" Video encoding"
          multiple
        />
      </VCol>
      <VCol v-if="freeStateFilterOptions.length > 0" cols="6" md="">
        <VSelect
          v-model="filterForm.freeState"
          :items="freeStateFilterOptions"
          size="small"
          density="compact"
          chips
          label=" Promotion status"
          multiple
        />
      </VCol>
    </VRow>
  </VCard>
  <div v-if="!isRefreshed" class="mt-12 w-full text-center text-gray-500 text-sm flex flex-col items-center">
    <VProgressCircular v-if="!props.keyword" size="48" indeterminate color="primary" />
    <VProgressCircular v-if="props.keyword" class="mb-3" color="primary" :model-value="progressValue" size="64" />
    <span>{{ progressText }}</span>
  </div>
  <div v-if="dataList.length > 0" class="grid gap-3 grid-torrent-card items-start">
    <TorrentCard v-for="data in dataList" :key="`${data.torrent_info.title}_${data.torrent_info.site_name}_${data.torrent_info.page_url}`" :torrent="data" :more="data.more" />
  </div>
  <NoDataFound
    v-if="dataList.length === 0 && isRefreshed"
    error-code="404"
    error-title=" No resources"
    error-description=" No eligible resources were searched。"
  />
</template>

<style lang="scss">
.grid-torrent-card {
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  padding-block-end: 1rem;
}
</style>

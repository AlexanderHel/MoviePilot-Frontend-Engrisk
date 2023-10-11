<script lang="ts" setup>
import type { PropType, Ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { formatSeason } from '@/@core/utils/formatters'
import api from '@/api'
import { doneNProgress, startNProgress } from '@/api/nprogress'
import type { MediaInfo, NotExistMediaInfo, Subscribe, TmdbSeason } from '@/api/types'
import router from '@/router'
import noImage from '@images/no-image.jpeg'

//  Input parameter
const props = defineProps({
  media: Object as PropType<MediaInfo>,
  width: String,
  height: String,
})

//  Checkbox
const $toast = useToast()

//  Image loading status
const isImageLoaded = ref(false)

//  Image failed to load
const imageLoadError = ref(false)

// TMDB Identifier
const tmdbFlag = ref(true)

//  Current subscription status
const isSubscribed = ref(false)

//  Local state of presence
const isExists = ref(false)

//  Missing status by season：0- Pre-existing 1- Partially missing 2- Missing in its entirety， No data exists.
const seasonsNotExisted = ref<{ [key: number]: number }>({})

//  Subscription season popups
const subscribeSeasonDialog = ref(false)

//  Season details
const seasonInfos = ref<TmdbSeason[]>([])

//  Selected subscription seasons
const seasonsSelected = ref<TmdbSeason[]>([])

//  Multiple seasons of subscription pop-up options
function subscribeSeasons() {
  subscribeSeasonDialog.value = false
  seasonsSelected.value.forEach((season) => {
    addSubscribe(season.season_number)
  })
}

//  Corner bracket color
function getChipColor(type: string) {
  if (type === ' Cinematic')
    return 'border-blue-500 bg-blue-600'
  else if (type === ' Dramas')
    return ' bg-indigo-500 border-indigo-600'
  else
    return 'border-purple-600 bg-purple-600'
}

//  Add subscription processing

async function handleAddSubscribe() {
  if (props.media?.type === ' Dramas' && props.media?.tmdb_id) {
    // TMDB Dramas
    //  Consult (a document etc)TMDB All season information
    await getMediaSeasons()
    if (!seasonInfos.value) {
      $toast.error(`${props.media?.title}  Failed to check episode information！`)
      return
    }

    //  Check the missing status of the seasons
    await checkSeasonsNotExists()
    if (!tmdbFlag.value)
      return

    if (seasonInfos.value.length === 1) {
      //  Add subscription
      addSubscribe(1)
    }
    else {
      //  Pop-up season selection list， Multi-selection support
      subscribeSeasonDialog.value = true
    }
  }
  else if (props.media?.type === ' Dramas') {
    //  Douban drama， There will only be one season.
    const season = props.media?.season ?? 1
    //  Add subscription
    addSubscribe(season)
  }
  else {
    //  Cinematic
    addSubscribe()
  }
}

//  Call (programming)API Add subscription， For a tv show, you need a season.
async function addSubscribe(season = 0) {
  //  Commencement of processing
  startNProgress()
  try {
    //  Whether or not to wash the plate
    let best_version = isExists.value ? 1 : 0
    if (season && props.media?.tmdb_id)
      //  Washout when all are present
      best_version = !seasonsNotExisted.value[season] ? 1 : 0
    //  RequestingAPI
    const result: { [key: string]: any } = await api.post('subscribe/', {
      name: props.media?.title,
      type: props.media?.type,
      year: props.media?.year,
      tmdbid: props.media?.tmdb_id,
      doubanid: props.media?.douban_id,
      season,
      best_version,
    })

    //  Subscription status
    if (result.success) {
      //  Subscription success
      isSubscribed.value = true
    }

    //  Draw attention to sth.
    showSubscribeAddToast(
      result.success,
      props.media?.title ?? '',
      season,
      result.message,
      best_version,
    )
  }
  catch (error) {
    console.error(error)
  }
  doneNProgress()
}

//  Pop-up alert to add subscription
function showSubscribeAddToast(result: boolean,
  title: string,
  season: number,
  message: string,
  best_version: number) {
  if (season)
    title = `${title} ${formatSeason(season.toString())}`

  let subname = ' Subscribe to'
  if (best_version > 0)
    subname = ' Wash edition subscription'

  if (result)
    $toast.success(`${title}  Increase${subname} Successes！`)
  else
    $toast.error(`${title}  Increase${subname} Fail (e.g. experiments)：${message}！`)
}

//  Call (programming)API Unsubscribe
async function removeSubscribe() {
  //  Commencement of processing
  startNProgress()
  try {
    const mediaid = props.media?.tmdb_id
      ? `tmdb:${props.media?.tmdb_id}`
      : `douban:${props.media?.douban_id}`

    const result: { [key: string]: any } = await api.delete(
      `subscribe/media/${mediaid}`,
      {
        params: {
          season: props.media?.season,
        },
      },
    )

    if (result.success) {
      isSubscribed.value = false
      $toast.success(`${props.media?.title}  Unsubscribe！`)
    }
    else {
      $toast.error(`${props.media?.title}  Failed to unsubscribe：${result.message}！`)
    }
  }
  catch (error) {
    console.error(error)
  }
  doneNProgress()
}

//  Check if the current media is subscribed
async function handleCheckSubscribe() {
  try {
    const result = await checkSubscribe(props.media?.season)
    if (result)
      isSubscribed.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Check if the current media already exists
async function handleCheckExists() {
  try {
    const result: { [key: string]: any } = await api.get('media/exists', {
      params: {
        tmdbid: props.media?.tmdb_id,
        title: props.media?.title,
        year: props.media?.year,
        season: props.media?.season,
        mtype: props.media?.type,
      },
    })

    if (result.success)
      isExists.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Check if you are subscribed， Drama series needs to be assigned a season
async function checkSubscribe(season = 0) {
  try {
    const mediaid = props.media?.tmdb_id
      ? `tmdb:${props.media?.tmdb_id}`
      : `douban:${props.media?.douban_id}`

    const result: Subscribe = await api.get(`subscribe/media/${mediaid}`, {
      params: {
        season,
      },
    })

    return result.id || null
  }
  catch (error) {
    console.error(error)
  }

  return null
}

//  Check the missing status of all seasons
async function checkSeasonsNotExists() {
  //  Commencement of processing
  startNProgress()
  try {
    const result: NotExistMediaInfo[] = await api.post('download/notexists', props.media)
    if (result) {
      result.forEach((item) => {
        // 0- Pre-existing 1- Partially missing 2- Missing in its entirety
        let state = 0
        if (item.episodes.length === 0)
          state = 2
        else if (item.episodes.length < item.total_episode)
          state = 1

        seasonsNotExisted.value[item.season] = state
      })
    }
  }
  catch (error) {
    $toast.error(`${props.media?.title} UnrecognizableTMDB Media information！`)
    tmdbFlag.value = false
  }

  //  Processing completed
  doneNProgress()
}

//  Consult (a document etc)TMDB All season information
async function getMediaSeasons() {
  try {
    seasonInfos.value = await api.get(`tmdb/seasons/${props.media?.tmdb_id}`)
  }
  catch (error) {
    console.error(error)
  }
}

//  Love subscription button response
function handleSubscribe() {
  if (isSubscribed.value)
    removeSubscribe()
  else
    handleAddSubscribe()
}

//  Calculate the color of the state of being
function getExistColor(season: number) {
  const state = seasonsNotExisted.value[season]
  if (!state)
    return 'success'

  if (state === 1)
    return 'warning'
  else if (state === 2)
    return 'error'
  else
    return 'success'
}

//  Calculate the text of the state of being
function getExistText(season: number) {
  const state = seasonsNotExisted.value[season]
  if (!state)
    return ' Pre-existing'

  if (state === 1)
    return ' Partially missing'
  else if (state === 2)
    return ' Deficiencies'
  else
    return ' Pre-existing'
}

//  Open detail page
function goMediaDetail() {
  router.push({
    path: '/media',
    query: {
      mediaid: `${
        props.media?.tmdb_id
          ? `tmdb:${props.media?.tmdb_id}`
          : `douban:${props.media?.douban_id}`
      }`,
      type: props.media?.type,
    },
  })
}

//  Start searching
function handleSearch() {
  router.push({
    path: '/resource',
    query: {
      keyword: `${
        props.media?.tmdb_id
          ? `tmdb:${props.media?.tmdb_id}`
          : `douban:${props.media?.douban_id}`
      }`,
      type: props.media?.type,
      area: 'title',
    },
  })
}

//  Check for subscription when loading
onBeforeMount(() => {
  handleCheckSubscribe()
  handleCheckExists()
})

//  Calculate image address
const getImgUrl: Ref<string> = computed(() => {
  if (imageLoadError.value)
    return noImage
  const url = props.media?.poster_path?.replace('original', 'w500') ?? noImage
  //  If the address containsdouban Then use a relay agent
  if (url.includes('doubanio.com'))
    return `${import.meta.env.VITE_API_BASE_URL}douban/img/${encodeURIComponent(url)}`

  return url
})

//  Patchwork season picture address
function getSeasonPoster(posterPath: string) {
  if (!posterPath)
    return ''
  return `https://image.tmdb.org/t/p/w500${posterPath}`
}

//  Commander-in-chief (military)yyyy-mm-dd Convert toyyyy Surname nianmm Moondd Date
function formatAirDate(airDate: string) {
  if (!airDate)
    return ''
  const date = new Date(airDate)
  return `${date.getFullYear()} Surname nian${date.getMonth() + 1} Moon${date.getDate()} Date`
}
//  Through (a gap)yyyy-mm-dd Year of extraction
function getYear(airDate: string) {
  if (!airDate)
    return ''
  const date = new Date(airDate)
  return date.getFullYear()
}
</script>

<template>
  <VHover v-bind="props">
    <template #default="hover">
      <VCard
        v-bind="hover.props"
        :height="props.height"
        :width="props.width"
        class="outline-none shadow ring-gray-500 rounded-lg"
        :class="{
          'transition transform-cpu duration-300 scale-105 shadow-lg': hover.isHovering,
          'ring-1': isImageLoaded,
        }"
      >
        <VImg
          aspect-ratio="2/3"
          :src="getImgUrl"
          class="object-cover aspect-w-2 aspect-h-3"
          :class="hover.isHovering ? 'on-hover' : ''"
          cover
          @load="isImageLoaded = true"
          @error="imageLoadError = true"
        >
          <template #placeholder>
            <div class="w-full h-full">
              <VSkeletonLoader class="object-cover aspect-w-2 aspect-h-3" />
            </div>
          </template>
          <!--  Type angle marker -->
          <VChip
            v-show="isImageLoaded"
            variant="elevated"
            size="small"
            :class="getChipColor(props.media?.type || '')"
            class="absolute left-2 top-2 bg-opacity-80 shadow-md text-white font-bold"
          >
            {{ props.media?.type }}
          </VChip>
          <!--  Local presence identifier -->
          <ExistIcon v-if="isExists" />
          <!--  Rating scale -->
          <VChip
            v-if="isImageLoaded && props.media?.vote_average && !isExists"
            variant="elevated"
            size="small"
            :class="getChipColor('rating')"
            class="absolute right-2 top-2 bg-opacity-80 shadow-md text-white font-bold"
          >
            {{ props.media?.vote_average }}
          </VChip>
          <!--  Particulars -->
          <VCardText
            v-show="hover.isHovering || imageLoadError"
            class="w-full flex flex-col flex-wrap justify-end align-left text-white absolute bottom-0 cursor-pointer pa-2"
            @click.stop="goMediaDetail"
          >
            <span class="font-bold">{{ props.media?.year }}</span>
            <h1 class="mb-1 text-white font-extrabold text-xl line-clamp-2 overflow-hidden text-ellipsis ...">
              {{ props.media?.title }}
            </h1>
            <p class="leading-4 line-clamp-4 overflow-hidden text-ellipsis ...">
              {{ props.media?.overview }}
            </p>
            <div class="flex align-center justify-between">
              <IconBtn
                icon="mdi-magnify"
                color="white"
                @click.stop="handleSearch"
              />
              <IconBtn
                icon="mdi-heart"
                :color="isSubscribed ? 'error' : 'white'"
                @click.stop="handleSubscribe"
              />
            </div>
          </VCardText>
        </VImg>
      </VCard>
    </template>
  </VHover>
  <!--  Subscription season popups -->
  <VBottomSheet
    v-model="subscribeSeasonDialog"
    inset
    scrollable
  >
    <VCard>
      <DialogCloseBtn @click="subscribeSeasonDialog = false" />
      <VCardTitle class="pe-10">
        Subscribe to - {{ props.media?.title }}
      </VCardTitle>
      <VCardText>
        <VList
          v-model:selected="seasonsSelected"
          lines="three"
          select-strategy="classic"
        >
          <VListItem
            v-for="(item, i) in seasonInfos" :key="i"
            :value="item"
          >
            <template #prepend>
              <VImg
                height="90"
                width="60"
                :src="getSeasonPoster(item.poster_path || '')"
                aspect-ratio="2/3"
                class="object-cover rounded shadow ring-gray-500 me-3"
                cover
              >
                <template #placeholder>
                  <div class="w-full h-full">
                    <VSkeletonLoader class="object-cover aspect-w-2 aspect-h-3" />
                  </div>
                </template>
              </VImg>
            </template>
            <VListItemTitle>
              (prefix indicating ordinal number, e.g. first, number two etc) {{ item.season_number }}  Classifier for seasonal crop yield or seasons of a tv series
            </VListItemTitle>
            <VListItemSubtitle class="mt-1 me-2">
              <VChip
                v-if="item.vote_average"
                color="primary"
                size="small"
                class="mb-1"
              >
                <VIcon icon="mdi-star" /> {{ item.vote_average }}
              </VChip>
              {{ getYear(item.air_date || '') }} • {{ item.episode_count }}  Classifier for sections of a tv series e.g. episode
            </VListItemSubtitle>
            <VListItemSubtitle>
              《{{ media?.title }}》(prefix indicating ordinal number, e.g. first, number two etc) {{ item.season_number }}  Classifier for seasonal crop yield or seasons of a tv series于 {{ formatAirDate(item.air_date || '') }} 首播。
            </VListItemSubtitle>
            <VListItemSubtitle>
              <VChip
                v-if="seasonsNotExisted"
                class="mt-2"
                size="small"
                :color="getExistColor(item.season_number || 0)"
              >
                {{ getExistText(item.season_number || 0) }}
              </VChip>
            </VListItemSubtitle>
            <template #append="{ isSelected }">
              <VListItemAction start>
                <VSwitch :model-value="isSelected" />
              </VListItemAction>
            </template>
          </VListItem>
        </VList>
      </VCardText>
      <div class="my-2 text-center">
        <VBtn
          :disabled="seasonsSelected.length === 0"
          width="30%"
          @click="subscribeSeasons"
        >
          {{ seasonsSelected.length === 0 ? ' Please select a subscription season' : ' Submit a subscription' }}
        </VBtn>
      </div>
    </VCard>
  </VBottomSheet>
</template>

<style lang="scss">
.on-hover img {
  @apply brightness-50;
}
</style>

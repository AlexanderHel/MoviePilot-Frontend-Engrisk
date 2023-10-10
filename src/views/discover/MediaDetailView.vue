<script setup lang="ts">
import { useToast } from 'vue-toast-notification'
import PersonCardSlideView from './PersonCardSlideView.vue'
import MediaCardSlideView from './MediaCardSlideView.vue'
import api from '@/api'
import type { MediaInfo, NotExistMediaInfo, Subscribe, TmdbEpisode } from '@/api/types'
import NoDataFound from '@/components/NoDataFound.vue'
import { doneNProgress, startNProgress } from '@/api/nprogress'
import { formatSeason } from '@/@core/utils/formatters'
import router from '@/router'

//  Input parameter
const mediaProps = defineProps({
  mediaid: String,
  type: String,
})

//  Checkbox
const $toast = useToast()

//  Media details
const mediaDetail = ref<MediaInfo>({} as MediaInfo)

//  Local availability
const isExists = ref(false)

//  Subscribed or not
const isSubscribed = ref(false)

//  Whether or not the loading has been completed
const isRefreshed = ref(false)

//  Stores episode information for each season
const seasonEpisodesInfo = ref({} as { [key: number]: TmdbEpisode[] })

//  Missing status by season：0- Pre-existing 1- Partially missing 2- Missing in its entirety， No data exists.
const seasonsNotExisted = ref<{ [key: number]: number }>({})

//  Subscription status by season
const seasonsSubscribed = ref<{ [key: number]: boolean }>({})

//  InvocationsAPI Inquiry details
async function getMediaDetail() {
  if (mediaProps.mediaid && mediaProps.type) {
    mediaDetail.value = await api.get(`media/${mediaProps.mediaid}`, {
      params: {
        type_name: mediaProps.type,
      },
    })
    isRefreshed.value = true
    if (!mediaDetail.value.tmdb_id && !mediaDetail.value.douban_id)
      return

    //  Checking the presence status
    if (mediaDetail.value.type === ' Cinematic')
      checkMovieExists()
    else
      checkSeasonsNotExists()
    //  Checking subscription status
    if (mediaDetail.value.type === ' Cinematic')
      checkMovieSubscribed()
    else
      checkSeasonsSubscribed()
  }
}

//  Call (programming)API Loading season episode information
async function loadSeasonEpisodes(season: number) {
  if (seasonEpisodesInfo.value[season])
    return

  try {
    const result: TmdbEpisode[] = await api.get(`tmdb/${mediaDetail.value.tmdb_id}/${season}`)
    seasonEpisodesInfo.value[season] = result || []
  }
  catch (error) {
    console.error(error)
  }
}

//  Check if the current media already exists
async function checkMovieExists() {
  try {
    const result: { [key: string]: any } = await api.get('media/exists', {
      params: {
        tmdbid: mediaDetail.value.tmdb_id,
        title: mediaDetail.value.title,
        year: mediaDetail.value.year,
        season: mediaDetail.value.season,
        mtype: mediaDetail.value.type,
      },
    })

    if (result.success)
      isExists.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Check if the current media is subscribed
async function checkSubscribe(season = 0) {
  try {
    const mediaid = `tmdb:${mediaDetail.value.tmdb_id}`

    const result: Subscribe = await api.get(`subscribe/media/${mediaid}`, {
      params: {
        season,
      },
    })

    if (result.id)
      return true
  }
  catch (error) {
    console.error(error)
  }

  return false
}

//  Check the missing status of all seasons
async function checkSeasonsNotExists() {
  if (mediaDetail.value.type !== ' Dramas')
    return
  try {
    const result: NotExistMediaInfo[] = await api.post('download/notexists', mediaDetail.value)
    if (result) {
      if (result.length === 0)
        isExists.value = true

      result.forEach((item) => {
        // 0- Pre-existing 1- Partially missing 2- Missing in its entirety
        let state = 0
        if (item.episodes.length === 0)
          state = 2
        else if (item.episodes.length < item.total_episode)
          state = 1
        if (state !== 2)
          isExists.value = true
        seasonsNotExisted.value[item.season] = state
      })
    }
  }
  catch (error) {
    console.error(error)
  }
}

//  Check movie subscription status
async function checkMovieSubscribed() {
  if (mediaDetail.value.type !== ' Cinematic')
    return
  isSubscribed.value = await checkSubscribe()
}

//  Filter out the first0 Classifier for seasonal crop yield or seasons of a tv series
const getMediaSeasons = computed(() => {
  return mediaDetail.value?.season_info?.filter(season => season.season_number !== 0)
})

//  Check the subscription status of all seasons
async function checkSeasonsSubscribed() {
  if (mediaDetail.value.type !== ' Dramas')
    return
  try {
    mediaDetail.value?.season_info?.forEach(async (item) => {
      seasonsSubscribed.value[item.season_number ?? 0] = await checkSubscribe(item.season_number)
    })
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Add subscription， For a tv show, you need a season.
async function addSubscribe(season = 0) {
  //  Commencement of processing
  startNProgress()
  try {
    //  Whether or not to wash the plate
    let best_version = isExists.value ? 1 : 0
    if (season)
      //  Washout when all are present
      best_version = !seasonsNotExisted.value[season] ? 1 : 0
    //  RequestingAPI
    const result: { [key: string]: any } = await api.post('subscribe/', {
      name: mediaDetail.value?.title,
      type: mediaDetail.value?.type,
      year: mediaDetail.value?.year,
      tmdbid: mediaDetail.value?.tmdb_id,
      doubanid: mediaDetail.value?.douban_id,
      season,
      best_version,
    })

    //  Subscription status
    if (result.success) {
      //  Subscription success
      isSubscribed.value = true
      if (season)
        seasonsSubscribed.value[season] = true
    }

    //  Draw attention to sth.
    showSubscribeAddToast(
      result.success,
      mediaDetail.value?.title ?? '',
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
async function removeSubscribe(season: number) {
  //  Commencement of processing
  startNProgress()
  try {
    const mediaid = mediaDetail.value?.tmdb_id
      ? `tmdb:${mediaDetail.value?.tmdb_id}`
      : `douban:${mediaDetail.value?.douban_id}`

    const result: { [key: string]: any } = await api.delete(
      `subscribe/media/${mediaid}`,
      {
        params: {
          season,
        },
      },
    )

    if (result.success) {
      isSubscribed.value = false
      if (season)
        seasonsSubscribed.value[season] = false
      $toast.success(`${mediaDetail.value?.title}  Unsubscribe！`)
    }
    else {
      $toast.error(`${mediaDetail.value?.title}  Failed to unsubscribe：${result.message}！`)
    }
  }
  catch (error) {
    console.error(error)
  }
  doneNProgress()
}

//  Subscribe button response
function handleSubscribe(season = 0) {
  if (isSubscribed.value)
    removeSubscribe(season)
  else
    addSubscribe(season)
}

//  Through (a gap)genres Gettingname， Utilization、 Segregation
function getGenresName(genres: any[]) {
  return genres.map(genre => genre.name).join('、')
}

//  AssembleTheMovieDb Address
function getTheMovieDbLink() {
  const mtype = mediaProps.type === ' Cinematic' ? 'movie' : 'tv'
  return `https://www.themoviedb.org/${mtype}/${mediaDetail.value.tmdb_id}`
}

//  Patchwork doula address
function getDoubanLink() {
  return `https://movie.douban.com/subject/${mediaDetail.value.douban_id}`
}

//  AssembleIMDB Address
function getImdbLink() {
  return `https://www.imdb.com/title/${mediaDetail.value.imdb_id}`
}

//  AssembleTVDB Address
function getTvdbLink() {
  return `https://www.thetvdb.com/series/${mediaDetail.value.tvdb_id}`
}

//  Picture address of the assembly set
function getEpisodeImage(stillPath: string) {
  if (!stillPath)
    return ''
  return `https://image.tmdb.org/t/p/w500${stillPath}`
}

// TMDB Images are converted tow500 Adults and children
function getW500Image(url = '') {
  if (!url)
    return ''
  return url.replace('original', 'w500')
}

//  Get the name of the country of issue
const getProductionCountries = computed(() => {
  return mediaDetail.value.production_countries?.map(country => country.name)
})

//  Get the name of the issuing company
const getProductionCompanies = computed(() => {
  return mediaDetail.value.production_companies?.map(company => company.name)
})

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

//  Calculate subscription icon
const getSubscribeIcon = computed(() => {
  if (isSubscribed.value)
    return 'mdi-heart'
  else
    return 'mdi-heart-outline'
})

//  Calculate subscription button color
const getSubscribeColor = computed(() => {
  if (isSubscribed.value)
    return 'error'
  else
    return 'warning'
})

//  Utilization、 Assembling arrays as strings
function joinArray(arr: string[]) {
  return arr.join('、')
}

//  Start searching
function handleSearch(area: string) {
  router.push({
    path: '/resource',
    query: {
      keyword: `tmdb:${mediaDetail.value.tmdb_id}`,
      type: mediaDetail.value.type,
      area,
    },
  })
}

onBeforeMount(() => {
  getMediaDetail()
})
</script>

<template>
  <div
    v-if="!isRefreshed"
    class="mt-12 w-full text-center text-gray-500 text-sm flex flex-col items-center"
  >
    <VProgressCircular
      size="48"
      indeterminate
      color="primary"
    />
  </div>
  <div v-if="mediaDetail.tmdb_id || mediaDetail.douban_id" class="max-w-8xl mx-auto px-4">
    <template v-if="mediaDetail.backdrop_path">
      <div class="vue-media-back absolute left-0 top-0 w-full h-96">
        <VImg class="h-96" :src="mediaDetail.backdrop_path" cover />
      </div>
      <div class="vue-media-back absolute left-0 top-0 w-full h-96" />
    </template>
    <div class="media-page">
      <div class="media-header">
        <div class="media-poster">
          <VImg :src="getW500Image(mediaDetail.poster_path)" cover class="object-cover aspect-w-2 aspect-h-3 ring-1 ring-gray-500">
            <template #placeholder>
              <div class="w-full h-full">
                <VSkeletonLoader class="object-cover aspect-w-2 aspect-h-3" />
              </div>
            </template>
          </VImg>
        </div>
        <div class="media-title">
          <div v-if="isExists" class="media-status">
            <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap transition !no-underline bg-green-500 bg-opacity-80 border border-green-500 !text-green-100 hover:bg-green-500 hover:bg-opacity-100 false overflow-hidden">
              <div class="relative z-20 flex items-center false"><span> In stock</span></div>
            </span>
          </div>
          <h1 class="d-flex flex-column flex-lg-row align-baseline justify-center justify-lg-start">
            <div class="align-self-center align-self-lg-end">
              {{ mediaDetail.title }}
            </div>
            <div v-if="mediaDetail.year" class="text-lg align-self-center align-self-lg-end">
              （{{ mediaDetail.year }}）
            </div>
          </h1>
          <span class="media-attributes">
            <span v-if="mediaDetail.runtime || mediaDetail.episode_run_time[0]">{{ mediaDetail.runtime || mediaDetail.episode_run_time[0] }}  Minutes</span>
            <span v-if="(mediaDetail.runtime || mediaDetail.episode_run_time[0]) && mediaDetail.genres" class="mx-1"> | </span>
            <span v-if="mediaDetail.genres">{{ getGenresName(mediaDetail.genres || []) }}</span>
          </span>
        </div>
        <div class="media-actions">
          <VBtn v-if="mediaDetail.tmdb_id" variant="tonal" color="info">
            <template #prepend>
              <VIcon icon="mdi-magnify" />
            </template>
            Search resources
            <VMenu
              activator="parent"
              close-on-content-click
            >
              <VList>
                <VListItem
                  variant="plain"
                  @click="handleSearch('title')"
                >
                  <VListItemTitle> Caption</VListItemTitle>
                </VListItem>
                <VListItem
                  v-show="mediaDetail.imdb_id"
                  variant="plain"
                  @click="handleSearch('imdbid')"
                >
                  <VListItemTitle>IMDB Link (on a website)</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </VBtn>
          <VBtn v-if="mediaDetail.type === ' Cinematic'" class="ms-2" :color="getSubscribeColor" variant="tonal" @click="handleSubscribe(0)">
            <template #prepend>
              <VIcon :icon="getSubscribeIcon" />
            </template>
            {{ isSubscribed ? ' Subscribed' : ' Subscribe to' }}
          </VBtn>
        </div>
      </div>
      <div class="media-overview">
        <div class="media-overview-left">
          <div v-if="mediaDetail.tagline" class="tagline">
            {{ mediaDetail.tagline }}
          </div>
          <h2 v-if="mediaDetail.overview">
            Synopsis
          </h2>
          <p>{{ mediaDetail.overview }}</p>
          <ul v-if="mediaDetail.tmdb_id" class="media-crew">
            <li v-for="director in mediaDetail.directors" :key="director.id">
              <span>{{ director.job }}</span>
              <a class="crew-name" :href="`person?personid=${director.id}`" target="_blank">{{ director.name }}</a>
            </li>
          </ul>
          <ul v-if="!mediaDetail.tmdb_id && mediaDetail.douban_id" class="media-crew">
            <li v-for="director in mediaDetail.directors" :key="director.id">
              <span>{{ joinArray(director.roles) }}</span>
              <a class="crew-name" :href="`${director.url}`" target="_blank">{{ director.name }}</a>
            </li>
            <li v-for="director in mediaDetail.actors" :key="director.id">
              <span>{{ joinArray(director.roles) }}</span>
              <a class="crew-name" :href="`${director.url}`" target="_blank">{{ director.name }}</a>
            </li>
          </ul>
          <div class="mt-6">
            <a v-if="mediaDetail.tmdb_id" class="mb-2 mr-2 inline-flex last:mr-0" :href="getTheMovieDbLink()" target="_blank">
              <div class="inline-flex cursor-pointer items-center rounded-full bg-gray-600 px-2 py-1 text-sm text-gray-200 ring-1 ring-gray-500 transition hover:bg-gray-700">
                <VIcon icon="mdi-link" />
                <span class="ms-1">TheMovieDb</span>
              </div>
            </a>
            <a v-if="mediaDetail.douban_id" class="mb-2 mr-2 inline-flex last:mr-0" :href="getDoubanLink()" target="_blank">
              <div class="inline-flex cursor-pointer items-center rounded-full bg-gray-600 px-2 py-1 text-sm text-gray-200 ring-1 ring-gray-500 transition hover:bg-gray-700">
                <VIcon icon="mdi-link" />
                <span class="ms-1"> Douban, prc social networking website</span>
              </div>
            </a>
            <a v-if="mediaDetail.imdb_id" class="mb-2 mr-2 inline-flex last:mr-0" :href="getImdbLink()" target="_blank">
              <div class="inline-flex cursor-pointer items-center rounded-full bg-gray-600 px-2 py-1 text-sm text-gray-200 ring-1 ring-gray-500 transition hover:bg-gray-700">
                <VIcon icon="mdi-link" />
                <span class="ms-1">IMDb</span>
              </div>
            </a>
            <a v-if="mediaDetail.tvdb_id" class="mb-2 mr-2 inline-flex last:mr-0" :href="getTvdbLink()" target="_blank">
              <div class="inline-flex cursor-pointer items-center rounded-full bg-gray-600 px-2 py-1 text-sm text-gray-200 ring-1 ring-gray-500 transition hover:bg-gray-700">
                <VIcon icon="mdi-link" />
                <span class="ms-1">TheTvDb</span>
              </div>
            </a>
          </div>
          <h2 v-if="mediaDetail.type === ' Dramas' && mediaDetail.tmdb_id" class="py-4">
            Classifier for seasonal crop yield or seasons of a tv series
          </h2>
          <div v-if="mediaDetail.type === ' Dramas' && mediaDetail.tmdb_id" class="flex w-full flex-col space-y-2">
            <VExpansionPanels>
              <VExpansionPanel
                v-for="season in getMediaSeasons"
                :key="season.season_number"
                @group:selected="loadSeasonEpisodes(season.season_number || 0)"
              >
                <VExpansionPanelTitle>
                  <template #default>
                    <div class="flex flex-row items-center justify-between">
                      <span class="font-weight-bold">第 {{ season.season_number }} Classifier for seasonal crop yield or seasons of a tv series</span>
                      <VChip size="small" class="ms-1">
                        {{ season.episode_count }} Classifier for sections of a tv series e.g. episode
                      </VChip>
                      <div class="absolute right-12">
                        <VChip
                          v-if="seasonsNotExisted"
                          :color="getExistColor(season.season_number || 0)"
                          flat
                        >
                          {{ getExistText(season.season_number || 0) }}
                        </VChip>
                        <IconBtn
                          class="ms-1" :color="seasonsSubscribed[season.season_number || 0] ? 'error' : 'warning'" variant="text"
                          @click.stop="handleSubscribe(season.season_number)"
                        >
                          <VIcon :icon="seasonsSubscribed[season.season_number || 0] ? 'mdi-heart' : 'mdi-heart-outline'" />
                        </IconBtn>
                      </div>
                    </div>
                  </template>
                </VExpansionPanelTitle>
                <VExpansionPanelText>
                  <template #default>
                    <div
                      v-if="!seasonEpisodesInfo[season.season_number || 0]"
                      class="mt-3 w-full text-center text-gray-500 text-sm flex flex-col items-center"
                    >
                      <VProgressCircular
                        size="48"
                        indeterminate
                        color="primary"
                      />
                    </div>
                    <div class="flex flex-col justify-center divide-y divide-gray-700">
                      <div v-for="episode in seasonEpisodesInfo[season.season_number || 0]" :key="episode.episode_number" class="flex flex-col space-y-4 py-4 xl:flex-row xl:space-y-4 xl:space-x-4">
                        <div class="flex-1">
                          <div class="flex flex-col space-y-2 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-2">
                            <h3 class="text-lg">
                              {{ episode.episode_number }} - {{ episode.name }}
                            </h3>
                            <div class="flex items-center space-x-2">
                              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap cursor-default bg-gray-700 !text-gray-300">
                                {{ episode.air_date }}
                              </span>
                            </div>
                          </div>
                          <p>{{ episode.overview }}</p>
                        </div>
                        <VImg cover class="rounded-lg" max-width="15rem" :src="getEpisodeImage(episode.still_path || '')" alt="" />
                      </div>
                    </div>
                  </template>
                </VExpansionPanelText>
              </VExpansionPanel>
            </VExpansionPanels>
          </div>
        </div>
        <div v-if="mediaDetail.tmdb_id" class="media-overview-right">
          <div class="media-facts">
            <div v-if="mediaDetail.vote_average" class="media-ratings">
              <VRating
                v-model="mediaDetail.vote_average"
                density="compact"
                length="10"
                class="ma-2"
                readonly
              />
            </div>
            <div v-if="mediaDetail.tmdb_id" class="media-fact">
              <span>ID</span>
              <span class="media-fact-value">{{ mediaDetail.tmdb_id }}</span>
            </div>
            <div v-if="mediaDetail.original_title || mediaDetail.original_name" class="media-fact">
              <span> Original title</span>
              <span class="media-fact-value">{{ mediaDetail.original_title || mediaDetail.original_name }}</span>
            </div>
            <div v-if="mediaDetail.status" class="media-fact">
              <span> State of affairs</span>
              <span class="media-fact-value">{{ mediaDetail.status }}</span>
            </div>
            <div v-if="mediaDetail.release_date || mediaDetail.first_air_date" class="media-fact">
              <span> Release date</span>
              <span class="media-fact-value">
                <span class="flex items-center justify-end">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true" class="h-4 w-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                  <span class="ml-1.5">{{ mediaDetail.release_date || mediaDetail.first_air_date }}</span>
                </span>
              </span>
            </div>
            <div v-if="mediaDetail.original_language" class="media-fact">
              <span> Original language</span>
              <span class="media-fact-value">{{ mediaDetail.original_language }}</span>
            </div>
            <div v-if="mediaDetail.production_countries" class="media-fact">
              <span> Producing country</span>
              <span class="media-fact-value">
                <span v-for="country in getProductionCountries" :key="country" class="flex items-center justify-end text-end">
                  {{ country }}
                </span>
              </span>
            </div>
            <div class="media-fact border-b-0">
              <span> Production company</span>
              <span class="media-fact-value text-end">
                <span v-for="company in getProductionCompanies" :key="company" class="block">{{ company }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="mediaDetail.tmdb_id">
        <PersonCardSlideView
          :apipath="`tmdb/credits/${mediaDetail.tmdb_id}/${mediaProps.type}`"
          :linkurl="`/credits/tmdb/credits/${mediaDetail.tmdb_id}/${mediaProps.type}?title= Dramatis personae`"
          title=" Dramatis personae"
        />
      </div>
      <div v-if="mediaDetail.tmdb_id">
        <MediaCardSlideView
          :apipath="`tmdb/recommend/${mediaDetail.tmdb_id}/${mediaProps.type}`"
          :linkurl="`/browse/tmdb/recommend/${mediaDetail.tmdb_id}/${mediaProps.type}?title= Testimonials`"
          title=" Testimonials"
        />
      </div>
      <div v-if="mediaDetail.tmdb_id">
        <MediaCardSlideView
          :apipath="`tmdb/similar/${mediaDetail.tmdb_id}/${mediaProps.type}`"
          :linkurl="`/browse/tmdb/similar/${mediaDetail.tmdb_id}/${mediaProps.type}?title= Analog`"
          title=" Analog"
        />
      </div>
    </div>
  </div>
  <NoDataFound
    v-if="!mediaDetail.tmdb_id && !mediaDetail.douban_id && isRefreshed"
    error-code="500"
    error-title=" There's been a mistake.！"
    error-description=" Not recognizedTMDB Media information。"
  />
</template>

<style lang="scss">
.vue-media-back {
  background-image:
    linear-gradient(180deg, rgba(var(--v-theme-background), 0) 50%, rgba(var(--v-theme-background), 1) 100%),
    linear-gradient(90deg, rgba(var(--v-theme-background), 0) 50%, rgba(var(--v-theme-background), 1) 100%),
    linear-gradient(270deg, rgba(var(--v-theme-background), 0) 50%, rgba(var(--v-theme-background), 1) 100%);
  box-shadow: 0 0 0 2px rgb(var(--v-theme-background));
  margin-block-start: calc(-70px - env(safe-area-inset-top));
}

.media-page {
  position: relative;
  background-position: 50%;
  background-size: cover;
  margin-block-start: calc(-4rem - env(safe-area-inset-top));
  margin-inline: -1rem;
  padding-block-start: calc(4rem + env(safe-area-inset-top));
  padding-inline: 1rem;
}

.media-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-block-start: 1rem;
}

@media (min-width: 1280px) {
  .media-header {
    flex-direction: row;
    align-items: flex-end;
  }
}

.media-overview {
  display: flex;
  flex-direction: column;
  padding-top: 2rem;
  padding-bottom: 1rem;
}

@media (min-width: 1024px) {
  .media-overview {
    flex-direction: row;
  }
}

.media-poster {
  width: 8rem;
  overflow: hidden;
  border-radius: .25rem;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, .1), 0 1px 2px -1px rgba(0, 0, 0, .1);
  --tw-shadow-colored: 0 1px 3px 0 var(--tw-shadow-color), 0 1px 2px -1px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
}

@media (min-width: 1280px) {
  .media-poster {
    margin-right: 1rem;
    width: 13rem;
  }
}

@media (min-width: 768px) {
  .media-poster {
    width: 11rem;
    border-radius: .5rem;
    --tw-shadow: 0 25px 50px -12px rgba(0, 0, 0, .25);
    --tw-shadow-colored: 0 25px 50px -12px var(--tw-shadow-color);
    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  }
}

.media-title {
  margin-top: 1rem;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  text-align: center;
}

@media (min-width: 1280px) {
  .media-title {
    margin-right: 1rem;
    margin-top: 0;
    text-align: left;
  }
}

.media-title>h1 {
    font-size: 1.5rem;
    line-height: 2rem;
    font-weight: 700;
}

@media (min-width: 1280px) {
  .media-title>h1 {
      font-size: 2.25rem;
      line-height: 2.5rem;
  }
}

ul.media-crew {
    margin-top: 1.5rem;
    display: grid;
    grid-template-columns: repeat(2,minmax(0,1fr));
    gap: 1.5rem;
}

@media (min-width: 640px) {
  ul.media-crew {
      grid-template-columns: repeat(3,minmax(0,1fr));
  }
}

ul.media-crew>li {
    grid-column: span 1/span 1;
    display: flex;
    flex-direction: column;
    font-weight: 700;
}

a.crew-name {
    font-weight: 400;
}

.media-status {
  margin-bottom: .5rem;
}

.media-attributes {
  margin-top: .25rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

@media (min-width: 1280px) {
  .media-attributes {
    margin-top: 0;
    justify-content: flex-start;
    font-size: 1rem;
    line-height: 1.5rem;
  }
}

@media (min-width: 640px) {
  .media-attributes {
    font-size: .875rem;
    line-height: 1.25rem;
  }
}

.media-actions {
  position: relative;
  margin-top: 1rem;
  display: flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

@media (min-width: 1280px) {
  .media-actions {
    margin-top: 0;
  }
}

@media (min-width: 640px) {
  .media-actions {
    flex-wrap: nowrap;
    justify-content: flex-end;
  }
}

.media-overview-left {
  flex: 1 1 0%;
}

@media (min-width: 1024px) {
  .media-overview-left {
    margin-right: 2rem;
  }
}

.media-overview-right {
  margin-top: 2rem;
  width: 100%;
}

@media (min-width: 1024px) {
  .media-overview-right {
    margin-top: 0;
    width: 20rem;
  }
}

.media-facts {
    border-radius: 0.5rem;
    border-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(55 65 81/var(--tw-border-opacity));
    --tw-bg-opacity: 1;
    font-size: .875rem;
    line-height: 1.25rem;
    font-weight: 700;
    --tw-text-opacity: 1;
}

.media-ratings {
    border-bottom-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(55 65 81/var(--tw-border-opacity));
    padding: 0.5rem 1rem;
    font-weight: 500;
}

.media-ratings {
    display: flex;
    align-items: center;
    justify-content: center;
}

.media-fact {
    display: flex;
    justify-content: space-between;
    border-bottom-width: 1px;
    --tw-border-opacity: 1;
    border-color: rgb(55 65 81/var(--tw-border-opacity));
    padding: 0.5rem 1rem;
}

.media-overview h2 {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 700;
}

@media (min-width: 640px) {
  .media-overview h2 {
      font-size: 1.5rem;
      line-height: 2rem;
  }
}

.tagline {
    margin-bottom: 1rem;
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-style: italic;
}

@media (min-width: 1024px) {
  .tagline {
      font-size: 1.5rem;
      line-height: 2rem;
  }
}
</style>

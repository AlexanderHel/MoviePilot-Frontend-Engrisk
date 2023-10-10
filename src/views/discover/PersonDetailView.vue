<script setup lang="ts">
import MediaCardListView from './MediaCardListView.vue'
import api from '@/api'
import personIcon from '@images/misc/person.png'
import type { TmdbPerson } from '@/api/types'
import NoDataFound from '@/components/NoDataFound.vue'

//  Input parameter
const personProps = defineProps({
  personid: String,
  type: String,
})

//  Media details
const personDetail = ref<TmdbPerson>({} as TmdbPerson)

//  Whether or not the loading has been completed
const isRefreshed = ref(false)

//  Whether the character image is loaded or not
const isImageLoaded = ref(false)

//  Call (programming)API Inquiry details
async function getPersonDetail() {
  if (personProps.personid) {
    personDetail.value = await api.get(`tmdb/person/${personProps.personid}`)
    isRefreshed.value = true
  }
}

//  Character picture address
function getPersonImage() {
  if (!personDetail.value?.profile_path)
    return personIcon
  return `https://image.tmdb.org/t/p/w600_and_h900_bestv2${personDetail.value?.profile_path}`
}

//  Split the array of aliases into、 Delimited string
function getAlsoKnownAs() {
  if (!personDetail.value?.also_known_as)
    return ''
  return personDetail.value.also_known_as.join('、')
}

onBeforeMount(() => {
  getPersonDetail()
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
  <div v-if="personDetail.id" class="max-w-8xl mx-auto px-4">
    <div class="relative z-10 mt-4 mb-8 flex flex-col items-center lg:flex-row ">
      <VAvatar
        size="200"
        :class="{
          'ring-1 ring-gray-700': isImageLoaded,
        }"
      >
        <VImg
          v-img
          :src="getPersonImage()"
          cover
          @load="isImageLoaded = true"
        />
      </VAvatar>
      <div class="text-start ms-3 md:text-center">
        <h1 class="text-3xl lg:text-4xl">
          {{ personDetail.name }}
        </h1>
        <div class="mt-1 mb-2 space-y-1 text-xs sm:text-sm lg:text-base">
          <div>
            <span v-if="personDetail.birthday">{{ personDetail.birthday }}</span>
            <span v-if="personDetail.place_of_birth"> | </span>
            <span v-if="personDetail.place_of_birth">{{ personDetail.place_of_birth }}</span>
          </div>
          <div v-if="personDetail.also_known_as">
            Nickname：{{ getAlsoKnownAs() }}
          </div>
        </div>
      </div>
    </div>
    <div class="relative text-left">
      <div class="group outline-none ring-0" role="button" tabindex="-1">
        <p class="pt-2 text-sm lg:text-base" style="overflow-wrap: break-word;">
          {{ personDetail.biography }}
        </p>
      </div>
    </div>
    <div>
      <div class="slider-header">
        <RouterLink :to="`/browse/tmdb/person/credits/${personDetail.id}?title= Act`" class="slider-title">
          <span> Act</span>
          <VIcon icon="mdi-arrow-right-circle-outline" class="ms-1" />
        </RouterLink>
      </div>
      <MediaCardListView :apipath="`tmdb/person/credits/${personDetail.id}`" />
    </div>
  </div>
  <NoDataFound
    v-if="!personDetail.id && isRefreshed"
    error-code="500"
    error-title=" There's been a mistake.！"
    error-description=" No access to media information， Please check the network connection。"
  />
</template>

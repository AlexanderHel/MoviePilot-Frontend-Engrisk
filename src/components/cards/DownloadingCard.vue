<script lang="ts" setup>
import api from '@/api'
import type { DownloadingInfo } from '@/api/types'

//  Input parameter
const props = defineProps({
  info: Object as PropType<DownloadingInfo>,
})

//  Whether to display the card
const cardState = ref(true)

//  Progress bar
function getPercentage() {
  return props.info?.progress ?? 0
}

//  Tempo
function getSpeedText() {
  return `↑ ${props.info?.upspeed}/s ↓ ${props.info?.dlspeed}/s`
}

//  Download status
const isDownloading = ref(props.info?.state === 'downloading')

//  Whether the image has finished loading
const imageLoaded = ref(false)

//  Image load completion response
function imageLoadHandler() {
  imageLoaded.value = true
}

//  Calculated text classes
function getTextClass() {
  return imageLoaded.value ? 'text-white' : ''
}

//  Download status控制
async function toggleDownload() {
  const operation = isDownloading.value ? 'stop' : 'start'
  try {
    const result: { [key: string]: any } = await api.get(
      `download/${operation}/${props.info?.hash}`,
    )

    if (result.success)
      isDownloading.value = !isDownloading.value
  }
  catch (error) {
    console.error(error)
  }
}

//  Delete the undercut
async function deleteDownload() {
  try {
    await api.delete(`download/${props.info?.hash}`)
    cardState.value = false
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <VCard
    v-if="cardState"
    :key="props.info?.hash"
  >
    <template #image>
      <VImg
        :src="props.info?.media.image"
        aspect-ratio="2/3"
        cover
        class="brightness-50"
        @load="imageLoadHandler"
      />
    </template>

    <VCardTitle
      class="break-words whitespace-normal"
      :class="getTextClass()"
    >
      {{ props.info?.media.title || props.info?.name }}
      {{ props.info?.media.episode ? `${props.info?.media.season} ${props.info?.media.episode}` : props.info?.season_episode }}
    </VCardTitle>

    <VCardSubtitle
      class="break-words whitespace-normal"
      :class="getTextClass()"
    >
      {{ props.info?.title }}
    </VCardSubtitle>

    <VCardText
      class="text-subtitle-1 pt-3 pb-1"
      :class="getTextClass()"
    >
      {{ getSpeedText() }}
    </VCardText>

    <VCardText
      v-if="getPercentage() > 0"
      :class="getTextClass()"
    >
      <VProgressLinear :model-value="getPercentage()" />
    </VCardText>

    <VCardActions class="justify-space-between">
      <VBtn
        :icon="`${isDownloading ? 'mdi-pause' : 'mdi-play'}`"
        @click="toggleDownload"
      />
      <VBtn
        color="error"
        icon="mdi-trash-can-outline"
        @click="deleteDownload"
      />
    </VCardActions>
  </VCard>
</template>

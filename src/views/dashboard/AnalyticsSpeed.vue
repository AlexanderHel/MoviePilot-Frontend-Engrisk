<script setup lang="ts">
import { formatFileSize } from '@/@core/utils/formatters'
import api from '@/api'
import type { DownloaderInfo } from '@/api/types'

//  Timers
let refreshTimer: NodeJS.Timer | null = null

//  Downloader information
const downloadInfo = ref<DownloaderInfo>({
  //  Download speed
  download_speed: 0,

  //  Upload speed
  upload_speed: 0,

  //  Downloads
  download_size: 0,

  //  Upload volume
  upload_size: 0,

  //  Headroom
  free_space: 0,
})

//  Displayed item
const infoItems = ref([
  {
    avatar: '',
    title: '',
    amount: '',
  },
])

//  Call (programming)API Query downloader data
async function loadDownloaderInfo() {
  try {
    const res: DownloaderInfo = await api.get('dashboard/downloader')

    downloadInfo.value = res
    infoItems.value = [
      {
        avatar: 'mdi-cloud-upload',
        title: ' Total uploads',
        amount: formatFileSize(res.upload_size),
      },
      {
        avatar: 'mdi-download-box',
        title: ' Total downloads',
        amount: formatFileSize(res.download_size),
      },
      {
        avatar: 'mdi-content-save',
        title: ' Disk space remaining',
        amount: formatFileSize(res.free_space),
      },
    ]
  }
  catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  loadDownloaderInfo()

  //  Start timer
  refreshTimer = setInterval(() => {
    loadDownloaderInfo()
  }, 3000)
})

//  Stop timer when component is unloaded
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle> Real time rate (rtr)</VCardTitle>
    </VCardItem>

    <VCardText class="pt-4">
      <div>
        <p class="text-h5 me-2">
          ↑{{ formatFileSize(downloadInfo.upload_speed) }}/s
        </p>
        <p class="text-h4 me-2">
          ↓{{ formatFileSize(downloadInfo.download_speed) }}/s
        </p>
      </div>
      <VList class="card-list mt-9">
        <VListItem
          v-for="item in infoItems"
          :key="item.title"
        >
          <template #prepend>
            <VIcon
              rounded
              :icon="item.avatar"
            />
          </template>

          <VListItemTitle class="text-sm font-weight-medium mb-1">
            {{ item.title }}
          </VListItemTitle>

          <template #append>
            <div>
              <h6 class="text-sm font-weight-medium mb-2">
                {{ item.amount }}
              </h6>
            </div>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1rem;
}
</style>

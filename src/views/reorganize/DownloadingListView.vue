<script lang="ts" setup>
import PullRefresh from 'pull-refresh-vue3'
import api from '@/api'
import type { DownloadingInfo } from '@/api/types'
import NoDataFound from '@/components/NoDataFound.vue'
import DownloadingCard from '@/components/cards/DownloadingCard.vue'

//  Timers
let refreshTimer: NodeJS.Timer | null = null

//  Data sheet
const dataList = ref<DownloadingInfo[]>([])

//  Is it refreshed
const isRefreshed = ref(false)

//  Get subscription list data
async function fetchData() {
  try {
    dataList.value = await api.get('download/')
    isRefreshed.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Refresh state
const loading = ref(false)

//  Drop-down refresh
function onRefresh() {
  loading.value = true
  fetchData()
  loading.value = false
}

//  Getting data on load
onBeforeMount(() => {
  fetchData()

  //  Start timer
  refreshTimer = setInterval(() => {
    fetchData()
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
  <div
    v-if="!isRefreshed"
    class="mt-12 w-full text-center text-gray-500 text-sm flex flex-col items-center"
  >
    <VProgressCircular
      v-if="!isRefreshed"
      size="48"
      indeterminate
      color="primary"
    />
  </div>
  <PullRefresh
    v-model="loading"
    @refresh="onRefresh"
  >
    <div
      v-if="dataList.length > 0"
      class="grid gap-3 grid-downloading-card"
    >
      <DownloadingCard
        v-for="data in dataList"
        :key="data.hash"
        :info="data"
      />
    </div>
    <NoDataFound
      v-if="dataList.length === 0 && isRefreshed"
      error-code="404"
      error-title=" No mandate"
      error-description=" Tasks being downloaded will be shown here。"
    />
  </PullRefresh>
</template>

<style lang="scss">
.grid-downloading-card {
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  padding-block-end: 1rem;
}
</style>

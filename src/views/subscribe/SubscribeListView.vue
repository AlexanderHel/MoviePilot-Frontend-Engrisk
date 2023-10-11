<script lang="ts" setup>
import PullRefresh from 'pull-refresh-vue3'
import api from '@/api'
import type { Subscribe } from '@/api/types'
import NoDataFound from '@/components/NoDataFound.vue'
import SubscribeCard from '@/components/cards/SubscribeCard.vue'

//  Input parameter
const props = defineProps({
  type: String,
})

//  Is it refreshed
const isRefreshed = ref(false)

//  Data sheet
const dataList = ref<Subscribe[]>([])

//  Get subscription list data
async function fetchData() {
  try {
    dataList.value = await api.get('subscribe/')
    isRefreshed.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Getting data on load
onBeforeMount(fetchData)

//  Refresh state
const loading = ref(false)

//  Drop-down refresh
function onRefresh() {
  loading.value = true
  fetchData()
  loading.value = false
}

//  Filtering data
const filteredDataList = computed(() => {
  return dataList.value.filter(data => data.type === props.type)
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
      v-if="filteredDataList.length > 0"
      class="grid gap-3 grid-subscribe-card p-1"
    >
      <SubscribeCard
        v-for="data in filteredDataList"
        :key="data.id"
        :media="data"
        @remove="fetchData"
        @save="fetchData"
      />
    </div>
    <NoDataFound
      v-if="filteredDataList.length === 0 && isRefreshed"
      error-code="404"
      error-title=" No subscription"
      error-description=" Please add a movie by searching、 Tv series subscription。"
    />
  </PullRefresh>
</template>

<style lang="scss">
.grid-subscribe-card {
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  padding-block-end: 1rem;
}
</style>

<script lang="ts" setup>
import api from '@/api'
import type { TmdbPerson } from '@/api/types'
import PersonCard from '@/components/cards/PersonCard.vue'
import NoDataFound from '@/components/NoDataFound.vue'

//  Input parameter
const props = defineProps({
  apipath: String,
  params: Object as PropType<{ [key: string]: any }>,
})

//  Determine if there is a scrollbar
function hasScroll() {
  return (
    document.body.scrollHeight
      - (window.innerHeight || document.documentElement.clientHeight)
    > 2
  )
}

//  Current page number
const page = ref(1)

//  Loading or not
const loading = ref(false)

//  Whether or not loading is complete
const isRefreshed = ref(false)

//  Data sheet
const dataList = ref<TmdbPerson[]>([])
const currData = ref<TmdbPerson[]>([])

//  Getting list data
async function fetchData({ done }: { done: any }) {
  try {
    if (!props.apipath)
      return

    //  If it is loading， Direct return
    if (loading.value) {
      done('ok')

      return
    }

    //  Setting loading
    loading.value = true

    //  Loads to full screen or loads incorrectly
    if (!hasScroll()) {
      //  Load multiple times
      while (!hasScroll()) {
        //  RequestingAPI
        currData.value = await api.get(props.apipath, {
          params: {
            page: page.value,
          },
        })

        //  Marked as completed as requested
        isRefreshed.value = true
        if (currData.value.length === 0) {
          //  If there is no data， Fig. appear suddenly
          done('ok')

          return
        }

        //  Consolidation of data
        dataList.value = [...dataList.value, ...currData.value]

        //  Pagination+1
        page.value++
      }
    }
    else {
      //  Load it once.
      //  RequestingAPI
      currData.value = await api.get(props.apipath, {
        params: {
          page: page.value,
        },
      })

      //  Marked as completed as requested
      isRefreshed.value = true
      if (currData.value.length === 0) {
        //  If there is no data， Fig. appear suddenly
        done('ok')

        return
      }

      //  Consolidation of data
      dataList.value = [...dataList.value, ...currData.value]

      //  Pagination+1
      page.value++
    }

    //  Cancel loading
    loading.value = false

    //  Returns loaded successfully
    done('ok')
  }
  catch (error) {
    console.error(error)

    //  Returns load failure
    done('error')
  }
}
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
  <VInfiniteScroll
    mode="intersect"
    side="end"
    :items="dataList"
    class="overflow-hidden"
    @load="fetchData"
  >
    <template #loading />
    <div
      v-if="dataList.length > 0"
      class="grid gap-4 grid-media-card mx-3"
      tabindex="0"
    >
      <PersonCard
        v-for="data in dataList"
        :key="data.id"
        :person="data"
      />
    </div>
    <NoDataFound
      v-if="dataList.length === 0 && isRefreshed"
      error-code="404"
      error-title=" No data"
      error-description=" Not availableTMDB Media information。"
    />
  </VInfiniteScroll>
</template>

<style lang="scss">
.grid-media-card {
  grid-template-columns: repeat(auto-fill, minmax(9.375rem, 1fr));
}
</style>

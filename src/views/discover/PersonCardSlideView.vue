<script lang="ts" setup>
import PersionCard from '@/components/cards/PersonCard.vue'
import api from '@/api'
import type { TmdbPerson } from '@/api/types'
import SlideView from '@/components/slide/SlideView.vue'

//  Input parameter
const props = defineProps({
  apipath: String,
  linkurl: String,
  title: String,
})

//  Component loading complete
const componentLoaded = ref(false)

//  Data sheet
const dataList = ref<TmdbPerson[]>([])

//  Get subscription list data
async function fetchData() {
  try {
    if (!props.apipath)
      return

    dataList.value = await api.get(props.apipath)
    if (dataList.value.length > 0)
      componentLoaded.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Getting data on load
onMounted(fetchData)
</script>

<template>
  <SlideView
    v-if="componentLoaded"
    v-bind="props"
  >
    <template #content>
      <template
        v-for="data in dataList"
        :key="data.id"
      >
        <PersionCard
          :person="data"
          height="15rem"
          width="10rem"
        />
      </template>
    </template>
  </SlideView>
</template>

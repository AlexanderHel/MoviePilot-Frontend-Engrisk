<script setup lang="ts">
import MediaCardListView from '@/views/discover/MediaCardListView.vue'

//  Input parameter
const props = defineProps({
  // API Trails
  paths: Array as PropType<string[]> | PropType<string>,
})

//  Routing parameter
const route = useRoute()

//  Caption
const title = route.query?.title?.toString()

//  CountAPI Trails
function getApiPath(paths: string[] | string) {
  if (Array.isArray(paths))
    return paths.join('/')
  else
    return paths
}
</script>

<template>
  <div>
    <div v-if="title" class="mt-3 md:flex md:items-center md:justify-between">
      <div class="min-w-0 flex-1 mx-0">
        <h2 class="mb-4 truncate text-2xl font-bold leading-7 text-gray-100 sm:overflow-visible sm:text-4xl sm:leading-9 md:mb-0" data-testid="page-header">
          <span class="text-moviepilot">{{ title }}</span>
        </h2>
      </div>
    </div>
    <MediaCardListView
      :apipath="getApiPath(props.paths || '')"
      :params="route.query"
    />
  </div>
</template>

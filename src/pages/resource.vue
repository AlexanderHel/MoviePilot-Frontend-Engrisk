<script setup lang="ts">
import TorrentCardListView from '@/views/discover/TorrentCardListView.vue'

//  Routing parameter
const route = useRoute()

//  Consult (a document etc)TMDBID Or title
const keyword = route.query?.keyword?.toString() ?? ''

//  Query type
const type = route.query?.type?.toString() ?? ''

//  Search fields
const area = route.query?.area?.toString() ?? ''
</script>

<template>
  <div>
    <TorrentCardListView
      :keyword="keyword"
      :type="type"
      :area="area"
    />
  </div>
</template>

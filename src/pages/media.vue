<script setup lang="ts">
import MediaDetailView from '@/views/discover/MediaDetailView.vue'

//  Routing parameter
const route = useRoute()

// TMDBID
const mediaid = route.query?.mediaid?.toString()

//  Typology
const type = route.query?.type?.toString()
</script>

<template>
  <div>
    <MediaDetailView
      :mediaid="mediaid"
      :type="type"
    />
  </div>
</template>

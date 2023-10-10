<script setup lang="ts">
import PersonDetailView from '@/views/discover/PersonDetailView.vue'

//  Routing parameter
const route = useRoute()

// Person Id
const personid = route.query?.personid?.toString()

//  Typology
const type = route.query?.type?.toString()
</script>

<template>
  <div>
    <PersonDetailView
      :personid="personid"
      :type="type"
    />
  </div>
</template>

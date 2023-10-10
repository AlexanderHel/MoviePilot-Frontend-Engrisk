<script setup lang="ts">
import NoDataFound from '@/components/NoDataFound.vue'
</script>

<template>
  <NoDataFound
    error-code="404"
    error-title=" Page does not exist ⚠️"
    error-description=" The page you are trying to access does not exist， Please check if the address is correct。"
  >
    <template #button>
      <VBtn
        to="/"
        class="mt-10"
      >
        Come (or go) back
      </VBtn>
    </template>
  </NoDataFound>
</template>

<script lang="ts" setup>
//  Input parameter
const props = defineProps({
  linkurl: String,
  title: String,
})
</script>

<template>
  <div
    class="ms-1"
  >
    <RouterLink
      :to="props.linkurl ? props.linkurl : ''"
      class="slider-title"
    >
      <span>{{ props.title }}</span>
      <VIcon
        icon="mdi-arrow-right-circle-outline"
        class="ms-1"
      />
    </RouterLink>
  </div>
</template>

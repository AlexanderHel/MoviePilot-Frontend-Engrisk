<script lang="ts" setup>
//  Define custom events that are triggered
const emit = defineEmits(['click'])

//  Button click
function onClick() {
  emit('click')
}
</script>

<template>
  <IconBtn
    class="absolute right-3 top-3"
    @click.stop="onClick"
  >
    <VIcon icon="mdi-close" />
  </IconBtn>
</template>

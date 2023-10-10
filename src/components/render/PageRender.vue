<script lang="ts" setup>
import { type PropType, ref } from 'vue'

//  Component interface
interface RenderProps {
  component: string
  text: string
  html: string
  content?: any
  props?: any
}

//  Input parameter
const elementProps = defineProps({
  config: Object as PropType<RenderProps>,
})

//  Configuration element
const formItem = ref<RenderProps>(elementProps.config ?? {
  component: 'div',
  text: '',
  html: '',
  props: {},
  content: [],
})
</script>

<template>
  <Component
    :is="formItem.component"
    v-if="!formItem.html"
    v-bind="formItem.props"
  >
    {{ formItem.text }}
    <PageRender
      v-for="(innerItem, innerIndex) in (formItem.content || [])"
      :key="innerIndex"
      :config="innerItem"
    />
  </Component>
  <Component
    :is="formItem.component"
    v-if="formItem.html"
    v-bind="formItem.props"
    v-html="formItem.html"
  />
</template>

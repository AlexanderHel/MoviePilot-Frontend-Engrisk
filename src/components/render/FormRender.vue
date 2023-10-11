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
  form: Object as PropType<any>,
})

//  Configuration element
const formItem = ref<RenderProps>(elementProps.config ?? {
  component: 'div',
  text: '',
  html: '',
  props: {},
  content: [],
})

//  Configuration data
const formData = ref<any>(elementProps.form || {})
</script>

<template>
  <Component
    :is="formItem.component"
    v-if="!formItem.html"
    v-bind="formItem.props"
    v-model="formData[formItem.props?.model || '']"
  >
    {{ formItem.text }}
    <FormRender
      v-for="(innerItem, innerIndex) in (formItem.content || [])"
      :key="innerIndex"
      v-model="formData[innerItem.props?.model || '']"
      :config="innerItem"
      :form="formData"
    />
  </Component>
  <Component
    :is="formItem.component"
    v-if="formItem.html"
    v-bind="formItem.props"
    v-html="formItem.html"
  />
</template>

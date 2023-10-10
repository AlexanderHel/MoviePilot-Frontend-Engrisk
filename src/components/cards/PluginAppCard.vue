<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'
import type { Plugin } from '@/api/types'

//  Input parameter
const props = defineProps({
  plugin: Object as PropType<Plugin>,
  width: String,
  height: String,
})

//  Define custom events that are triggered
const emit = defineEmits(['install'])

//  Checkbox
const $toast = useToast()

//  Whether the image has finished loading
const isImageLoaded = ref(false)

//  Installation of plug-ins
async function installPlugin() {
  try {
    const result: { [key: string]: any } = await api.get(
      `plugin/install/${props.plugin?.id}`,
    )

    if (result.success) {
      $toast.success(` Plug-in (software component) ${props.plugin?.plugin_name}  Successful installation！`)

      //  Notify the parent component of a refresh
      emit('install')
    }
    else {
      $toast.error(` Plug-in (software component) ${props.plugin?.plugin_name}  Installation failure：${result.message}}`)
    }
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <VCard
    :width="props.width"
    :height="props.height"
    @click="installPlugin"
  >
    <div
      class="relative pa-4 text-center card-cover-blurred"
      :style="{ background: `${props.plugin?.plugin_color}` }"
    >
      <VAvatar
        size="8rem"
        :class="{ shadow: isImageLoaded }"
      >
        <VImg
          :src="`/plugin_icon/${props.plugin?.plugin_icon}`"
          aspect-ratio="4/3"
          cover
          @load="isImageLoaded = true"
        />
      </VAvatar>
    </div>
    <VCardTitle>{{ props.plugin?.plugin_name }}</VCardTitle>

    <VCardText>
      {{ props.plugin?.plugin_desc }}
    </VCardText>
    <VCardText>
      Author：<a
        :href="props.plugin?.author_url"
        target="_blank"
        @click.stop
      >
        {{ props.plugin?.plugin_author }}
      </a>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-cover-blurred::before {
  position: absolute;
  /* stylelint-disable-next-line property-no-vendor-prefix */
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
  background: rgba(29, 39, 59, 48%);
  content: "";
  inset: 0;
}
</style>

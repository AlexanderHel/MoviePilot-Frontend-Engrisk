<script lang="ts" setup>
//  Input parameter
const props = defineProps({
  pri: String,
  maxpri: String,
  rules: Array as PropType<string[]>,
  width: String,
  height: String,
})

//  Define custom events that are triggered
const emit = defineEmits(['close', 'changed', 'levelup', 'leveldown'])

//  Button click
function onClose() {
  emit('close')
}

//  Move up the priority list
function onLevelUp() {
  emit('levelup', props.pri)
}

//  Deprioritize
function onLevelDown() {
  emit('leveldown', props.pri)
}

//  Option changes
function filtersChanged(value: string[]) {
  emit('changed', props.pri, value)
}

//  Filter rules dropdown box
const selectFilterOptions = ref<{ [key: string]: string }[]>([
  { title: ' Special effects montage', value: ' SPECSUB ' },
  { title: ' Chinese subtitles', value: ' CNSUB ' },
  { title: ' Resolution (of a photo): 4K', value: ' 4K ' },
  { title: ' Resolution (of a photo): 1080P', value: ' 1080P ' },
  { title: ' Resolution (of a photo): 720P', value: ' 720P ' },
  { title: ' Rule out: 720P', value: ' !720P ' },
  { title: ' Mass (in physics):  Blu-ray disk', value: ' BLU ' },
  { title: ' Rule out:  Blu-ray disk', value: ' !BLU ' },
  { title: ' Mass (in physics): BLURAY', value: ' BLURAY ' },
  { title: ' Rule out: BLURAY', value: ' !BLURAY ' },
  { title: ' Mass (in physics): UHD', value: ' UHD ' },
  { title: ' Rule out: UHD', value: ' !UHD ' },
  { title: ' Mass (in physics): REMUX', value: ' REMUX ' },
  { title: ' Rule out: REMUX', value: ' !REMUX ' },
  { title: ' Mass (in physics): WEB-DL', value: ' WEBDL ' },
  { title: ' Rule out: WEB-DL', value: ' !WEBDL ' },
  { title: ' Encodings: H265', value: ' H265 ' },
  { title: ' Rule out: H265', value: ' !H265 ' },
  { title: ' Encodings: H264', value: ' H264 ' },
  { title: ' Rule out: H264', value: ' !H264 ' },
  { title: ' Effect:  Dolby vision', value: ' DOLBY ' },
  { title: ' Rule out:  Dolby vision', value: ' !DOLBY ' },
  { title: ' Effect: HDR', value: ' HDR ' },
  { title: ' Rule out: HDR', value: ' !HDR ' },
  { title: ' Mandarin dub', value: ' CNVOI ' },
  { title: ' Rule out:  Mandarin dub', value: ' !CNVOI ' },
  { title: ' Promote:  Free (of charge)', value: ' FREE ' },
])
</script>

<template>
  <VCard variant="tonal" :width="props.width" :height="props.height">
    <span class="absolute top-3 right-14">
      <IconBtn
        v-if="props.pri !== '1'"
        @click.stop="onLevelUp"
      >
        <VIcon icon="mdi-arrow-up" />
      </IconBtn>
      <IconBtn
        v-if="props.pri !== props.maxpri"
        @click.stop="onLevelDown"
      >
        <VIcon icon="mdi-arrow-down" />
      </IconBtn>
    </span>
    <DialogCloseBtn @click="onClose" />
    <VCardItem>
      <VCardTitle> Prioritization {{ props.pri }}</VCardTitle>
      <VRow>
        <VCol>
          <VSelect
            :key="props.pri"
            v-model="props.rules"
            variant="underlined"
            :items="selectFilterOptions"
            chips
            label=""
            multiple
            @update:modelValue="filtersChanged"
          />
        </VCol>
      </VRow>
    </VCardItem>
  </VCard>
</template>

<script lang="ts" setup>
import type { Axios } from 'axios'
import type { EndPoints } from '@/api/types'

//  Input parameter
const inProps = defineProps({
  storages: Array as PropType<any[]>,
  storage: String,
  path: String,
  endpoints: Object as PropType<EndPoints>,
  axios: Object as PropType<Axios>,
})

//  External events
const emit = defineEmits(['storagechanged', 'pathchanged', 'loading', 'foldercreated', 'sortchanged'])

//  New folder name
const newFolderPopper = ref(false)

//  New file name
const newFolderName = ref('')

//  Sort by
const sort = ref('name')

//  Adjustment of sorting
function changeSort() {
  if (sort.value === 'name')
    sort.value = 'time'
  else
    sort.value = 'name'

  emit('sortchanged', sort.value)
}

//  CountPATH Crumb
const pathSegments = computed(() => {
  let path_str = ''
  const isFolder = inProps.path?.endsWith('/')
  const segments = inProps.path?.split('/').filter(item => item)

  return segments?.map((item, index) => {
    path_str += item + ((index < segments.length - 1 || isFolder) ? '/' : '')
    return {
      name: item,
      path: path_str,
    }
  }) ?? []
})

const storageObject = computed(() => {
  return inProps.storages?.find(item => item.code === inProps.storage)
})

//  Toggle storage
function changeStorage(code: string) {
  if (inProps.storage !== code) {
    emit('storagechanged', code)
    emit('pathchanged', '')
  }
}

//  Route changes
function changePath(_path: string) {
  emit('pathchanged', _path)
}

//  Return to previous level
function goUp() {
  const segments = pathSegments.value ?? []
  const path = segments?.length === 1 ? '/' : segments[segments.length - 2].path
  changePath(path)
}

//  Create a catalog
async function mkdir() {
  emit('loading', true)
  const url = inProps.endpoints?.mkdir.url
    .replace(/{storage}/g, inProps.storage)
    .replace(/{path}/g, encodeURIComponent(inProps.path + newFolderName.value))

  const config = {
    url,
    method: inProps.endpoints?.mkdir.method || 'post',
  }

  //  HarmonizeAPI
  await inProps.axios?.request(config)

  newFolderPopper.value = false
  newFolderName.value = ''
  emit('loading', false)

  //  Notification reload
  emit('foldercreated')
}

//  Calculate sort icon
const sortIcon = computed(() => {
  if (sort.value === 'time')
    return 'mdi-sort-clock-ascending-outline'
  else
    return 'mdi-sort-alphabetical-ascending'
})
</script>

<template>
  <VToolbar flat dense>
    <VToolbarItems class="overflow-hidden">
      <VMenu v-if="inProps.storages?.length || 0 > 1" offset-y>
        <template #activator="{ props }">
          <VBtn v-bind="props">
            <VIcon icon="mdi-arrow-down-drop-circle-outline" />
          </VBtn>
        </template>
        <VList>
          <VListItem
            v-for="(item, index) in storages"
            :key="index"
            :disabled="item.code === storageObject?.code"
            @click="changeStorage(item.code)"
          >
            <template #prepend>
              <Icon :icon="item.icon" />
            </template>
            <VListItemTitle>{{ item.name }}</VListItemTitle>
          </VListItem>
        </VList>
      </VMenu>
      <VBtn variant="text" :input-value="path === '/'" class="px-1" @click="changePath('/')">
        <VIcon :icon="storageObject?.icon" class="mr-2" />
        {{ storageObject?.name }}
      </VBtn>
      <template v-for="(segment, index) in pathSegments" :key="index">
        <VBtn
          variant="text"
          :input-value="index === pathSegments.length - 1"
          class="px-1 d-none d-md-block"
          @click="changePath(segment.path)"
        >
          <VIcon icon=" mdi-chevron-right" />
          {{ segment.name }}
        </VBtn>
      </template>
    </VToolbarItems>
    <div class="flex-grow-1" />
    <IconBtn @click="changeSort">
      <VIcon :icon="sortIcon" />
    </IconBtn>
    <IconBtn v-if="pathSegments.length > 0" @click="goUp">
      <VIcon icon="mdi-arrow-up-bold-outline" />
    </IconBtn>
    <VDialog
      v-model="newFolderPopper"
      max-width="50rem"
    >
      <template #activator="{ props }">
        <IconBtn title=" New folder" v-bind="props">
          <VIcon icon="mdi-folder-plus-outline" />
        </IconBtn>
      </template>
      <VCard title=" New folder">
        <VCardText>
          <VTextField v-model="newFolderName" label=" Name (of a thing)" />
        </VCardText>
        <VCardActions>
          <div class="flex-grow-1" />
          <VBtn depressed @click="newFolderPopper = false">
            Abolish
          </VBtn>
          <VBtn
            :disabled="!newFolderName"
            depressed
            @click="mkdir"
          >
            Newly built
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </VToolbar>
</template>

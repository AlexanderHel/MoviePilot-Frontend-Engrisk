<script lang="ts" setup>
import type { Axios } from 'axios'
import axios from 'axios'

import Toolbar from './filebrowser/Toolbar.vue'
import Tree from './filebrowser/Tree.vue'
import List from './filebrowser/List.vue'
import type { EndPoints } from '@/api/types'

//  Input parameter
const props = defineProps({
  storages: String,
  storage: String,
  path: String,
  tree: Boolean,
  endpoints: Object as PropType<EndPoints>,
  axios: Object as PropType<Axios>,
  axiosconfig: Object,
})

//  External events
const emit = defineEmits(['pathchanged'])

const availableStorages = [
  {
    name: ' This locality',
    code: 'local',
    icon: 'mdi-folder-multiple-outline',
  },
]

const fileIcons = {
  zip: 'mdi-folder-zip-outline',
  rar: 'mdi-folder-zip-outline',
  htm: 'mdi-language-html5',
  html: 'mdi-language-html5',
  js: 'mdi-nodejs',
  json: 'mdi-file-document-outline',
  md: 'mdi-language-markdown-outline',
  pdf: 'mdi-file-pdf',
  png: 'mdi-file-image',
  jpg: 'mdi-file-image',
  jpeg: 'mdi-file-image',
  mp4: 'mdi-filmstrip',
  mkv: 'mdi-filmstrip',
  avi: 'mdi-filmstrip',
  wmv: 'mdi-filmstrip',
  mov: 'mdi-filmstrip',
  txt: 'mdi-file-document-outline',
  xls: 'mdi-file-excel',
  other: 'mdi-file-outline',
}

//  Number of times loaded
const loading = ref(0)
//  Current storage
const activeStorage = ref('local')
//  Refresh (computer window)
const refreshPending = ref(false)
//  Arrange in order
const sort = ref('name')
// axios An actual example
const axiosInstance = ref<Axios>()

//  Calculating properties
const storagesArray = computed(() => {
  const storageCodes = props.storages?.split(',')
  return availableStorages.filter(item => storageCodes?.includes(item.code))
})

//  Methodologies
function loadingChanged(loading: number) {
  if (loading)
    loading++
  else if (loading > 0)
    loading--
}

function storageChanged(storage: string) {
  activeStorage.value = storage
}

//  Route changes
function pathChanged(_path: string) {
  emit('pathchanged', _path)
}

//  Arrange in order变化
function sortChanged(s: string) {
  sort.value = s
  refreshPending.value = true
}

//  Initialization
onBeforeMount(() => {
  activeStorage.value = props.storage ?? 'local'
  axiosInstance.value = props.axios ?? axios.create(props.axiosconfig)
})
</script>

<template>
  <VCard class="mx-auto" :loading="loading > 0">
    <Toolbar
      :path="props.path"
      :storages="storagesArray"
      :storage="activeStorage"
      :endpoints="props.endpoints"
      :axios="axiosInstance"
      @storagechanged="storageChanged"
      @pathchanged="pathChanged"
      @foldercreated="refreshPending = true"
      @sortchanged="sortChanged"
    />
    <VRow no-gutters>
      <VCol v-if="tree" sm="auto" class="d-none d-md-block">
        <Tree
          :path="props.path"
          :storage="activeStorage"
          :icons="fileIcons"
          :endpoints="endpoints"
          :axios="axiosInstance"
          :refreshpending="refreshPending"
          @pathchanged="pathChanged"
          @loading="loadingChanged"
          @refreshed="refreshPending = false"
        />
      </VCol>
      <VDivider v-if="tree" vertical />
      <VCol>
        <List
          :path="props.path"
          :storage="activeStorage"
          :icons="fileIcons"
          :endpoints="endpoints"
          :axios="axiosInstance"
          :refreshpending="refreshPending"
          :sort="sort"
          @pathchanged="pathChanged"
          @loading="loadingChanged"
          @refreshed="refreshPending = false"
          @filedeleted="refreshPending = true"
          @renamed="refreshPending = true"
        />
      </VCol>
    </VRow>
  </VCard>
</template>

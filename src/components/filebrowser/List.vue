<script lang="ts" setup>
import type { Axios } from 'axios'
import type { PropType } from 'vue'
import { useConfirm } from 'vuetify-use-dialog'
import axios from 'axios'
import { useToast } from 'vue-toast-notification'
import { numberValidator } from '@/@validators'
import { formatBytes } from '@core/utils/formatters'
import type { Context, EndPoints, FileItem } from '@/api/types'
import store from '@/store'
import api from '@/api'
import MediaInfoCard from '@/components/cards/MediaInfoCard.vue'
import TmdbSelectorCard from '@/components/cards/TmdbSelectorCard.vue'

//  Input parameter
const inProps = defineProps({
  icons: Object,
  storage: String,
  path: String,
  endpoints: Object as PropType<EndPoints>,
  axios: Object as PropType<Axios>,
  refreshpending: Boolean,
  sort: String,
})

//  External events
const emit = defineEmits(['loading', 'pathchanged', 'refreshed', 'filedeleted', 'renamed'])

//  Checkbox
const $toast = useToast()

//  Is it loading
const loading = ref(true)

//  Confirmation box
const createConfirm = useConfirm()

//  Storage space type
const storage = ref(inProps.storage ?? '')

// axios An actual example
const axiosInstance = ref<Axios>(inProps.axios ?? axios)

//  Content list
const items = ref<FileItem[]>([])

//  Filtration conditions
const filter = ref('')

//  Rename a pop-up window
const renamePopper = ref(false)

//  Organize pop-ups
const transferPopper = ref(false)

//  Organize the progress bar
const progressDialog = ref(false)

//  Organize progress text
const progressText = ref(' Please wait. ...')

//  Organize progress
const progressValue = ref(0)

//  Loading progressSSE
const progressEventSource = ref<EventSource>()

//  New name
const newName = ref('')

//  Current name
const currentItem = ref<FileItem>()

//  File transfer form
const transferForm = reactive({
  path: '',
  target: '',
  tmdbid: null,
  season: null,
  type_name: '',
  transfer_type: '',
  episode_format: '',
  episode_detail: '',
  episode_part: '',
  episode_offset: null,
  min_filesize: 0,

})

//  Identification results
const nameTestResult = ref<Context>()

//  Identification results对话框
const nameTestDialog = ref(false)

// TMDB Selection dialog box
const tmdbSelectorDialog = ref(false)

//  Generating1 Until (a time)50 Quarterly drop-down box options
const seasonItems = ref(
  Array.from({ length: 51 }, (_, i) => i).map(item => ({
    title: ` (prefix indicating ordinal number, e.g. first, number two etc) ${item}  Classifier for seasonal crop yield or seasons of a tv series`,
    value: item,
  })),
)

//  Catalog filtering
const dirs = computed(() =>
  items.value.filter(item => item.type === 'dir' && item.basename.includes(filter.value)),
)

//  File filtering
const files = computed(() =>
  items.value.filter(item => item.type === 'file' && item.basename.includes(filter.value)),
)

//  Catalog or not
const isDir = computed(() => inProps.path?.endsWith('/'))

//  Documentation
const isFile = computed(() => !isDir.value)

//  Whether it is an image file
const isImage = computed(() => {
  const ext = inProps.path?.split('.').pop()?.toLowerCase()
  return ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(ext ?? '')
})

//  HarmonizeAPI Loading content
async function load() {
  loading.value = true
  emit('loading', true)
  //  Parameters
  const url = inProps.endpoints?.list.url
    .replace(/{storage}/g, storage.value)
    .replace(/{path}/g, encodeURIComponent(inProps.path || ''))
    .replace(/{sort}/g, inProps.sort || 'name')

  const config = {
    url,
    method: inProps.endpoints?.list.method || 'get',
  }
  //  Load data
  items.value = await axiosInstance.value.request(config) ?? []
  emit('loading', false)
  loading.value = false
}

//  Deleting items
async function deleteItem(item: FileItem) {
  const confirmed = await createConfirm({
    title: ' Recognize',
    content: ` Confirmation of deletion${
                item.type === 'dir' ? ' Catalogs' : ' File'
            } ${item.basename}？`,
    confirmationText: ' Recognize',
    cancellationText: ' Abolish',
    dialogProps: {
      maxWidth: '50rem',
    },
  })

  if (confirmed) {
    emit('loading', true)
    const url = inProps.endpoints?.delete.url
      .replace(/{storage}/g, storage.value)
      .replace(/{path}/g, encodeURIComponent(item.path))

    const config = {
      url,
      method: inProps.endpoints?.delete.method || 'post',
    }

    await axiosInstance.value.request(config)
    emit('filedeleted')
    emit('loading', false)
    //  Reload
    load()
  }
}

//  Switching paths
function changePath(_path: string) {
  emit('pathchanged', _path)
}

//  Download file in new window
function download(path: string) {
  if (!path)
    return
  const token = store.state.auth.token
  const url_path = inProps.endpoints?.download.url
    .replace(/{storage}/g, storage.value)
    .replace(/{path}/g, encodeURIComponent(path))
  const url = `${import.meta.env.VITE_API_BASE_URL}${url_path.slice(1)}&token=${token}`
  //  Download file
  window.open(url, '_blank')
}

//  Show picture
function getImgLink(path: string) {
  if (!path)
    return ''
  const token = store.state.auth.token
  const url_path = inProps.endpoints?.image.url
    .replace(/{storage}/g, storage.value)
    .replace(/{path}/g, encodeURIComponent(path))
  return `${import.meta.env.VITE_API_BASE_URL}${url_path.slice(1)}&token=${token}`
}

//  Show rename popup
function showRenmae(item: FileItem) {
  currentItem.value = item
  newName.value = item.name
  renamePopper.value = true
}

//  Rename
async function rename() {
  emit('loading', true)
  const url = inProps.endpoints?.rename.url
    .replace(/{storage}/g, inProps.storage)
    .replace(/{path}/g, encodeURIComponent(currentItem.value?.path || ''))
    .replace(/{newname}/g, encodeURIComponent(newName.value))

  const config = {
    url,
    method: inProps.endpoints?.mkdir.method || 'post',
  }

  //  HarmonizeAPI
  await inProps.axios?.request(config)

  renamePopper.value = false
  newName.value = ''
  emit('loading', false)

  //  Notification reload
  emit('renamed')
}

//  Displaying the organizer dialog
function showTransfer(item: FileItem) {
  currentItem.value = item
  transferPopper.value = true
}

//  Organize documents
async function transfer() {
  transferForm.path = currentItem.value?.path ?? ''
  //  Start organizing documents
  try {
    //  Close pop-up window
    transferPopper.value = false
    //  Show progress bar
    progressDialog.value = true
    //  Start listening to progress
    startLoadingProgress()
    //  Asynchronous transferAPI， Close the progress bar when finished
    api.post('transfer/manual', {}, {
      params: transferForm,
    }).then((res: any) => {
      //  Close the progress bar
      progressDialog.value = false
      //  Stop listening to progress
      stopLoadingProgress()
      //  Show results
      if (res.success) {
        $toast.success(`${currentItem.value?.name}  Finishing！`)
        //  Reload
        load()
      }
      else {
        $toast.error(`${currentItem.value?.name}  Failure to organize：${res.message}！`)
      }
    })
  }
  catch (e) {
    console.log(e)
  }
}

//  Modify the document to the time（timestape） Convert to local time
function formatTime(timestape: number) {
  return new Date(timestape * 1000).toLocaleString()
}

//  Monitorpath Variations
watch(
  () => inProps.path,
  async () => {
    items.value = []
    nameTestResult.value = undefined
    nameTestDialog.value = false
    await load()
  },
)

//  MonitorrefreshPending Variations
watch(
  () => inProps.refreshpending,
  async () => {
    if (inProps.refreshpending) {
      await load()
      emit('refreshed')
    }
  },
)

//  UtilizationSSE Listening to loading progress
function startLoadingProgress() {
  progressText.value = ' Please wait. ...'

  const token = store.state.auth.token

  progressEventSource.value = new EventSource(
    `${import.meta.env.VITE_API_BASE_URL}system/progress/filetransfer?token=${token}`,
  )
  progressEventSource.value.onmessage = (event) => {
    const progress = JSON.parse(event.data)
    if (progress) {
      progressText.value = progress.text
      progressValue.value = progress.value
    }
  }
}

//  Stop listening for loading progress
function stopLoadingProgress() {
  progressEventSource.value?.close()
}

//  Call (programming)API Recognize
async function recognize(path: string) {
  try {
    //  Show progress bar
    progressDialog.value = true
    progressText.value = ` Recognition in progress ${path} ...`
    progressValue.value = 0
    nameTestResult.value = await api.get('media/recognize_file', {
      params: {
        path,
      },
    })
    //  Close the progress bar
    progressDialog.value = false
    if (!nameTestResult.value)
      $toast.error(`${path}  Recognition failure！`)
    nameTestDialog.value = !!nameTestResult.value?.meta_info?.name
  }
  catch (error) {
    console.error(error)
  }
}

//  Pop-up menu
const dropdownItems = ref([
  {
    title: ' Recognize',
    value: 1,
    props: {
      prependIcon: 'mdi-text-recognition',
      click: (_item: FileItem) => {
        recognize(_item.path || '')
      },
    },
  }, {
    title: ' Rename',
    value: 2,
    props: {
      prependIcon: 'mdi-rename',
      click: showRenmae,
    },
  },
  {
    title: ' Collate (data, files)',
    value: 3,
    props: {
      prependIcon: 'mdi-folder-arrow-right',
      click: showTransfer,
    },
  },
  {
    title: ' Removing',
    value: 4,
    props: {
      prependIcon: 'mdi-delete-outline',
      color: 'error',
      click: deleteItem,
    },
  },
])

onMounted(() => {
  load()
})
</script>

<template>
  <VCard class="d-flex flex-column">
    <VCardText
      v-if="loading"
      class="text-center flex flex-col items-center"
    >
      <VProgressCircular
        size="48"
        indeterminate
        color="primary"
      />
    </VCardText>
    <VCardText
      v-if="!path"
      class="grow d-flex justify-center align-center grey--text"
    >
      Select a directory or file
    </VCardText>
    <VCardText
      v-else-if="isFile && !isImage"
      class="text-center break-all"
    >
      <strong>{{ items[0]?.name }}</strong><br>
      Adults and children：{{ formatBytes(items[0]?.size || 0) }}<br>
      Modify time：{{ formatTime(items[0]?.modify_time || 0) }}
    </VCardText>
    <VCardText
      v-else-if="isFile && isImage"
      class="grow d-flex justify-center align-center"
    >
      <VImg :src="getImgLink(path)" max-width="100%" max-height="100%" />
    </VCardText>
    <VCardText v-else-if="dirs.length || files.length" class="p-0">
      <VList v-if="dirs.length" subheader>
        <VListSubheader> Catalogs</VListSubheader>
        <VListItem
          v-for="(item, index) in dirs"
          :key="index"
          class="px-3 pe-1"
          @click="changePath(item.path)"
        >
          <template #prepend>
            <VIcon icon="mdi-folder-outline" />
          </template>
          <VListItemTitle v-text="item.name" />
          <template #append>
            <IconBtn class="d-sm-none">
              <VIcon
                icon="mdi-dots-vertical"
              />
              <VMenu
                activator="parent"
                close-on-content-click
              >
                <VList>
                  <VListItem
                    v-for="(menu, i) in dropdownItems"
                    :key="i"
                    variant="plain"
                    :base-color="menu.props.color"
                    @click="menu.props.click(item)"
                  >
                    <template #prepend>
                      <VIcon :icon="menu.props.prependIcon" />
                    </template>
                    <VListItemTitle v-text="menu.title" />
                  </VListItem>
                </VList>
              </VMenu>
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="recognize(item.path)">
              <VIcon icon="mdi-text-recognition" />
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="showRenmae(item)">
              <VIcon icon="mdi-rename" />
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="showTransfer(item)">
              <VIcon icon="mdi-folder-arrow-right" />
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="deleteItem(item)">
              <VIcon icon="mdi-delete-outline" />
            </IconBtn>
          </template>
        </VListItem>
      </VList>
      <VDivider v-if="dirs.length && files.length" />
      <VList v-if="files.length" subheader>
        <VListSubheader> File</VListSubheader>
        <VListItem
          v-for="(item, index) in files"
          :key="index"
          class="pl-3 pe-1"
          @click="changePath(item.path)"
        >
          <template #prepend>
            <VIcon v-if="inProps.icons" :icon="inProps.icons[item.extension.toLowerCase()] || inProps.icons?.other" />
          </template>

          <VListItemTitle v-text="item.name" />
          <VListItemSubtitle> {{ formatBytes(item.size) }}</VListItemSubtitle>

          <template #append>
            <IconBtn class="d-sm-none">
              <VIcon
                icon="mdi-dots-vertical"
              />
              <VMenu
                activator="parent"
                close-on-content-click
              >
                <VList>
                  <VListItem
                    v-for="(menu, i) in dropdownItems"
                    :key="i"
                    variant="plain"
                    :base-color="menu.props.color"
                    @click="menu.props.click(item)"
                  >
                    <template #prepend>
                      <VIcon :icon="menu.props.prependIcon" />
                    </template>
                    <VListItemTitle v-text="menu.title" />
                  </VListItem>
                </VList>
              </VMenu>
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="recognize(item.path)">
              <VIcon icon="mdi-text-recognition" />
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="showRenmae(item)">
              <VIcon icon="mdi-rename" />
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="showTransfer(item)">
              <VIcon icon="mdi-folder-arrow-right" />
            </IconBtn>
            <IconBtn class="d-none d-sm-block" @click.stop="deleteItem(item)">
              <VIcon icon="mdi-delete-outline" />
            </IconBtn>
          </template>
        </VListItem>
      </VList>
    </VCardText>
    <VCardText
      v-else-if="filter"
      class="grow d-flex justify-center align-center grey--text py-5"
    >
      No directories or files
    </VCardText>
    <VCardText
      v-else-if="!loading"
      class="grow d-flex justify-center align-center grey--text py-5"
    >
      Empty directory
    </VCardText>
    <VDivider v-if="path" />
    <VToolbar v-if="!loading" density="compact" flat color="gray">
      <VTextField
        v-if="!isFile"
        v-model="filter"
        hide-details
        flat
        density="compact"
        variant="solo-filled"
        placeholder=" Look for sth. ..."
        prepend-inner-icon="mdi-filter-outline"
        class="me-2"
      />
      <VSpacer v-if="isFile" />
      <IconBtn v-if="isFile" @click="recognize(inProps.path || '')">
        <VIcon color="primary">
          mdi-text-recognition
        </VIcon>
      </IconBtn>
      <IconBtn v-if="isFile" @click="download(inProps.path || '')">
        <VIcon color="primary">
          mdi-download
        </VIcon>
      </IconBtn>
      <IconBtn v-if="!isFile" @click="load">
        <VIcon color="primary">
          mdi-refresh
        </VIcon>
      </IconBtn>
    </VToolbar>
  </VCard>
  <!--  Rename a pop-up window -->
  <VDialog
    v-model="renamePopper"
    max-width="50rem"
  >
    <template #activator="{ props }">
      <IconBtn title=" Rename" v-bind="props">
        <VIcon icon="mdi-rename-outline" />
      </IconBtn>
    </template>
    <VCard title=" Rename">
      <VCardText>
        <VTextField v-model="newName" label=" Name (of a thing)" />
      </VCardText>
      <VCardActions>
        <div class="flex-grow-1" />
        <VBtn depressed @click="renamePopper = false">
          Abolish
        </VBtn>
        <VBtn
          :disabled="!newName"
          depressed
          @click="rename"
        >
          Rename
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <!--  File organizer popup -->
  <VDialog
    v-model="transferPopper"
    max-width="50rem"
    scrollable
  >
    <template #activator="{ props }">
      <IconBtn title=" Collate (data, files)" v-bind="props">
        <VIcon icon="mdi-folder-arrow-right-outline" />
      </IconBtn>
    </template>
    <VCard :title="` Documentation - ${currentItem?.name}`">
      <DialogCloseBtn @click="transferPopper = false" />
      <VCardText class="pt-2">
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol
              cols="12"
              md="8"
            >
              <VTextField
                v-model="transferForm.target"
                label=" Destination path"
                placeholder=" Leave blank spaces in writing"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VSelect
                v-model="transferForm.transfer_type"
                label=" Organization"
                :items="[
                  { title: ' Default (setting)', value: '' },
                  { title: ' Mobility', value: 'move' },
                  { title: ' Make a copy of', value: 'copy' },
                  { title: ' Hard link', value: 'link' },
                  { title: ' Soft link (computing)', value: 'softlink' },
                  { title: 'Rclone Copy', value: 'rclone_copy' },
                  { title: 'Rclone Move', value: 'rclone_move' },
                ]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VSelect
                v-model="transferForm.type_name"
                label=" Typology"
                :items="[{ title: ' Please select', value: '' }, { title: ' Cinematic', value: ' Cinematic' }, { title: ' Dramas', value: ' Dramas' }]"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="transferForm.tmdbid"
                :disabled="transferForm.type_name === ''"
                label="TMDBID"
                placeholder=" Leave blank spaces in automatic recognition (computing)"
                :rules="[numberValidator]"
                append-inner-icon="mdi-magnify"
                @click:append-inner="tmdbSelectorDialog = true"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VSelect
                v-show="transferForm.type_name === ' Dramas'"
                v-model.number="transferForm.season"
                label=" Classifier for seasonal crop yield or seasons of a tv series"
                :items="seasonItems"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" md="8">
              <VTextField
                v-model="transferForm.episode_format"
                label=" Episode positioning"
                placeholder=" Utilization{ep} Positioning episodes"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="transferForm.episode_detail"
                label=" Specify the number of episodes"
                placeholder=" Starting set, End of set (math.)， As if1 Maybe1,2"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model="transferForm.episode_part"
                label=" Indicate clearly and with certaintyPart"
                placeholder=" As ifpart1"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.number="transferForm.episode_offset"
                label=" Offset of set number (math.)"
                placeholder=" As if-10"
              />
            </VCol>
            <VCol cols="12" md="4">
              <VTextField
                v-model.number="transferForm.min_filesize"
                label=" Minimum file size（MB）"
                :rules="[numberValidator]"
                placeholder="0"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VBtn depressed @click="transferPopper = false">
          Abolish
        </VBtn>
        <VSpacer />
        <VBtn
          @click="transfer"
        >
          Start organizing
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <!--  Manually organizing progress boxes -->
  <vDialog
    v-model="progressDialog"
    :scrim="false"
    width="25rem"
  >
    <vCard
      color="primary"
    >
      <vCardText class="text-center">
        {{ progressText }}
        <vProgressLinear
          v-if="progressValue"
          color="white"
          class="mb-0 mt-1"
          :model-value="progressValue"
        />
      </vCardText>
    </vCard>
  </vDialog>
  <!--  Recognition results dialog box -->
  <vDialog
    v-model="nameTestDialog"
    width="50rem"
  >
    <vCard>
      <DialogCloseBtn @click="nameTestDialog = false" />
      <VCardItem>
        <MediaInfoCard :context="nameTestResult" />
      </VCardItem>
    </vCard>
  </vDialog>
  <!-- TMDB ID Search box -->
  <vDialog
    v-model="tmdbSelectorDialog"
    width="40rem"
    scrollable
  >
    <TmdbSelectorCard
      v-model="transferForm.tmdbid"
      @close="tmdbSelectorDialog = false"
    />
  </vDialog>
</template>

<style lang="scss" scoped>
.v-card {
    height: 100%;
}
.v-toolbar{
  background: rgb(var(--v-table-header-background));
}
</style>

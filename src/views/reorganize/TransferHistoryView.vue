<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'vue-toast-notification'
import { numberValidator } from '@/@validators'
import api from '@/api'
import type { TransferHistory } from '@/api/types'
import TmdbSelectorCard from '@/components/cards/TmdbSelectorCard.vue'

//  Checkbox
const $toast = useToast()

//  Reorganize the dialog box
const redoDialog = ref(false)

// TMDB Serial number
const redoTmdbId = ref('')

//  Typology
const redoType = ref(' Cinematic')

//  Typology下拉框：电影、电视剧
const redoTypeItems = ref([
  { title: ' Automation', value: '' },
  { title: ' Cinematic', value: ' Cinematic' },
  { title: ' Dramas', value: ' Dramas' },
])

//  Current operation record
const currentHistory = ref<TransferHistory>()

//  Selected data
const selected = ref<TransferHistory[]>([])

//  Meter header
const headers = [
  { title: ' Caption', key: 'title', sortable: false },
  { title: ' Catalogs', key: 'src', sortable: false },
  { title: ' Migration pattern', key: 'mode', sortable: false },
  { title: ' Timing', key: 'date', sortable: false },
  { title: ' State of affairs', key: 'status', sortable: false },
  { title: ' Reasons for failure', key: 'errmsg', sortable: false },
  { title: '', key: 'actions', sortable: false },
]

//  Data sheet
const dataList = ref<TransferHistory[]>([])

//  Look for sth.
const search = ref('')

//  Loaded state
const loading = ref(false)

//  Total number of articles
const totalItems = ref(0)

//  Number of articles per page
const itemsPerPage = ref(25)

//  Current page number
const currentPage = ref(1)

//  Progress bar
const progressDialog = ref(false)

//  Progress text
const progressText = ref(' Please wait. ...')

//  Progress value
const progressValue = ref(0)

// TMDB Selection dialog box
const tmdbSelectorDialog = ref(false)

//  Delete confirmation dialog
const deleteConfirmDialog = ref(false)

//  Confirmation box title
const confirmTitle = ref('')

//  Get subscription list data
async function fetchData({
  page,
  itemsPerPage,
}: {
  page: number
  itemsPerPage: number
}) {
  loading.value = true
  try {
    currentPage.value = page

    const result: { [key: string]: any } = await api.get('history/transfer', {
      params: {
        page,
        count: itemsPerPage,
        title: search.value,
      },
    })

    dataList.value = result.data.list
    totalItems.value = result.data.total
  }
  catch (error) {
    console.error(error)
  }
  loading.value = false
}

//  According to type  Return to different icons
function getIcon(type: string) {
  if (type === ' Cinematic')
    return 'mdi-movie'
  else if (type === ' Dramas')
    return 'mdi-television-classic'
  else
    return 'mdi-help-circle'
}

//  Calculate color
function getStatusColor(status: boolean) {
  return status ? 'success' : 'error'
}

//  Dictionary of transfer methods
const TransferDict: { [key: string]: string } = {
  copy: ' Make a copy of',
  move: ' Mobility',
  link: ' Hard link',
  softlink: ' Soft link',
  rclone_copy: 'Rclone Copy',
  rclone_move: 'Rclone Move',
}

//  Delete history
async function removeHistory(item: TransferHistory) {
  currentHistory.value = item
  confirmTitle.value = ` Confirm deletion ${item.title} ${item.seasons}${item.episodes} ?`
  deleteConfirmDialog.value = true
}

//  Call (programming)API Deletion of records
async function remove(item: TransferHistory, deleteSrc: boolean, deleteDest: boolean) {
  try {
    //  Call deleteAPI
    const result: { [key: string]: any } = await api.delete(`history/transfer?deletesrc=${deleteSrc}&deletedest=${deleteDest}`, {
      data: item,
    })

    if (!result.success)
      $toast.error(` Failed to delete: ${result.msg}`)
  }
  catch (error) {
    console.error(error)
  }
}

//  Deleting a single record
async function removeSingle(deleteSrc: boolean, deleteDest: boolean) {
  //  Close pop-up window
  deleteConfirmDialog.value = false
  if (!currentHistory.value)
    return
  //  Removing
  await remove(currentHistory.value, deleteSrc, deleteDest)
  //  Refresh (computer window)
  fetchData({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
  })
}

//  Batch deletion of records
async function removeBatch(deleteSrc: boolean, deleteDest: boolean) {
  //  Close pop-up window
  deleteConfirmDialog.value = false
  //  Total number of articles
  const total = selected.value.length
  if (total === 0)
    return
  //  Number of articles processed
  let handled = 0
  //  Show progress bar
  progressDialog.value = true
  //  Call from a loopremoveHistory
  for (const item of selected.value) {
    //  Start deleting
    progressText.value = ` Deleting ${item.title} ${item.seasons}${item.episodes} ...`
    await remove(item, deleteSrc, deleteDest)
    //  Removing完成
    handled++
    progressValue.value = handled / total * 100
  }
  //  Clear selected items
  selected.value = []
  //  Hide the progress bar
  progressDialog.value = false
  //  Retrieve data
  fetchData({
    page: currentPage.value,
    itemsPerPage: itemsPerPage.value,
  })
}

//  Responding to delete operations
async function deleteConfirmHandler(deleteSrc: boolean, deleteDest: boolean) {
  if (currentHistory.value)
    await removeSingle(deleteSrc, deleteDest)
  else
    await removeBatch(deleteSrc, deleteDest)
}

//  Batch delete history
async function removeHistoryBatch() {
  if (selected.value.length === 0)
    return
  //  Empty the current operation record
  currentHistory.value = undefined
  confirmTitle.value = ` Confirm deletion ${selected.value.length}  Entry ?`
  //  Open confirmation pop-up
  deleteConfirmDialog.value = true
}

//  Batch reorganization
async function retransferBatch() {
  if (selected.value.length === 0)
    return
  //  Empty the current operation record
  currentHistory.value = undefined
  //  Open the recognition pop-up window
  redoType.value = ''
  redoTmdbId.value = ''
  redoDialog.value = true
}

//  HarmonizeAPI Reorganize
async function retransfer(item: TransferHistory, redoType = '', redoTmdbId = 0) {
  try {
    const result: { [key: string]: any } = await api.post(
      'history/transfer',
      item,
      {
        params: {
          mtype: redoType,
          new_tmdbid: redoTmdbId,
        },
      },
    )

    if (result.success) {
      fetchData({
        page: currentPage.value,
        itemsPerPage: itemsPerPage.value,
      })
    }
    else {
      $toast.error(` Failed to reorganize: ${result.message}！`)
    }
  }
  catch (e) {
    console.log(e)
  }
}

//  Reorganize
async function rehandleHistory() {
  try {
    //  Close pop-up window
    redoDialog.value = false

    let tmdbid = 0

    if (redoTmdbId.value)
      tmdbid = parseInt(redoTmdbId.value)

    //  Transfer the currently selected record
    if (currentHistory.value) {
      $toast.info(` It's being reorganized. ${currentHistory.value?.title} ...`)
      await retransfer(currentHistory.value, redoType.value, tmdbid)
    }
    else if (selected.value.length > 0) {
      //  Total number of articles
      const total = selected.value.length
      if (total === 0)
        return
      //  Number of articles processed
      let handled = 0
      //  Show progress bar
      progressDialog.value = true
      for (const item of selected.value) {
        progressText.value = ` It's being reorganized. ${item.src} ...`
        await retransfer(item, redoType.value, tmdbid)
        handled++
        progressValue.value = handled / total * 100
      }
      //  Clear selected items
      selected.value = []
      //  Hide the progress bar
      progressDialog.value = false
    }
    //  Bulk transfer
    else { $toast.error(' No records are checked.！') }
  }
  catch (e) {
    console.log(e)
  }
}

//  Pop-up menu
const dropdownItems = ref([
  {
    title: ' Reorganize',
    value: 1,
    props: {
      prependIcon: 'mdi-redo-variant',
      click: (item: TransferHistory) => {
        redoTmdbId.value = ''
        redoType.value = ''
        redoDialog.value = true
        currentHistory.value = item
      },
    },
  },
  {
    title: ' Removing',
    value: 2,
    props: {
      prependIcon: 'mdi-trash-can-outline',
      color: 'error',
      click: (item: TransferHistory) => {
        removeHistory(item)
      },
    },
  },
])
</script>

<template>
  <VCard class="pb-5">
    <VCardItem>
      <VCardTitle>
        <VRow>
          <VCol>  Historical record </VCol>
          <VCol>
            <VTextField
              key="search_navbar"
              v-model="search"
              class="text-disabled"
              density="compact"
              label=" Look for sth."
              append-inner-icon="mdi-magnify"
              variant="solo-filled"
              single-line
              hide-details
              flat
              rounded
            />
          </VCol>
        </VRow>
      </VCardTitle>
    </VCardItem>
    <VDataTableServer
      v-model="selected"
      v-model:items-per-page="itemsPerPage"
      :headers="headers"
      :items="dataList"
      :items-length="totalItems"
      :search="search"
      :loading="loading"
      density="compact"
      item-value="id"
      return-object
      fixed-header
      show-select
      items-per-page-text=" Number of articles per page"
      page-text="{0}-{1}  Common {2}  Clause (of law or treaty)"
      @update:options="fetchData"
    >
      <template #item.title="{ item }">
        <div class="d-flex">
          <VAvatar><VIcon :icon="getIcon(item.raw.type || '')" /></VAvatar>
          <div class="d-flex flex-column ms-1">
            <span class="d-block whitespace-nowrap text-high-emphasis">
              {{ item.raw.title }} {{ item.raw.seasons }}{{ item.raw.episodes }}
            </span>
            <small>{{ item.raw.category }}</small>
          </div>
        </div>
      </template>
      <template #item.src="{ item }">
        <small>{{ item.raw.src }} <br>=> {{ item.raw.dest }}</small>
      </template>
      <template #item.mode="{ item }">
        <VChip
          variant="outlined"
          color="primary"
          size="small"
        >
          {{
            TransferDict[item.raw.mode]
          }}
        </VChip>
      </template>
      <template #item.status="{ item }">
        <VChip
          :color="getStatusColor(item.raw.status)"
          size="small"
        >
          {{ item.raw.status ? " Successes" : " Fail (e.g. experiments)" }}
        </VChip>
      </template>
      <template #item.date="{ item }">
        <small>{{ item.raw.date }}</small>
      </template>
      <template #item.errmsg="{ item }">
        <small class="text-error">{{ item.raw.errmsg }}</small>
      </template>
      <template #item.actions="{ item }">
        <IconBtn>
          <VIcon icon="mdi-dots-vertical" />
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
                @click="menu.props.click(item.raw)"
              >
                <template #prepend>
                  <VIcon :icon="menu.props.prependIcon" />
                </template>
                <VListItemTitle v-text="menu.title" />
              </VListItem>
            </VList>
          </VMenu>
        </IconBtn>
      </template>
      <template #no-data>
        No data
      </template>
    </VDataTableServer>
  </VCard>
  <VDialog
    v-model="redoDialog"
    max-width="50rem"
  >
    <!-- Dialog Content -->
    <VCard title=" Reorganize">
      <VCardText>
        <VRow>
          <VCol cols="12" md="4">
            <VSelect
              v-model="redoType"
              label=" Typology"
              :items="redoTypeItems"
            />
          </VCol>
          <VCol cols="12" md="8">
            <VTextField
              v-model="redoTmdbId"
              label="TMDB Serial number"
              placeholder=" Leave blank spaces in automatic recognition (computing)"
              :disabled="redoType === ''"
              :rules="[numberValidator]"
              append-inner-icon="mdi-magnify"
              @click:append-inner.stop="tmdbSelectorDialog = true"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn
          @click="rehandleHistory"
          @keydown.enter="rehandleHistory"
        >
          Recognize
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <span v-if="selected.length > 0" class="fixed right-5 bottom-5">
    <VBtn
      icon="mdi-redo-variant"
      class="me-2"
      color="primary"
      size="x-large"
      @click="retransferBatch"
    />
    <VBtn
      icon="mdi-trash-can-outline"
      color="error"
      size="x-large"
      @click="removeHistoryBatch"
    />
  </span>
  <!--  Progress dialog -->
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
          color="white"
          class="mb-0 mt-1"
          :model-value="progressValue"
        />
      </vCardText>
    </vCard>
  </vDialog>
  <!-- TMDB ID Search box -->
  <vDialog
    v-model="tmdbSelectorDialog"
    width="600"
    scrollable
  >
    <TmdbSelectorCard
      v-model="redoTmdbId"
      @close="tmdbSelectorDialog = false"
    />
  </vDialog>
  <!--  Bottom pop-up -->
  <VBottomSheet v-model="deleteConfirmDialog" inset>
    <VCard class="text-center">
      <DialogCloseBtn @click="deleteConfirmDialog = false" />
      <VCardTitle class="pe-10">
        {{ confirmTitle }}
      </VCardTitle>
      <div class="d-flex  flex-column flex-lg-row justify-center my-3">
        <VBtn
          color="primary"
          class="mb-2 mx-2"
          @click="deleteConfirmHandler(false, false)"
        >
          Delete history only
        </VBtn>
        <VBtn
          color="warning"
          class="mb-2 mx-2"
          @click="deleteConfirmHandler(true, false)"
        >
          Delete history and source files
        </VBtn>
        <VBtn
          color="info"
          class="mb-2 mx-2"
          @click="deleteConfirmHandler(false, true)"
        >
          Delete history and media library files
        </VBtn>
        <VBtn
          color="error"
          class="mb-2 mx-2"
          @click="deleteConfirmHandler(true, true)"
        >
          Delete history、 Source and media library files
        </VBtn>
      </div>
    </VCard>
  </VBottomSheet>
</template>

<style lang="scss">
.v-table th {
  white-space: nowrap;
}
</style>

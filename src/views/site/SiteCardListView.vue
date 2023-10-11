<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'
import type { Site } from '@/api/types'
import SiteCard from '@/components/cards/SiteCard.vue'
import NoDataFound from '@/components/NoDataFound.vue'
import { numberValidator, requiredValidator } from '@/@validators'
import { doneNProgress, startNProgress } from '@/api/nprogress'

//  Checkbox
const $toast = useToast()

//  Data sheet
const dataList = ref<Site[]>([])

//  Is it refreshed
const isRefreshed = ref(false)

//  New button text
const addBtnText = ref(' New sites')
//  Add button status
const addBtnState = ref(false)

//  Add site dialog box
const siteAddDialog = ref(false)

//  Status drop-down items
const statusItems = [
  { title: ' (computing) enable (a feature)', value: true },
  { title: ' Deactivate', value: false },
]

//  Generating1 Until (a time)50 The prioritize drop-down box option for the
const priorityItems = ref(
  Array.from({ length: 50 }, (_, i) => i + 1).map(item => ({
    title: item,
    value: item,
  })),
)

//  Site edit form data
const siteForm = reactive<Site>({
  id: 0,
  url: '',
  pri: 1,
  is_active: true,
  cookie: '',
  ua: '',
  limit_interval: 0,
  limit_seconds: 0,
  limit_count: 0,
  proxy: 0,
  render: 0,
  name: '',
  domain: '',
})

//  Get site list data
async function fetchData() {
  try {
    dataList.value = await api.get('site/')
    isRefreshed.value = true
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API  New sites
async function addSite() {
  if (!siteForm.url)
    return

  startNProgress()

  addBtnText.value = ' New...'
  addBtnState.value = true

  try {
    const result: { [key: string]: string } = await api.post('site/', siteForm)
    if (result.success) {
      $toast.success(' New site added successfully')

      //  Refresh data
      fetchData()
    }

    else { $toast.error(` Failed to add site：${result.message}`) }
    siteAddDialog.value = false
  }
  catch (error) {
    console.error(error)
  }

  doneNProgress()

  addBtnText.value = ' New sites'
  addBtnState.value = false
}

//  Getting data on load
onBeforeMount(fetchData)
</script>

<template>
  <div
    v-if="!isRefreshed"
    class="mt-12 w-full text-center text-gray-500 text-sm flex flex-col items-center"
  >
    <VProgressCircular
      v-if="!isRefreshed"
      size="48"
      indeterminate
      color="primary"
    />
  </div>
  <div
    v-if="dataList.length > 0"
    class="grid gap-3 grid-site-card"
  >
    <SiteCard
      v-for="data in dataList"
      :key="data.id"
      :site="data"
      @remove="fetchData"
      @update="fetchData"
    />
  </div>
  <NoDataFound
    v-if="dataList.length === 0 && isRefreshed"
    error-code="404"
    error-title=" No site"
    error-description=" Added and supported sites will be shown here。"
  />
  <!-- Dialog Content -->
  <VDialog
    v-model="siteAddDialog"
    max-width="50rem"
    persistent
    scrollable
  >
    <!-- Dialog Activator -->
    <template #activator="{ props }">
      <VBtn
        icon="mdi-plus"
        v-bind="props"
        size="x-large"
        class="fixed right-5 bottom-5"
      />
    </template>
    <VCard title=" New sites">
      <DialogCloseBtn @click="siteAddDialog = false" />
      <VCardText class="pt-2">
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="siteForm.url"
                label=" Site address"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VSelect
                v-model="siteForm.pri"
                label=" Prioritization"
                :items="priorityItems"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="3"
            >
              <VSelect
                v-model="siteForm.is_active"
                :items="statusItems"
                label=" State of affairs"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="siteForm.rss"
                label="RSS Address"
              />
            </VCol>
            <VCol cols="12">
              <VTextarea
                v-model="siteForm.cookie"
                label=" WebsiteCookie"
              />
            </VCol>
            <VCol cols="12">
              <VTextField
                v-model="siteForm.ua"
                label=" WebsiteUser-Agent"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="siteForm.limit_interval"
                label=" Unit cycle（ Unit of angle or arc equivalent one sixtieth of a degree）"
                :rules="[numberValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="siteForm.limit_seconds"
                label=" Number of visits"
                :rules="[numberValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
            >
              <VTextField
                v-model="siteForm.limit_seconds"
                label=" Access interval（ Unit of angle or arc equivalent one sixtieth of a degree）"
                :rules="[numberValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="siteForm.proxy"
                label=" Act on behalf of sb. in a responsible position"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VSwitch
                v-model="siteForm.render"
                label=" Emulate"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VBtn
          @click="siteAddDialog = false"
        >
          Abolish
        </VBtn>
        <VSpacer />
        <VBtn
          color="primary"
          :disabled="addBtnState"
          @click="addSite"
        >
          {{ addBtnText }}
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.grid-site-card {
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  padding-block-end: 1rem;
}
</style>

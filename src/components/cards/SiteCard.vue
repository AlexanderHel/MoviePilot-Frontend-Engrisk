<script lang="ts" setup>
import type { PropType } from 'vue'
import { useToast } from 'vue-toast-notification'
import { formatFileSize } from '@core/utils/formatters'
import { numberValidator, requiredValidator } from '@/@validators'
import api from '@/api'
import type { Site, TorrentInfo } from '@/api/types'
import ExistIcon from '@core/components/ExistIcon.vue'

//  Input parameter
const cardProps = defineProps({
  site: Object as PropType<Site>,
  width: String,
  height: String,
})

//  Define custom events that are triggered
const emit = defineEmits(['remove', 'update'])

//  Password input
const isPasswordVisible = ref(false)

//  Icon (computing)
const siteIcon = ref<string>('')

//  Checkbox
const $toast = useToast()

//  Test button text
const testButtonText = ref(' Beta (software)')

//  Test button usability
const testButtonDisable = ref(false)

//  Update button text
const updateButtonText = ref(' Update')

//  Update button usability
const updateButtonDisable = ref(false)

//  Updating the siteCookie UA Pop-up window
const siteCookieDialog = ref(false)

//  Site editor popup
const siteInfoDialog = ref(false)

//  Resource browsing popup
const resourceDialog = ref(false)

//  Resource browser header
const resourceHeaders = [
  { title: ' Caption', key: 'title', sortable: false },
  { title: ' Timing', key: 'pubdate', sortable: true },
  { title: ' Adults and children', key: 'size', sortable: true },
  { title: ' Breed', key: 'seeders', sortable: true },
  { title: ' Downloading', key: 'peers', sortable: true },
  { title: '', key: 'actions', sortable: false },
]

//  Data sheet
const resourceDataList = ref<TorrentInfo[]>([])

//  Look for sth.
const resourceSearch = ref('')

//  Loaded state
const resourceLoading = ref(false)

//  Total number of articles
const resourceTotalItems = ref(0)

//  Number of articles per page
const resourceItemsPerPage = ref(25)

//  User name and password form
const userPwForm = ref({
  username: '',
  password: '',
})

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
const siteForm = reactive<any>(cardProps.site ?? {})

//  Type conversion
siteForm.proxy = siteForm.proxy === 1
siteForm.render = siteForm.render === 1

//  Open the seed details page
function openTorrentDetail(page_url: string) {
  window.open(page_url, '_blank')
}

//  Download seed file
async function downloadTorrentFile(enclosure: string) {
  window.open(enclosure, '_blank')
}

//  Query site icon
async function getSiteIcon() {
  try {
    siteIcon.value = (await api.get(`site/icon/${cardProps.site?.id}`)).data.icon
  }
  catch (error) {
    console.error(error)
  }
}

//  Test site connectivity
async function testSite() {
  try {
    testButtonText.value = ' Under test ...'
    testButtonDisable.value = true

    const result: { [key: string]: any } = await api.get(`site/test/${cardProps.site?.id}`)
    if (result.success)
      $toast.success(`${cardProps.site?.name}  Connectivity test successful， Serviceable！`)
    else
      $toast.error(`${cardProps.site?.name}  Failed connectivity test：${result.message}`)

    testButtonText.value = ' Beta (software)'
    testButtonDisable.value = false
  }
  catch (error) {
    console.error(error)
  }
}

//  Open update siteCookie UA Pop-up window
async function handleSiteUpdate() {
  siteCookieDialog.value = true
}

//  Open the site editor pop-up window
async function handleSiteInfo() {
  siteInfoDialog.value = true
}

//  Open resource browsing popup
async function handleResourceBrowse() {
  resourceDialog.value = true
  getResourceList()
}

//  Call (programming)API， Updating the siteCookie UA
async function updateSiteCookie() {
  try {
    if (!userPwForm.value.username || !userPwForm.value.password)
      return

    //  Update button status
    siteCookieDialog.value = false
    updateButtonText.value = ' In the process of updating ...'
    updateButtonDisable.value = true

    const result: { [key: string]: any } = await api.get(
      `site/cookie/${cardProps.site?.id}`,
      {
        params: {
          username: userPwForm.value.username,
          password: userPwForm.value.password,
        },
      },
    )

    if (result.success)
      $toast.success(`${cardProps.site?.name}  UpdateCookie & UA  Successes！`)
    else
      $toast.error(`${cardProps.site?.name}  Update failure：${result.message}`)

    updateButtonText.value = ' Update'
    updateButtonDisable.value = false
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Deleting site information
async function deleteSiteInfo() {
  try {
    siteInfoDialog.value = false
    const result: { [key: string]: any } = await api.delete(`site/${cardProps.site?.id}`)
    if (result.success) {
      $toast.success(`${cardProps.site?.name}  Deleted successfully！`)
      emit('remove')
    }
    else { $toast.error(`${cardProps.site?.name}  Failed to delete：${result.message}`) }
  }
  catch (error) {
    $toast.error(`${cardProps.site?.name}  Failed to delete！`)
    console.error(error)
  }
}

//  Call (programming)API Update site information
async function updateSiteInfo() {
  try {
    //  Update button status
    siteInfoDialog.value = false

    const result: { [key: string]: any } = await api.put('site/', siteForm)
    if (result.success) {
      $toast.success(`${cardProps.site?.name}  Successful update！`)
      emit('update')
    }
    else { $toast.error(`${cardProps.site?.name}  Update failure：${result.message}`) }
  }
  catch (error) {
    $toast.error(`${cardProps.site?.name}  Update failure！`)
    console.error(error)
  }
}

//  PromoteChip Resemble
function getVolumeFactorClass(downloadVolume: number, uploadVolume: number) {
  if (downloadVolume === 0)
    return 'text-white bg-lime-500'
  else if (downloadVolume < 1)
    return 'text-white bg-green-500'
  else if (uploadVolume !== 1)
    return 'text-white bg-sky-500'
  else
    return 'text-white bg-gray-500'
}

//  Call (programming)API， Query site resources
async function getResourceList() {
  resourceLoading.value = true
  try {
    resourceDataList.value = await api.get(`site/resource/${cardProps.site?.id}`)
    resourceLoading.value = false
  }
  catch (error) {
    console.error(error)
  }
}

//  Open site page
function openSitePage() {
  window.open(cardProps.site?.url, '_blank')
}

//  Query site icon when loading
onMounted(() => {
  getSiteIcon()
})
</script>

<template>
  <VCard
    :height="cardProps.height"
    :width="cardProps.width"
    :flat="!siteForm.is_active"
    class="overflow-hidden"
    @click="handleSiteInfo"
  >
    <template #image>
      <VAvatar
        class="absolute right-2 bottom-2 rounded"
        variant="flat"
        rounded="0"
      >
        <VImg :src="siteIcon" />
      </VAvatar>
    </template>
    <VCardItem>
      <VCardTitle class="font-bold" @click.stop="openSitePage">
        {{ cardProps.site?.name }}
      </VCardTitle>
      <VCardSubtitle>{{ cardProps.site?.url }}</VCardSubtitle>
    </VCardItem>

    <ExistIcon v-if="siteForm.is_active" />

    <VCardText class="py-2">
      <VTooltip
        v-if="siteForm.render"
        text=" Browser emulation"
      >
        <template #activator="{ props }">
          <VIcon
            color="primary"
            class="me-2"
            v-bind="props"
            icon="mdi-apple-safari"
          />
        </template>
      </VTooltip>

      <VTooltip
        v-if="siteForm.proxy"
        text=" Act on behalf of sb. in a responsible position"
      >
        <template #activator="{ props }">
          <VIcon
            color="primary"
            class="me-2"
            v-bind="props"
            icon="mdi-network-outline"
          />
        </template>
      </VTooltip>

      <VTooltip
        v-if="siteForm.limit_interval"
        text=" Flow control"
      >
        <template #activator="{ props }">
          <VIcon
            color="primary"
            class="me-2"
            v-bind="props"
            icon="mdi-speedometer"
          />
        </template>
      </VTooltip>

      <VTooltip
        v-if="siteForm.filter"
        text=" Filtration"
      >
        <template #activator="{ props }">
          <VIcon
            color="primary"
            class="me-2"
            v-bind="props"
            icon="mdi-filter-cog-outline"
          />
        </template>
      </VTooltip>
    </VCardText>

    <VDivider
      class="opacity-75"
      style="border-color: rgba(var(--v-theme-on-background), var(--v-selected-opacity));"
    />

    <VCardActions>
      <VBtn
        v-if="!cardProps.site?.public"
        :disabled="updateButtonDisable"
        @click.stop="handleSiteUpdate"
      >
        <template #prepend>
          <VIcon icon="mdi-refresh" />
        </template>
        {{ updateButtonText }}
      </VBtn>
      <VBtn
        :disabled="testButtonDisable"
        @click.stop="testSite"
      >
        <template #prepend>
          <VIcon icon="mdi-link" />
        </template>
        {{ testButtonText }}
      </VBtn>
      <VBtn @click.stop="handleResourceBrowse">
        <template #prepend>
          <VIcon icon="mdi-web" />
        </template>
        Skim over
      </VBtn>
    </VCardActions>
  </VCard>
  <!--  Updating the siteCookie & UA Pop-up window -->
  <VDialog
    v-model="siteCookieDialog"
    max-width="50rem"
  >
    <!-- Dialog Content -->
    <VCard title=" Updating the siteCookie & UA">
      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userPwForm.username"
                label=" User id"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userPwForm.password"
                label=" Cryptographic"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                :rules="[requiredValidator]"
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
                @keydown.enter="updateSiteCookie"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions>
        <VSpacer />
        <VBtn @click="updateSiteCookie">
          Start updating
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <!--  Site editor popup -->
  <VDialog
    v-model="siteInfoDialog"
    max-width="50rem"
    persistent
    scrollable
  >
    <!-- Dialog Content -->
    <VCard :title="` Edit site - ${cardProps.site?.name}`">
      <VCardText class="pt-2">
        <DialogCloseBtn @click="siteInfoDialog = false" />
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
        <VBtn color="error" @click="deleteSiteInfo">
          Removing
        </VBtn>
        <VSpacer />
        <VBtn @click="updateSiteInfo">
          Recognize
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  <!--  Site resource popups -->
  <VDialog
    v-model="resourceDialog"
    max-width="80rem"
    scrollable
  >
    <!-- Dialog Content -->
    <VCard :title="`Skim over站点 - ${cardProps.site?.name}`">
      <DialogCloseBtn @click="resourceDialog = false" />
      <VCardText class="pt-2">
        <VDataTable
          v-model:items-per-page="resourceItemsPerPage"
          :headers="resourceHeaders"
          :items="resourceDataList"
          :items-length="resourceTotalItems"
          :search="resourceSearch"
          :loading="resourceLoading"
          density="compact"
          item-value="title"
          return-object
          fixed-header
          items-per-page-text=" Number of articles per page"
          page-text="{0}-{1}  Common {2}  Clause (of law or treaty)"
        >
          <template #item.title="{ item }">
            <div class="text-high-emphasis pt-1">
              {{ item.raw.title }}
            </div>
            <div class="text-sm my-1">
              {{ item.raw.description }}
            </div>
            <VChip
              v-for="(label, index) in item.raw?.labels"
              :key="index"
              variant="elevated"
              size="small"
              color="primary"
              class="me-1 mb-1"
            >
              {{ label }}
            </VChip>
            <VChip
              v-if="item.raw?.downloadvolumefactor !== 1 || item.raw?.uploadvolumefactor !== 1"
              :class="
                getVolumeFactorClass(item.raw?.downloadvolumefactor, item.raw?.uploadvolumefactor)
              "
              variant="elevated"
              size="small"
              class="me-1 mb-1"
            >
              {{ item.raw?.volume_factor }}
            </VChip>
          </template>
          <template #item.pubdate="{ item }">
            <div>{{ item.raw.date_elapsed }}</div>
            <div class="text-sm">
              {{ item.raw.pubdate }}
            </div>
          </template>
          <template #item.size="{ item }">
            <div class="text-nowrap whitespace-nowrap">
              {{ formatFileSize(item.raw.size) }}
            </div>
          </template>
          <template #item.seeders="{ item }">
            <div>{{ item.raw.seeders }}</div>
          </template>
          <template #item.peers="{ item }">
            <div>{{ item.raw.peers }}</div>
          </template>
          <template #item.actions="{ item }">
            <div class="me-n3">
              <IconBtn>
                <VIcon
                  icon="mdi-dots-vertical"
                />
                <VMenu
                  activator="parent"
                  close-on-content-click
                >
                  <VList>
                    <VListItem
                      variant="plain"
                      @click="openTorrentDetail(item.raw.page_url)"
                    >
                      <template #prepend>
                        <VIcon icon="mdi-information" />
                      </template>
                      <VListItemTitle> View details</VListItemTitle>
                    </VListItem>
                    <VListItem
                      v-if="item.raw.enclosure?.startsWith('http')"
                      variant="plain"
                      @click="downloadTorrentFile(item.raw.enclosure)"
                    >
                      <template #prepend>
                        <VIcon icon="mdi-download" />
                      </template>
                      <VListItemTitle> Download seeds</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </IconBtn>
            </div>
          </template>
          <template #no-data>
            No data
          </template>
        </VDataTable>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.v-table th {
  white-space: nowrap;
}
</style>

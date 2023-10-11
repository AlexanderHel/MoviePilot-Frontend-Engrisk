<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import { calculateTimeDifference } from '@/@core/utils'
import { formatSeason } from '@/@core/utils/formatters'
import { numberValidator } from '@/@validators'
import api from '@/api'
import type { Site, Subscribe } from '@/api/types'

//  Input parameter
const props = defineProps({
  media: Object as PropType<Subscribe>,
})

//  Define custom events that are triggered
const emit = defineEmits(['remove', 'save'])

//  Checkbox
const $toast = useToast()

//  Whether the image has finished loading
const imageLoaded = ref(false)

//  Subscribe to pop-ups
const subscribeInfoDialog = ref(false)

//  Site data list
const siteList = ref<Site[]>([])

//  Site selection download box
const selectSitesOptions = ref<{ [key: number]: string }[]>([])

//  Subscription edit form
const subscribeForm = reactive<any>(props.media ?? {})

//  Type conversion
subscribeForm.best_version = subscribeForm.best_version === 1

//  Last updated
const lastUpdateText = ref(
  `${
    props.media?.last_update
      ? `${calculateTimeDifference(props.media?.last_update || '')} Ahead`
      : ''
  }`,
)

//  Image load completion response
function imageLoadHandler() {
  imageLoaded.value = true
}

//  According to type  Return to different icons
function getIcon() {
  if (props.media?.type === ' Cinematic')
    return 'mdi-movie'
  else if (props.media?.type === ' Dramas')
    return 'mdi-television-classic'
  else
    return 'mdi-help-circle'
}

//  Calculation of percentages
function getPercentage() {
  if (props.media?.total_episode === 0)
    return 0

  return Math.round(
    (((props.media?.total_episode ?? 0) - (props.media?.lack_episode ?? 0))
      / (props.media?.total_episode ?? 1))
      * 100,
  )
}

//  Calculate text color
function getTextColor() {
  return imageLoaded.value ? 'white' : ''
}

//  Calculated text classes
function getTextClass() {
  return imageLoaded.value ? 'text-white' : ''
}

//  Delete subscription
async function removeSubscribe() {
  try {
    const result: { [key: string]: any } = await api.delete(
      `subscribe/${props.media?.id}`,
    )

    if (result.success) {
      //  Notify the parent component of a refresh
      emit('remove')
    }
  }
  catch (e) {
    console.log(e)
  }
}

//  Search subscriptions
async function searchSubscribe() {
  try {
    const result: { [key: string]: any } = await api.get(
      `subscribe/search/${props.media?.id}`,
    )

    //  Draw attention to sth.
    if (result.success)
      $toast.success(`${props.media?.name}  Submit search request successful！`)
  }
  catch (e) {
    console.log(e)
  }
}

//  InvocationsAPI Modify subscription
async function updateSubscribeInfo() {
  subscribeInfoDialog.value = false
  try {
    const result: { [key: string]: any } = await api.put('subscribe/', subscribeForm)

    //  Draw attention to sth.
    if (result.success) {
      $toast.success(`${props.media?.name}  Successful update！`)
      //  Notify the parent component of a refresh
      emit('remove')
    }
    else { $toast.error(`${props.media?.name}  Update failure：${result.message}！`) }
  }
  catch (e) {
    console.log(e)
  }
}

//  Get site list data
async function loadSites() {
  try {
    const data: Site[] = await api.get('site/rss')

    //  Filter sites， Only enabled sites are shown
    siteList.value = data.filter(item => item.is_active)
  }
  catch (error) {
    console.error(error)
  }
}

//  Get site list checkbox data
async function getSiteList() {
  //  Load subscription site list
  if (!siteList.value.length)
    await loadSites()

  const maps = siteList.value.map((item) => {
    return {
      title: item.name,
      value: item.id,
    }
  })

  selectSitesOptions.value = maps.flat()
}

//  Edit subscription response
async function editSubscribeDialog() {
  await getSiteList()
  subscribeInfoDialog.value = true
}

//  Pop-up menu
const dropdownItems = ref([
  {
    title: ' Compiler',
    value: 1,
    props: {
      prependIcon: 'mdi-file-edit-outline',
      click: editSubscribeDialog,
    },
  },
  {
    title: ' Look for sth.',
    value: 2,
    props: {
      prependIcon: 'mdi-magnify',
      click: searchSubscribe,
    },
  },
  {
    title: ' Unsubscribe',
    value: 3,
    props: {
      prependIcon: 'mdi-trash-can-outline',
      color: 'error',
      click: removeSubscribe,
    },
  },
])
</script>

<template>
  <VCard
    :key="props.media?.id"
    :class="`${subscribeForm.best_version ? 'outline-dashed outline-1' : ''}`"
    @click="editSubscribeDialog"
  >
    <template #image>
      <VImg
        :src="props.media?.backdrop || props.media?.poster"
        aspect-ratio="2/3"
        cover
        class="brightness-50"
        @load="imageLoadHandler"
      />
    </template>
    <VCardItem>
      <template #prepend>
        <VIcon
          size="1.9rem"
          :color="getTextColor()"
          :icon="getIcon()"
        />
      </template>
      <VCardTitle :class="getTextClass()">
        {{ props.media?.name }}
        {{ formatSeason(props.media?.season ? props.media?.season.toString() : "") }}
      </VCardTitle>
      <template #append>
        <div class="me-n3">
          <IconBtn>
            <VIcon
              icon="mdi-dots-vertical"
              :color="getTextColor()"
            />
            <VMenu
              activator="parent"
              close-on-content-click
            >
              <VList>
                <VListItem
                  v-for="(item, i) in dropdownItems"
                  :key="i"
                  variant="plain"
                  :base-color="item.props.color"
                  @click="item.props.click"
                >
                  <template #prepend>
                    <VIcon :icon="item.props.prependIcon" />
                  </template>
                  <VListItemTitle v-text="item.title" />
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </div>
      </template>
    </VCardItem>

    <VCardText>
      <p
        class="clamp-text mb-0"
        :class="getTextClass()"
      >
        {{ props.media?.description }}
      </p>
    </VCardText>

    <VCardText class="d-flex justify-space-between align-center flex-wrap">
      <div class="d-flex align-center">
        <IconBtn
          icon="mdi-star"
          :color="getTextColor()"
          class="me-1"
        />
        <span
          class="text-subtitle-2 me-4"
          :class="getTextClass()"
        >{{
          props.media?.vote
        }}</span>
        <IconBtn
          v-if="props.media?.total_episode"
          v-bind="props"
          icon="mdi-progress-clock"
          :color="getTextColor()"
          class="me-1"
        />
        <span
          v-if="props.media?.season"
          class="text-subtitle-2 me-4"
          :class="getTextClass()"
        >{{ (props.media?.total_episode || 0) - (props.media?.lack_episode || 0) }} /
          {{ props.media?.total_episode }}</span>
        <IconBtn
          v-if="props.media?.username"
          icon="mdi-account"
          :color="getTextColor()"
          class="me-1"
        />
        <span
          v-if="props.media?.username"
          class="text-subtitle-2 me-4"
          :class="getTextClass()"
        >
          {{ props.media?.username }}
        </span>
      </div>
    </VCardText>
    <VCardText
      v-if="lastUpdateText"
      class="absolute right-0 bottom-0 d-flex align-center p-2 text-gray-300"
    >
      <VIcon
        icon="mdi-download"
        class="me-1"
      /> {{ lastUpdateText }}
    </VCardText>
    <VProgressLinear
      v-if="getPercentage() > 0"
      :model-value="getPercentage()"
      bg-color="success"
      color="success"
    />
  </VCard>
  <!--  Subscribe to edit popups -->
  <VDialog
    v-model="subscribeInfoDialog"
    max-width="50rem"
    persistent
    scrollable
  >
    <!-- Dialog Content -->
    <VCard :title="` Subscribe to - ${props.media?.name}`">
      <VCardText class="pt-2">
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="subscribeForm.keyword"
                label=" Search keywords"
              />
            </VCol>
            <VCol
              v-if="props.media?.type === ' Dramas'"
              cols="12"
              md="3"
            >
              <VTextField
                v-model="subscribeForm.total_episode"
                label=" Total episodes"
                :rules="[numberValidator]"
              />
            </VCol>
            <VCol
              v-if="props.media?.type === ' Dramas'"
              cols="12"
              md="3"
            >
              <VTextField
                v-model="subscribeForm.start_episode"
                label=" Number of episodes"
                :rules="[numberValidator]"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="subscribeForm.include"
                label=" Embody（ Keywords.、 Regular formula）"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="subscribeForm.exclude"
                label=" Rule out（ Keywords.、 Regular formula）"
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VSelect
                v-model="subscribeForm.sites"
                :items="selectSitesOptions"
                chips
                label=" Subscribe to the site"
                multiple
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12">
              <VSwitch
                v-model="subscribeForm.best_version"
                label=" Typesetting"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>

      <VCardActions>
        <VBtn @click="subscribeInfoDialog = false">
          Abolish
        </VBtn>
        <VSpacer />
        <VBtn @click="updateSubscribeInfo">
          Recognize
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

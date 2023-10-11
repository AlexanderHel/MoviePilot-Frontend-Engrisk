<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'
import type { Plugin } from '@/api/types'
import FormRender from '@/components/render/FormRender.vue'
import PageRender from '@/components/render/PageRender.vue'
import { isNullOrEmptyObject } from '@core/utils'

//  Input parameter
const props = defineProps({
  plugin: Object as PropType<Plugin>,
  width: String,
  height: String,
})

//  Define custom events that are triggered
const emit = defineEmits(['remove', 'save'])

//  Checkbox
const $toast = useToast()

//  Whether it is visible or not
const isVisible = ref(true)

//  Plugin configuration page
const pluginConfigDialog = ref(false)

//  Plugin configuration form data
const pluginConfigForm = ref({})

//  Plugin form configuration items
let pluginFormItems = reactive([])

//  Plugin details page
const pluginInfoDialog = ref(false)

//  Plugin details pageConfigure项
let pluginPageItems = reactive([])

//  Whether the image has finished loading
const isImageLoaded = ref(false)

//  Call (programming)API Uninstallation of plug-ins
async function uninstallPlugin() {
  try {
    const result: { [key: string]: any } = await api.delete(`plugin/${props.plugin?.id}`)
    if (result.success) {
      $toast.success(` Plug-in (software component) ${props.plugin?.plugin_name}  Uninstalled`)

      //  Notify the parent component of a refresh
      emit('remove')
    }
    else {
      $toast.error(` Plug-in (software component) ${props.plugin?.plugin_name}  Failed to uninstall：${result.message}}`)
    }
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Read the form page
async function loadPluginForm() {
  try {
    const result: { [key: string]: any } = await api.get(`plugin/form/${props.plugin?.id}`)
    if (result) {
      pluginFormItems = result.conf
      if (result.model)
        pluginConfigForm.value = result.model
    }
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Read details page
async function loadPluginPage() {
  try {
    const result: [] = await api.get(`plugin/page/${props.plugin?.id}`)
    if (result)
      pluginPageItems = result
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Read configuration data
async function loadPluginConf() {
  try {
    const result: { [key: string]: any } = await api.get(`plugin/${props.plugin?.id}`)
    if (!isNullOrEmptyObject(result))
      pluginConfigForm.value = result
  }
  catch (error) {
    console.error(error)
  }
}

//  Call (programming)API Saving configuration data
async function savePluginConf() {
  try {
    const result: { [key: string]: any } = await api.put(`plugin/${props.plugin?.id}`, pluginConfigForm.value)
    if (result.success) {
      $toast.success(` Plug-in (software component) ${props.plugin?.plugin_name}  Configuration saved`)
      pluginConfigDialog.value = false
      //  Notify the parent component of a refresh
      emit('save')
    }
    else {
      $toast.error(` Plug-in (software component) ${props.plugin?.plugin_name}  Configuration save failure：${result.message}}`)
    }
  }
  catch (error) {
    console.error(error)
  }
}

//  Show plugin details
async function showPluginInfo() {
  //  Loading details
  await loadPluginPage()
  pluginConfigDialog.value = false
  pluginInfoDialog.value = true
}

//  Show plugin configuration
async function showPluginConfig() {
  //  Loading forms
  await loadPluginForm()
  //  Load configuration
  await loadPluginConf()
  //  Show dialog box
  pluginInfoDialog.value = false
  pluginConfigDialog.value = true
}

//  Pop-up menu
const dropdownItems = ref([
  {
    title: ' View details',
    value: 1,
    show: props.plugin?.has_page,
    props: {
      prependIcon: 'mdi-information-outline',
      click: showPluginInfo,
    },
  },
  {
    title: ' Configure',
    value: 2,
    show: true,
    props: {
      prependIcon: 'mdi-cog-outline',
      click: showPluginConfig,
    },
  },
  {
    title: ' Uninstallation',
    value: 3,
    show: true,
    props: {
      prependIcon: 'mdi-trash-can-outline',
      color: 'error',
      click: uninstallPlugin,
    },
  },
])
</script>

<template>
  <!--  Plug-in card -->
  <VCard
    v-if="isVisible"
    :width="props.width"
    :height="props.height"
    @click="() => {
      if (props.plugin?.has_page)
        showPluginInfo()
      else
        showPluginConfig()
    }"
  >
    <div
      class="relative pa-4 text-center card-cover-blurred"
      :style="{ background: `${props.plugin?.plugin_color}` }"
    >
      <div class="me-n3 absolute top-0 right-3">
        <IconBtn>
          <VIcon icon="mdi-dots-vertical" class="text-white" />
          <VMenu
            activator="parent"
            close-on-content-click
          >
            <VList>
              <VListItem
                v-for="(item, i) in dropdownItems"
                v-show="item.show"
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
      <VAvatar
        size="8rem"
        :class="{ shadow: isImageLoaded }"
      >
        <VImg
          :src="`/plugin_icon/${props.plugin?.plugin_icon}`"
          aspect-ratio="4/3"
          cover
          :class="{ shadow: isImageLoaded }"
        />
      </VAvatar>
    </div>
    <VCardItem class="py-2">
      <VCardTitle class="flex items-center flex-row">
        <VBadge v-if="props.plugin?.state" dot inline color="success" class="me-1 mb-1" />
        {{ props.plugin?.plugin_name }}
      </VCardTitle>
    </VCardItem>
    <VCardText>
      {{ props.plugin?.plugin_desc }}
    </VCardText>
  </VCard>
  <!--  Plugin configuration page -->
  <VDialog
    v-model="pluginConfigDialog"
    max-width="50rem"
    scrollable
    persistent
  >
    <VCard :title="`${props.plugin?.plugin_name} -  Configure`">
      <DialogCloseBtn @click="pluginConfigDialog = false" />
      <VCardText>
        <FormRender
          v-for="(item, index) in pluginFormItems"
          :key="index"
          :config="item"
          :form="pluginConfigForm"
        />
      </VCardText>
      <VCardActions>
        <VBtn v-if="pluginPageItems.length > 0" @click="showPluginInfo">
          View details
        </VBtn>
        <VSpacer />
        <VBtn @click="savePluginConf">
          Save (a file etc) (computing)
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>

  <!--  Plugin details page -->
  <VDialog
    v-model="pluginInfoDialog"
    max-width="62.5rem"
    scrollable
    persistent
  >
    <VCard :title="`${props.plugin?.plugin_name}`">
      <DialogCloseBtn @click="pluginInfoDialog = false" />
      <VCardText>
        <PageRender
          v-for="(item, index) in pluginPageItems"
          :key="index"
          :config="item"
        />
      </VCardText>
      <VCardActions>
        <VBtn @click="showPluginConfig">
          Configure
        </VBtn>
        <VSpacer />
        <VBtn @click="pluginInfoDialog = false">
          Cloture
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
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

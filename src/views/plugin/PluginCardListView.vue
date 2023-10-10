<script lang="ts" setup>
import api from '@/api'
import type { Plugin } from '@/api/types'
import NoDataFound from '@/components/NoDataFound.vue'
import PluginAppCard from '@/components/cards/PluginAppCard.vue'
import PluginCard from '@/components/cards/PluginCard.vue'

//  Data sheet
const dataList = ref<Plugin[]>([])

//  Is it refreshed
const isRefreshed = ref(false)

// APP Market window
const PluginAppDialog = ref(false)

//  Get the list of installed plugins
const getInstalledPluginList = computed(() => {
  return dataList.value.filter(item => item.installed)
})

//  Get the list of uninstalled plugins
const getUninstalledPluginList = computed(() => {
  return dataList.value.filter(item => !item.installed)
})

//  Close the plug-in market window
function pluginDialogClose() {
  PluginAppDialog.value = false
}

//  New plugin installed
function pluginInstalled() {
  fetchData()
  pluginDialogClose()
}

//  Get plugin list data
async function fetchData() {
  try {
    dataList.value = await api.get('plugin/')
    isRefreshed.value = true
  }
  catch (error) {
    console.error(error)
  }
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
    v-if="getInstalledPluginList.length > 0"
    class="grid gap-4 grid-plugin-card"
  >
    <PluginCard
      v-for="data in getInstalledPluginList"
      :key="data.id"
      :plugin="data"
      @remove="fetchData"
      @save="fetchData"
    />
  </div>
  <NoDataFound
    v-if="getInstalledPluginList.length === 0 && isRefreshed"
    error-code="404"
    error-title=" No plug-ins installed"
    error-description=" Click on the button in the lower right corner， Go to the plugin marketplace to install the plugin。"
  />
  <!-- App Market (also in abstract) -->
  <VDialog
    v-model="PluginAppDialog"
    fullscreen
    :scrim="false"
    transition="dialog-bottom-transition"
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

    <!-- Dialog Content -->
    <VCard>
      <!-- Toolbar -->
      <div>
        <VToolbar color="primary">
          <VToolbarTitle> Plug-in market</VToolbarTitle>

          <VSpacer />

          <VToolbarItems>
            <VBtn
              size="x-large"
              @click="pluginDialogClose"
            >
              <VIcon
                color="white"
                icon="mdi-close"
              />
            </VBtn>
          </VToolbarItems>
        </VToolbar>
      </div>
      <div class="pa-4">
        <div class="grid gap-4 grid-plugin-card">
          <PluginAppCard
            v-for="data in getUninstalledPluginList"
            :key="data.id"
            :plugin="data"
            @install="pluginInstalled"
          />
        </div>
        <NoDataFound
          v-if="getUninstalledPluginList.length === 0 && isRefreshed"
          error-code="404"
          error-title=" No uninstalled plug-ins"
          error-description=" All available plugins are installed。"
        />
      </div>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.grid-plugin-card {
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  padding-block-end: 1rem;
}
</style>

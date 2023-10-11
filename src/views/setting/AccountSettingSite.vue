<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'

//  Checkbox
const $toast = useToast()

//  Site reset
const isConfirmResetSites = ref(false)

//  Site reset按钮文本
const resetSitesText = ref(' Reset site data')

//  Site reset按钮可用状态
const resetSitesDisabled = ref(false)

//  Reset site
async function resetSites() {
  try {
    resetSitesDisabled.value = true
    resetSitesText.value = ' Resetting....'

    const result: { [key: string]: any } = await api.get('site/reset')
    if (result.success)
      $toast.success(' Site reset successful， Please wait.CookieCloud Synchronized completion！')

    else
      $toast.error(' Site reset failed！')

    resetSitesDisabled.value = false
    resetSitesText.value = ' Reset site data'
  }
  catch (error) {
    console.log(error)
  }
}
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title=" Site reset">
        <VCardText>
          <div>
            <VCheckbox v-model="isConfirmResetSites" label=" Confirm deletion of all site data and resynchronization。" />
          </div>

          <VBtn :disabled="!isConfirmResetSites || resetSitesDisabled" color="error" class="mt-3" @click="resetSites">
            {{ resetSitesText }}
          </VBtn>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

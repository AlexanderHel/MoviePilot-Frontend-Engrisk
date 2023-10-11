<script setup lang="ts">
import { reactive, ref } from 'vue'
import { requiredValidator } from '@/@validators'
import api from '@/api'
import type { Context } from '@/api/types'
import MediaInfoCard from '@/components/cards/MediaInfoCard.vue'

//  Identification results
const nameTestResult = ref<Context>()

//  Name recognition form
const nameTestForm = reactive({
  title: '',
  subtitle: '',
})

//  Recognize button status
const nameTestLoading = ref(false)

//  Recognize button text
const nameTestText = ref(' Recognize')

//  Whether to display results
const showResult = ref(false)

//  Call (programming)API Recognize
async function nameTest() {
  if (!nameTestForm.title)
    return

  try {
    nameTestLoading.value = true
    nameTestText.value = ' Under identification...'
    showResult.value = false
    nameTestResult.value = await api.get('media/recognize', {
      params: {
        title: nameTestForm.title,
        subtitle: nameTestForm.subtitle,
      },
    })
    nameTestLoading.value = false
    nameTestText.value = ' Recertification'
    showResult.value = true
  }
  catch (error) {
    console.error(error)
  }
}
</script>

<template>
  <VForm @submit.prevent="() => {}">
    <VRow class="pt-2">
      <VCol cols="12">
        <VTextField
          v-model="nameTestForm.title"
          label=" Caption"
          :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="12">
        <VTextarea
          v-model="nameTestForm.subtitle"
          label=" Subheading"
          rows="2"
          auto-grow
        />
      </VCol>
    </VRow>
    <VRow>
      <VCol
        cols="12"
        class="text-center"
      >
        <VBtn
          :disabled="nameTestLoading"
          @click="nameTest"
        >
          <template #prepend>
            <VIcon icon="mdi-text-recognition" />
          </template>
          {{ nameTestText }}
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
  <VExpandTransition>
    <div v-show="showResult">
      <MediaInfoCard :context="nameTestResult" />
    </div>
  </VExpandTransition>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { requiredValidator } from '@/@validators'
import api from '@/api'

//  Identification results
const ruleTestResult = ref('')

//  Name recognition form
const ruleTestForm = reactive({
  title: '',
  subtitle: '',
  ruletype: '1',
})

//  Recognize button status
const ruleTestLoading = ref(false)

//  Recognize button text
const ruleTestText = ref(' Beta (software)')

//  Whether to display results
const showResult = ref(false)

//  Call (programming)API Recognize
async function ruleTest() {
  if (!ruleTestForm.title)
    return

  try {
    ruleTestLoading.value = true
    ruleTestText.value = ' Testing...'
    showResult.value = false
    const result: { [key: string]: any } = await api.get('system/ruletest', {
      params: {
        title: ruleTestForm.title,
        subtitle: ruleTestForm.subtitle,
        ruletype: ruleTestForm.ruletype,
      },
    })
    if (result.success)
      ruleTestResult.value = ` Prioritization：${result.data.priority}`

    else
      ruleTestResult.value = ' No priority rules hit！'

    ruleTestLoading.value = false
    ruleTestText.value = ' Retest'
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
      <VCol cols="12" md="8">
        <VTextField
          v-model="ruleTestForm.title"
          label=" Caption"
          :rules="[requiredValidator]"
        />
      </VCol>
      <VCol cols="12" md="4">
        <VSelect
          v-model="ruleTestForm.ruletype"
          label=" Type of rule"
          :items="[{
            title: ' Subscription priority',
            value: '1',
          }, {
            title: ' Prioritization of plate washing',
            value: '2',
          }, {
            title: ' Search priority',
            value: '3',
          }]"
        />
      </VCol>
      <VCol cols="12">
        <VTextarea
          v-model="ruleTestForm.subtitle"
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
          :disabled="ruleTestLoading"
          @click="ruleTest"
        >
          <template #prepend>
            <VIcon icon="mdi-filter-check-outline" />
          </template>
          {{ ruleTestText }}
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
  <VExpandTransition>
    <div v-show="showResult">
      <VCol>
        <VAlert
          icon="mdi-alert-circle-outline"
        >
          {{ ruleTestResult }}
        </VAlert>
      </VCol>
    </div>
  </VExpandTransition>
</template>

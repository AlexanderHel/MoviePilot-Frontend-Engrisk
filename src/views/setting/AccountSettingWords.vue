<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'

//  Checkbox
const $toast = useToast()

//  Customized identifiers
const customIdentifiers = ref('')

//  Customizing the production team
const customReleaseGroups = ref('')

//  Custom placeholders
const customization = ref('')

//  Document organization masked words
const transferExcludeWords = ref('')

//  Querying set identifiers
async function queryCustomIdentifiers() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/setting/CustomIdentifiers',
    )

    customIdentifiers.value = result.data?.value.join('\n')
  }
  catch (error) {
    console.log(error)
  }
}

//  Query set production groups
async function queryCustomReleaseGroups() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/setting/CustomReleaseGroups',
    )

    customReleaseGroups.value = result.data?.value.join('\n')
  }
  catch (error) {
    console.log(error)
  }
}

//  Queries the custom placeholders that have been set
async function queryCustomization() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/setting/Customization',
    )

    customization.value = result.data?.value.join('\n')
  }
  catch (error) {
    console.log(error)
  }
}

//  Checking the blocked words set
async function queryTransferExcludeWords() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/setting/TransferExcludeWords',
    )

    transferExcludeWords.value = result.data?.value.join('\n')
  }
  catch (error) {
    console.log(error)
  }
}

//  Save user-set identifiers
async function saveCustomIdentifiers() {
  try {
    //  User name and password
    const result: { [key: string]: any } = await api.post(
      'system/setting/CustomIdentifiers',
      customIdentifiers.value.split('\n'),
    )

    if (result.success)
      $toast.success(' Customized identifier saved successfully')
    else
      $toast.error(' Failure to save customized identifiers！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Save custom production groups
async function saveCustomReleaseGroups() {
  try {
    //  User name and password
    const result: { [key: string]: any } = await api.post(
      'system/setting/CustomReleaseGroups',
      customReleaseGroups.value.split('\n'),
    )

    if (result.success)
      $toast.success(' Customizing the production team/ Subtitle set saved successfully')
    else
      $toast.error(' Customizing the production team/ Failed to save subtitle set！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Saving custom placeholders
async function saveCustomization() {
  try {
    //  User name and password
    const result: { [key: string]: any } = await api.post(
      'system/setting/Customization',
      customization.value.split('\n'),
    )

    if (result.success)
      $toast.success(' Custom placeholders saved successfully')
    else
      $toast.error(' Failed to save custom placeholder！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Save file to organize block words
async function saveTransferExcludeWords() {
  try {
    //  User name and password
    const result: { [key: string]: any } = await api.post(
      'system/setting/TransferExcludeWords',
      transferExcludeWords.value.split('\n'),
    )

    if (result.success)
      $toast.success(' File organizing blockwords saved successfully')
    else
      $toast.error(' File organizing blockword save failure！')
  }
  catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  queryCustomIdentifiers()
  queryCustomReleaseGroups()
  queryCustomization()
  queryTransferExcludeWords()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title=" Customized identifiers">
        <VCardSubtitle>  Add rules to preprocess seed names or filenames to correct recognition。 </VCardSubtitle>
        <VCardItem>
          <VTextarea
            v-model="customIdentifiers"
            auto-grow
            placeholder=" Regular expression support， Special characters are required\ Transferred meaning， Groups of one act， The following configuration formats are supported：
Blocked word
=>  Superseded word
 Alternative word
<>  Prepositioning words >>  Post locator（EP）
 Set offset
=>  Superseded word
 Alternative word && <>  Prepositioning words >>  Post locator（EP）
 Set offset"
          />
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            @click="saveCustomIdentifiers"
          >
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title=" Customizing the production team/ Subtitling team">
        <VCardSubtitle>  Add unrecognizable production groups/ Subtitling team。 </VCardSubtitle>
        <VCardItem>
          <VTextarea
            v-model="customReleaseGroups"
            auto-grow
            placeholder=" Regular expression support， Special characters are required\ Transferred meaning， One line represents one production team/ Subtitling team"
          />
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            @click="saveCustomReleaseGroups"
          >
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title=" Custom placeholders">
        <VCardSubtitle>  Add custom placeholders to recognize regulars， The renaming format adds{{customization}} Utilization。 </VCardSubtitle>
        <VCardItem>
          <VTextarea
            v-model="customization"
            auto-grow
            placeholder=" Multiple matches are separated by new lines， Regular expression support， Note the escaping of special characters"
          />
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            @click="saveCustomization"
          >
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title="文件整理Blocked word">
        <VCardSubtitle> 目录名或文件名中包含Blocked word时不进行整理。 </VCardSubtitle>
        <VCardItem>
          <VTextarea
            v-model="transferExcludeWords"
            auto-grow
            placeholder="支持正则表达式，特殊字符需要\转义，一行代表一个Blocked word"
          />
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            @click="saveTransferExcludeWords"
          >
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'

//  Checkbox
const $toast = useToast()

//  Seeding priority rule
const selectedTorrentPriority = ref<string>('seeder')

//  Seeding priority rule下拉框
const TorrentPriorityItems = [
  { title: ' Site priority', value: 'site' },
  { title: ' Prioritize the number of species (math.)', value: 'seeder' },
]

//  Inclusion and exclusion rules
const defaultFilterRules = ref({
  include: '',
  exclude: '',
})

//  Query seed prioritization rules
async function queryTorrentPriority() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/setting/TorrentsPriority',
    )

    selectedTorrentPriority.value = result.data?.value
  }
  catch (error) {
    console.log(error)
  }
}

//  Query inclusion and exclusion rules
async function queryDefaultFilter() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/setting/DefaultFilterRules',
    )
    if (result.data?.value)
      defaultFilterRules.value = result.data?.value
  }
  catch (error) {
    console.log(error)
  }
}

//  Saved seed priority rule
async function saveTorrentPriority() {
  try {
    //  User name and password
    const result: { [key: string]: any } = await api.post(
      'system/setting/TorrentsPriority',
      selectedTorrentPriority.value,
    )

    if (result.success)
      $toast.success(' Priority rules saved successfully')
    else
      $toast.error(' Priority rule save failure！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Preserving inclusion and exclusion rules
async function saveDefaultFilter() {
  try {
    const result: { [key: string]: any } = await api.post(
      'system/setting/DefaultFilterRules',
      defaultFilterRules.value,
    )
    if (result.success)
      $toast.success(' The default contains/ Exclusion rule saved successfully')
    else
      $toast.error(' The default contains/ Exclusion rule save failure！')
  }
  catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  queryTorrentPriority()
  queryDefaultFilter()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title=" Download priority rules">
        <VCardSubtitle>  Sort and prioritize downloads by site priority or number of resource seeds。 </VCardSubtitle>
        <VCardText>
          <VForm>
            <VRow>
              <VCol cols="12" md="6">
                <VSelect
                  v-model="selectedTorrentPriority"
                  :items="TorrentPriorityItems"
                  label=" Priority rules"
                  outlined
                />
              </VCol>
            </VRow>
          </vform>
        </VCardText>
        <VCardItem>
          <VBtn
            type="submit"
            @click="saveTorrentPriority"
          >
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title=" Default filtering rules">
        <VCardSubtitle>  Set the filtering rules to be used by default when searching and subscribing。 </VCardSubtitle>
        <VCardText>
          <VForm>
            <VRow>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="defaultFilterRules.include"
                  type="text"
                  label=" Embody（ Keywords.、 Regular formula）"
                />
              </VCol>
              <VCol cols="12" md="6">
                <VTextField
                  v-model="defaultFilterRules.exclude"
                  type="text"
                  label=" Rule out（ Keywords.、 Regular formula）"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardItem>
          <VBtn
            type="submit"
            @click="saveDefaultFilter"
          >
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
.grid-filterrule-card {
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  padding-block-end: 1rem;
}
</style>

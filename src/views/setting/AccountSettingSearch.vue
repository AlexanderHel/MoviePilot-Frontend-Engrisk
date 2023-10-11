<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'
import FilterRuleCard from '@/components/cards/FilterRuleCard.vue'
import type { Site } from '@/api/types'

//  Rule card type
interface FilterCard {
  //  Prioritization
  pri: string
  //  Selected rules
  rules: string[]
}

//  Checkbox
const $toast = useToast()

//  Rule card list
const filterCards = ref<FilterCard[]>([])

//  All sites
const allSites = ref<Site[]>([])

//  Check the subscription site
const selectedSites = ref<number[]>([])

//  Query set priority rules
async function queryCustomFilters() {
  try {
    const result: { [key: string]: any } = await api.get('system/setting/SearchFilterRules')
    if (result.success) {
      //  Saved as a string， Needs to be split into arrays
      const groups = result.data?.value?.split('>') ?? []

      //  Generating rule cards
      filterCards.value = groups?.map((group: string, index: number) => {
        return {
          pri: (index + 1).toString(),
          rules: group.split('&'),
        }
      })
    }
  }
  catch (error) {
    console.log(error)
  }
}

//  Save user-set rules
async function saveCustomFilters() {
  try {
    //  Process sth. when it has a value
    let value = ''
    if (filterCards.value.length !== 0) {
      //  Splice card rules into strings
      value = filterCards.value
        .filter(card => card.rules.length > 0)
        .map(card => card.rules.join('&'))
        .join('>')
    }
    //  Save (a file etc) (computing)
    const result: { [key: string]: any } = await api.post(
      'system/setting/SearchFilterRules',
      value,
    )

    if (result.success)
      $toast.success(' Search prioritization saved successfully')
    else
      $toast.error(' Search prioritization save failed！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Updating the value of a rule card
function updateFilterCardValue(pri: string, rules: string[]) {
  const card = filterCards.value.find(card => card.pri === pri)
  if (card)
    card.rules = rules
}

//  Remove cards
function filterCardClose(pri: string) {
  //  Commander-in-chief (military)pri The corresponding card is removed from the list， And update the serial numbers of the remaining cards
  const updatedCards = filterCards.value
    .filter(card => card.pri !== pri)
    .map((card, index) => {
      card.pri = (index + 1).toString()
      return card
    })
  //  Update filterCards.value
  filterCards.value = updatedCards
}

//  Add cards
function addFilterCard() {
  //  Prioritization
  const pri = (filterCards.value.length + 1).toString()

  //  New card
  const newCard: FilterCard = { pri, rules: [] }

  //  Add to list
  filterCards.value.push(newCard)
}

//  Search all sites
async function querySites() {
  try {
    const data: Site[] = await api.get('site/')

    //  Filter sites， Only enabled sites are shown
    allSites.value = data.filter(item => item.is_active)
    querySelectedSites()
  }
  catch (error) {
    console.log(error)
  }
}

//  Query user-selected sites
async function querySelectedSites() {
  try {
    const result: { [key: string]: any } = await api.get('system/setting/IndexerSites')

    selectedSites.value = result.data?.value ?? []
  }
  catch (error) {
    console.log(error)
  }
}

//  Save (a file etc) (computing)用户选中的站点
async function saveSelectedSites() {
  try {
    //  User name and password
    const result: { [key: string]: any } = await api.post('system/setting/IndexerSites', selectedSites.value)

    if (result.success)
      $toast.success(' Search site saved successfully')
    else
      $toast.error(' Failed to save search site！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Upward prioritization
function onLevelUp(pri: string) {
  //  Find the current card
  const card = filterCards.value.find(card => card.pri === pri)
  if (!card)
    return

  //  Find the current card的上一张卡片
  const prevCard = filterCards.value.find(card => card.pri === (parseInt(pri) - 1).toString())
  if (!prevCard)
    return

  //  Exchanging the priority of two cards
  const temp = card.pri
  card.pri = prevCard.pri
  prevCard.pri = temp

  //  Cards re-prioritized
  filterCards.value.sort((a, b) => parseInt(a.pri) - parseInt(b.pri))
}

//  Downward prioritization
function onLevelDown(pri: string) {
  //  Find the current card
  const card = filterCards.value.find(card => card.pri === pri)
  if (!card)
    return

  //  Find the current card的下一张卡片
  const nextCard = filterCards.value.find(card => card.pri === (parseInt(pri) + 1).toString())
  if (!nextCard)
    return

  //  Exchanging the priority of two cards
  const temp = card.pri
  card.pri = nextCard.pri
  nextCard.pri = temp

  //  Cards re-prioritized
  filterCards.value.sort((a, b) => parseInt(a.pri) - parseInt(b.pri))
}

onMounted(() => {
  queryCustomFilters()
  querySites()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title=" Search site">
        <VCardSubtitle>  Only selected sites will be used in searches。</VCardSubtitle>

        <VCardItem>
          <VChipGroup v-model="selectedSites" column multiple>
            <VChip
              v-for="site in allSites"
              :key="site.id"
              :color="selectedSites.includes(site.id) ? 'primary' : ''"
              filter
              variant="outlined"
              :value="site.id"
            >
              {{ site.name }}
            </VChip>
          </VChipGroup>
        </VCardItem>

        <VCardItem>
          <VBtn type="submit" @click="saveSelectedSites">
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title=" Search priority">
        <VCardSubtitle>  Set the priority ordering to be used by default during searches， Resources that are not prioritized will not be displayed in the search results。 </VCardSubtitle>
        <VCardItem>
          <div class="grid gap-3 grid-filterrule-card">
            <FilterRuleCard
              v-for="(card, index) in filterCards"
              :key="index"
              :pri="card.pri"
              :maxpri="filterCards.length.toString()"
              :rules="card.rules"
              @changed="updateFilterCardValue"
              @close="filterCardClose(card.pri)"
              @leveldown="onLevelDown"
              @levelup="onLevelUp"
            />
          </div>
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            class="me-2"
            @click="saveCustomFilters()"
          >
            Save (a file etc) (computing)
          </VBtn>
          <VBtn
            color="success"
            variant="tonal"
            @click="addFilterCard()"
          >
            <VIcon icon="mdi-plus" />
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

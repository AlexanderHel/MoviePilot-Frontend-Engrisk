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

//  Subscription rules card list
const subscribeFilterCards = ref<FilterCard[]>([])

//  Shuffle rule card list
const bestVersionFilterCards = ref<FilterCard[]>([])

//  All sites
const allSites = ref<Site[]>([])

//  Check the subscription site
const selectedRssSites = ref<number[]>([])

//  Query user-selected subscription sites
async function querySelectedRssSites() {
  try {
    const result: { [key: string]: any } = await api.get('system/setting/RssSites')

    selectedRssSites.value = result.data?.value ?? []
  }
  catch (error) {
    console.log(error)
  }
}

//  Save user-selected subscription sites
async function saveSelectedRssSites() {
  try {
    const result: { [key: string]: any } = await api.post('system/setting/RssSites', selectedRssSites.value)

    if (result.success)
      $toast.success(' Subscription site saved successfully')
    else
      $toast.error(' Failed to save subscription site！')
  }
  catch (error) {
    console.log(error)
  }
}

//  Search all sites
async function querySites() {
  try {
    const data: Site[] = await api.get('site/')

    //  Filter sites， Only enabled sites are shown
    allSites.value = data.filter(item => item.is_active)
    querySelectedRssSites()
  }
  catch (error) {
    console.log(error)
  }
}

//  Query set priority rules
async function queryCustomFilters(ruleType: string) {
  try {
    const result: { [key: string]: any } = await api.get(`system/setting/${ruleType}`)
    if (result.success) {
      //  Saved as a string， Needs to be split into arrays
      const groups = result.data?.value?.split('>') ?? []

      //  Generating rule cards
      const cards = ruleType === 'SubscribeFilterRules' ? subscribeFilterCards : bestVersionFilterCards
      cards.value = groups?.map((group: string, index: number) => {
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
async function saveCustomFilters(ruleType: string) {
  try {
    //  Process sth. when it has a value
    let value = ''
    const cards = ruleType === 'SubscribeFilterRules' ? subscribeFilterCards : bestVersionFilterCards
    if (cards.value.length !== 0) {
      //  Splice card rules into strings
      value = cards.value
        .filter(card => card.rules.length > 0)
        .map(card => card.rules.join('&'))
        .join('>')
    }
    //  Save (a file etc) (computing)
    const result: { [key: string]: any } = await api.post(
      `system/setting/${ruleType}`,
      value,
    )

    const msg = ruleType === 'SubscribeFilterRules' ? ' Subscription priority' : ' Prioritization of plate washing'

    if (result.success)
      $toast.success(`${msg} Save successful`)
    else
      $toast.error(`${msg} Fail to save！`)
  }
  catch (error) {
    console.log(error)
  }
}

//  Updating the value of a rule card
function updateFilterCardValue(pri: string, rules: string[]) {
  const card = subscribeFilterCards.value.find(card => card.pri === pri)
  if (card)
    card.rules = rules
}

//  Update the value of the wash rule card
function updateFilterCardValue2(pri: string, rules: string[]) {
  const card = bestVersionFilterCards.value.find(card => card.pri === pri)
  if (card)
    card.rules = rules
}

//  Remove cards
function filterCardClose(ruleType: string, pri: string) {
  //  Commander-in-chief (military)pri The corresponding card is removed from the list， And update the serial numbers of the remaining cards
  const updatedCards = (ruleType === 'SubscribeFilterRules' ? subscribeFilterCards.value : bestVersionFilterCards.value)
    .filter(card => card.pri !== pri)
    .map((card, index) => {
      card.pri = (index + 1).toString()
      return card
    })
  //  Update subscribeFilterCards.value
  if (ruleType === 'SubscribeFilterRules')
    subscribeFilterCards.value = updatedCards
  else
    bestVersionFilterCards.value = updatedCards
}

//  Add cards
function addFilterCard(ruleType: string) {
  const cards = ruleType === 'SubscribeFilterRules' ? subscribeFilterCards : bestVersionFilterCards
  //  Prioritization
  const pri = (cards.value.length + 1).toString()

  //  New card
  const newCard: FilterCard = { pri, rules: [] }

  //  Add to list
  cards.value.push(newCard)
}

//  Upward prioritization
function onLevelUp(filterCards: FilterCard[], pri: string) {
  //  Find the current card
  const card = filterCards.find(card => card.pri === pri)
  if (!card)
    return

  //  Find the current card的上一张卡片
  const prevCard = filterCards.find(card => card.pri === (parseInt(pri) - 1).toString())
  if (!prevCard)
    return

  //  Exchanging the priority of two cards
  const temp = card.pri
  card.pri = prevCard.pri
  prevCard.pri = temp

  //  Cards re-prioritized
  filterCards.sort((a, b) => parseInt(a.pri) - parseInt(b.pri))
}

//  Downward prioritization
function onLevelDown(filterCards: FilterCard[], pri: string) {
  //  Find the current card
  const card = filterCards.find(card => card.pri === pri)
  if (!card)
    return

  //  Find the current card的下一张卡片
  const nextCard = filterCards.find(card => card.pri === (parseInt(pri) + 1).toString())
  if (!nextCard)
    return

  //  Exchanging the priority of two cards
  const temp = card.pri
  card.pri = nextCard.pri
  nextCard.pri = temp

  //  Cards re-prioritized
  filterCards.sort((a, b) => parseInt(a.pri) - parseInt(b.pri))
}

onMounted(() => {
  querySites()
  queryCustomFilters('SubscribeFilterRules')
  queryCustomFilters('BestVersionFilterRules')
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title=" Subscribe to the site">
        <VCardSubtitle>  Only selected sites will be available in the subscription。</VCardSubtitle>

        <VCardItem>
          <VChipGroup v-model="selectedRssSites" column multiple>
            <VChip
              v-for="site in allSites"
              :key="site.id"
              :color="selectedRssSites.includes(site.id) ? 'primary' : ''"
              filter
              variant="outlined"
              :value="site.id"
            >
              {{ site.name }}
            </VChip>
          </VChipGroup>
        </VCardItem>

        <VCardItem>
          <VBtn type="submit" @click="saveSelectedRssSites">
            Save (a file etc) (computing)
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title=" Subscription priority">
        <VCardSubtitle>  Set the priority to be used by default during normal subscription， Resources that are not prioritized will not be automatically downloaded。 </VCardSubtitle>
        <VCardItem>
          <div class="grid gap-3 grid-filterrule-card">
            <FilterRuleCard
              v-for="(card, index) in subscribeFilterCards"
              :key="index"
              :pri="card.pri"
              :maxpri="subscribeFilterCards.length.toString()"
              :rules="card.rules"
              @changed="updateFilterCardValue"
              @close="filterCardClose('SubscribeFilterRules', card.pri)"
              @leveldown="onLevelDown(subscribeFilterCards, card.pri)"
              @levelup="onLevelUp(subscribeFilterCards, card.pri)"
            />
          </div>
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            class="me-2"
            @click="saveCustomFilters('SubscribeFilterRules')"
          >
            Save (a file etc) (computing)
          </VBtn>
          <VBtn
            color="success"
            variant="tonal"
            @click="addFilterCard('SubscribeFilterRules')"
          >
            <VIcon icon="mdi-plus" />
          </VBtn>
        </VCardItem>
      </VCard>
    </VCol>
    <VCol cols="12">
      <VCard title=" Prioritization of plate washing">
        <VCardSubtitle>  Set the priority to be used when subscribing to a wash version， Matching priority1 Finished at the time of washing。 </VCardSubtitle>
        <VCardItem>
          <div class="grid gap-3 grid-filterrule-card">
            <FilterRuleCard
              v-for="(card, index) in bestVersionFilterCards"
              :key="index"
              :pri="card.pri"
              :maxpri="bestVersionFilterCards.length.toString()"
              :rules="card.rules"
              @changed="updateFilterCardValue2"
              @close="filterCardClose('BestVersionFilterRules', card.pri)"
              @leveldown="onLevelDown(bestVersionFilterCards, card.pri)"
              @levelup="onLevelUp(bestVersionFilterCards, card.pri)"
            />
          </div>
        </VCardItem>
        <VCardItem>
          <VBtn
            type="submit"
            class="me-2"
            @click="saveCustomFilters('BestVersionFilterRules')"
          >
            Save (a file etc) (computing)
          </VBtn>
          <VBtn
            color="success"
            variant="tonal"
            @click="addFilterCard('BestVersionFilterRules')"
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

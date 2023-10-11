<script setup lang="ts">
import api from '@/api'
import type { ScheduleInfo } from '@/api/types'

//  List of timed services
const schedulerList = ref<ScheduleInfo[]>([])

//  Timers
let refreshTimer: NodeJS.Timer | null = null

//  Call (programming)API Load timed service list
async function loadSchedulerList() {
  try {
    const res: ScheduleInfo[] = await api.get('dashboard/schedule')

    schedulerList.value = res
  }
  catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  loadSchedulerList()

  //  Start timer
  refreshTimer = setInterval(() => {
    loadSchedulerList()
  }, 60000)
})

//  Stop timer when component is unloaded
onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle> Back-office tasks</VCardTitle>
    </VCardItem>

    <VCardText>
      <VList
        class="card-list"
        height="250"
      >
        <VListItem
          v-for="item in schedulerList"
          :key="item.id"
        >
          <template #prepend>
            <VAvatar
              size="40"
              variant="tonal"
              color=""
              class="me-3"
            >
              {{ item.name[0] }}
            </VAvatar>
          </template>

          <VListItemTitle class="mb-1">
            <span class="text-sm font-weight-medium">{{ item.name }}</span>
          </VListItemTitle>

          <VListItemSubtitle class="text-xs">
            {{ item.next_run }}
          </VListItemSubtitle>

          <template #append>
            <div>
              <h4 class="font-weight-medium">
                {{ item.status }}
              </h4>
            </div>
          </template>
        </VListItem>
        <VListItem v-if="schedulerList.length === 0">
          <VListItemTitle class="text-center">
            No backend services
          </VListItemTitle>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
.card-list {
  --v-card-list-gap: 1.5rem;
}

.card-list::-webkit-scrollbar {
  display: none;
}
</style>

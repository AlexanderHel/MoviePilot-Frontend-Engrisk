<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'
import type { ScheduleInfo } from '@/api/types'

//  Checkbox
const $toast = useToast()

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

//  Task status color
function getSchedulerColor(status: string) {
  switch (status) {
    case ' Running':
      return 'success'
    case ' Ceased':
      return 'error'
    case ' Wait for':
      return ''
    default:
      return ''
  }
}

//  Execute a command
function runCommand(id: string) {
  try {
    //  Asynchronous submission
    api.get('system/runscheduler', {
      params: {
        jobid: id,
      },
    })
    $toast.success(' Timed job execution request submitted successfully！')
    // 1 Refresh data after seconds
    setTimeout(() => {
      loadSchedulerList()
    }, 1000)
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
  }, 5000)
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
  <VCard title=" Timing work">
    <VCardText>  Manual implementation does not affect the normal schedule of operations。 </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th scope="col">
            Task name
          </th>
          <th scope="col">
            Mission status
          </th>
          <th scope="col">
            Next execution time
          </th>
          <th scope="col" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="scheduler in schedulerList"
          :key="scheduler.id"
        >
          <td>
            {{ scheduler.name }}
          </td>
          <td>
            <VChip :color="getSchedulerColor(scheduler.status)">
              {{ scheduler.status }}
            </VChip>
          </td>
          <td>
            {{ scheduler.next_run }}
          </td>
          <td>
            <VBtn
              size="small"
              :disabled="scheduler.status === ' Running'"
              @click="runCommand(scheduler.id)"
            >
              <template #prepend>
                <VIcon>mdi-play</VIcon>
              </template>
              Fulfillment
            </VBtn>
          </td>
        </tr>
        <tr v-if="schedulerList.length === 0">
          <td
            colspan="4"
            class="text-center"
          >
            No backend services
          </td>
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>

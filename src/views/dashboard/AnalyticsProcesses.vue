<script lang="ts" setup>
import { formatSeconds } from '@/@core/utils/formatters'
import api from '@/api'
import type { Process } from '@/api/types'

//  Meter header
const headers = [' StepID', ' Process name', ' Running time', ' Memory footprint']

//  Data sheet
const processList = ref<Process[]>([])

//  Timers
let refreshTimer: NodeJS.Timer | null = null

//  Call (programming)API Load data
async function loadProcessList() {
  try {
    const res: Process[] = await api.get('dashboard/processes')

    processList.value = res
  }
  catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  loadProcessList()

  //  Start timer
  refreshTimer = setInterval(() => {
    loadProcessList()
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
  <VCard title=" System process">
    <VTable
      item-key="fullName"
      class="table-rounded"
      hide-default-footer
      disable-sort
    >
      <thead>
        <tr>
          <th
            v-for="header in headers"
            :id="header"
            :key="header"
          >
            {{ header }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in processList"
          :key="row.pid"
        >
          <td
            class="text-sm"
            v-text="row.pid"
          />
          <!-- name -->
          <td>
            <h6 class="text-sm font-weight-medium">
              {{ row.name }}
            </h6>
          </td>
          <td
            class="text-sm"
            v-text="formatSeconds(row.run_time)"
          />
          <td
            class="text-sm"
            v-text="`${row.memory} MB`"
          />
        </tr>
      </tbody>
    </VTable>
  </VCard>
</template>

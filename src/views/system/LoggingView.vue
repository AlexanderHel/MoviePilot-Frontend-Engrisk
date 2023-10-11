<script lang="ts" setup>
import store from '@/store'

//  Log list
const logs = ref<string[]>([])

// SSE Continuously fetch logs
function startSSELogging() {
  const token = store.state.auth.token
  if (token) {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}system/logging?token=${token}`,
    )

    eventSource.addEventListener('message', (event) => {
      const message = event.data
      if (message)
        logs.value.push(message)
    })

    onBeforeUnmount(() => {
      eventSource.close()
    })
  }
}

//  Extracting log details from logs
function extractLogDetailsFromLogs(logs: string[]): { level: string; time: string; program: string; content: string }[] {
  const logDetails: { level: string; time: string; program: string; content: string }[] = []

  const logPattern = /^【(.*?)】[0-9\-:]*\s(.*?)\s-\s(.*?)\s-\s(.*)$/

  for (const log of logs) {
    const matches = RegExp(logPattern).exec(log)
    if (matches && matches.length === 5) {
      const [_, level, time, program, content] = matches
      logDetails.push({ level, time, program, content })
    }
  }

  return logDetails
}

//  Calculate log color
function getLogColor(level: string): string {
  switch (level) {
    case 'DEBUG':
      return 'primary'
    case 'INFO':
      return 'secondary'
    case 'WARNING':
      return 'warning'
    case 'ERROR':
      return 'error'
    default:
      return 'secondary'
  }
}

//  Split log data calculation attributes
const extractLogDetails = computed(() => {
  return extractLogDetailsFromLogs(logs.value)
})

onMounted(() => {
  startSSELogging()
})
</script>

<template>
  <div
    v-if="logs.length === 0"
    class="mt-5 w-full text-center flex flex-col items-center"
  >
    <VProgressCircular
      size="48"
      indeterminate
      color="primary"
    />
    <span class="mt-3"> Refreshing. ...</span>
  </div>
  <div>
    <VTable
      class="table-rounded"
      hide-default-footer
      disable-sort
    >
      <tbody>
        <tr v-for="(log, i) in extractLogDetails" :key="i" class="text-sm">
          <td
            class="text-sm"
          >
            <VChip
              size="small"
              :color="getLogColor(log.level)"
              variant="elevated"
              v-text="log.level"
            />
          </td>
          <!-- name -->
          <td
            class="text-sm"
          >
            {{ log.time }}
          </td>
          <td
            class="text-sm"
          >
            <h6 class="text-sm font-weight-medium">
              {{ log.program }}
            </h6>
          </td>
          <td
            class="text-sm"
            v-text="log.content"
          />
        </tr>
      </tbody>
    </VTable>
  </div>
</template>

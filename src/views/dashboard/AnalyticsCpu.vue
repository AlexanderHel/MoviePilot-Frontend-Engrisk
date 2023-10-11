<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@layouts/utils'
import api from '@/api'

const vuetifyTheme = useTheme()

const currentTheme = controlledComputed(() => vuetifyTheme.name.value, () => vuetifyTheme.current.value.colors)
const variableTheme = controlledComputed(() => vuetifyTheme.name.value, () => vuetifyTheme.current.value.variables)

//  Timers
let refreshTimer: NodeJS.Timer | null = null

//  Time series (stats.)
const series = ref([
  {
    data: [0],
  },
])

//  Current value
const current = ref(0)

const chartOptions = controlledComputed(() => vuetifyTheme.name.value, () => {
  return {
    chart: {
      parentHeightOffset: 0,
      toolbar: { show: false },
      animations: { enabled: false },
    },
    tooltip: { enabled: false },
    grid: {
      borderColor: `rgba(${hexToRgb(String(variableTheme.value['border-color']))},${variableTheme.value['border-opacity']})`,
      strokeDashArray: 6,
      xaxis: {
        lines: { show: false },
      },
      yaxis: {
        lines: { show: true },
      },
      padding: {
        top: -10,
        left: -7,
        right: 5,
        bottom: 5,
      },
    },
    stroke: {
      width: 3,
      lineCap: 'butt',
      curve: 'smooth',
    },
    colors: [currentTheme.value.primary],
    markers: {
      size: 6,
      offsetY: 4,
      offsetX: -2,
      strokeWidth: 3,
      colors: ['transparent'],
      strokeColors: 'transparent',
      discrete: [
        {
          size: 5.5,
          seriesIndex: 0,
          strokeColor: currentTheme.value.primary,
          fillColor: currentTheme.value.surface,
        },
      ],
      hover: { size: 7 },
    },
    xaxis: {
      labels: { show: false },
      axisTicks: { show: false },
      axisBorder: { show: false },
    },
    yaxis: {
      labels: { show: false },
      max: 100,
    },
  }
})

//  Call (programming)API Interface to get the latestCPU Utilization rate
async function getCpuUsage() {
  try {
    //  Request data
    current.value = await api.get('dashboard/cpu') ?? 0
    //  Add to sequence
    series.value[0].data.push(current.value)
    //  Sequence over30 When， Clear the front
    if (series.value[0].data.length > 30)
      series.value[0].data.shift()
  }
  catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  getCpuUsage()//  Start timer
  refreshTimer = setInterval(() => {
    getCpuUsage()
  }, 2000)
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
    <VCardText>
      <h6 class="text-h6">
        CPU
      </h6>
      <VueApexCharts
        type="line"
        :options="chartOptions"
        :series="series"
        :height="150"
      />

      <p class="text-center font-weight-medium mb-0">
        Be facing (us)：{{ current }}%
      </p>
    </VCardText>
  </VCard>
</template>

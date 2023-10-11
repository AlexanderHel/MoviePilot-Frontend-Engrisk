<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import api from '@/api'
import { hexToRgb } from '@layouts/utils'

const vuetifyTheme = useTheme()

const options = controlledComputed(
  () => vuetifyTheme.name.value,
  () => {
    const currentTheme = ref(vuetifyTheme.current.value.colors)
    const variableTheme = ref(vuetifyTheme.current.value.variables)

    const disabledColor = `rgba(${hexToRgb(currentTheme.value['on-surface'])},${
      variableTheme.value['disabled-opacity']
    })`

    const borderColor = `rgba(${hexToRgb(String(variableTheme.value['border-color']))},${
      variableTheme.value['border-opacity']
    })`

    return {
      chart: {
        parentHeightOffset: 0,
        toolbar: { show: false },
      },
      plotOptions: {
        bar: {
          borderRadius: 9,
          distributed: true,
          columnWidth: '40%',
          endingShape: 'rounded',
          startingShape: 'rounded',
        },
      },
      stroke: {
        width: 2,
        colors: [currentTheme.value.surface],
      },
      legend: { show: false },
      tooltip: {
        enabled: false,
      },
      grid: {
        borderColor,
        strokeDashArray: 7,
        padding: {
          top: -1,
          right: 0,
          left: -12,
          bottom: 5,
        },
      },
      dataLabels: { enabled: false },
      colors: [currentTheme.value.primary],
      states: {
        hover: { filter: { type: 'none' } },
        active: { filter: { type: 'none' } },
      },
      xaxis: {
        categories: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        tickPlacement: 'on',
        labels: { show: false },
        crosshairs: { opacity: 0 },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },
      yaxis: {
        show: true,
        tickAmount: 4,
        labels: {
          offsetX: -17,
          style: {
            colors: disabledColor,
            fontSize: '12px',
          },

          formatter: (value: number) =>
            value > 999 ? (value / 1000).toFixed(0) : value,
        },
      },
    }
  },
)

//  Chart data
const series = ref([{ data: [0, 0, 0, 0, 0, 0, 0] }])

//  Aggregate
const totalCount = computed(() => series.value[0].data.reduce((a, b) => a + b, 0))

//  Call (programming)API Interface to get data near7 Tidata
async function getWeeklyData() {
  try {
    const res: number[] = await api.get('dashboard/transfer')

    series.value = [{ data: res }]
  }
  catch (e) {
    console.log(e)
  }
}

onMounted(() => {
  getWeeklyData()
})
</script>

<template>
  <VCard>
    <VCardItem>
      <VCardTitle> Recent inventory</VCardTitle>
    </VCardItem>

    <VCardText>
      <VueApexCharts
        type="bar"
        :options="options"
        :series="series"
        :height="160"
      />

      <div class="d-flex align-center mb-3">
        <h5 class="text-h5 me-4">
          {{ totalCount }}
        </h5>
        <p> It's been in storage for the last week. {{ totalCount }}  Film 😎</p>
      </div>

      <VBtn
        block
        to="/history"
      >
        View details
      </VBtn>
    </VCardText>
  </VCard>
</template>

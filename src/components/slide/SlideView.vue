<script lang="ts" setup>
import SlideViewTitle from '@/components/slide/SlideViewTitle.vue'

//  Input parameter
const props = defineProps({
  linkurl: String,
  title: String,
})

//  Elemental
const slideview_content = ref()
//  Paging toggle state
const disabled = ref(0)
//  Record scrolling values
const slideview_scrollLeft = ref(0)
//  Number of all cards
let slide_card_length: number
//  Card spacing
let slide_gap_px: number
//  Card width
let card_width: number
//  The container displays up toN Thermosensitive
let card_max: number
//  Current position
let card_current: number

//  Pagination
function slideNext(next: boolean) {
  let run_to_left_px
  if (next) {
    const card_index = card_current + card_max
    run_to_left_px = card_index * card_width
    if (run_to_left_px >= slideview_content.value.scrollWidth - slideview_content.value.clientWidth)
      run_to_left_px = slideview_content.value.scrollWidth - slideview_content.value.clientWidth
    // console.log(` Maximum display: ${card_max}  Current starting point: ${card_current}  Target starting point: ${card_index}  Card width: ${card_width}`)
  }
  else {
    const card_index = card_current - card_max
    run_to_left_px = card_index * card_width
    if (run_to_left_px <= 0)
      run_to_left_px = 0
    // console.log(` Maximum display: ${card_max}  Current starting point: ${card_current}  Target starting point: ${card_index}  Card width: ${card_width}`)
  }
  slideview_content.value.scrollTo({
    top: 0,
    left: run_to_left_px,
    behavior: 'smooth',
  })
}

//  Calculating the maximum number of displays
function countMaxNumber() {
  slide_card_length = slideview_content.value.children.length
  card_width = slideview_content.value.firstElementChild.getBoundingClientRect().width
  slide_gap_px = (slideview_content.value.scrollWidth / slide_card_length) - card_width
  card_width += slide_gap_px
  card_max = Math.trunc(slideview_content.value.clientWidth / card_width)
  countDisabled()
}

//  Modify paging toggle button status
function countDisabled() {
  slideview_scrollLeft.value = slideview_content.value.scrollLeft
  card_current = slideview_content.value.scrollLeft === 0 ? 0 : Math.trunc((slideview_content.value.scrollLeft + card_width / 2) / card_width)
  if (slide_card_length * card_width <= slideview_content.value.clientWidth)
    disabled.value = 3
  else if (slideview_content.value.scrollLeft === 0)
    disabled.value = 0
  else if (slideview_content.value.scrollLeft >= slideview_content.value.scrollWidth - slideview_content.value.clientWidth - 2)
    disabled.value = 2

  else
    disabled.value = 1
}

//  Component loading complete
onMounted(() => {
  //  Initial access to element parameters
  countMaxNumber()
  //  When the window size changes
  window.addEventListener('resize', countMaxNumber)
})
onUnmounted(() => {
  //  Uninstallation event
  window.removeEventListener('resize', countMaxNumber)
})
onActivated(() => {
  if (slideview_scrollLeft.value !== 0) {
    // console.log(`onActivated: to_scrollLeft, ${slideview_scrollLeft.value}`)
    slideview_content.value.scrollLeft = slideview_scrollLeft.value
  }
})
</script>

<template>
  <div class="flex justify-between mt-3">
    <slot name="title">
      <SlideViewTitle v-bind="props" />
    </slot>
    <div v-if="disabled !== 3" class="me-1 d-none d-md-flex">
      <VBtn
        class="rounded-circle"
        variant="text"
        icon="mdi-chevron-left"
        color="grey"
        :disabled="disabled === 0"
        @click="slideNext(false)"
      />
      <VBtn
        class="rounded-circle"
        variant="text"
        icon="mdi-chevron-right"
        color="grey"
        :disabled="disabled === 2"
        @click="slideNext(true)"
      />
    </div>
  </div>
  <div
    ref="slideview_content"
    class="slideview_content grid grid-rows-1 grid-flow-col justify-start gap-4 p-3"
    tabindex="0"
    @scroll="countDisabled"
  >
    <slot name="content" />
  </div>
</template>

<style lang="scss" scoped>
.slideview_content {
  -ms-overflow-style: none !important;
  overflow-x: scroll !important;
  overflow-y: hidden !important;
  overscroll-behavior-x: contain !important;
  scrollbar-width: none !important;
}

.slideview_content::-webkit-scrollbar {
  display: none;
}
</style>

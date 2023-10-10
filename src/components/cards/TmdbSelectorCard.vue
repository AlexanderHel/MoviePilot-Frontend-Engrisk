<script lang="ts" setup>
import api from '@/api'
import type { MediaInfo } from '@/api/types'

interface TmdbItem {
  title: string
  overview: string
  tmdbid: number
  poster: string
}

// update:modelValue  Event
const emit = defineEmits(['update:modelValue', 'close'])

const items = ref<TmdbItem[]>([])

//  Search term
const keyword = ref('')

//  Loading
const loading = ref(false)

// ref
const tmdbKeyword = ref<HTMLElement | null>(null)

//  Selected entries
function selectMedia(item: TmdbItem) {
  console.log(item)
  emit('update:modelValue', item.tmdbid)
  emit('close')
}

// TMDB Images are converted tow500 Adults and children
function getW500Image(url = '') {
  if (!url)
    return ''
  return url.replace('original', 'w500')
}

//  Search term条
async function searchMedias() {
  if (!keyword)
    return

  //  Call (programming)API Search terms
  try {
    loading.value = true
    const result: MediaInfo[] = await api.get('media/search', {
      params: {
        title: keyword.value,
        page: 1,
        count: 20,
      },
    })

    //  Empty
    items.value = []

    //  Assign a value to something
    for (const item of result) {
      items.value.push({
        tmdbid: item.tmdb_id || 0,
        poster: getW500Image(item.poster_path),
        title: `${item.title}（${item.year}）`,
        overview: `<span class="text-primary">${item.type}</span> ${item.overview}`,
      })
    }
    loading.value = false
  }
  catch (e) {
    console.error(e)
  }
}

//  Focus search box when loading
onMounted(() => {
  // 500ms Backward focus
  setTimeout(() => {
    tmdbKeyword.value?.focus()
  }, 500)
})
</script>

<template>
  <VCard
    class="mx-auto"
    width="100%"
  >
    <VToolbar flat class="p-0">
      <VTextField
        ref="tmdbKeyword"
        v-model="keyword"
        label=" Search by name"
        single-line
        placeholder=" Name of movie or tv series"
        variant="solo"
        append-inner-icon="mdi-magnify"
        flat
        class="mx-1"
        :loading="loading"
        @click:append-inner="searchMedias"
        @keydown.enter="searchMedias"
      />
    </VToolbar>

    <VList
      v-if="items.length > 0"
      lines="three"
    >
      <template v-for="(item, i) in items" :key="i">
        <VListItem
          @click="selectMedia(item)"
        >
          <template #prepend>
            <VImg
              height="75"
              width="50"
              :src="item.poster"
              aspect-ratio="2/3"
              class="object-cover rounded shadow ring-gray-500 me-3"
              cover
            >
              <template #placeholder>
                <div class="w-full h-full">
                  <VSkeletonLoader class="object-cover aspect-w-2 aspect-h-3" />
                </div>
              </template>
            </VImg>
          </template>
          <VListItemTitle>
            {{ item.title }}
          </VListItemTitle>
          <VListItemSubtitle class="mt-2" v-html="item.overview" />
        </VListItem>
        <VDivider v-if="i < items.length - 1" class="mt-1" inset />
      </template>
    </VList>
  </VCard>
</template>

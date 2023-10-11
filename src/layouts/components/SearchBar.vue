<script lang="ts" setup>
//  Routing (in computer networks)
const router = useRouter()

//  Search term
const searchWord = ref<string>('')

//  Search for pop-ups
const searchDialog = ref(false)

// Search
function search() {
  if (!searchWord.value)
    return

  searchDialog.value = false
  router.push({
    path: '/browse/media/search',
    query: {
      title: searchWord.value,
    },
  })
}
</script>

<template>
  <!-- 👉 Search Button -->
  <div
    class="d-flex align-center cursor-pointer"
    style="user-select: none;"
  >
    <VDialog
      v-model="searchDialog"
      max-width="50rem"
      transition="dialog-top-transition"
    >
      <!-- Dialog Activator -->
      <template #activator="{ props }">
        <IconBtn
          class="d-lg-none"
          v-bind="props"
        >
          <VIcon icon="mdi-magnify" />
        </IconBtn>
      </template>
      <!-- Dialog Content -->
      <VCard title=" Look for sth.">
        <VCardText>
          <VRow>
            <VCol cols="12">
              <VTextField
                v-model="searchWord"
                label=" Cinematic、 Tv series name"
              />
            </VCol>
          </VRow>
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn
            @click="search"
            @keydown.enter="search"
          >
            Look for sth.
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>

  <!-- 👉 Search Textfield -->
  <span class="w-1/5">
    <VTextField
      key="search_navbar"
      v-model="searchWord"
      class="d-none d-lg-block text-disabled"
      density="compact"
      variant="solo"
      label="Look for sth.电影、电视剧"
      append-inner-icon="mdi-magnify"
      single-line
      hide-details
      flat
      rounded
      @click:append-inner="search"
      @keydown.enter="search"
    />
  </span>
</template>

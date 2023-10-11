<script lang="ts" setup>
import { calculateTimeDifference } from '@/@core/utils'
import api from '@/api'

//  System environment variable
const systemEnv = ref<any>({})

//  PossessRelease
const allRelease = ref<any>([])

//  Change log dialog box
const releaseDialog = ref(false)

//  Latest version
const latestRelease = ref('')

//  Change log dialog box标题
const releaseDialogTitle = ref('')

//  Change log dialog box内容
const releaseDialogBody = ref('')

//  Open the log dialog box
function showReleaseDialog(title: string, body: string) {
  releaseDialogTitle.value = title
  releaseDialogBody.value = body.replaceAll('\r\n', '<br />')
  releaseDialog.value = true
}

//  Querying system environment variables
async function querySystemEnv() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/env',
    )

    systemEnv.value = result.data
  }
  catch (error) {
    console.log(error)
  }
}

//  Query allRelease
async function queryAllRelease() {
  try {
    const result: { [key: string]: any } = await api.get(
      'system/versions',
    )

    allRelease.value = result.data ?? []

    //  Latest version
    if (allRelease.value.length > 0)
      latestRelease.value = allRelease.value[0].tag_name
  }
  catch (error) {
    console.log(error)
  }
}

//  Calculate release time
function releaseTime(releaseDate: string) {
  //  Last updated
  return `${calculateTimeDifference(releaseDate)} Ahead`
}

onMounted(() => {
  querySystemEnv()
  queryAllRelease()
})
</script>

<template>
  <div class="px-3">
    <div class="section">
      <div>
        <h3 class="heading">
          With respect to MoviePilot
        </h3>
      </div>
      <div class="section border-t border-gray-800">
        <dl>
          <div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                Current version
              </dt>
              <dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow flex flex-row items-center truncate">
                  <code class="truncate">{{ systemEnv.VERSION }}</code>
                  <a v-if="latestRelease === systemEnv.VERSION" href="https://github.com/AlexanderHel/MoviePilotEngrisk/releases" target="_blank" rel="noopener noreferrer">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap bg-green-500 bg-opacity-80 border border-green-500 !text-green-100 ml-2 !cursor-pointer transition hover:bg-green-400">
                      Newest
                    </span>
                  </a>
                </span>
              </dd>
            </div>
          </div>
          <div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                Configuration directory
              </dt>
              <dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow undefined">
                  <code>{{ systemEnv.CONFIG_DIR }}</code>
                </span>
              </dd>
            </div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                Data catalog
              </dt>
              <dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow undefined"><code>/moviepilot</code></span>
              </dd>
            </div>
          </div>
          <div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                Time zones
              </dt>
              <dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow undefined">
                  <code>{{ systemEnv.TZ }}</code>
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
    <div class="section">
      <div>
        <h3 class="heading">
          Support sth.
        </h3>
      </div>
      <div class="section border-t border-gray-800">
        <dl>
          <div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                (computer) file
              </dt><dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow undefined">
                  <a href="https://github.com/AlexanderHel/MoviePilotEngrisk/blob/main/README.md" target="_blank" rel="noreferrer" class="text-indigo-500 transition duration-300 hover:underline">
                    https://github.com/AlexanderHel/MoviePilotEngrisk/blob/main/README.md
                  </a>
                </span>
              </dd>
            </div>
          </div><div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                Question feedback
              </dt><dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow undefined">
                  <a href="https://github.com/AlexanderHel/MoviePilotEngrisk/issues/new/choose" target="_blank" rel="noreferrer" class="text-indigo-500 transition duration-300 hover:underline">
                    https://github.com/AlexanderHel/MoviePilotEngrisk/issues/new/choose
                  </a>
                </span>
              </dd>
            </div>
          </div><div>
            <div class="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt class="block text-sm font-bold">
                Publishing channel
              </dt>
              <dd class="flex text-sm sm:col-span-2 sm:mt-0">
                <span class="flex-grow undefined">
                  <a href="https://t.me/moviepilot_channel" target="_blank" rel="noreferrer" class="text-indigo-500 transition duration-300 hover:underline">
                    https://t.me/moviepilot_channel
                  </a>
                </span>
              </dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
    <div class="section">
      <div>
        <h3 class="heading">
          Software version
        </h3>
        <div class="section space-y-3">
          <div>
            <div v-for="release in allRelease" :key="release.tag_name" class="mb-3 flex w-full flex-col space-y-3 rounded-md px-4 py-2 shadow-md ring-1 ring-gray-400 sm:flex-row sm:space-y-0 sm:space-x-3">
              <div class="flex w-full flex-grow items-center justify-start space-x-2 truncate sm:justify-start">
                <span class="truncate text-lg font-bold">
                  <span class="mr-2 whitespace-nowrap text-xs font-normal">{{ releaseTime(release.published_at) }}</span>
                  {{ release.tag_name }}
                </span>
                <span v-if="release.tag_name === latestRelease" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap cursor-default bg-green-500 bg-opacity-80 border border-green-500 !text-green-100">
                  NewestSoftware version
                </span>
                <span v-if="release.tag_name === systemEnv.VERSION" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap cursor-default bg-indigo-500 bg-opacity-80 border border-indigo-500 !text-indigo-100">
                  Current version
                </span>
              </div>
              <VBtn @click.stop="showReleaseDialog(release.tag_name, release.body)">
                <template #prepend>
                  <VIcon icon="mdi-text-box-outline" />
                </template>
                View change log
              </VBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <VDialog v-model="releaseDialog" width="600" scrollable>
    <VCard>
      <VCardItem>
        <DialogCloseBtn @click="releaseDialog = false" />
        <VCardTitle>{{ releaseDialogTitle }}  Change log</VCardTitle>
      </VCardItem>
      <VCardText v-html="releaseDialogBody" />
    </VCard>
  </VDialog>
</template>

<style type="scss">
.heading {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 2rem;

  --tw-text-opacity: 1;
}

.section {
  margin-block: 0.5rem 2.5rem;
}
</style>

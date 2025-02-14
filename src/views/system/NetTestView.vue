<script setup lang="ts">
import api from '@/api'
import douban from '@images/logos/douban.png'
import github from '@images/logos/github.png'
import slack from '@images/logos/slack.png'
import telegram from '@images/logos/telegram.webp'
import tmdb from '@images/logos/tmdb.png'
import wechat from '@images/logos/wechat.png'

interface Status {
  OK: string
  Fail: string
  Normal: string
  Doing?: string
}

interface Address {
  image: string
  name: string
  url: string
  proxy: boolean
  status: keyof Status
  time: string
  message: string
  btndisable: boolean
}

//  Test set
const targets = ref<Address[]>([
  {
    image: tmdb,
    name: 'api.themoviedb.org',
    url: 'https://api.themoviedb.org/3/movie/550?api_key={TMDBAPIKEY}',
    proxy: true,
    status: 'Normal',
    time: '',
    message: '',
    btndisable: false,
  },
  {
    image: tmdb,
    name: 'api.tmdb.org',
    url: 'https://api.tmdb.org',
    proxy: true,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
  {
    image: tmdb,
    name: 'www.themoviedb.org',
    url: 'https://www.themoviedb.org',
    proxy: true,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
  {
    image: telegram,
    name: 'api.telegram.org',
    url: 'https://api.telegram.org',
    proxy: true,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
  {
    image: wechat,
    name: 'qyapi.weixin.qq.com',
    url: 'https://qyapi.weixin.qq.com/cgi-bin/gettoken',
    proxy: false,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
  {
    image: douban,
    name: 'frodo.douban.com',
    url: 'https://frodo.douban.com',
    proxy: false,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
  {
    image: slack,
    name: 'slack.com',
    url: 'https://slack.com',
    proxy: false,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
  {
    image: github,
    name: 'github.com',
    url: 'https://github.com',
    proxy: true,
    status: 'Normal',
    time: '',
    message: ' Untested',
    btndisable: false,
  },
])

const resolveStatusColor: Status = {
  OK: 'success',
  Fail: 'error',
  Normal: '',
  Doing: 'warning',
}

//  Call (programming)API Test network connection
async function netTest(index: number) {
  try {
    const target = targets.value[index]

    target.btndisable = true
    target.status = 'Doing'
    target.message = ' Under test...'

    const result: { [key: string]: any } = await api.get('system/nettest', {
      params: {
        url: target.url,
        proxy: target.proxy,
      },
    })

    if (result.success) {
      target.status = 'OK'
      target.message = ' Normalcy'
    }
    else {
      target.status = 'Fail'
      target.message = result.message
    }
    target.time = result.data?.time
    target.btndisable = false
  }
  catch (error) {
    console.error(error)
  }
}

//  Test all connections when loading
onMounted(async () => {
  for (let i = 0; i < targets.value.length; i++)
    await netTest(i)
})
</script>

<template>
  <VList
    lines="two"
    border
    rounded
  >
    <template
      v-for="(target, index) of targets"
      :key="target.name"
    >
      <VListItem>
        <template #prepend>
          <VAvatar :image="target.image" />
        </template>
        <VListItemTitle>
          {{ target.name }}
        </VListItemTitle>
        <VListItemSubtitle class="mt-1 me-2">
          <VBadge
            dot
            location="start center"
            offset-x="2"
            :color="resolveStatusColor[target.status]"
            class="me-3"
          >
            <span class="ms-4">{{ target.message }}</span>
          </VBadge>

          <span
            v-if="target.time"
            class="text-xs text-wrap text-disabled"
          >
            {{ target.time }} ms
          </span>
        </VListItemSubtitle>
        <template #append>
          <VBtn
            size="small"
            icon="mdi-connection"
            :disabled="target.btndisable"
            @click="netTest(index)"
          />
        </template>
      </VListItem>
      <VDivider v-if="index !== targets.length - 1" />
    </template>
  </VList>
</template>

<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import { useTheme } from 'vuetify'
import store from './store'

//  First time application theme
const { global: globalTheme } = useTheme()
globalTheme.name.value = localStorage.getItem('theme') || 'light'

//  Checkbox
const $toast = useToast()

// SSE Continuously receive messages
function startSSEMessager() {
  const token = store.state.auth.token
  if (token) {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_BASE_URL}system/message?token=${token}`,
    )

    eventSource.addEventListener('message', (event) => {
      const message = event.data
      if (message)
        $toast.info(message)
    })

    onBeforeUnmount(() => {
      eventSource.close()
    })
  }
}

//  When the page loads， Load current user data
onBeforeMount(async () => {
  startSSEMessager()
})
</script>

<template>
  <VApp>
    <RouterView />
  </VApp>
</template>

<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import api from '@/api'
import type { NotificationSwitch } from '@/api/types'

const messagemTypes = ref<NotificationSwitch[]>([])

//  Checkbox
const $toast = useToast()

//  Call (programming)API Query message switch
async function loadNotificationSwitchs() {
  try {
    const result: NotificationSwitch[] = await api.get('message/switchs')

    messagemTypes.value = result
  }
  catch (error) {
    console.log(error)
  }
}

//  Call (programming)API Save message switch
async function saveNotificationSwitchs() {
  try {
    const result: { [key: string]: any } = await api.post(
      'message/switchs',
      messagemTypes.value,
    )

    if (result.success)
      $toast.success(' Save notification message settings successfully')
    else
      $toast.error(' Failed to save notification message settings！')

    // messagemTypes.value = messagemTypes.value
  }
  catch (error) {
    console.log(error)
  }
}

onMounted(() => {
  loadNotificationSwitchs()
})
</script>

<template>
  <VCard title=" Message notification">
    <VCardText>  The corresponding message type will only be sent to the selected message channels。 </VCardText>

    <VTable class="text-no-wrap">
      <thead>
        <tr>
          <th scope="col">
            Message type
          </th>
          <th scope="col">
            Microsoft
          </th>
          <th scope="col">
            Telegram
          </th>
          <th scope="col">
            Slack
          </th>
          <th scope="col">
            SynologyChat
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="message in messagemTypes"
          :key="message.mtype"
        >
          <td>
            {{ message.mtype }}
          </td>
          <td>
            <VCheckbox v-model="message.wechat" />
          </td>
          <td>
            <VCheckbox v-model="message.telegram" />
          </td>
          <td>
            <VCheckbox v-model="message.slack" />
          </td>
          <td>
            <VCheckbox v-model="message.synologychat" />
          </td>
        </tr>
        <tr v-if="messagemTypes.length === 0">
          <td
            colspan="4"
            class="text-center"
          >
            No notification channels have been set up
          </td>
        </tr>
      </tbody>
    </VTable>
    <VDivider />

    <VCardText>
      <VForm @submit.prevent="() => {}">
        <div class="d-flex flex-wrap gap-4 mt-4">
          <VBtn
            mtype="submit"
            @click="saveNotificationSwitchs"
          >
            Save (a file etc) (computing)
          </VBtn>
        </div>
      </VForm>
    </VCardText>
  </VCard>
</template>

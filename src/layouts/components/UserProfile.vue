<script setup lang="ts">
import { useStore } from 'vuex'
import { useConfirm } from 'vuetify-use-dialog'
import { useToast } from 'vue-toast-notification'
import router from '@/router'
import avatar1 from '@images/avatars/avatar-1.png'
import api from '@/api'

// Vuex Store
const store = useStore()

//  Confirmation box
const createConfirm = useConfirm()

//  Checkbox
const $toast = useToast()

//  Progress dialog
const progressDialog = ref(false)

//  Perform a logout operation
function logout() {
  //  Clearing login status information
  store.dispatch('auth/clearToken')

  //  Redirects to a login page or other appropriate page
  router.push('/login')
}

//  Perform a reboot
async function restart() {
  //  Pop-up prompt
  const confirmed = await createConfirm({
    title: ' Recognize',
    content: ' Are you sure you want to reboot?？',
    confirmationText: ' Recognize',
    cancellationText: ' Abolish',
    dialogProps: {
      maxWidth: '30rem',
    },
  })

  if (confirmed) {
    //  Call (programming)API Reopen
    try {
      //  Show waiting box
      progressDialog.value = true
      const result: { [key: string]: any } = await api.get('system/restart')
      if (!result?.success) {
        //  Hide waiting box
        progressDialog.value = false
        //  The reboot was unsuccessful
        $toast.error(result.message)
        return
      }
    }
    catch (error) {
      console.error(error)
    }
    //  Deregister
    logout()
  }
}

//  Through (a gap)Vuex Store Access to information in
const superUser = store.state.auth.superUser
const userName = store.state.auth.userName
const avatar = store.state.auth.avatar
</script>

<template>
  <VAvatar
    class="cursor-pointer"
    color="primary"
    variant="tonal"
  >
    <VImg :src="avatar ?? avatar1" />

    <!-- SECTION Menu -->
    <VMenu
      activator="parent"
      width="230"
      location="bottom end"
      offset="14px"
    >
      <VList>
        <!-- 👉 User Avatar & Name -->
        <VListItem>
          <template #prepend>
            <VListItemAction start>
              <VAvatar
                color="primary"
                variant="tonal"
              >
                <VImg :src="avatar ?? avatar1" />
              </VAvatar>
            </VListItemAction>
          </template>

          <VListItemTitle class="font-weight-semibold">
            {{ superUser ? " Janitors" : " Regular user" }}
          </VListItemTitle>
          <VListItemSubtitle>{{ userName }}</VListItemSubtitle>
        </VListItem>
        <VDivider class="my-2" />

        <!-- 👉 Profile -->
        <VListItem
          v-if="superUser"
          link
          to="setting"
        >
          <template #prepend>
            <VIcon
              class="me-2"
              icon="mdi-account-outline"
              size="22"
            />
          </template>

          <VListItemTitle> Preferences</VListItemTitle>
        </VListItem>

        <!-- 👉 FAQ -->
        <VListItem
          href="https://github.com/AlexanderHel/MoviePilotEngrisk/blob/main/README.md"
          target="_blank"
        >
          <template #prepend>
            <VIcon
              class="me-2"
              icon="mdi-help-circle-outline"
              size="22"
            />
          </template>

          <VListItemTitle> Hand</VListItemTitle>
        </VListItem>

        <!-- Divider -->
        <VDivider class="my-2" />

        <!-- 👉 restart -->
        <VListItem @click="restart">
          <template #prepend>
            <VIcon
              class="me-2"
              icon="mdi-restart"
              size="22"
            />
          </template>

          <VListItemTitle> Reopen</VListItemTitle>
        </VListItem>

        <!-- 👉 Logout -->
        <VListItem @click="logout">
          <template #prepend>
            <VIcon
              class="me-2"
              icon="mdi-logout"
              size="22"
            />
          </template>

          <VListItemTitle> Deregister</VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
    <!-- !SECTION -->
  </VAvatar>
  <!--  Restart progress box -->
  <vDialog
    v-model="progressDialog"
    width="25rem"
  >
    <vCard
      color="primary"
    >
      <vCardText class="text-center">
        Rebooting. ...
        <vProgressLinear
          indeterminate
          color="white"
          class="mb-0 mt-1"
        />
      </vCardText>
    </vCard>
  </vDialog>
</template>

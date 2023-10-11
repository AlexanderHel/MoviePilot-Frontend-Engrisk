<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { useStore } from 'vuex'
import { requiredValidator } from '@/@validators'
import api from '@/api'
import router from '@/router'
import logo from '@images/logo.png'

// Vuex Store
const store = useStore()

//  Form (document)
const form = ref({
  username: '',
  password: '',
  remember: true,
})

const refForm = ref<InstanceType<typeof VForm> | null>(null)

//  Password input
const isPasswordVisible = ref(false)

//  Error message
const errorMessage = ref('')

//  Background image
const backgroundImageUrl = ref('')

//  Background image加载状态
const isImageLoaded = ref(false)

//  Get background image
async function fetchBackgroundImage() {
  api
    .get('/login/tmdb')
    .then((response: any) => {
      backgroundImageUrl.value = response.message
    })
    .catch((error: any) => {
      console.log(error)
    })
}

//  Log in to gettoken Event
function login() {
  errorMessage.value = ''

  //  Perform form validation
  if (!form.value.username || !form.value.password)
    return

  //  User name and password
  const formData = new FormData()

  formData.append('username', form.value.username)
  formData.append('password', form.value.password)

  //  Requestingtoken
  api
    .post('/login/access-token', formData, {
      headers: {
        Accept: 'application/json', //  Set up Accept  Typology
      },
    })
    .then((response: any) => {
      //  Gaintoken
      const token = response.access_token
      const superuser = response.super_user
      const username = response.user_name
      const avatar = response.avatar

      //  Updatetoken Cap (a poem)remember State toVuex Store
      store.dispatch('auth/updateToken', token)
      store.dispatch('auth/updateRemember', form.value.remember)
      store.dispatch('auth/updateSuperUser', superuser)
      store.dispatch('auth/updateUserName', username)
      store.dispatch('auth/updateAvatar', avatar)

      //  Jump to home page
      router.push('/')
    })
    .catch((error: any) => {
      //  Login failure， Show error message
      if (!error.response)
        errorMessage.value = ' Login failure， Please check the network connection'
      else if (error.response.status === 401)
        errorMessage.value = ' Login failure， Please check if the username and password are correct'
      else if (error.response.status === 403)
        errorMessage.value = ' Login failure， You do not have permission to access'
      else if (error.response.status === 500)
        errorMessage.value = ' Login failure， Server error'
      else
        errorMessage.value = ` Login failure ${error.response.status}， Please check if the username and password are correct`
    })
}

//  Automatic login
onMounted(() => {
  //  Through (a gap)Vuex Store Gettingtoken Cap (a poem)remember State of affairs
  const token = store.state.auth.token
  const remember = store.state.auth.remember

  //  In the event thattoken Remain， And remain logged in astrue， Then go to the home page
  if (token && remember) {
    router.push('/')
  }
  else {
    //  Get background image
    fetchBackgroundImage()
  }
})
</script>

<template>
  <VImg
    aspect-ratio="4/3"
    :src="backgroundImageUrl"
    class="w-full h-full overflow-hidden"
    cover
    @load="isImageLoaded = true"
  >
    <div class="auth-wrapper d-flex align-center justify-center pa-4">
      <VCard
        class="auth-card pa-7 w-full h-full"
        :class="isImageLoaded ? 'backdrop-blur-xl bg-white/50' : ''"
        max-width="25rem"
        :theme="isImageLoaded ? 'light' : ''"
      >
        <VCardItem class="justify-center mb-7">
          <template #prepend>
            <div class="d-flex pe-0">
              <VImg :src="logo" width="64" height="64" />
            </div>
          </template>

          <VCardTitle class="font-weight-semibold text-2xl text-uppercase">
            MoviePilot
          </VCardTitle>
        </VCardItem>

        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="() => {}"
          >
            <VRow>
              <!-- username -->
              <VCol cols="12">
                <VTextField
                  v-model="form.username"
                  label=" User id"
                  type="text"
                  :rules="[requiredValidator]"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <VTextField
                  v-model="form.password"
                  label=" Cryptographic"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                  "
                  :rules="[requiredValidator]"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div
                  v-if="errorMessage"
                  class="text-error mt-1"
                >
                  {{ errorMessage }}
                </div>

                <!-- remember me checkbox -->
                <div class="d-flex align-center justify-space-between flex-wrap mt-1 mb-4">
                  <VCheckbox
                    v-model="form.remember"
                    label=" Stay logged in"
                    required
                  />
                </div>

                <!-- login button -->
                <VBtn
                  block
                  type="submit"
                  @click="login"
                >
                  Log in
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </div>
  </VImg>
</template>

<style lang="scss">
@use "@core/scss/pages/page-auth.scss";

.v-card-item__prepend {
  padding-inline-end: 0 !important;
}
</style>

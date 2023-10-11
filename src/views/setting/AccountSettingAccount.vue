<script lang="ts" setup>
import { useToast } from 'vue-toast-notification'
import { requiredValidator } from '@/@validators'
import api from '@/api'
import type { User } from '@/api/types'
import avatar1 from '@images/avatars/avatar-1.png'

const isNewPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const isPasswordVisible = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

//  Checkbox
const $toast = useToast()

const refInputEl = ref<HTMLElement>()

//  Add user window
const addUserDialog = ref(false)

//  Add a new user form
const userForm = reactive({
  name: '',
  password: '',
  email: '',
})

//  Current user information
const accountInfo = ref<User>({
  id: 0,
  name: '',
  password: '',
  email: '',
  is_active: false,
  is_superuser: false,
  avatar: '',
})

//  All user information
const allUsers = ref<User[]>([])

// changeAvatar function
function changeAvatar(file: Event) {
  const fileReader = new FileReader()
  const { files } = file.target as HTMLInputElement

  if (files && files.length > 0) {
    fileReader.readAsDataURL(files[0])
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        accountInfo.value.avatar = fileReader.result
        saveAccountInfo()
      }
    }
  }
}

// reset avatar image
function resetAvatar() {
  accountInfo.value.avatar = avatar1
}

//  Call (programming)API， Load current user data
async function loadAccountInfo() {
  try {
    const user: User = await api.get('user/current')

    accountInfo.value = user
    if (!accountInfo.value.avatar)
      accountInfo.value.avatar = avatar1
  }
  catch (error) {
    console.log(error)
  }
}

//  Save user information
async function saveAccountInfo() {
  if (newPassword.value || confirmPassword.value) {
    if (newPassword.value !== confirmPassword.value) {
      $toast.error(' Inconsistent passwords entered twice')

      return
    }
    accountInfo.value.password = newPassword.value
  }
  try {
    const result: { [key: string]: any } = await api.put('user/', accountInfo.value)
    if (result.success)
      $toast.success(' User information saved successfully！')
    else
      $toast.error(` Failure to save user information：${result.message}！`)
  }
  catch (error) {
    console.log(error)
  }
}

//  Call (programming)API， Query all users
async function loadAllUsers() {
  try {
    const result: User[] = await api.get('/user/')

    allUsers.value = result
  }
  catch (error) {
    console.log(error)
  }
}

//  Delete user
async function deleteUser(user: User) {
  try {
    const result: { [key: string]: any } = await api.delete(`user/${user.name}`)
    if (result.success) {
      $toast.success(' User deleted successfully！')
      loadAllUsers()
    }
    else {
      $toast.error(` User deletion failed：${result.message}！`)
    }
  }
  catch (error) {
    console.log(error)
  }
}

//  User freeze
async function deactivateUser(user: User) {
  try {
    user.is_active = !user.is_active

    const result: { [key: string]: any } = await api.put('user/', user)
    if (result.success) {
      $toast.success(' User freeze success！')
      loadAllUsers()
    }
    else {
      $toast.error(` User freeze failure：${result.message}！`)
    }
  }
  catch (error) {
    console.log(error)
  }
}

//  New subscriber
async function addUser() {
  try {
    const result: { [key: string]: any } = await api.post('user', userForm)
    if (result.success) {
      $toast.success(' User added successfully！')
      loadAllUsers()
      addUserDialog.value = false
    }
    else {
      $toast.error(` Failed to add user：${result.message}！`)
    }
  }
  catch (error) {
    console.log(error)
  }
}

//  Load current user data
onMounted(() => {
  loadAccountInfo()
  loadAllUsers()
})
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard title=" Personal information">
        <VCardText class="d-flex">
          <!-- 👉 Avatar -->
          <VAvatar
            rounded="lg"
            size="100"
            class="me-6"
            :image="accountInfo.avatar"
          />

          <!-- 👉 Upload Photo -->
          <form class="d-flex flex-column justify-center gap-5">
            <div class="d-flex flex-wrap gap-2">
              <VBtn
                color="primary"
                @click="refInputEl?.click()"
              >
                <VIcon
                  icon="mdi-cloud-upload-outline"
                  class="d-sm-none"
                />
                <span class="d-none d-sm-block"> Upload avatar</span>
              </VBtn>

              <input
                ref="refInputEl"
                type="file"
                name="file"
                accept=".jpeg,.png,.jpg,GIF"
                hidden
                @input="changeAvatar"
              >

              <VBtn
                type="reset"
                color="error"
                variant="tonal"
                @click="resetAvatar"
              >
                <span class="d-none d-sm-block"> Reprovision</span>
                <VIcon
                  icon="mdi-refresh"
                  class="d-sm-none"
                />
              </VBtn>
            </div>

            <p class="text-body-1 mb-0">
              Permissible JPG、GIF  Maybe PNG  Specification，  Maximum size 800K。
            </p>
          </form>
        </VCardText>

        <VDivider />

        <VCardText>
          <!-- 👉 Form -->
          <VForm class="mt-6">
            <VRow>
              <!-- 👉 Name -->
              <VCol
                md="6"
                cols="12"
              >
                <VTextField
                  v-model="accountInfo.name"
                  readonly
                  label=" User id"
                />
              </VCol>

              <!-- 👉 Email -->
              <VCol
                cols="12"
                md="6"
              >
                <VTextField
                  v-model="accountInfo.email"
                  label=" Inbox"
                  type="email"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 new password -->
                <VTextField
                  v-model="newPassword"
                  :type="isNewPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isNewPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                  "
                  label=" New password"
                  autocomplete="new-password"
                  @click:append-inner="isNewPasswordVisible = !isNewPasswordVisible"
                />
              </VCol>

              <VCol
                cols="12"
                md="6"
              >
                <!-- 👉 confirm password -->
                <VTextField
                  v-model="confirmPassword"
                  :type="isConfirmPasswordVisible ? 'text' : 'password'"
                  :append-inner-icon="
                    isConfirmPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                  "
                  label=" Confirm new password"
                  @click:append-inner="
                    isConfirmPasswordVisible = !isConfirmPasswordVisible
                  "
                />
              </VCol>

              <!-- 👉 Form Actions -->
              <VCol
                cols="12"
                class="d-flex flex-wrap gap-4"
              >
                <VBtn @click="saveAccountInfo">
                  Save (a file etc) (computing)
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>

    <VCol
      v-if="accountInfo.is_superuser"
      cols="12"
    >
      <!-- 👉 Accounts -->
      <VCard title=" All users">
        <template #append>
          <IconBtn @click.stop="addUserDialog = true">
            <VIcon icon="mdi-plus" />
          </IconBtn>
        </template>
        <VTable class="text-no-wrap">
          <thead>
            <tr>
              <th scope="col">
                User id
              </th>
              <th scope="col">
                Inbox
              </th>
              <th scope="col">
                State of affairs
              </th>
              <th scope="col">
                Janitors
              </th>
              <th
                scope="col"
                class="w-5"
              />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in allUsers"
              :key="user.name"
            >
              <td>
                {{ user.name }}
              </td>
              <td>{{ user.email }}</td>
              <td>
                <VChip
                  v-if="user.is_active"
                  color="success"
                  text-color="white"
                >
                  Activation
                </VChip>
                <VChip
                  v-else
                  color="error"
                  text-color="white"
                >
                  Freeze (loan, wage, price etc)
                </VChip>
              </td>
              <td>{{ user.is_superuser ? " Be" : " Clogged" }}</td>
              <td>
                <IconBtn v-show="accountInfo.is_superuser && accountInfo.name != user.name">
                  <VIcon icon="mdi-dots-vertical" />
                  <VMenu
                    activator="parent"
                    close-on-content-click
                  >
                    <VList>
                      <VListItem
                        variant="plain"
                        @click="deactivateUser(user)"
                      >
                        <template #prepend>
                          <VIcon icon="mdi-lock" />
                        </template>
                        <VListItemTitle>
                          {{
                            user.is_active ? "Freeze (loan, wage, price etc)" : "解冻"
                          }}
                        </VListItemTitle>
                      </VListItem>
                      <VListItem
                        variant="plain"
                        base-color="error"
                        @click="deleteUser(user)"
                      >
                        <template #prepend>
                          <VIcon icon="mdi-delete" />
                        </template>
                        <VListItemTitle> Removing</VListItemTitle>
                      </VListItem>
                    </VList>
                  </VMenu>
                </IconBtn>
              </td>
            </tr>
          </tbody>
        </VTable>
      </VCard>
    </VCol>
  </VRow>
  <!--  Site editor popup -->
  <VDialog
    v-model="addUserDialog"
    max-width="50rem"
    persistent
  >
    <!-- Dialog Content -->
    <VCard title=" New subscriber">
      <VCardText>
        <VForm @submit.prevent="() => {}">
          <VRow>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userForm.name"
                label=" User id"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userForm.password"
                label=" Cryptographic"
                :rules="[requiredValidator]"
                :type="isPasswordVisible ? 'text' : 'password'"
                :append-inner-icon="
                  isPasswordVisible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
                "
                @click:append-inner="isPasswordVisible = !isPasswordVisible"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VTextField
                v-model="userForm.email"
                label=" Inbox"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions>
        <VBtn @click="addUserDialog = false">
          Abolish
        </VBtn>
        <VSpacer />
        <VBtn @click="addUser">
          Recognize
        </VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
</template>

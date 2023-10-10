<script lang="ts" setup>
import NameTestView from '@/views/system/NameTestView.vue'
import NetTestView from '@/views/system/NetTestView.vue'
import LoggingView from '@/views/system/LoggingView.vue'
import RuleTestView from '@/views/system/RuleTestView.vue'

// App Shortcuts
const appsMenu = ref(false)

//  Name test popups
const nameTestDialog = ref(false)

//  Network test pop-ups
const netTestDialog = ref(false)

//  Real-time log pop-ups
const loggingDialog = ref(false)

//  Filter rule pop-ups
const ruleTestDialog = ref(false)
</script>

<template>
  <VMenu
    v-model="appsMenu"
    max-width="600"
    width="340"
    max-height="560"
    location="top end"
    origin="top end"
    transition="scale-transition"
    close-on-content-click
  >
    <!-- Menu Activator -->
    <template #activator="{ props }">
      <IconBtn
        class="me-2"
        v-bind="props"
      >
        <VIcon icon="mdi-checkbox-multiple-blank-outline" />
      </IconBtn>
    </template>
    <!-- Menu Content -->
    <VCard>
      <VCardItem class="border-b">
        <VCardTitle> Shortcuts</VCardTitle>
        <template #append>
          <IconBtn @click="() => {}">
            <VIcon icon="mdi-checkbox-multiple-blank-outline" />
          </IconBtn>
        </template>
      </VCardItem>
      <div class="ps ps--active-y">
        <VRow class="ma-0 mt-n1">
          <VCol
            cols="6"
            class="text-center cursor-pointer pa-0 shortcut-icon border-e"
          >
            <VListItem
              class="pa-4"
              @click="nameTestDialog = true"
            >
              <VAvatar
                size="48"
                variant="tonal"
              >
                <VIcon icon="mdi-text-recognition" />
              </VAvatar>
              <h6 class="text-base font-weight-medium mt-2 mb-0">
                Recognize
              </h6>
              <span class="text-sm">名称Recognize测试</span>
            </VListItem>
          </VCol>
          <VCol
            cols="6"
            class="text-center cursor-pointer pa-0 shortcut-icon"
            @click="() => {}"
          >
            <VListItem
              class="pa-4"
              @click="netTestDialog = true"
            >
              <VAvatar
                size="48"
                variant="tonal"
              >
                <VIcon icon="mdi-network-outline" />
              </VAvatar>
              <h6 class="text-base font-weight-medium mt-2 mb-0">
                Reticulation
              </h6>
              <span class="text-sm"> Testing network speed connectivity</span>
            </VListItem>
          </VCol>
        </VRow>
        <VRow class="ma-0 mt-n1 border-t">
          <VCol
            cols="6"
            class="text-center cursor-pointer pa-0 shortcut-icon border-e"
            @click="() => {}"
          >
            <VListItem
              class="pa-4"
              @click="loggingDialog = true"
            >
              <VAvatar
                size="48"
                variant="tonal"
              >
                <VIcon icon="mdi-file-document-outline" />
              </VAvatar>
              <h6 class="text-base font-weight-medium mt-2 mb-0">
                Log (computing)
              </h6>
              <span class="text-sm">系统实时Log (computing)</span>
            </VListItem>
          </VCol>
          <VCol
            cols="6"
            class="text-center cursor-pointer pa-0 shortcut-icon border-e"
            @click="() => {}"
          >
            <VListItem
              class="pa-4"
              @click="ruleTestDialog = true"
            >
              <VAvatar
                size="48"
                variant="tonal"
              >
                <VIcon icon="mdi-filter-cog-outline" />
              </VAvatar>
              <h6 class="text-base font-weight-medium mt-2 mb-0">
                Prioritization
              </h6>
              <span class="text-sm">Prioritization规则测试</span>
            </VListItem>
          </VCol>
        </VRow>
      </div>
    </VCard>
  </VMenu>
  <!--  Name test popups -->
  <VDialog
    v-model="nameTestDialog"
    max-width="50rem"
  >
    <VCard title="名称Recognize测试">
      <DialogCloseBtn @click="nameTestDialog = false" />
      <VCardItem>
        <NameTestView />
      </VCardItem>
    </VCard>
  </VDialog>
  <!-- Reticulation测试弹窗 -->
  <VDialog
    v-model="netTestDialog"
    max-width="35rem"
  >
    <VCard title="Reticulation测试">
      <DialogCloseBtn @click="netTestDialog = false" />
      <VCardItem>
        <NetTestView />
      </VCardItem>
    </VCard>
  </VDialog>
  <!-- 实时Log (computing)弹窗 -->
  <VDialog
    v-model="loggingDialog"
    class="w-full lg:w-4/5"
    scrollable
  >
    <VCard title="实时Log (computing)">
      <DialogCloseBtn @click="loggingDialog = false" />
      <VCardText>
        <LoggingView />
      </VCardText>
    </VCard>
  </VDialog>
  <!--  Rule testing pop-ups -->
  <VDialog
    v-model="ruleTestDialog"
    max-width="50rem"
    scrollable
  >
    <VCard title="Prioritization测试">
      <DialogCloseBtn @click="ruleTestDialog = false" />
      <VCardText>
        <RuleTestView />
      </VCardText>
    </VCard>
  </VDialog>
</template>

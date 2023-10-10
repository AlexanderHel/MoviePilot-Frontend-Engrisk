<script lang="ts" setup>
import { useRoute } from 'vue-router'
import AccountSettingAccount from '@/views/setting/AccountSettingAccount.vue'
import AccountSettingNotification from '@/views/setting/AccountSettingNotification.vue'
import AccountSettingRule from '@/views/setting/AccountSettingRule.vue'
import AccountSettingSite from '@/views/setting/AccountSettingSite.vue'
import AccountSettingWords from '@/views/setting/AccountSettingWords.vue'
import AccountSettingAbout from '@/views/setting/AccountSettingAbout.vue'
import AccountSettingSearch from '@/views/setting/AccountSettingSearch.vue'
import AccountSettingSubscribe from '@/views/setting/AccountSettingSubscribe.vue'
import AccountSettingService from '@/views/setting/AccountSettingService.vue'

const route = useRoute()

const activeTab = ref(route.params.tab)

// tabs
const tabs = [
  {
    title: ' Subscribers',
    icon: 'mdi-account',
    tab: 'account',
  },
  {
    title: ' Website',
    icon: 'mdi-web',
    tab: 'site',
  },
  {
    title: ' Look for sth.',
    icon: 'mdi-magnify',
    tab: 'search',
  },
  {
    title: ' Subscribe to',
    icon: 'mdi-rss',
    tab: 'subscribe',
  },
  {
    title: ' Service',
    icon: 'mdi-list-box',
    tab: 'service',
  },
  {
    title: ' Rules and regulations',
    icon: 'mdi-filter-cog',
    tab: 'filter',
  },
  {
    title: ' Notifications',
    icon: 'mdi-bell',
    tab: 'notification',
  },
  {
    title: ' Word list',
    icon: 'mdi-file-word-box',
    tab: 'words',
  },
  {
    title: ' With respect to',
    icon: 'mdi-information',
    tab: 'about',
  },
]
</script>

<template>
  <div>
    <VTabs
      v-model="activeTab"
      show-arrows
    >
      <VTab v-for="item in tabs" :key="item.icon" :value="item.tab">
        <VIcon size="20" start :icon="item.icon" />
        {{ item.title }}
      </VTab>
    </VTabs>
    <VDivider />

    <VWindow
      v-model="activeTab"
      class="mt-5 disable-tab-transition"
      :touch="false"
    >
      <!--  Subscribers -->
      <VWindowItem value="account">
        <transition name="fade-slide" appear>
          <AccountSettingAccount />
        </transition>
      </VWindowItem>

      <!--  Website -->
      <VWindowItem value="site">
        <transition name="fade-slide" appear>
          <AccountSettingSite />
        </transition>
      </VWindowItem>

      <!--  Look for sth. -->
      <VWindowItem value="search">
        <transition name="fade-slide" appear>
          <AccountSettingSearch />
        </transition>
      </VWindowItem>

      <!--  Subscribe to -->
      <VWindowItem value="subscribe">
        <transition name="fade-slide" appear>
          <AccountSettingSubscribe />
        </transition>
      </VWindowItem>

      <!--  Service -->
      <VWindowItem value="service">
        <transition name="fade-slide" appear>
          <AccountSettingService />
        </transition>
      </VWindowItem>

      <!--  Rules and regulations -->
      <VWindowItem value="filter">
        <transition name="fade-slide" appear>
          <AccountSettingRule />
        </transition>
      </VWindowItem>

      <!--  Notifications -->
      <VWindowItem value="notification">
        <transition name="fade-slide" appear>
          <AccountSettingNotification />
        </transition>
      </VWindowItem>
      <!--  Word list -->
      <VWindowItem value="words">
        <transition name="fade-slide" appear>
          <AccountSettingWords />
        </transition>
      </VWindowItem>
      <!--  With respect to -->
      <VWindowItem value="about">
        <transition name="fade-slide" appear>
          <AccountSettingAbout />
        </transition>
      </VWindowItem>
    </VWindow>
  </div>
</template>

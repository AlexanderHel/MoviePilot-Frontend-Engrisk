<script lang="ts" setup>
import VerticalNavSectionTitle from '@/@layouts/components/VerticalNavSectionTitle.vue'
import VerticalNavLayout from '@layouts/components/VerticalNavLayout.vue'
import VerticalNavLink from '@layouts/components/VerticalNavLink.vue'

// Components
import Footer from '@/layouts/components/Footer.vue'
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue'
import SearchBar from '@/layouts/components/SearchBar.vue'
import ShortcutBar from '@/layouts/components/ShortcutBar.vue'
import UserProfile from '@/layouts/components/UserProfile.vue'
import store from '@/store'

//  Through (a gap)Vuex Store Gettingsuperuser Text
const superUser = store.state.auth.superUser
</script>

<template>
  <VerticalNavLayout>
    <!-- 👉 Navbar -->
    <template #navbar="{ toggleVerticalOverlayNavActive }">
      <div class="d-flex h-100 align-center mx-1">
        <!-- 👉 Vertical Nav Toggle -->
        <IconBtn
          class="ms-n2 d-lg-none"
          @click="toggleVerticalOverlayNavActive(true)"
        >
          <VIcon icon="mdi-menu" />
        </IconBtn>

        <!-- 👉 Search Bar -->
        <SearchBar />

        <VSpacer />

        <!-- 👉 Github -->
        <IconBtn
          class="me-2"
          href="https://github.com/AlexanderHel/MoviePilotEngrisk"
          target="_blank"
          rel="noopener noreferrer"
        >
          <VIcon icon="mdi-github" />
        </IconBtn>

        <!-- 👉 Shortcuts -->
        <ShortcutBar />

        <!-- 👉 Theme -->
        <NavbarThemeSwitcher class="me-2" />

        <!-- 👉 UserProfile -->
        <UserProfile />
      </div>
    </template>

    <template #vertical-nav-content>
      <VerticalNavLink
        :item="{
          title: ' Instrument panels',
          icon: 'mdi-home-outline',
          to: '/dashboard',
        }"
      />

      <!-- 👉  Discoveries -->
      <VerticalNavSectionTitle
        :item="{
          heading: ' Discoveries',
        }"
      />
      <VerticalNavLink
        :item="{
          title: ' Testimonials',
          icon: 'mdi-table-star',
          to: '/ranking',
        }"
      />
      <VerticalNavLink
        :item="{
          title: ' Resource search',
          icon: 'mdi-magnify',
          to: '/resource',
        }"
      />

      <!-- 👉  Subscribe to -->
      <VerticalNavSectionTitle
        :item="{
          heading: ' Subscribe to',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Cinematic',
          icon: 'mdi-movie-check-outline',
          to: '/subscribe-movie',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Dramas',
          icon: 'mdi-television-classic',
          to: '/subscribe-tv',
        }"
      />
      <VerticalNavLink
        :item="{
          title: ' Calendar',
          icon: 'mdi-calendar',
          to: '/calendar',
        }"
      />
      <!-- 👉  Collate (data, files) -->
      <VerticalNavSectionTitle
        :item="{
          heading: ' Collate (data, files)',
        }"
      />
      <VerticalNavLink
        :item="{
          title: ' Downloading',
          icon: 'mdi-download-outline',
          to: '/downloading',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Historical record',
          icon: 'mdi-history',
          to: '/history',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Document management',
          icon: 'mdi-folder-multiple-outline',
          to: '/filemanager',
        }"
      />

      <!-- 👉  Systems -->
      <VerticalNavSectionTitle
        v-if="superUser"
        :item="{
          heading: ' Systems',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Plug-in (software component)',
          icon: 'mdi-apps',
          to: '/plugins',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Site management',
          icon: 'mdi-web',
          to: '/site',
        }"
      />
      <VerticalNavLink
        v-if="superUser"
        :item="{
          title: ' Preferences',
          icon: 'mdi-cog',
          to: '/setting',
        }"
      />
    </template>

    <template #after-vertical-nav-items />

    <!-- 👉 Pages -->
    <slot />

    <!-- 👉 Footer -->
    <template #footer>
      <Footer />
    </template>
  </VerticalNavLayout>
</template>

<style lang="scss" scoped>
.meta-key {
  border: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  block-size: 1.5625rem;
  line-height: 1.3125rem;
  padding-block: 0.125rem;
  padding-inline: 0.25rem;
}
</style>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import FlagStripe from '@/components/FlagStripe.vue'
import LangToggle from '@/components/LangToggle.vue'
import SiteBanner from '@/components/SiteBanner.vue'
import ProfilePanel from '@/components/ProfilePanel.vue'
import ResourcesPanel from '@/components/ResourcesPanel.vue'
import SharePanel from '@/components/SharePanel.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const { lang, dir } = useI18n()

onMounted(() => {
  document.documentElement.setAttribute('lang', lang.value)
})
</script>

<template>
  <FlagStripe />
  <LangToggle />
  <SiteBanner />

  <main class="container" :dir="dir">
    <ProfilePanel />
    <ResourcesPanel />
    <SharePanel />
    <SiteFooter />
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { fetchSiteData, type SiteData } from '@/composables/useApi'
import FlagStripe from '@/components/FlagStripe.vue'
import LangToggle from '@/components/LangToggle.vue'
import SiteBanner from '@/components/SiteBanner.vue'
import ProfilePanel from '@/components/ProfilePanel.vue'
import StatsPanel from '@/components/StatsPanel.vue'
import ResourcesPanel from '@/components/ResourcesPanel.vue'
import NewsPanel from '@/components/NewsPanel.vue'
import SharePanel from '@/components/SharePanel.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const { dir } = useI18n()

const siteData = ref<SiteData | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    siteData.value = await fetchSiteData({
      onUpdate: (fresh) => { siteData.value = fresh },
    })
  } catch (e) {
    console.error('Failed to load site data:', e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <FlagStripe />
  <LangToggle />

  <template v-if="siteData">
    <SiteBanner :banner="siteData.banner" />

    <main class="container" :dir="dir">
      <ProfilePanel :description="siteData.profile.description" />
      <StatsPanel />
      <ResourcesPanel :links="siteData.links" />
      <NewsPanel />
      <SharePanel />
      <SiteFooter :contact-email="siteData.contactEmail" :last-updated="siteData.lastUpdated" />
    </main>
  </template>

  <main v-else-if="loading" class="container">
    <section class="panel">
      <div class="panel-header header-blue">
        <span>STAND WITH IRAN</span>
      </div>
      <div class="panel-body profile-body">
        <p class="profile-desc">Loading...</p>
      </div>
    </section>
  </main>
</template>

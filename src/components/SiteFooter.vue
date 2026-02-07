<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { lastUpdated, contactEmail } from '@/data/config'

const { t } = useI18n()

const popups = ref({
  contact: false,
  terms: false,
})
</script>

<template>
  <footer class="footer">
    <div class="footer-slogan">{{ t('slogan') }}</div>
    <div class="footer-meta">{{ t('lastUpdated') }}: {{ lastUpdated }}</div>
    <div class="footer-links">
      <span
        class="footer-trigger"
        @mouseenter="popups.contact = true"
        @mouseleave="popups.contact = false"
      >
        {{ t('contact') }}
        <div v-show="popups.contact" class="footer-popup">
          <p>{{ contactEmail }}</p>
        </div>
      </span>
      <span class="footer-sep">|</span>
      <span
        class="footer-trigger"
        @mouseenter="popups.terms = true"
        @mouseleave="popups.terms = false"
      >
        {{ t('terms') }}
        <div v-show="popups.terms" class="footer-popup">
          <p>{{ t('termsText') }}</p>
        </div>
      </span>
    </div>
  </footer>
</template>

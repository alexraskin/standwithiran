<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'

const { lang, toggleLang } = useI18n()
</script>

<template>
  <button
    class="lang-toggle"
    :aria-label="lang === 'en' ? 'Switch to Farsi' : 'Switch to English'"
    @click="toggleLang"
  >
    {{ lang === 'en' ? 'فارسی' : 'English' }}
  </button>
</template>

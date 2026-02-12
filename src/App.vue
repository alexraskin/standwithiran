<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { lang } = useI18n()

onMounted(() => {
  document.documentElement.setAttribute('lang', lang.value)
})
</script>

<template>
  <router-view />
</template>

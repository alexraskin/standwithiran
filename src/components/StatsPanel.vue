<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

const MAHSA_AMINI = new Date('2022-09-16T00:00:00Z')
const LATEST_PROTEST = new Date('2025-12-28T00:00:00Z')
const INTERNET_BLACKOUT = new Date('2026-01-08T00:00:00Z')

const now = ref(Date.now())
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => { now.value = Date.now() }, 60_000)
})

onUnmounted(() => clearInterval(timer))

function daysSince(date: Date): number {
  return Math.floor((now.value - date.getTime()) / 86_400_000)
}

const daysAmini = computed(() => daysSince(MAHSA_AMINI))
const daysProtest = computed(() => daysSince(LATEST_PROTEST))
const daysBlackout = computed(() => daysSince(INTERNET_BLACKOUT))
</script>

<template>
  <section class="stats-strip">
    <div class="stat-block stat-primary">
      <span class="stat-number">{{ daysAmini.toLocaleString() }}</span>
      <span class="stat-label">{{ t('statDays') }}</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-block">
      <span class="stat-number">{{ daysProtest.toLocaleString() }}</span>
      <span class="stat-label">{{ t('statProtest') }}</span>
    </div>
    <div class="stat-divider" />
    <div class="stat-block">
      <span class="stat-number">{{ daysBlackout.toLocaleString() }}</span>
      <span class="stat-label">{{ t('statBlackout') }}</span>
    </div>
  </section>
</template>

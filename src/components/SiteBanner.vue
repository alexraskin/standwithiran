<script setup lang="ts">
import { banner } from '@/data/config'
</script>

<template>
  <div v-if="banner.enabled" class="banner" :class="'banner-' + banner.type">
    <a v-if="banner.link" :href="banner.link" target="_blank" rel="noopener" class="banner-link">
      <span class="banner-text">{{ banner.text }}</span>
      <span class="banner-arrow">&rarr;</span>
    </a>
    <span v-else class="banner-text">{{ banner.text }}</span>
  </div>
</template>

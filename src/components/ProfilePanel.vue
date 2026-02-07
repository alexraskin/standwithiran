<script setup lang="ts">
import { profile } from '@/data/config'
</script>

<template>
  <section class="panel">
    <div class="panel-header header-blue">
      <span>STAND WITH IRAN</span>
      <span class="badge badge-green">ACTIVE</span>
    </div>
    <div class="panel-body profile-body">
      <div class="avatar-frame">
        <img :src="profile.avatar" :alt="profile.name" loading="eager" decoding="async" />
      </div>
      <p class="profile-subtitle">{{ profile.subtitle }}</p>
      <p class="profile-desc">{{ profile.description }}</p>
    </div>
  </section>
</template>

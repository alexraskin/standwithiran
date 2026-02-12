<script setup lang="ts">
defineProps<{
  description: string
}>()
</script>

<template>
  <section class="panel">
    <div class="panel-header header-blue">
      <span>STAND WITH IRAN</span>
      <span class="badge badge-green">ACTIVE</span>
    </div>
    <div class="panel-body profile-body">
      <div class="profile-desc">
        <p v-for="(para, i) in description.split('\n\n')" :key="i">{{ para }}</p>
      </div>
    </div>
  </section>
</template>

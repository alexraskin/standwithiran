<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { Link } from '@/composables/useApi'

const props = defineProps<{
  links: Link[]
}>()

const { t } = useI18n()

const actionLinks = computed(() => props.links.filter((l) => l.featured))
const regularLinks = computed(() => props.links.filter((l) => !l.featured))

const iconMap: Record<string, string> = {
  heart: '❤️',
  shield: '🛡️',
  book: '📖',
  megaphone: '📢',
  globe: '🌍',
  money: '💰',
  people: '👥',
  fist: '✊',
  flame: '🔥',
  star: '⭐',
  rocket: '🚀',
  lightning: '⚡',
  hand: '👊',
  peace: '🤝',
}

function getIcon(icon: string): string {
  return iconMap[icon] || '🔗'
}
</script>

<template>
  <section v-if="actionLinks.length" class="action-section">
    <div class="action-header">
      <span>{{ t('takeAction') }}</span>
    </div>
    <div class="action-body">
      <a
        v-for="(link, i) in actionLinks"
        :key="link.id"
        :href="link.url"
        class="action-card"
        :class="{ 'action-card-urgent': i === 0 }"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="action-icon">{{ getIcon(link.icon) }}</span>
        <div class="action-content">
          <span class="action-text">{{ link.title }}</span>
          <span class="action-badge" :class="'cat-' + link.category">{{ link.category }}</span>
        </div>
        <span class="action-arrow">&rarr;</span>
      </a>
    </div>
  </section>

  <section class="panel">
    <div class="panel-header">
      <span>{{ t('resources') }}</span>
    </div>
    <div class="panel-body links-body">
      <a
        v-for="link in regularLinks"
        :key="link.id"
        :href="link.url"
        class="link-card"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="link-icon">{{ getIcon(link.icon) }}</span>
        <span class="link-text">{{ link.title }}</span>
        <span class="cat-badge" :class="'cat-' + link.category">{{ link.category }}</span>
        <span class="link-arrow">&rarr;</span>
      </a>
    </div>
  </section>
</template>

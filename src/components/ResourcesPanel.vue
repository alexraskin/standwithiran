<script setup lang="ts">
import { useI18n } from '@/composables/useI18n'
import type { Link } from '@/composables/useApi'

defineProps<{
  links: Link[]
}>()

const { t } = useI18n()

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
  <section class="panel">
    <div class="panel-header">
      <span>{{ t('resources') }}</span>
    </div>
    <div class="panel-body links-body">
      <a
        v-for="link in links"
        :key="link.id"
        :href="link.url"
        class="link-card"
        :class="{ 'link-featured': link.featured }"
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

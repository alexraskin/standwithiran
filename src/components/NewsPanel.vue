<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/composables/useI18n'

const { t } = useI18n()

interface NewsItem {
  title: string
  link: string
  pubDate: string
  description: string
  category: string
}

const items = ref<NewsItem[]>([])
const loading = ref(true)
const error = ref(false)

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return t('newsJustNow')
    if (diffHours < 24) return `${diffHours}${t('newsHoursAgo')}`
    if (diffDays < 7) return `${diffDays}${t('newsDaysAgo')}`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return ''
  }
}

onMounted(async () => {
  try {
    const res = await fetch('/api/news')
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    items.value = data.items || []
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="panel">
    <div class="panel-header header-news">
      <span>{{ t('newsTitle') }}</span>
      <a href="https://azadiwire.org" target="_blank" rel="noopener noreferrer" class="news-source-link">
        AZADIWIRE.ORG
      </a>
    </div>
    <div class="panel-body news-body">
      <p v-if="loading" class="news-loading">{{ t('newsLoading') }}</p>
      <p v-else-if="error || !items.length" class="news-loading">{{ t('newsError') }}</p>
      <template v-else>
        <a
          v-for="(item, i) in items"
          :key="i"
          :href="item.link"
          class="news-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="news-content">
            <span class="news-headline">{{ item.title }}</span>
            <span v-if="item.description" class="news-desc">{{ item.description }}</span>
            <div class="news-meta">
              <span v-if="item.pubDate" class="news-date">{{ formatDate(item.pubDate) }}</span>
              <span v-if="item.category" class="news-category">{{ item.category }}</span>
            </div>
          </div>
          <span class="news-arrow">&rarr;</span>
        </a>
      </template>
    </div>
  </section>
</template>

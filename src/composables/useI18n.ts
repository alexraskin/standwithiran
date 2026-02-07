import { ref, computed } from 'vue'
import { translations, type Lang, type TranslationKey } from '@/data/translations'

const lang = ref<Lang>((localStorage.getItem('language') as Lang) || 'en')

export function useI18n() {
  const isRtl = computed(() => lang.value === 'fa')
  const dir = computed(() => (isRtl.value ? 'rtl' : 'ltr'))

  function t(key: TranslationKey): string {
    return translations[lang.value]?.[key] || translations.en[key] || key
  }

  function toggleLang() {
    lang.value = lang.value === 'en' ? 'fa' : 'en'
    localStorage.setItem('language', lang.value)
    document.documentElement.setAttribute('lang', lang.value)
  }

  return {
    lang,
    isRtl,
    dir,
    t,
    toggleLang,
  }
}

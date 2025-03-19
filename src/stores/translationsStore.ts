import { defineStore } from 'pinia'
import {useAppStore} from "@/stores/app";


interface TranslationMap {
  [key: string]: {
    [key: string]: string
  }
}

export const useTranslationStore = defineStore('translation', {
  state: () => ({
    translations: {
      en: {
        home: 'Home',
        about: 'About',
        map: 'Map',
      },
      ru: {
        home: 'Главная',
        about: 'О нас',
        map: 'Карта'
      }
    } as TranslationMap
  }),

  getters: {
    currentTranslations(): {[key: string]: string} {
      const appStore = useAppStore()
      return this.translations[appStore.language] || this.translations['en']
    }
  },

  actions: {
    t(key: string): string {

      const appStore = useAppStore()
      const langCode = appStore.language

      if (this.translations[langCode] && this.translations[langCode][key]) {
        return this.translations[langCode][key]
      }

      if (langCode !== 'en' && this.translations['en'] && this.translations['en'][key]) {
        return this.translations['en'][key]
      }
      return key
    }
  }
})

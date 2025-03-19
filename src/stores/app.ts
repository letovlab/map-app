import { defineStore } from 'pinia'

interface Language {
  code: string;
  title: string;
}

interface AppState {
  appTitle: string;
  language: string;
  availableLanguages: Language[];
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    appTitle: 'Map/App',
    availableLanguages: [
      {
        code: 'ru',
        title: 'Russian',
      },
      {
        code: 'en',
        title: 'English',
      }
    ],
    language: 'ru'
  }),
  getters: {
    currentLanguage(): Language {
      return this.availableLanguages.find(lang => lang.code === this.language) || this.availableLanguages[0];
    }
  },
  actions: {
    setLanguage(languageCode: string) {
      this.language = languageCode

      localStorage.setItem('app-language', languageCode);
    },
    initializeLanguage() {
      const savedLanguage = localStorage.getItem('app-language');

      if (savedLanguage) {
        this.setLanguage(savedLanguage);
      } else {
        const browserLang = navigator.language.split('-')[0];
        const availableLangCodes = this.availableLanguages.map(lang => lang.code);

        if (availableLangCodes.includes(browserLang)) {
          this.setLanguage(browserLang);
        }
      }
    }
  }
})

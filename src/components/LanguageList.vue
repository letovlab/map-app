<script setup lang="ts">
import {useAppStore} from "@/stores/app";

// Stores
const appStore = useAppStore()
const { availableLanguages, setLanguage } = useAppStore()

// Computed
const currentLanguage = computed(() => {
  return appStore.currentLanguage
})

// Methods
const changeLanguage = (languageCode: string) => {
  setLanguage(languageCode)
}
</script>

<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        icon="mdi-earth"
        v-bind="props"
      />
      <span class="text-button ml-1 mr-5">{{ currentLanguage.code }}</span>
    </template>

    <v-list>
      <v-list-item
        v-for="(language) in availableLanguages"
        :key="language.code"
        :value="language.code"
        :active="currentLanguage.code === language.code"
        @click="changeLanguage(language.code)"
      >
        <v-list-item-title>{{ language.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style scoped lang="sass">

</style>

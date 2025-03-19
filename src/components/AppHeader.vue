<script lang="ts" setup>
import { useRouter } from 'vue-router'
import {useAppStore} from "@/stores/app";
import {useTranslationStore} from "@/stores/translationsStore";

// Router
const router = useRouter()

// Stores
const {appTitle} = useAppStore()
const {t} = useTranslationStore()

// LocalState
const activeTab = ref(null)

// Computed
const navigationItems = computed(() => {
  return router.getRoutes()
    .filter(route => {
      return route.meta && route.meta.title
    })
    .map(route => ({
      path: route.path,
      title: route.meta.title as string,
      description: route.meta.description,
      icon: route.meta.icon
    }))
})
</script>

<template>
  <v-card>
    <v-toolbar color="primary">
      <v-toolbar-title>{{ appTitle }}</v-toolbar-title>
      <v-spacer />
      <language-list />
      <template #extension>
        <v-tabs
          v-model="activeTab"
          align-tabs="title"
        >
          <v-tab
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            :value="item.path"
            :title="item.description"
          >
            {{ t(item.title.toLowerCase()) }}
          </v-tab>
        </v-tabs>
      </template>
    </v-toolbar>
  </v-card>
</template>

<script setup lang="ts">
import { useTranslationStore } from "@/stores/translationsStore";
import { useMapStore } from "@/stores/mapStore";

defineOptions({
  layout: 'default',
  meta: {
    title: 'Map',
  }
})

// Stores
const mapStore = useMapStore()
const {t} = useTranslationStore()

// Local state
const isStoreInitialized = ref(false)

onMounted(async () => {
  try {
    await mapStore.initStore();
    isStoreInitialized.value = true;
  } catch (err) {
    console.error("Error initializing store:", err);
  }
});
</script>

<template>
  <v-container
    fluid
    class="pa-0 pa-sm-2"
  >
    <v-row no-gutters>
      <v-col
        cols="12"
        sm="4"
        md="3"
        lg="3"
        class="pr-0 pr-sm-2"
      >
        <v-card class="pa-4 h-100">
          <h1 class="text-h5 text-sm-h4 mb-4">
            {{ t('map') }}
          </h1>
          <v-divider class="mb-4" />
          <v-skeleton-loader
            height="600"
            :loading="mapStore.isLoading"
          >
            <markers-list />
          </v-skeleton-loader>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        sm="8"
        md="9"
        lg="9"
        class="pt-2 pt-sm-0"
      >
        <v-card class="h-100">
          <v-skeleton-loader
            height="600"
            :loading="mapStore.isLoading"
          >
            <open-layers-map v-if="isStoreInitialized && !mapStore.isLoading" />
          </v-skeleton-loader>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped lang="scss">
</style>

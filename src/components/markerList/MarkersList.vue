<script setup lang="ts">
import { useMapStore } from '@/stores/mapStore';
import {computed} from "vue";

// Stores
const mapStore = useMapStore();

// Computed
const markers = computed(() => mapStore.markers);
const selectedMarkerId = computed(() => mapStore.selectedMarkerId);

// Methods
const selectMarker = (id: number) => {
  mapStore.selectMarker(id);
};

const removeMarker = (id: number) => {
  if (confirm('Are you sure you want to remove this marker?')) {
    mapStore.removeMarker(id);
  }
};

const isSelected = (markerId: number) => {
  return selectedMarkerId.value === markerId;
};

const copyMarkerUrl = async (id: number, event: MouseEvent) => {
  event.stopPropagation();

  const markerUrl = new URL(
    window.location.href.split('?')[0] + `?marker=${id}`
  );

  try {
    await navigator.clipboard.writeText(markerUrl.toString());
    alert('Marker URL copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy URL:', err);
    alert('Failed to copy URL to clipboard');
  }
};
</script>

<template>
  <v-sheet class="markers-list">
    <v-sheet
      v-if="!markers.length"
      class="text-center py-4"
    >
      <p>No markers added yet</p>
      <p class="text-caption">
        Use the "Add Marker" button on the map to add markers
      </p>
    </v-sheet>
    <template v-else>
      <v-list
        density="compact"
        nav
      >
        <v-list-item
          v-for="marker in markers"
          :key="marker.id"
          :title="marker.title || 'Unnamed Marker'"
          :subtitle="marker.position
            ? `${marker.position.lat.toFixed(4)}, ${marker.position.lng.toFixed(4)}`
            : 'Invalid coordinates'"
          :active="isSelected(marker.id)"
          :class="{ 'bg-blue-lighten-5': isSelected(marker.id) }"
          class="mb-1 rounded"
          @click="selectMarker(marker.id)"
        >
          <template #prepend>
            <v-icon :color="isSelected(marker.id) ? 'blue' : 'gray'">
              mdi-map-marker
            </v-icon>
          </template>

          <template #append>
            <div class="d-flex">
              <v-btn
                size="small"
                icon
                variant="text"
                title="Copy marker URL"
                data-test="copy-marker-button"
                @click.stop="copyMarkerUrl(marker.id, $event)"
              >
                <v-icon>mdi-link</v-icon>
              </v-btn>

              <v-btn
                size="small"
                icon
                variant="text"
                color="error"
                title="Remove marker"
                @click.stop="removeMarker(marker.id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-list-item>
      </v-list>
    </template>
  </v-sheet>
</template>

<style scoped>
.markers-list {
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}
</style>

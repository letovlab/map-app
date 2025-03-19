import { useRouter, useRoute } from 'vue-router';
import { watch, onMounted } from 'vue';
import { useMapStore } from '@/stores/mapStore';

/**
 * Hook to sync marker selection with URL parameters
 */
export function useMarkerUrlSync() {
  const router = useRouter();
  const route = useRoute();
  const mapStore = useMapStore();

  // Update URL when selected marker changes
  watch(() => mapStore.selectedMarkerId, (newId) => {
    if (route.query.marker === String(newId)) {
      return;
    }
    const query = { ...route.query };

    if (newId === null) {
      delete query.marker;
    } else {
      query.marker = String(newId);
    }

    router.replace({ query });
  });

  // Set selected marker when URL changes
  watch(() => route.query.marker, (markerId) => {
    if (markerId) {
      const id = parseInt(markerId as string, 10);

      if (mapStore.markers.some(m => m.id === id)) {

        if (id !== mapStore.selectedMarkerId) {
          console.log(`URL marker ID changed to ${id}, selecting marker`);
          mapStore.selectMarker(id);
        }
      } else {
        console.warn(`Marker with ID ${id} from URL not found in store`);
      }
    } else if (mapStore.selectedMarkerId !== null) {
      mapStore.selectMarker(null);
    }
  }, { immediate: true });

  onMounted(() => {
    const { marker } = route.query;
    if (marker) {
      const id = parseInt(marker as string, 10);
      mapStore.selectMarker(id);
    }
  });

  return {
    // Helper function to get URL for a specific marker
    getMarkerUrl: (markerId: number) => {
      return {
        ...route,
        query: {
          ...route.query,
          marker: String(markerId)
        }
      };
    }
  };
}

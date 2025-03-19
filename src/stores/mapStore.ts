import { defineStore } from 'pinia'
import { fromLonLat } from 'ol/proj'
import Map from 'ol/Map'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import Backend from "@/services/backedMock.js";

export interface Position {
  lat: number;
  lng: number;
}

export interface Marker {
  id: number;
  position: Position;
  title: string;
  popup?: string;
}

export interface TileProvider {
  name: string;
  label: string;
  url: string;
}

interface MapState {
  center: Position;
  zoom: number;
  markers: Marker[];
  selectedMarkerId: number | null;
  isMapLoaded: boolean;
  mapInstance: Map | null;
  tileProviders: TileProvider[];
  currentTileProvider: string;
  error: string | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export const useMapStore = defineStore('map', {
  state: (): MapState => ({
    center: { lat: 55.751244, lng: 37.618423 },
    zoom: 13,
    markers: [],
    selectedMarkerId: null,
    isMapLoaded: false,
    mapInstance: null,
    tileProviders: [],
    currentTileProvider: 'standard',
    isLoading: false,
    error: null,
    isInitialized: false
  }),

  getters: {
    selectedMarker: (state): Marker | undefined => {
      return state.markers.find(marker => marker.id === state.selectedMarkerId)
    },

    markerCount: (state): number => state.markers.length,

    activeTileProvider: (state): TileProvider => {
      return state.tileProviders.find(provider => provider.name === state.currentTileProvider) || state.tileProviders[0]
    },

    tileProviderOptions: (state): { value: string; title: string }[] => {
      return state.tileProviders.map(provider => ({
        value: provider.name,
        title: provider.label
      }))
    },

    // Get center in OpenLayers format
    olCenter: (state): number[] => {
      return fromLonLat([state.center.lng, state.center.lat])
    },
  },

  actions: {
    setCenter(lat: number, lng: number): void {
      if (isNaN(lat) || isNaN(lng)) {
        return;
      }

      this.center = { lat, lng };

      // Update map if it exists (OpenLayers specific)
      if (this.mapInstance && this.mapInstance.getView) {
        const center = fromLonLat([lng, lat]);

        this.mapInstance.getView().setCenter(center);
      }
    },

    setZoom(zoom: number): void {
      if (isNaN(zoom) || zoom < 0) {
        return;
      }

      this.zoom = zoom;

      // Update map if it exists (OpenLayers specific)
      if (this.mapInstance && this.mapInstance.getView) {
        this.mapInstance.getView().setZoom(zoom);
      }
    },

    async addMarker(marker: Omit<Marker, 'id'>) {
      try {
        if (!marker.position) {
          throw new Error('Invalid marker position');
        }

        const tempId = Date.now() + Math.floor(Math.random() * 1000);

        const newMarkerWithId: Marker = {
          id: tempId,
          position: {
            lat: marker.position.lat,
            lng: marker.position.lng
          },
          title: marker.title,
          popup: marker.popup
        };

        // Add to local state
        this.markers = [...this.markers, newMarkerWithId];

        // Call the backend to persist data
        const response = await Backend.addMarker({
          marker: newMarkerWithId,
          id: tempId
        });

        // Update the markers from the response
        if (response && response.markers) {
          this.markers = response.markers.map((m:Marker) => {
            if (!m.position && m.id === tempId) {
                return newMarkerWithId;
            }

            return {
              id: m.id,
              position: {
                lat: m.position.lat,
                lng: m.position.lng
              },
              title: m.title,
              popup: m.popup
            };
          });

          const lastMarker = this.markers[this.markers.length - 1];
          return lastMarker ? lastMarker.id : tempId;
        }

        return tempId;
      } catch (err) {
        console.error('Error adding marker:', err);
        this.error = err instanceof Error ? err.message : 'Failed to add marker';
        return null;
      }
    },

    removeMarker(id: number): void {
      const index = this.markers.findIndex(marker => marker.id === id)
      if (index !== -1) {
        this.markers.splice(index, 1)

        if (this.selectedMarkerId === id) {
          this.selectedMarkerId = null
        }

        this.saveCurrentState();
      }
    },

    selectMarker(id: number | null): void {
      if (this.selectedMarkerId === id) {
        return;
      }

      if (id === null) {
        this.selectedMarkerId = null;
        return;
      }

      const marker = this.markers.find(m => m.id === id);

      if (marker) {
        this.selectedMarkerId = id;

        // Center the map on the marker
        if (this.mapInstance && this.mapInstance.getView) {
          this.mapInstance.getView().animate({
            center: fromLonLat([marker.position.lng, marker.position.lat]),
            duration: 500
          });
        }
      } else {
        console.warn(`Tried to select marker with ID ${id}, but it was not found in store`);
      }
    },

    setMapLoaded(status: boolean): void {
      this.isMapLoaded = status
    },

    setMapInstance(map: Map | null): void {
      this.mapInstance = map
    },

    async fetchMapData() {
      this.isLoading = true;
      this.error = null;

      try {
        const data = await Backend.getMapData();

        if (data) {
          // Set center and zoom
          if (data.center && typeof data.center.lat === 'number' && typeof data.center.lng === 'number') {
            this.center = data.center;
          } else {
            console.warn('Invalid center from backend, using default');
            this.center = { lat: 55.751244, lng: 37.618423 };
          }

          this.zoom = typeof data.zoom === 'number' ? data.zoom : 13;
          console.log('Map center set to:', this.center, 'zoom:', this.zoom);

          // Process markers to ensure all have the required properties
          if (data.markers && Array.isArray(data.markers)) {
            this.markers = [...data.markers]

          } else {
            this.markers = [];
          }

          this.tileProviders = data.tileProviders || [];
          this.currentTileProvider = data.currentTileProvider || 'standard';
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch map data';
        console.error('Error fetching map data:', errorMessage);
        this.error = errorMessage;
      } finally {
        this.isLoading = false;
        this.isInitialized = true;
      }
    },

    async saveCurrentState() {
      try {
        await Backend.saveMapData({
          center: this.center,
          zoom: this.zoom,
          markers: this.markers,
          tileProviders: this.tileProviders,
          currentTileProvider: this.currentTileProvider
        });
      } catch (err) {
        console.error('Error saving map data:', err);
        this.error = err instanceof Error ? err.message : 'Failed to save map data';
      }
    },

    async initStore(): Promise<void> {
      if (this.isInitialized) {
        return;
      }

      try {
        await this.fetchMapData();
      } catch (err) {
        console.error('Error initializing store:', err);
        this.error = err instanceof Error ? err.message : 'Failed to initialize store';
        throw err;
      }
    }
  }
})

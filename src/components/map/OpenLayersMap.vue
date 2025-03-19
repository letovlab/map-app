<script setup lang="ts">
import { useMapHandlers } from "@/utils/useMapHandlers";

const {
  markers,
  mapRef,
  isMarkerAddingMode,
  zoom,
  center,
  getCoordinates,
  onMapClick,
  onFeatureClick,
  onMapReady,
} = useMapHandlers();



// Watch for changes in marker adding mode to update the cursor style
watch(isMarkerAddingMode, (newValue) => {
  if (!mapRef.value || !mapRef.value.map) return;

  const mapElement = mapRef.value.map.getTargetElement();

  if (newValue) {
    mapElement.style.cursor = 'crosshair';
  } else {
    mapElement.style.cursor = '';
  }
});
</script>

<template>
  <v-container class="map-wrapper">
    <ol-map
      ref="mapRef"
      :load-tiles-while-animating="true"
      :load-tiles-while-interacting="true"
      style="height: 600px; width: 100%"
      class="map rounded-lg"
      :class="{ 'map--active': isMarkerAddingMode }"
      @ready="onMapReady"
      @click="onMapClick"
    >
      <ol-view
        :center="center"
        :zoom="zoom"
        projection="EPSG:3857"
      />

      <ol-tile-layer>
        <ol-source-osm />
      </ol-tile-layer>

      <ol-vector-layer>
        <ol-source-vector>
          <template v-if="markers && markers.length">
            <ol-feature
              v-for="marker in markers"
              :key="marker.id"
              :properties="{ markerId: marker.id, markerData: marker }"
            >
              <ol-geom-point :coordinates="getCoordinates(marker)" />
              <ol-style>
                <ol-style-circle
                  :radius="8"
                  style="cursor: pointer"
                >
                  <ol-style-fill color="#03a9f4" />
                  <ol-style-stroke
                    color="#ffffff"
                    :width="2"
                  />
                </ol-style-circle>
              </ol-style>
            </ol-feature>
          </template>
        </ol-source-vector>
      </ol-vector-layer>

      <ol-interaction-select
        @select="onFeatureClick"
      />

      <marker-add-button
        :marker-adding-mode="isMarkerAddingMode"
        @update:marker-adding-mode="isMarkerAddingMode = $event"
      />
    </ol-map>
  </v-container>
</template>

<style lang="scss">
@use 'sass:map';
@use 'vuetify/settings' as vuetify;

.map-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.loading-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
}

.adding-marker-indicator {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 100;
  font-weight: bold;
  pointer-events: none;
}

.map {
  height: 100%;
  width: 100%;
  border-radius: 2px;
  overflow: hidden;
  border: 2px solid transparent;

  &--active {
    border-color: map.get(vuetify.$blue, 'base');
  }
}

.ol-tooltip {
  position: absolute;
  background-color: white;
  border: 1px solid map.get(vuetify.$blue, 'base');
  border-radius: 8px;
  padding: 12px;
  min-width: 180px;
  max-width: 240px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  pointer-events: none;
  font-family: 'Roboto', sans-serif;
  transform: translate(-50%, -100%);
  transition: opacity 0.2s ease-out, transform 0.2s ease-out;

  &.ol-tooltip-hidden {
    opacity: 0;
    transform: translate(-50%, -90%);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 10px solid white;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    bottom: -11px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 11px solid transparent;
    border-right: 11px solid transparent;
    border-top: 11px solid map.get(vuetify.$blue, 'base');
    z-index: 0;
  }

  .tooltip-title {
    font-weight: 500;
    font-size: 14px;
    margin-bottom: 6px;
    color: map.get(vuetify.$blue, 'darken-2');
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .tooltip-coordinates {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.03);
    padding: 4px 6px;
    border-radius: 4px;
    margin-top: 4px;
  }

  .tooltip-description {
    margin-top: 8px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.8);
  }
}

@keyframes tooltip-fade-in {
  from { opacity: 0; transform: translate(-50%, -90%); }
  to { opacity: 1; transform: translate(-50%, -100%); }
}

.ol-tooltip:not(.ol-tooltip-hidden) {
  animation: tooltip-fade-in 0.2s ease-out;
}
</style>

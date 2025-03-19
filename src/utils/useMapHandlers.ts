import { fromLonLat, toLonLat } from 'ol/proj';
import { Map } from "ol";
import Overlay from 'ol/Overlay';
import { Fill, Stroke, Style } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { Point } from "ol/geom";
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { SelectEvent } from 'ol/interaction/Select';
import { MapBrowserEvent } from 'ol';
import {useMarkerUrlSync} from "@/utils/useMarkerUrlSync";
import { type Marker, useMapStore } from "@/stores/mapStore";

export const useMapHandlers = () => {
// Stores
  const mapStore = useMapStore();

  useMarkerUrlSync();

// Local State
  const mapRef = ref<{ map: Map } | null>(null);
  const mapInitialized = ref(false);
  const isMarkerAddingMode = ref(false);
  const tooltip: Ref<Overlay | null> = ref(null);

// Computed
  const zoom = computed({
    get: () => mapStore.zoom,
    set: (value) => mapStore.setZoom(value)
  });

  const center = computed({
    get: () => {
      const currentCenter = mapStore.center;
      if (!currentCenter) {
        return fromLonLat([37.618423, 55.751244]);
      }
      return fromLonLat([currentCenter.lng, currentCenter.lat]);
    },
    set: (value) => {
      const lonLat = toLonLat(value);
      mapStore.setCenter(lonLat[1], lonLat[0]); // [lat, lng]
    }
  });

  const markers = computed(() => mapStore.markers || []);
  const selectedMarkerId = computed<number | null>(() => mapStore.selectedMarkerId);

  const isSelected = (markerId: number) => {
    return selectedMarkerId.value === markerId;
  };

// Methods
  const createMarkerStyle = (isSelected = false) => {
    return new Style({
      image: new CircleStyle({
        radius: isSelected ? 10 : 8,
        fill: new Fill({
          color: '#03a9f4'
        }),
        stroke: new Stroke({
          color: '#fff',
          width: isSelected ? 3 : 2
        })
      })
    });
  };

  const getCoordinates = (marker: Marker) => {
    if (!marker || !marker.position) {
      return fromLonLat([0, 0]);
    }

    return fromLonLat([marker.position.lng, marker.position.lat]);
  }

  const onMapClick = async (event: MapBrowserEvent<UIEvent>) => {
    if (!mapRef.value || !mapRef.value.map) {
      return;
    }

    if (!isMarkerAddingMode.value) {
      hideTooltip();
      return;
    }

    const coordinate = event.coordinate;

    const lonLat = toLonLat(coordinate);
    const lng = lonLat[0];
    const lat = lonLat[1];

    try {
      const title = prompt("Marker Name");
      const description = prompt("Marker Description");

      const newMarker = {
        position: { lat, lng },
        title: title || `Marker ${mapStore.markers.length + 1}`,
        popup: description || `New marker (${lat.toFixed(6)}, ${lng.toFixed(6)})`
      };

      const newMarkerId = await mapStore.addMarker(newMarker);

      if (newMarkerId) {
        mapStore.selectMarker(newMarkerId);

        const addedMarker = mapStore.markers.find(m => m.id === newMarkerId);
        if (addedMarker) {
          showTooltip(addedMarker, coordinate);
        }
      }

      isMarkerAddingMode.value = false;
    } catch (error) {
      console.error('Error adding marker:', error);
    }
  };

  const showTooltip = (marker: Marker, coordinates: number[]): void => {
    if (!mapRef.value || !mapRef.value.map) {
      return;
    }

    if (!marker || !marker.position) {
      return;
    }

    hideTooltip();

    const tooltipContent = document.createElement('div');
    tooltipContent.className = 'ol-tooltip ol-tooltip-hidden';

    const lat = marker.position.lat.toFixed(6);
    const lng = marker.position.lng.toFixed(6);

    tooltipContent.innerHTML = `
      <div class="tooltip-title">${marker.title || 'Unnamed Marker'}</div>
      <div class="tooltip-coordinates">${lat}, ${lng}</div>
      ${marker.popup ? `<div class="tooltip-description">${marker.popup}</div>` : ''}
    `;

    tooltip.value = new Overlay({
      element: tooltipContent,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false
    });

    tooltip.value.setPosition(coordinates);
    mapRef.value.map.addOverlay(tooltip.value);

    tooltipContent.classList.remove('ol-tooltip-hidden');
  };

  const hideTooltip = (): void => {
    if (tooltip.value && mapRef.value && mapRef.value.map) {
      mapRef.value.map.removeOverlay(tooltip.value);
      tooltip.value = null;
    }
  };

  const onFeatureClick = (event: SelectEvent): void => {
    if (event.selected && event.selected.length > 0) {
      const feature = event.selected[0];
      const markerData = feature.get('markerData');

      if (!markerData) {
        console.warn('Feature clicked but no marker data found');
        return;
      }

      const marker = markerData as Marker;
      const geometry = feature.getGeometry();

      if (marker && marker.id && geometry) {
        // Disable marker adding mode when a marker is clicked
        if (isMarkerAddingMode.value) {
          isMarkerAddingMode.value = false;
        }

        mapStore.selectMarker(marker.id);
        if (geometry instanceof Point) {
          showTooltip(marker, geometry.getCoordinates());
        }
      }
    } else {
      hideTooltip();
      mapStore.selectMarker(null);
    }
  };

  const onMapReady = (event: { map: Map }) => {
    const map = event.map;
    mapStore.setMapInstance(map);
    mapStore.setMapLoaded(true);
    mapInitialized.value = true;

    const currentCenter = mapStore.center;
    const currentZoom = mapStore.zoom;


    if (currentCenter) {
      const olCenter = fromLonLat([currentCenter.lng, currentCenter.lat]);
      map.getView().setCenter(olCenter);
    }

    map.getView().setZoom(currentZoom);

    //Close any tooltips when clicking away from markers
    map.on('click', (event: MapBrowserEvent<UIEvent>) => {
      const pixel = event.pixel;
      const hasFeature = map.hasFeatureAtPixel(pixel);
      if (!hasFeature) {
        hideTooltip();
        mapStore.selectMarker(null);
      }
    });

    updateMarkerStyles();
  };

  const updateMarkerStyles = () => {
    try {
      if (!mapRef.value || !mapRef.value.map) {
        return;
      }

      const layers = mapRef.value.map.getLayers().getArray();
      if (!layers || !Array.isArray(layers)) {
        return;
      }

      const vectorLayer = layers.find(layer =>
        layer instanceof VectorLayer && layer.getSource() instanceof VectorSource
      );

      if (!vectorLayer) {
        return;
      }

      const source = (vectorLayer as VectorLayer<VectorSource>).getSource();
      if (!source) {
        return;
      }

      const features = source.getFeatures();
      if (!features || !Array.isArray(features)) {
        return;
      }

      features.forEach((feature) => {
        if (!feature) return;

        try {
          const marker = feature.get('markerData');
          if (marker) {
            const isSelected = marker.id === selectedMarkerId.value;
            feature.setStyle(createMarkerStyle(isSelected));
          }
        } catch (featureError) {
          console.warn('Error updating feature style:', featureError);
        }
      });
    } catch (error) {
      console.error('Error updating marker styles:', error);
    }
  };

  // Watchers
  watch(selectedMarkerId, () => {
    updateMarkerStyles();
  }, {
    immediate: true,
  });

  // Pan to selected marker when it changes
  watch(selectedMarkerId, (newId) => {
    if (newId === null || !mapRef.value?.map) return;

    const selectedMarker = markers.value.find(marker => marker.id === newId);
    if (!selectedMarker) {
      return;
    }

    // Pan to the marker location
    const coordinates = getCoordinates(selectedMarker);
    mapRef.value.map.getView().animate({
      center: coordinates,
      duration: 300
    });

    showTooltip(selectedMarker, coordinates);
  }, {
    immediate: true,
  });

  // Watch for changes in the markers array to update styles
  watch(() => mapStore.markers.length, (newLength) => {
    if (mapInitialized.value && newLength > 0) {
      updateMarkerStyles();
    }
  });

  return {
    mapRef,
    isMarkerAddingMode,
    zoom,
    center,
    markers,
    selectedMarkerId,
    isSelected,
    selectMarker: mapStore.selectMarker,
    onMapClick,
    onFeatureClick,
    onMapReady,
    getCoordinates,
    updateMarkerStyles,
    mapInitialized
  };
};

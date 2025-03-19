<script setup lang="ts">
// Props
const props = defineProps({
  markerAddingMode: {
    type: Boolean,
    required: true
  }
});

// Emits
const emit = defineEmits(['update:markerAddingMode']);

// Computed
const iconName = computed(() => props.markerAddingMode ? '$complete' : '$plus');
const buttonColor = computed(() => props.markerAddingMode ? 'success' : 'primary');

// Methods
const toggleMarkerAddingMode = () => {
  emit('update:markerAddingMode', !props.markerAddingMode);
};
</script>

<template>
  <v-fab
    :color="buttonColor"
    :icon="iconName"
    absolute
    location="bottom right"
    style="z-index: 1000; left: 0;"
    class="map-marker-add-button"
    @click="toggleMarkerAddingMode"
  />
</template>

<style scoped lang="sass">

</style>

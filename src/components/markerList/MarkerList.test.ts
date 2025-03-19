import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, VueWrapper } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { useMapStore } from '@/stores/mapStore';
import MarkersList from "@/components/markerList/MarkersList.vue";

vi.mock('@/utils/useMarkerUrlSync', () => ({
  useMarkerUrlSync: () => ({
    getMarkerUrl: vi.fn()
  })
}));

describe('MarkersList.vue', () => {
  let wrapper: VueWrapper;
  let mapStore: ReturnType<typeof useMapStore>;

  const sampleMarkers = [
    { id: 1, title: 'Marker 1', position: { lat: 40.7128, lng: -74.0060 } },
    { id: 2, title: 'Marker 2', position: { lat: 37.7749, lng: -122.4194 } },
    { id: 3, title: '', position: { lat: 51.5074, lng: -0.1278 } } // Unnamed marker
  ];

  beforeEach(() => {
    setActivePinia(createPinia());
    mapStore = useMapStore();

    // Mock location and URL
    vi.stubGlobal('location', {
      href: 'http://localhost:3000/',
      pathname: '/'
    });

    // Mock clipboard API
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    // Mock confirm dialog
    vi.stubGlobal('confirm', vi.fn(() => true));

    // Mock alert
    vi.stubGlobal('alert', vi.fn());
  });

  it('displays a message when no markers are present', () => {
    mapStore.markers = [];
    wrapper = mount(MarkersList);

    expect(wrapper.text()).toContain('No markers added yet');
    expect(wrapper.text()).toContain('Use the "Add Marker" button on the map to add markers');
  });

  it('displays the correct number of markers', () => {
    mapStore.markers = sampleMarkers;
    wrapper = mount(MarkersList);

    const listItems = wrapper.findAll('v-list-item');
    expect(listItems.length).toBe(3);
  });

  it('displays marker titles and coordinates correctly', () => {
    mapStore.markers = sampleMarkers;
    wrapper = mount(MarkersList);

    const listItems = wrapper.findAll('v-list-item');

    // Check first marker
    expect(listItems[0].attributes('title')).toBe('Marker 1');
    expect(listItems[0].attributes('subtitle')).toBe('40.7128, -74.0060');

    // Check unnamed marker
    expect(listItems[2].attributes('title')).toBe('Unnamed Marker');
  });

  it('highlights the selected marker', async () => {
    mapStore.markers = sampleMarkers;
    mapStore.selectedMarkerId = 2;
    wrapper = mount(MarkersList);

    const listItems = wrapper.findAll('v-list-item');

    expect(listItems[1].classes()).toContain('bg-blue-lighten-5');
    expect(listItems[0].classes()).not.toContain('bg-blue-lighten-5');
    expect(listItems[2].classes()).not.toContain('bg-blue-lighten-5');
  });

  it('selects a marker when clicked', async () => {
    mapStore.markers = sampleMarkers;
    vi.spyOn(mapStore, 'selectMarker');
    wrapper = mount(MarkersList);

    await wrapper.findAll('v-list-item')[1].trigger('click');

    expect(mapStore.selectMarker).toHaveBeenCalledWith(2);
  });

  it('removes a marker when delete button is clicked', async () => {
    mapStore.markers = sampleMarkers;
    vi.spyOn(mapStore, 'removeMarker');

    wrapper = mount(MarkersList);

    // Directly call the removeMarker method
    await wrapper.vm.removeMarker(1);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this marker?');
    expect(mapStore.removeMarker).toHaveBeenCalledWith(1);
  });

  it('does not remove marker if confirmation is canceled', async () => {
    mapStore.markers = sampleMarkers;
    vi.mocked(window.confirm).mockReturnValueOnce(false);
    vi.spyOn(mapStore, 'removeMarker');

    wrapper = mount(MarkersList);
    await wrapper.vm.removeMarker(1);

    expect(mapStore.removeMarker).not.toHaveBeenCalled();
  });

  it('copies marker URL to clipboard when copy button is clicked', async () => {
    mapStore.markers = sampleMarkers;
    wrapper = mount(MarkersList);

    // Create a mock event with stopPropagation
    const mockEvent = {
      stopPropagation: vi.fn()
    };

    // Mock clipboard writeText
    vi.mocked(navigator.clipboard.writeText).mockResolvedValueOnce(undefined);

    // Call the method directly with the mock event
    await wrapper.vm.copyMarkerUrl(1, mockEvent as unknown as MouseEvent);

    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('?marker=1')
    );
    expect(window.alert).toHaveBeenCalledWith('Marker URL copied to clipboard!');
  });
});

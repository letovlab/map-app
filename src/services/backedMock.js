export default class Backend {
  /**
   * Storage key for data in localStorage
   * @type {string}
   * @private
   */
  static #STORAGE_KEY = 'map_data';

  /**
   * Default delay for simulating network requests (in ms)
   * @type {number}
   * @private
   */
  static #DEFAULT_DELAY = 300;

  /**
   * Simulates network delay
   * @param {number} [ms=Backend.#DEFAULT_DELAY] - Delay in milliseconds
   * @returns {Promise<void>}
   * @private
   */
  static async #delay(ms = this.#DEFAULT_DELAY) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get data from localStorage
   * @returns {Object} Data from localStorage or default data if not found
   * @private
   */
  static #getData() {
    try {
      const data = localStorage.getItem(this.#STORAGE_KEY);
      return data ? JSON.parse(data) : this.#getDefaultData();
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return this.#getDefaultData();
    }
  }

  /**
   * Save data to localStorage
   * @param {Object} data - Data to save
   * @private
   */
  static #saveData(data) {
    try {
      localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      throw new Error('Failed to save data to local storage');
    }
  }

  /**
   * Get default data
   * @returns {Object} Default data
   * @private
   */
  static #getDefaultData() {
    return {
      center: { lat: 55.751244, lng: 37.618423 }, // Default center (Moscow)
      zoom: 13,
      markers: [
        { id: 1, position: { lat: 55.751244, lng: 37.618423 }, title: 'Moscow', popup: 'Capital of Russia' },
        { id: 2, position: { lat: 59.9343, lng: 30.3351 }, title: 'Saint Petersburg', popup: 'Cultural capital' }
      ],
      tileProviders: [
        {
          name: 'standard',
          label: 'Standard',
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        }
      ],
      currentTileProvider: 'standard'
    };
  }

  /**
   * Get all map data
   * @returns {Promise<Object>} Map data
   */
  static async getMapData() {
    await this.#delay();
    return this.#getData();
  }

  /**
   * Save all map data
   * @param {Object} mapData - Complete map data to save
   * @returns {Promise<Object>} Saved map data
   */
  static async saveMapData(mapData) {
    await this.#delay();

    if (mapData.markers) {
      mapData.markers = mapData.markers.map(marker => {
        return {
          id: marker.id || Date.now() + Math.floor(Math.random() * 1000),
          position: {
            lat: marker.position?.lat || mapData.center.lat,
            lng: marker.position?.lng || mapData.center.lng
          },
          title: marker.title || 'Unnamed Marker',
          popup: marker.popup || ''
        };
      });
    }

    this.#saveData(mapData);
    return mapData;
  }

  /**
   * Add a new marker
   * @param {Object} param0 - Object containing marker data and ID
   * @returns {Promise<Object>} All map data including the new marker
   */
  static async addMarker({ marker, id }) {
    await this.#delay();

    if (!marker.position || typeof marker.position.lat !== 'number' || typeof marker.position.lng !== 'number') {
      throw new Error('Invalid marker position');
    }

    const data = this.#getData();

    const newMarker = {
      id: id || Date.now() + Math.floor(Math.random() * 1000),
      position: {
        lat: marker.position.lat,
        lng: marker.position.lng
      },
      title: marker.title || 'Unnamed Marker',
      popup: marker.popup || ''
    };

    // Add to markers array
    data.markers.push(newMarker);
    this.#saveData(data);

    return data;
  }
}

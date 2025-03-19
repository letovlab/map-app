# SquareGPS Test Project

## Overview

This project is a Vue.js application that demonstrates interactive map functionality with marker management. The application allows users to add markers to a map, view their addresses, and interact with them through a synchronized list view.

## Technologies Used

- **Vue 3** - Progressive JavaScript framework for building user interfaces
- **Pinia** - State management solution for Vue applications (replacement for Vuex)
- **Vue Router** - Official router for Vue.js
- **Vuetify** - Material Design component framework for Vue
- **OpenLayers** - High-performance, feature-rich library for creating interactive maps
- **Vitest** - Unit testing framework for Vue applications

## Features

- Interactive map with marker placement functionality
- Address lookup using geocoding API
- Synchronized list and map view for markers
- Persisted marker storage using LocalStorage
- Responsive design for mobile and desktop devices
- Localization support
- Unit tested components

## Setup and Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/squaregps-test.git
cd squaregps-test

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build
```

## Backend Service

The application uses a pseudo-asynchronous backend service that emulates server behavior while storing data in the browser's localStorage. This approach demonstrates the implementation of service architecture while keeping the application self-contained.

```javascript
// Example backend service usage
import { BackendService } from '@/services/backend';

// Initialize backend
const backend = new BackendService();

// Save marker
await backend.saveMarker(markerData);

// Get all markers
const markers = await backend.getMarkers();
```

## Map Implementation

The map is implemented using OpenLayers, providing robust mapping capabilities including:

- Custom marker placement
- Map centering and zoom controls
- Marker selection and highlighting
- Coordinate transformation for geocoding

## Testing

The project includes unit tests using Vitest, demonstrating testing methodologies for Vue components.

To run the tests:

```bash
npm run test
```
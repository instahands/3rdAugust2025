import pointInPolygon from 'point-in-polygon';

// --- MODIFIED ---
// Import the coordinates from our single source of truth file.
import { bhilaiDurgServiceAreaCoords } from './data/coordinates';

// Define the type for the location object
export interface LocationCoords {
  lat: number;
  lng: number;
}

// --- REMOVED ---
// The old, hardcoded array has been deleted from this file.
// const bhilaiDurgServiceArea = [ ... ];

export function isLocationInServiceArea(location: LocationCoords) {
  // --- MODIFIED ---
  // Use the imported variable name here.
  return pointInPolygon([location.lng, location.lat], bhilaiDurgServiceAreaCoords);
}
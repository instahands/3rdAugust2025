// src/locationService.ts

import pointInPolygon from 'point-in-polygon';

// Define the type for the location object
export interface LocationCoords {
  lat: number;
  lng: number;
}

// Define the coordinates of your service area as a polygon
// **IMPORTANT**: You must replace these with the actual coordinates for your region (Bhilai and Durg).
// You can find these coordinates using tools like Google Maps or a polygon generator.
const bhilaiDurgServiceArea = [
  [81.36531, 21.23351], // Example coordinate 1
  [81.28292, 21.21832], // Example coordinate 2
  [81.25867, 21.19632], // Example coordinate 3
  [81.26615, 21.16857], // Example coordinate 4
  [81.31238, 21.15783], // Example coordinate 5
  [81.37890, 21.17645], // Example coordinate 6
];

export function isLocationInServiceArea(location: LocationCoords) {
  return pointInPolygon([location.lng, location.lat], bhilaiDurgServiceArea);
}
// src/shared/lib/locationService.ts

import pointInPolygon from 'point-in-polygon';
// CORRECTED: The path now correctly navigates up to src, then down to app/data
import { bhilaiDurgServiceAreaCoords } from '../../app/data/coordinates';
import { LocationCoords } from '../types/types';

export function isLocationInServiceArea(location: LocationCoords) {
  return pointInPolygon([location.lng, location.lat], bhilaiDurgServiceAreaCoords);
}

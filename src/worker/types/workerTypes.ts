// src/worker/types/workerTypes.ts

import { Order } from "../../shared/types/types";

// --- FIX: Use Omit<Order, 'status'> to remove the conflicting 'status' property from the base Order type before extending it. ---
// This resolves the "reduced to never" error that was causing cascading failures across the entire worker dashboard.
export type Job = Omit<Order, 'status'> & {
  id: number;
  service_en: string;
  service_hi: string;
  customerName: string;
  address: string;
  dateTime: string;
  earning: number;
  status: 'new' | 'ongoing' | 'completed'; // This is now the only 'status' definition
  statusDetail: 'pending' | 'accepted' | 'started' | 'completed';
  workDetails_en: string;
  workDetails_hi: string;
  distance: string;
  mapUrl: string;
  directionsUrl: string;
  startTime: number | null;
  endTime: number | null;
}
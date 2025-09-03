// src/worker/types/workerTypes.ts

import { Order } from "../../shared/types/types";

// Omit status and other conflicting fields from Order and add worker-specific fields
export type Job = Omit<Order, 'status' | 'address' | 'worker' | 'start_time' | 'end_time'> & {
  id: number;
  service_en: string;
  service_hi: string;
  customerName: string;
  address: string;
  dateTime: string;
  earning: number;
  status: 'new' | 'ongoing' | 'completed'; // Worker-specific status
  statusDetail: 'pending' | 'accepted' | 'started' | 'completed';
  workDetails_en: string;
  workDetails_hi: string;
  distance: string;
  mapUrl: string;
  directionsUrl: string;
  startTime: string | null; // Keep as string or null
  endTime: string | null;   // Keep as string or null
  customerPhone?: string;
};

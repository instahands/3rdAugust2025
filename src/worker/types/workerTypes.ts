// src/worker/types/workerTypes.ts

import { Order } from "../../shared/types/types";

// This now correctly extends the base Order type and adds our local status field.
export type Job = Order & {
  service_en: string;
  service_hi: string;
  customerName: string;
  address: string; 
  dateTime: string;
  earning: number;
  // This workerStatus is for local UI state (tabs) and is derived from the main status fields
  workerStatus: 'new' | 'ongoing' | 'completed';
  workDetails_en: string;
  workDetails_hi: string;
  distance: string;
  mapUrl: string;
  directionsUrl: string;
  customerPhone?: string;
};
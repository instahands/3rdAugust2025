// src/shared/types/types.ts

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'worker';
  created_at: string;
  worker_status?: 'pending' | 'approved' | 'rejected' | null;
  // --- FIX: Add optional password for new worker creation form ---
  password?: string;
}

export interface Order {
  id: number;
  user_id: string;
  date: string;
  duration: number;
  timeSlot: string;
  address: string;
  workDescription: string;
  manpowerType: string;
  subscriptionType: string;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Cancelled';
  trackingStatus: 'Booked' | 'Assigned' | 'On the Way' | 'Completed';
  worker_id?: string;
}

export interface Address {
    id: number;
    user_id: string;
    address_type: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    phone_number: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'order' | 'user';
  timestamp: Date;
  isRead: boolean;
}

export type DataItem = Profile | Order | Address;

export interface Service {
    name: string;
    manpowerType: string;
    color: string;
    price: number;
    description: string;
    imageUrl: string;
    trainedTo: string[];
    excluded: string[];
    needs?: string[]; 
}

export interface LocationCoords {
    lat: number;
    lng: number;
}


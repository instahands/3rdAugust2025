// src/shared/types/types.ts

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'worker';
  created_at: string;
  worker_status?: 'pending' | 'approved' | 'rejected' | null;
  password?: string;
  phone?: string;
  address?: string;
}

export interface Service {
    name: string;
    manpowerType: string;
    color: string;
    price: number;
    description: string;
    imageUrl: string;
    trainedTo: string[];
    needs: string[];
    excluded: string[];
}

export interface Order {
  id: number;
  user_id: string;
  worker_id?: string | null;
  address_id?: number | null;
  service_name: string;
  date: string;
  duration: number;
  work_description: string;
  price?: number;
  status: 'Pending' | 'Assigned' | 'Completed' | 'Cancelled';
  time_slot: string;
  tracking_status: 'Booked' | 'Assigned' | 'On the Way' | 'Arrived' | 'Work Started' | 'Completed';
  start_otp?: string;
  complete_otp?: string;
  start_time?: string | null;
  end_time?: string | null;
  address?: Address | null;
  worker?: Profile | null;
  payment_method: 'cod' | 'prepaid';
  payment_status: 'Pending' | 'Paid via App' | 'Paid via Cash' | 'Paid via Worker QR' | 'Failed';
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
    created_at?: string;
}

export interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type: 'order' | 'user';
  timestamp: Date;
}

// --- NEW: Add this interface for worker locations ---
export interface WorkerLocation {
    worker_id: string;
    lat: number;
    lng: number;
    updated_at: string;
}


export type DataItem = Profile | Order | Address;

export interface LocationCoords {
    lat: number;
    lng: number;
}
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
  phone?: string;
}

// src/shared/types/types.ts

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
  
  // --- FIX: Ensure these are all snake_case ---
  time_slot: string;
  tracking_status: 'Booked' | 'Assigned' | 'On the Way' | 'Completed';
  start_otp?: string;
  complete_otp?: string;
  start_time?: string | null;
  end_time?: string | null;

  // For joined data
  address?: Address | null;
  worker?: Profile | null;
  payment_status: 'Unpaid' | 'Paid'; 
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


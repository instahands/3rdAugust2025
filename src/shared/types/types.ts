// src/shared/types/types.ts

// Defines the structure for a user profile
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'worker';
  created_at: string;
}

// Defines the structure for a service order
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
  profiles?: { name: string }; 
}

// CORRECTED: The Address interface now includes user_id
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

// Defines the structure for a service offering
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

// CORRECTED: DataItem includes Address
export type DataItem = Profile | Order | Address;

// Defines coordinates for mapping
export interface LocationCoords {
  lat: number;
  lng: number;
}

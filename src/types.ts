// src/types.ts

export interface Address {
    id: number;
    address_type: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    phone_number: string;
}

export interface Service {
    name: string;
    price: number;
    // ... other service properties from HomePage.tsx
}

export interface LocationCoords {
  lat: number;
  lng: number;
}
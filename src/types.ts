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

// --- MODIFIED: Expanded the Service interface ---
export interface Service {
    name: string;
    manpowerType: string; // Added from HomePage
    color: string;        // Added from HomePage
    price: number;
    description: string;  // Added from HomePage
    imageUrl: string;     // Added from HomePage
    trainedTo: string[];  // Added from HomePage
    needs: string[];      // Added from HomePage
    excluded: string[];   // Added from HomePage
}

export interface LocationCoords {
  lat: number;
  lng: number;
}
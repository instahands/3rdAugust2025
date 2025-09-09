// src/worker/components/details/WorkerDirectionsMap.tsx (CORRECTED)

import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface WorkerDirectionsMapProps {
    origin: { lat: number; lng: number } | null;
    destination: string;
    geolocationError: string | null;
}

const mapContainerStyle = { width: '100%', height: '100%' };

const WorkerDirectionsMap = ({ origin, destination, geolocationError }: WorkerDirectionsMapProps) => {
    const { isLoaded } = useJsApiLoader({
        // FIX: Use a consistent ID and libraries to prevent conflicts
        id: 'google-map-script-main',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places', 'marker'],
    });

    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

    useEffect(() => {
        if (isLoaded && origin && destination) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: new window.google.maps.LatLng(origin.lat, origin.lng),
                    destination: destination,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirectionsResponse(result);
                    } else {
                        console.error(`error fetching directions ${result}`);
                    }
                }
            );
        }
    }, [isLoaded, origin, destination]);

    if (!isLoaded) {
        return <div className="flex items-center justify-center h-full bg-gray-200"><p>Loading Map...</p></div>;
    }
    
    if (geolocationError) {
         return <div className="flex items-center justify-center h-full bg-red-100 text-red-600 p-4"><p>Location Error: {geolocationError}. Please ensure location services are enabled.</p></div>;
    }

    if (!origin) {
         return <div className="flex items-center justify-center h-full bg-gray-200"><p>Waiting for your location...</p></div>;
    }

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={origin}
            zoom={15}
            options={{ disableDefaultUI: true, zoomControl: true }}
        >
            {directionsResponse && (
                <DirectionsRenderer 
                    directions={directionsResponse}
                    options={{ 
                        suppressMarkers: true, // We'll use our own custom markers
                        polylineOptions: {
                            strokeColor: '#1a73e8',
                            strokeWeight: 6,
                        },
                    }}
                />
            )}

            {/* Worker's Marker */}
             <Marker 
                position={origin} 
                icon={{
                    url: 'https://img.icons8.com/bubbles/100/delivery-scooter.png',
                    scaledSize: new window.google.maps.Size(60, 60),
                    anchor: new window.google.maps.Point(30, 30),
                }}
            />

            {/* Destination Marker (from directions response) */}
            {directionsResponse && (
                 <Marker 
                    position={directionsResponse.routes[0].legs[0].end_location}
                    label={{ text: "🏠", fontSize: "24px" }}
                />
            )}
        </GoogleMap>
    );
};

export default WorkerDirectionsMap;
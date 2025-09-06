import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { supabase } from '../../../shared/lib/supabaseClient';
import { WorkerLocation } from '../../../shared/types/types';

interface WorkerMapTrackerProps {
    workerId: string;
    destinationAddress: string;
}

const mapContainerStyle = { width: '100%', height: '300px' };

const WorkerMapTracker = ({ workerId, destinationAddress }: WorkerMapTrackerProps) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const [workerPosition, setWorkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [destinationPosition, setDestinationPosition] = useState<{ lat: number; lng: number } | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    useEffect(() => {
        if (isLoaded) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ address: destinationAddress }, (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const { lat, lng } = results[0].geometry.location;
                    setDestinationPosition({ lat: lat(), lng: lng() });
                } else {
                    console.error('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    }, [destinationAddress, isLoaded]);

    useEffect(() => {
        const channel = supabase
            .channel(`public:worker_locations:worker_id=eq.${workerId}`)
            .on<WorkerLocation>(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'worker_locations', filter: `worker_id=eq.${workerId}` },
                (payload) => {
                    const newLocation = payload.new;
                    // --- THIS IS THE FIX ---
                    // Safely check if the newLocation object has lat/lng properties before using them.
                    // This handles events like DELETE where `payload.new` would be an empty object.
                    if (newLocation && 'lat' in newLocation && 'lng' in newLocation) {
                        setWorkerPosition({ lat: newLocation.lat, lng: newLocation.lng });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [workerId]);
    
    useEffect(() => {
        if (isLoaded && mapRef.current && workerPosition && destinationPosition) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(workerPosition.lat, workerPosition.lng));
            bounds.extend(new window.google.maps.LatLng(destinationPosition.lat, destinationPosition.lng));
            mapRef.current.fitBounds(bounds);
        }
    }, [workerPosition, destinationPosition, isLoaded]);

    if (!isLoaded) return <div>Loading Map...</div>;

    const center = destinationPosition || { lat: 21.1925, lng: 81.3522 };

    return (
        <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={12}
            onLoad={(map) => { mapRef.current = map; }}
            options={{ disableDefaultUI: true, zoomControl: true }}
        >
            {destinationPosition && (
                <Marker position={destinationPosition} label="You" />
            )}
            {workerPosition && (
                <Marker 
                    position={workerPosition} 
                    icon={{
                        url: 'https://img.icons8.com/plasticine/100/scooter.png',
                        scaledSize: new window.google.maps.Size(50, 50),
                    }}
                />
            )}
        </GoogleMap>
    );
};

export default WorkerMapTracker;
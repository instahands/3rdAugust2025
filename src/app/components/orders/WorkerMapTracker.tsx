import { useState, useEffect, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { supabase } from '../../../shared/lib/supabaseClient';
import { WorkerLocation } from '../../../shared/types/types';

interface WorkerMapTrackerProps {
    workerId: string;
    destinationAddress: string;
}

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.75rem' };

const WorkerMapTracker = ({ workerId, destinationAddress }: WorkerMapTrackerProps) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    });

    const [workerPosition, setWorkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [destinationPosition, setDestinationPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
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
                    if (newLocation && 'lat' in newLocation && 'lng' in newLocation) {
                        setWorkerPosition({ lat: newLocation.lat, lng: newLocation.lng });
                    }
                }
            )
            .subscribe((status, err) => {
                 if (status === 'SUBSCRIBED') {
                    setSubscriptionStatus('connected');
                }
                if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || err) {
                    setSubscriptionStatus('error');
                    console.error('Subscription error:', err);
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [workerId]);
    
    useEffect(() => {
        if (isLoaded && mapRef.current && workerPosition && destinationPosition) {
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(new window.google.maps.LatLng(workerPosition.lat, workerPosition.lng));
            bounds.extend(new window.google.maps.LatLng(destinationPosition.lat, destinationPosition.lng));
            // Add some padding to the bounds
            mapRef.current.fitBounds(bounds, 50); 
        }
    }, [workerPosition, destinationPosition, isLoaded]);

    if (!isLoaded) return <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 rounded-lg"><p>Loading Map...</p></div>;

    const center = destinationPosition || { lat: 21.1925, lng: 81.3522 };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
             <h3 className="font-bold text-lg mb-3">Live Tracking</h3>
            <div className="rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                    onLoad={(map) => { mapRef.current = map; }}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                >
                    {destinationPosition && (
                        <Marker position={destinationPosition} label={{ text: "You", color: "white", fontWeight: "bold" }} />
                    )}
                    {workerPosition && (
                        <Marker 
                            position={workerPosition} 
                            // --- THIS IS THE FIX: Using a new, more descriptive icon ---
                            icon={{
                                url: 'https://img.icons8.com/bubbles/100/delivery-scooter.png',
                                scaledSize: new window.google.maps.Size(60, 60),
                                anchor: new window.google.maps.Point(30, 30),
                            }}
                        />
                    )}
                </GoogleMap>
            </div>
             <div className="text-xs text-center text-gray-500 pt-2">
                {subscriptionStatus === 'connecting' && 'Connecting to live location...'}
                {subscriptionStatus === 'connected' && !workerPosition && 'Waiting for worker location update...'}
                {subscriptionStatus === 'connected' && workerPosition && 'Live location active.'}
                {subscriptionStatus === 'error' && 'Could not connect to live location.'}
            </div>
        </div>
    );
};

export default WorkerMapTracker;
// src/app/components/orders/WorkerMapTracker.tsx (CORRECTED)

import { useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { supabase } from '../../../shared/lib/supabaseClient';
import { WorkerLocation } from '../../../shared/types/types';

interface WorkerMapTrackerProps {
    workerId: string;
    destinationAddress: string;
}

const mapContainerStyle = { width: '100%', height: '300px', borderRadius: '0.75rem' };

const WorkerMapTracker = ({ workerId, destinationAddress }: WorkerMapTrackerProps) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script-main',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ['places', 'marker'],
    });

    const [workerPosition, setWorkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
    const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

    // This useEffect fetches the route when the worker's position is updated
    useEffect(() => {
        if (isLoaded && workerPosition && destinationAddress) {
            const directionsService = new window.google.maps.DirectionsService();
            directionsService.route(
                {
                    origin: new window.google.maps.LatLng(workerPosition.lat, workerPosition.lng),
                    destination: destinationAddress,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                    if (status === window.google.maps.DirectionsStatus.OK) {
                        setDirectionsResponse(result);
                    } else {
                        console.error(`Error fetching directions: ${status}`);
                    }
                }
            );
        }
    }, [isLoaded, workerPosition, destinationAddress]);


    useEffect(() => {
        // --- NEW: Function to fetch the initial location ---
        const fetchInitialLocation = async () => {
            const { data, error } = await supabase
                .from('worker_locations')
                .select('*')
                .eq('worker_id', workerId)
                .single();
            
            if (error) {
                console.error("Error fetching initial worker location:", error.message);
            } else if (data) {
                setWorkerPosition({ lat: data.lat, lng: data.lng });
            }
        };

        fetchInitialLocation(); // Call the function on component mount

        // The real-time subscription remains the same
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
    }, [workerId]); // Dependency array remains the same

    if (!isLoaded) return <div className="w-full h-[300px] flex items-center justify-center bg-gray-200 rounded-lg"><p>Loading Map...</p></div>;

    const center = workerPosition || { lat: 21.1925, lng: 81.3522 };

    return (
        <div className="bg-white p-4 rounded-xl shadow">
             <h3 className="font-bold text-lg mb-3">Live Tracking</h3>
            <div className="rounded-lg overflow-hidden">
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={center}
                    zoom={12}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                >
                    {directionsResponse && (
                        <DirectionsRenderer 
                            directions={directionsResponse}
                            options={{ 
                                suppressMarkers: true,
                                polylineOptions: {
                                    strokeColor: '#1a73e8',
                                    strokeWeight: 6,
                                },
                            }}
                        />
                    )}

                    {directionsResponse && (
                        <Marker 
                            position={directionsResponse.routes[0].legs[0].end_location} 
                            label={{ text: "You", color: "white", fontWeight: "bold" }} 
                        />
                    )}

                    {workerPosition && (
                        <Marker 
                            position={workerPosition} 
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
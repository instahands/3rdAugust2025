// src/components/booking/MapPicker.tsx

import React, { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { LocationCoords } from "../../../shared/types/types";

interface MapPickerProps {
  initialLocation: LocationCoords;
  onConfirm: (address: string) => void;
  onCancel: () => void;
}

const mapContainerStyle = {
  height: "100%",
  width: "100%",
};

// ❌ REMOVE THE styles PROPERTY HERE
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  // ❌ REMOVE THIS ENTIRE STYLES ARRAY
  // styles: [
  //   { featureType: "poi", stylers: [{ visibility: "off" }] },
  //   { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
  //   { featureType: "transit", stylers: [{ visibility: "off" }] },
  // ],
};

// FIX: Standardize the libraries and ID to prevent conflicts
const libraries: ("places" | "marker")[] = ["places", "marker"];

const MapPicker: React.FC<MapPickerProps> = ({
  initialLocation,
  onConfirm,
  onCancel,
}) => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoords>(initialLocation);
  const [currentAddress, setCurrentAddress] = useState("Fetching address...");
  const [isFetchingAddress, setIsFetchingAddress] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    // FIX: Use a consistent ID and libraries
    id: 'google-map-script-main',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const getAddressFromCoords = useCallback(
    async (coords: LocationCoords) => {
      if (!window.google || !window.google.maps || isFetchingAddress) return;
      setIsFetchingAddress(true);
      try {
        const geocoder = new window.google.maps.Geocoder();
        const { results } = await geocoder.geocode({ location: coords });
        if (results && results.length > 0) {
          setCurrentAddress(results[0].formatted_address);
        } else {
          setCurrentAddress("Address not found");
        }
      } catch (error) {
        console.error("Geocoding API error:", error);
        setCurrentAddress("Error getting address");
      } finally {
        setIsFetchingAddress(false);
      }
    },
    [isFetchingAddress]
  );

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      getAddressFromCoords(currentLocation);

      if (window.google && (window.google.maps as any).marker && !markerRef.current) {
        const { AdvancedMarkerElement } = (window.google.maps as any).marker;
        
        // --- MODIFIED: Create marker first, add listener, THEN assign to ref ---
        const marker = new AdvancedMarkerElement({
          map,
          position: currentLocation,
          gmpDraggable: true,
        });

        marker.addListener("dragend", (e: google.maps.MapMouseEvent) => {
          const newLat = e.latLng?.lat();
          const newLng = e.latLng?.lng();
          if (newLat !== undefined && newLng !== undefined) {
            const newLocation = { lat: newLat, lng: newLng };
            setCurrentLocation(newLocation);
            getAddressFromCoords(newLocation);
          }
        });

        markerRef.current = marker; // Assign to ref at the end
      }
    },
    [getAddressFromCoords, currentLocation]
  );


  useEffect(() => {
     if (markerRef.current) {
    markerRef.current.position = currentLocation;
  }
}, [currentLocation]);

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* HEADER */}
      <header className="p-4 bg-white shadow-md flex items-center justify-between">
        <button onClick={onCancel} className="p-2 text-gray-600">✖</button>
        <h2 className="text-xl font-semibold">Confirm map pin location</h2>
        <div className="w-6 h-6"></div>
      </header>

      {/* MAP */}
      <div className="relative flex-grow">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentLocation}
          zoom={15}
          options={{
            ...mapOptions,
            mapId: import.meta.env.VITE_GOOGLE_MAP_ID, // ✅ Keep this
          }}
          onLoad={onMapLoad}
        />

        {/* CURRENT LOCATION BTN */}
        <button
          onClick={() => {
            if (navigator.geolocation && mapRef.current) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  };
                  setCurrentLocation(newLocation);
                  getAddressFromCoords(newLocation);
                  mapRef.current?.panTo(newLocation);
                },
                (error) => console.error("Geolocation error:", error)
              );
            }
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-full shadow-lg flex items-center space-x-2 text-green-700 font-bold z-40"
        >
          📍 Go to current location
        </button>
      </div>

      {/* FOOTER */}
      <footer className="p-4 bg-white shadow-t-md">
        <div className="bg-gray-100 p-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-green-600">📌</span>
            <div className="flex-1">
              <p className="font-semibold">Delivering your order to</p>
              <p className="text-sm text-gray-600">{currentAddress}</p>
            </div>
            <button onClick={() => onConfirm(currentAddress)} className="text-green-600 font-bold text-sm">
              Change
            </button>
          </div>
        </div>
        <button
          onClick={() => onConfirm(currentAddress)}
          className="w-full mt-4 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
        >
          Confirm location
        </button>
      </footer>
    </div>
  );
};

export default MapPicker;
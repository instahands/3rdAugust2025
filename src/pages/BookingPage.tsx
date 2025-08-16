// src/pages/BookingPage.tsx

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import SubPageHeader from '../components/common/SubPageHeader';
import AddressSelectionModal from '../components/booking/AddressSelectionModal';
import { User } from '@supabase/supabase-js';

// Import the MapPicker component and location service
import MapPicker from '../components/booking/MapPicker';
import { Address, Service, LocationCoords } from '../types';

interface BookingPageProps {
    setPage: (page: string) => void;
    service: Service | null;
    proceedToCheckout: (data: any) => void;
    goBack: () => void;
    currentUser: User | null;
    dataVersion: number;
    openAddAddressModal: () => void;
    onEditAddress: (address: Address) => void;
    locationStatus: 'checking' | 'available' | 'unavailable' | null;
}

export default function BookingPage({ setPage, service, proceedToCheckout, goBack, currentUser, dataVersion, openAddAddressModal, onEditAddress, locationStatus }: BookingPageProps) {
    if (!service) {
        useEffect(() => { setPage('home'); }, []);
        return null;
    }

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);
    
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);

    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        timeSlot: '09:00 AM',
        workDescription: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Morning');
    
    const getInitialLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const location = { lat, lng };
                    setUserLocation(location);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setUserLocation({ lat: 21.2269, lng: 81.3533 }); // Centered on Bhilai, India
                }
            );
        } else {
            setUserLocation({ lat: 21.2269, lng: 81.3533 });
        }
    };

    useEffect(() => {
        if (locationStatus === 'available' && !userLocation) {
            getInitialLocation();
        }
    }, [locationStatus, userLocation]);

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!currentUser) { setLoadingAddresses(false); return; }
            setLoadingAddresses(true);
            const { data, error } = await supabase.from('addresses').select('*').eq('user_id', currentUser.id);
            if (error) { console.error("Error fetching addresses:", error); } 
            else if (data) {
                setAddresses(data as Address[]);
                if (data.length > 0 && !selectedAddress) {
                    setSelectedAddress(data[0] as Address);
                }
            }
            setLoadingAddresses(false);
        };
        fetchAddresses();
    }, [currentUser, dataVersion]);

    const handleProceed = () => {
        if (!bookingData.workDescription.trim()) {
            alert("Please describe the work needed.");
            return;
        }
        if (!selectedAddress) {
            alert("Please select a service address.");
            return;
        }
    
        const finalBookingData = {
            ...bookingData,
            address: selectedAddress,
            service,
        };
    
        proceedToCheckout(finalBookingData);
    };
    
    const durations = [ { label: '60 min', value: 60 }, { label: '90 min', value: 90 }, { label: '120 min', value: 120 }, { label: '180 min', value: 180 }, { label: '240 min', value: 240 } ];
    const timeSlots: { [key: string]: string[] } = { Morning: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'], Afternoon: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'], Evening: ['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] };
    const getFormattedDate = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0]; };
    const isSlotDisabled = (slot: string) => {
        const today = new Date();
        const currentHour = today.getHours();
        const todayISO = today.toISOString().split('T')[0];
        if (bookingData.date !== todayISO) return false;
        const hourString = slot.split(':')[0];
        const period = slot.split(' ')[1];
        let slotHour = parseInt(hourString, 10);
        if (period === 'PM' && slotHour !== 12) slotHour += 12;
        if (period === 'AM' && slotHour === 12) slotHour = 0;
        return slotHour < currentHour;
    };
    const calculatePrice = () => (bookingData.duration / 60) * (service?.price || 0);

    return (
        <>
            {isMapPickerOpen && userLocation && (
                <MapPicker
                    initialLocation={userLocation}
                    onConfirm={(addressString: string) => {
                        const parts = addressString.split(',').map(p => p.trim());
                        // Create a complete Address object that matches your type definition
                        const newAddress: Address = {
                            id: Date.now(), // Use a timestamp for a temporary numeric ID
                            address_type: 'Pinned Location',
                            street_address: parts[0] || 'N/A',
                            city: parts[1] || 'Bhilai',
                            state: parts[2] || 'Chhattisgarh',
                            postal_code: parts[3] || '490001',
                            phone_number: currentUser?.phone || '', // Add phone number
                        };
                        setSelectedAddress(newAddress);
                        setIsMapPickerOpen(false);
                    }}
                    onCancel={() => setIsMapPickerOpen(false)}
                />
            )}
            
            <div className="max-w-4xl mx-auto pb-24">
                <SubPageHeader title={service.name} onBack={goBack} />
                
                {locationStatus === 'checking' && (
                    <div className="text-center p-8">
                        <p className="text-gray-500">Checking your location for service availability...</p>
                    </div>
                )}
                {locationStatus === 'unavailable' && (
                    <div className="text-center p-8 bg-red-100 rounded-xl m-4">
                        <h2 className="text-xl font-bold text-red-700">Service Not Available</h2>
                        <p className="text-red-600 mt-2">
                            Sorry, we currently do not offer services in your location.
                        </p>
                    </div>
                )}
                
                {locationStatus === 'available' && (
                    <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                        <div>
                            <h3 className="font-bold text-lg mb-2">Service Address</h3>
                            <button onClick={() => setIsAddressSelectorOpen(true)} className="w-full p-4 text-left border-2 border-dashed rounded-lg flex items-center justify-between hover:bg-gray-50">
                                {loadingAddresses ? ( <span className="text-gray-500">Loading addresses...</span> ) 
                                : selectedAddress ? (
                                    <div className="text-sm">
                                        <p className="font-bold text-base">{selectedAddress.address_type}</p>
                                        <p className="text-gray-600">{`${selectedAddress.street_address}, ${selectedAddress.city}`}</p>
                                    </div>
                                ) : ( <span className="text-gray-500">No address selected</span> )}
                                <span className="font-bold text-green-600">Change</span>
                            </button>
                            <button onClick={() => setIsMapPickerOpen(true)} className="mt-4 w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700">
                                Use Map to Pinpoint Location
                            </button>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-3">Select Date</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => { setBookingData({...bookingData, date: getFormattedDate(0)}); setShowDatePicker(false); }} className={`p-3 rounded-lg text-sm ${bookingData.date === getFormattedDate(0) && !showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Today</button>
                                <button onClick={() => { setBookingData({...bookingData, date: getFormattedDate(1)}); setShowDatePicker(false); }} className={`p-3 rounded-lg text-sm ${bookingData.date === getFormattedDate(1) && !showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Tomorrow</button>
                                <button onClick={() => setShowDatePicker(true)} className={`p-3 rounded-lg text-sm ${showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Select Date</button>
                            </div>
                            {showDatePicker && <input type="date" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} className="w-full mt-3 p-2 border rounded-lg" />}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-3">Select Duration</h3>
                            <div className="flex overflow-x-auto space-x-2 pb-2">
                                {durations.map(d => ( <button key={d.value} onClick={() => setBookingData({...bookingData, duration: d.value})} className={`px-4 py-2 rounded-lg text-sm flex-shrink-0 ${bookingData.duration === d.value ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{d.label}</button>))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-3">Select Time Slot</h3>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {Object.keys(timeSlots).map(period => ( <button key={period} onClick={() => setSelectedPeriod(period)} className={`p-3 rounded-lg text-sm ${selectedPeriod === period ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{period}</button>))}
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {timeSlots[selectedPeriod].map(slot => (
                                    <button key={slot} onClick={() => setBookingData({...bookingData, timeSlot: slot})} disabled={isSlotDisabled(slot)} className={`p-3 rounded-lg text-sm transition-colors ${ isSlotDisabled(slot) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : (bookingData.timeSlot === slot ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300') }`}>{slot}</button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-3">Describe the work <span className="text-red-500">*</span></h3>
                            <textarea value={bookingData.workDescription} onChange={e => setBookingData({...bookingData, workDescription: e.target.value})} placeholder="e.g., I need help moving a large sofa..." className="w-full p-3 border rounded-lg bg-gray-50" rows={4} required></textarea>
                        </div>
                    </div>
                )}
            </div>
            {locationStatus === 'available' && (
                <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="text-2xl font-bold text-green-600">₹{calculatePrice()}</p>
                        </div>
                        <button onClick={handleProceed} disabled={!bookingData.workDescription.trim() || !selectedAddress} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                            Confirm Booking
                        </button>
                    </div>
                </div>
            )}
            <AddressSelectionModal
                isOpen={isAddressSelectorOpen}
                onClose={() => setIsAddressSelectorOpen(false)}
                addresses={addresses}
                onSelectAddress={(address) => {
                    setSelectedAddress(address);
                    setIsAddressSelectorOpen(false);
                }}
                onAddNew={openAddAddressModal}
                onEdit={(address) => {
                    setIsAddressSelectorOpen(false);
                    onEditAddress(address);
                }}
            />
        </>
    );
}

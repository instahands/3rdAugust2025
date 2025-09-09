// src/pages/BookingPage.tsx (FINAL UX TWEAKS)

import { useState, useEffect } from 'react';
import { supabase } from '../../shared/lib/supabaseClient';
import SubPageHeader from '../components/common/SubPageHeader';
import AddressSelectionModal from '../components/booking/AddressSelectionModal';
import { User } from '@supabase/supabase-js';
import { Address, Service, LocationCoords } from '../../shared/types/types';
import MapPicker from '../components/booking/MapPicker';

interface BookingPageProps {
    setPage: (page: string) => void;
    service: Service | null;
    proceedToCheckout: (data: any) => void;
    goBack: () => void;
    currentUser: User | null;
    dataVersion: number;
    openAddAddressModal: () => void;
    onEditAddress: (address: Address) => void;
}

export default function BookingPage({ setPage, service, proceedToCheckout, goBack, currentUser, dataVersion, openAddAddressModal, onEditAddress }: BookingPageProps) {
    if (!service) {
        useEffect(() => { setPage('home'); }, []);
        return null;
    }

    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
    const [bookingData, setBookingData] = useState({
        date: new Date().toISOString().split('T')[0],
        weeklyStartDate: '',
        weeklyEndDate: '',
        selectedMonth: new Date().toISOString().slice(0, 7),
        duration: 60,
        timeSlot: '09:00 AM',
        workDescription: '',
    });

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Morning');
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
    
    // FIX 1: Added "Evening" to the time slots object
    const timeSlots: { [key: string]: string[] } = { 
        Morning: ['09:00 AM', '10:00 AM', '11:00 AM'], 
        Afternoon: ['02:00 PM', '03:00 PM', '04:00 PM'],
        Evening: ['06:00 PM', '07:00 PM', '08:00 PM']
    };
    const getFormattedDate = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0]; };

    const isSlotInThePast = (slot: string, date: string): boolean => {
        const today = new Date();
        const slotDateTime = new Date(`${date}T${slot.split(' ')[0]}:00`);
        return slotDateTime.getTime() < today.getTime();
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            });
        }
        const fetchAddresses = async () => {
            if (!currentUser) return;
            const { data, error } = await supabase.from('addresses').select('*').eq('user_id', currentUser.id);
            if (!error && data && data.length > 0) {
                setAddresses(data);
                setSelectedAddress(data[0]);
            }
        };
        fetchAddresses();
    }, [currentUser, dataVersion]);

    // FIX 2: Updated useEffect to no longer switch to "Tomorrow" automatically
    useEffect(() => {
        if (frequency !== 'daily') return;
        if (bookingData.date === getFormattedDate(0) && isSlotInThePast(bookingData.timeSlot, bookingData.date)) {
            const allSlots = [...timeSlots.Morning, ...timeSlots.Afternoon, ...timeSlots.Evening];
            const firstAvailableSlot = allSlots.find(slot => !isSlotInThePast(slot, bookingData.date));

            if (firstAvailableSlot) {
                handleDataChange('timeSlot', firstAvailableSlot);
                let period: "Morning" | "Afternoon" | "Evening" = "Morning";
                if (timeSlots.Afternoon.includes(firstAvailableSlot)) period = "Afternoon";
                if (timeSlots.Evening.includes(firstAvailableSlot)) period = "Evening";
                setSelectedPeriod(period);
            }
            // The else block that switched to "Tomorrow" has been removed.
        }
    }, [bookingData.date, frequency]);
    
    const handleDataChange = (field: string, value: any) => {
        setBookingData(prev => ({ ...prev, [field]: value }));
    };

    const handleProceed = () => {
        const finalBookingData = { ...bookingData, address: selectedAddress, service, frequency };
        proceedToCheckout(finalBookingData);
    };
    
    const calculatePrice = () => {
        const basePrice = (bookingData.duration / 60) * (service?.price || 0);
        if (frequency === 'weekly') return basePrice * 0.9;
        if (frequency === 'monthly') return basePrice * 0.85;
        return basePrice;
    };
    const finalPrice = calculatePrice();
    
    const durations = [60, 90, 120, 150, 180];

    const isFormValid = 
        selectedAddress &&
        bookingData.workDescription.trim() !== '' &&
        (frequency === 'daily' || (frequency === 'weekly' && bookingData.weeklyStartDate && bookingData.weeklyEndDate) || (frequency === 'monthly' && bookingData.selectedMonth)) &&
        (frequency !== 'daily' || !isSlotInThePast(bookingData.timeSlot, bookingData.date));

    const renderDateSelection = () => {
        const todayString = getFormattedDate(0);
        const currentMonthString = new Date().toISOString().slice(0, 7);
        // ... (this function remains the same as the previous version)
        switch (frequency) {
            case 'weekly':
                return (
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Week <span className="text-red-500">*</span></h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Start Date</label>
                                <input type="date" value={bookingData.weeklyStartDate} onChange={e => handleDataChange('weeklyStartDate', e.target.value)} className="w-full mt-1 p-2 border rounded-lg bg-gray-50" min={todayString} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">End Date</label>
                                <input type="date" value={bookingData.weeklyEndDate} onChange={e => handleDataChange('weeklyEndDate', e.target.value)} className="w-full mt-1 p-2 border rounded-lg bg-gray-50" min={bookingData.weeklyStartDate || todayString} />
                            </div>
                        </div>
                    </div>
                );
            case 'monthly':
                 return (
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Month <span className="text-red-500">*</span></h3>
                        <input type="month" value={bookingData.selectedMonth} onChange={e => handleDataChange('selectedMonth', e.target.value)} className="w-full p-2 border rounded-lg bg-gray-50" min={currentMonthString} />
                    </div>
                );
            case 'daily':
            default:
                return (
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Date <span className="text-red-500">*</span></h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => { handleDataChange('date', getFormattedDate(0)); setShowDatePicker(false); }} className={`p-3 rounded-lg text-sm ${bookingData.date === getFormattedDate(0) && !showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Today</button>
                            <button onClick={() => { handleDataChange('date', getFormattedDate(1)); setShowDatePicker(false); }} className={`p-3 rounded-lg text-sm ${bookingData.date === getFormattedDate(1) && !showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Tomorrow</button>
                            <button onClick={() => setShowDatePicker(true)} className={`p-3 rounded-lg text-sm ${showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Select Date</button>
                        </div>
                        {showDatePicker && <input type="date" value={bookingData.date} onChange={e => handleDataChange('date', e.target.value)} className="w-full mt-3 p-2 border rounded-lg" min={todayString} />}
                    </div>
                );
        }
    };
    
    return (
        <>
            {isMapPickerOpen && userLocation && ( <MapPicker initialLocation={userLocation} onConfirm={(addressString: string) => { const newAddress: Address = { id: Date.now(),  user_id: currentUser?.id || '', address_type: 'Pinned Location', street_address: addressString.split(',')[0] || 'N/A', city: 'Bhilai', state: 'Chhattisgarh', postal_code: '490001', phone_number: currentUser?.phone || '', }; setSelectedAddress(newAddress); setIsMapPickerOpen(false); }} onCancel={() => setIsMapPickerOpen(false)} /> )}
            <div className="max-w-4xl mx-auto px-4 pt-4 pb-32">
                <SubPageHeader title={service.name} onBack={goBack} />
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Booking Type</h3>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => setFrequency('daily')} className={`p-3 rounded-lg text-sm ${frequency === 'daily' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Daily</button>
                            <button onClick={() => setFrequency('weekly')} className={`p-3 rounded-lg text-sm ${frequency === 'weekly' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Weekly</button>
                            <button onClick={() => setFrequency('monthly')} className={`p-3 rounded-lg text-sm ${frequency === 'monthly' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Monthly</button>
                        </div>
                    </div>
                    {renderDateSelection()}
                    <div>
                        <h3 className="font-bold text-lg mb-2">Service Address <span className="text-red-500">*</span></h3>
                        <button onClick={() => setIsAddressSelectorOpen(true)} className="w-full p-4 text-left border rounded-lg flex items-center justify-between hover:bg-gray-50">
                            {selectedAddress ? (<div className="text-sm"><p className="font-bold text-base">{selectedAddress.address_type}</p><p className="text-gray-600">{`${selectedAddress.street_address}, ${selectedAddress.city}`}</p></div>) : ( <span className="text-gray-500">Select an address</span> )}
                            <span className="font-bold text-green-600">Change</span>
                        </button>
                        <button onClick={() => setIsMapPickerOpen(true)} className="mt-4 w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700">Use Map to Pinpoint Location</button>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Duration</h3>
                        <div className="flex overflow-x-auto space-x-2 pb-2">
                            {durations.map(d => ( <button key={d} onClick={() => handleDataChange('duration', d)} className={`px-4 py-2 rounded-lg text-sm flex-shrink-0 ${bookingData.duration === d ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{`${d} min`}</button>))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Time Slot <span className="text-red-500">*</span></h3>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {Object.keys(timeSlots).map(period => ( <button key={period} onClick={() => setSelectedPeriod(period as "Morning" | "Afternoon" | "Evening")} className={`p-3 rounded-lg text-sm ${selectedPeriod === period ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{period}</button>))}
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots[selectedPeriod].map(slot => ( <button key={slot} onClick={() => handleDataChange('timeSlot', slot)} disabled={isSlotInThePast(slot, bookingData.date)} className={`p-3 rounded-lg text-sm transition-colors ${ isSlotInThePast(slot, bookingData.date) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : (bookingData.timeSlot === slot ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300') }`} > {slot} </button> ))}
                        </div>
                        {/* FIX 3: The explanatory message has been removed from the UI */}
                    </div>
                     <div>
                        <h3 className="font-bold text-lg mb-3">Describe the work <span className="text-red-500">*</span></h3>
                        <textarea value={bookingData.workDescription} onChange={e => handleDataChange('workDescription', e.target.value)} placeholder="e.g., I need help moving a large sofa..." className="w-full p-3 border rounded-lg bg-gray-50" rows={4} required></textarea>
                    </div>
                </div>
            </div>
            
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-600">{frequency === 'daily' ? 'Total Price' : `Price per Service`}</p>
                        <p className="text-2xl font-bold text-green-600">₹{finalPrice.toFixed(2)}</p>
                    </div>
                    <button onClick={handleProceed} disabled={!isFormValid} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        Proceed to Checkout
                    </button>
                </div>
            </div>

            <AddressSelectionModal isOpen={isAddressSelectorOpen} onClose={() => setIsAddressSelectorOpen(false)} addresses={addresses} onSelectAddress={(address) => { setSelectedAddress(address); setIsAddressSelectorOpen(false); }} onAddNew={openAddAddressModal} onEdit={(address) => { setIsAddressSelectorOpen(false); onEditAddress(address); }} />
        </>
    );
}
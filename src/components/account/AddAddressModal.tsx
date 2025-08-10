// src/components/account/AddAddressModal.tsx

import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js'; // Import the User type from Supabase

// Define the shape of a single address object
interface Address {
    id: number;
    address_type: string;
    street_address: string;
    city: string;
    state: string;
    postal_code: string;
    phone_number: string;
}

// Define the shape of the props our component expects
interface AddAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    currentUser: User | null;
    addressToEdit: Address | null;
}

export default function AddAddressModal({ isOpen, onClose, onSave, currentUser, addressToEdit }: AddAddressModalProps) {
    if (!isOpen) {
        return null;
    }
    
    // In a real app, this should come from the database
    const CHHATTISGARH_CITIES = ['Bhilai', 'Durg'];

    const isEditMode = !!addressToEdit;
    const [addressType, setAddressType] = useState('Home');
    const [streetAddress, setStreetAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('Chhattisgarh');
    const [postalCode, setPostalCode] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isEditMode && addressToEdit) {
            setAddressType(addressToEdit.address_type);
            setStreetAddress(addressToEdit.street_address);
            setCity(addressToEdit.city);
            setState(addressToEdit.state);
            setPostalCode(addressToEdit.postal_code);
            setPhoneNumber(addressToEdit.phone_number);
        } else {
            // Reset form for new address
            setAddressType('Home');
            setStreetAddress('');
            setCity('');
            setState('Chhattisgarh');
            setPostalCode('');
            setPhoneNumber('');
        }
    }, [addressToEdit, isEditMode, isOpen]);


    const handleSaveAddress = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        if (!currentUser) {
            setError("You must be logged in to save an address.");
            setLoading(false);
            return;
        }

        if (phoneNumber.trim().length !== 10) {
            setError("Please enter a valid 10-digit phone number.");
            setLoading(false);
            return;
        }

        const addressData = {
            user_id: currentUser.id,
            address_type: addressType,
            street_address: streetAddress,
            city,
            state,
            postal_code: postalCode,
            phone_number: phoneNumber
        };
        
        let response;
        if (isEditMode) {
            response = await supabase.from('addresses').update(addressData).eq('id', addressToEdit.id);
        } else {
            response = await supabase.from('addresses').insert(addressData);
        }

        if (response.error) {
            setError(response.error.message);
        } else {
            onSave(); // Call the onSave callback to trigger a refresh or close
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg m-4">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Address' : 'Add New Address'}</h2>
                {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md mb-4">{error}</p>}
                <form onSubmit={handleSaveAddress} className="space-y-4">
                    <input type="text" placeholder="Street Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                        <input list="cities" type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="w-full p-3 border rounded-lg" />
                        <datalist id="cities">
                            {CHHATTISGARH_CITIES.map(c => <option key={c} value={c} />)}
                        </datalist>
                        <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    </div>
                    <input type="text" placeholder="State" value={state} readOnly required className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed" />
                    <input type="tel" placeholder="10-digit Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full p-3 border rounded-lg" />
                    <select value={addressType} onChange={e => setAddressType(e.target.value)} className="w-full p-3 border rounded-lg bg-white">
                        <option>Home</option>
                        <option>Office</option>
                        <option>Other</option>
                    </select>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-green-600 rounded-lg font-semibold disabled:bg-gray-400">
                            {loading ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
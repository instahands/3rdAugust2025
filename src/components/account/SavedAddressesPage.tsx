// src/components/account/SavedAddressesPage.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import SubPageHeader from '../common/SubPageHeader';

export default function SavedAddressesPage({ setPage, currentUser, openAddAddressModal, setEditingAddress }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = async () => {
        if (!currentUser) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', currentUser.id).order('created_at');
        if (error) { console.error("Error fetching addresses:", error); }
        else if (data) { setAddresses(data); }
        setLoading(false);
    };

    useEffect(() => {
        fetchAddresses();
    }, [currentUser]);

    const handleDelete = async (addressId) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            const { error } = await supabase.from('addresses').delete().eq('id', addressId);
            if (error) {
                alert("Error deleting address: " + error.message);
            } else {
                setAddresses(addresses.filter(addr => addr.id !== addressId));
            }
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        openAddAddressModal();
    };

    return (
        <div className="max-w-2xl mx-auto pb-32">
            <SubPageHeader title="Saved Addresses" onBack={() => setPage('account')} />
            {loading ? ( <p className="text-center text-gray-500 py-8">Loading addresses...</p> ) : (
                <div className="space-y-4">
                    {addresses.length > 0 ? (
                        addresses.map(addr => (
                            <div key={addr.id} className="bg-white p-4 rounded-xl shadow">
                                <h3 className="font-bold">{addr.address_type}</h3>
                                <p className="text-gray-600">{`${addr.street_address}, ${addr.city}, ${addr.state} ${addr.postal_code}`}</p>
                                <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone_number}</p>
                                <div className="flex justify-end space-x-4 mt-3 pt-3 border-t">
                                    <button onClick={() => handleEdit(addr)} className="text-sm font-semibold text-blue-600">Edit</button>
                                    <button onClick={() => handleDelete(addr.id)} className="text-sm font-semibold text-red-600">Delete</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-8">No saved addresses found.</p>
                    )}
                </div>
            )}
            <div className="fixed bottom-16 left-0 right-0 bg-transparent p-4 z-10">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={openAddAddressModal}
                        className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 shadow-lg"
                    >
                         + Add New Address
                    </button>
                </div>
            </div>
        </div>
    );
}
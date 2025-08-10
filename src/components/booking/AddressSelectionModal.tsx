// src/components/booking/AddressSelectionModal.tsx

import React from 'react';
import { XIcon } from '../common/Icons';

// --- TYPE DEFINITIONS ---
interface Address { id: number; address_type: string; street_address: string; city: string; }
interface AddressSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    addresses: Address[];
    onSelectAddress: (address: Address) => void;
    onAddNew: () => void;
    onEdit: (address: Address) => void;
}

export default function AddressSelectionModal({ isOpen, onClose, addresses, onSelectAddress, onAddNew, onEdit }: AddressSelectionModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
            <div className="bg-white w-full max-w-4xl max-h-[75vh] rounded-t-2xl shadow-lg flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Select an Address</h2>
                    <button onClick={onClose}><XIcon /></button>
                </div>
                <div className="space-y-3 overflow-y-auto">
                    {addresses.map(addr => (
                        <div key={addr.id} className="w-full p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50">
                            <div className="flex items-start space-x-4 cursor-pointer flex-grow" onClick={() => { onSelectAddress(addr); onClose(); }}>
                                <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
                                <div>
                                    <p className="font-semibold">{addr.address_type}</p>
                                    <p className="text-sm text-gray-600">{`${addr.street_address}, ${addr.city}`}</p>
                                </div>
                            </div>
                            <button onClick={() => onEdit(addr)} className="text-sm font-semibold text-blue-600 ml-4 px-3 py-1 flex-shrink-0">
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={() => { onClose(); onAddNew(); }} className="w-full mt-4 py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700">
                    + Add a New Address
                </button>
            </div>
        </div>
    );
}
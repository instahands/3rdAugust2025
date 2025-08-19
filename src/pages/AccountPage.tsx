// src/pages/AccountPage.tsx

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

import { UserIcon, ProfileIcon, AddressIcon, PaymentIcon, NotificationIcon, HelpIcon, ChevronRightIcon } from '../components/common/Icons';

// Import the sub-pages
import ProfileDetailsPage from '../components/account/ProfileDetailsPage';
import SavedAddressesPage from '../components/account/SavedAddressesPage';
import AddAddressModal from '../components/account/AddAddressModal';
import PaymentMethodsPage from '../components/account/PaymentMethodsPage';
import NotificationsPage from '../components/account/NotificationsPage';
import HelpCenterPage from '../components/account/HelpCenterPage';


const AccountMenu = ({ setPage, currentUser, handleLogout }) => {
    const menuItems = [
        { name: 'Profile Details', icon: <ProfileIcon />, page: 'profileDetails' },
        { name: 'Saved Addresses', icon: <AddressIcon />, page: 'savedAddresses' },
        { name: 'Payment Methods', icon: <PaymentIcon />, page: 'paymentMethods' },
        { name: 'Notifications', icon: <NotificationIcon />, page: 'notifications' },
        { name: 'Help Center', icon: <HelpIcon />, page: 'helpCenter' },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-4 mb-8 p-4 bg-white rounded-xl shadow">
                <div className="p-3 bg-gray-100 rounded-full"><UserIcon /></div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">{currentUser?.user_metadata?.name || currentUser?.email}</h2>
                    <p className="text-gray-500">{currentUser?.phone || 'No phone number'}</p>
                </div>
            </div>
            <div className="bg-white rounded-xl shadow">
                {menuItems.map((item, index) => (
                    <button
                        key={item.name}
                        onClick={() => setPage(item.page)}
                        className={`w-full p-4 flex items-center space-x-4 text-left ${index !== menuItems.length - 1 ? 'border-b' : ''}`}
                    >
                        <span className="text-gray-500">{item.icon}</span>
                        <span className="flex-1 font-medium text-gray-700">{item.name}</span>
                        <ChevronRightIcon />
                    </button>
                ))}
            </div>
            <div className="mt-8">
                <button
                    onClick={handleLogout}
                    className="w-full py-3 text-white font-bold bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};


export default function AccountPage({ setPage: setMainPage, currentUser, handleLogout }) {
    // This state now controls the sub-page within the Account section
    const [subPage, setSubPage] = useState('account'); 
    
    // State for the address modal
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const handleOpenAddAddressModal = () => {
        setEditingAddress(null); // Clear any previous edits
        setAddressModalOpen(true);
    };

    const handleCloseAddressModal = () => {
        setAddressModalOpen(false);
    };

    const renderSubPage = () => {
        switch (subPage) {
            case 'profileDetails':
                return <ProfileDetailsPage setPage={setSubPage} currentUser={currentUser} />;
            case 'savedAddresses':
                return <SavedAddressesPage setPage={setSubPage} currentUser={currentUser} openAddAddressModal={handleOpenAddAddressModal} setEditingAddress={setEditingAddress} />;
            case 'paymentMethods':
                return <PaymentMethodsPage setPage={setSubPage} />;
            case 'notifications':
                return <NotificationsPage setPage={setSubPage} />;
            case 'helpCenter':
                return <HelpCenterPage setPage={setSubPage} />;
            default:
                return <AccountMenu setPage={setSubPage} currentUser={currentUser} handleLogout={handleLogout} />;
        }
    };

    return (
        <>
            {renderSubPage()}
            <AddAddressModal 
                isOpen={isAddressModalOpen}
                onClose={handleCloseAddressModal}
                onSave={() => {
                    // We might need to refresh addresses here in a real app
                    handleCloseAddressModal();
                }}
                currentUser={currentUser}
                addressToEdit={editingAddress}
            />
        </>
    );
}
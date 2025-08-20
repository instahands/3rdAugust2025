// src/pages/AccountPage.tsx (CORRECTED)

import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Address } from '../types'; // --- NEW: Import Address type
import { UserIcon, ProfileIcon, AddressIcon, PaymentIcon, NotificationIcon, HelpIcon, ChevronRightIcon } from '../components/common/Icons';

// Import the sub-pages
import ProfileDetailsPage from '../components/account/ProfileDetailsPage';
import SavedAddressesPage from '../components/account/SavedAddressesPage';
import AddAddressModal from '../components/account/AddAddressModal';
import PaymentMethodsPage from '../components/account/PaymentMethodsPage';
import NotificationsPage from '../components/account/NotificationsPage';
import HelpCenterPage from '../components/account/HelpCenterPage';

// --- Interfaces and AccountMenu component remain the same ---
interface AccountMenuProps {
    setPage: (page: string) => void;
    currentUser: User | null;
    handleLogout: () => void;
}

const AccountMenu = ({ setPage, currentUser, handleLogout }: AccountMenuProps) => {
    // ... menu code
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


interface AccountPageProps {
    setPage: (page: string) => void; 
    currentUser: User | null;
    handleLogout: () => void;
}

export default function AccountPage({ currentUser, handleLogout }: AccountPageProps) {
    const [subPage, setSubPage] = useState('account'); 
    
    const [isAddressModalOpen, setAddressModalOpen] = useState(false);
    // --- MODIFIED: Explicitly set the type for the state ---
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);

    const handleOpenAddAddressModal = () => {
        setEditingAddress(null);
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
                // The type of setEditingAddress now correctly matches the prop requirement
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
                    handleCloseAddressModal();
                }}
                currentUser={currentUser}
                addressToEdit={editingAddress}
            />
        </>
    );
}
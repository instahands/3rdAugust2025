// src/components/account/NotificationsPage.tsx (CORRECTED)

import { useState } from 'react';
import SubPageHeader from '../common/SubPageHeader';

// --- NEW: Typed props for Toggle component ---
const Toggle = ({ label, isEnabled, onToggle }: { label: string, isEnabled: boolean, onToggle: () => void }) => (
    <div className="flex justify-between items-center p-4">
        <span className="font-medium text-gray-700">{label}</span>
        <button 
            onClick={onToggle} 
            className={`w-14 h-8 rounded-full flex items-center transition-colors duration-300 ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
        >
            <span className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
    </div>
);

// --- NEW: Typed props for the page ---
export default function NotificationsPage({ setPage }: { setPage: (page: string) => void }) {
    const [toggles, setToggles] = useState({
        orderUpdates: true,
        promotions: true,
        reminders: false,
    });

    // --- NEW: Typed the key parameter ---
    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({...prev, [key]: !prev[key]}));
    };
    
    return (
        <div className="max-w-2xl mx-auto px-4 pt-4">
            <SubPageHeader title="Notifications" onBack={() => setPage('account')} />
            <div className="bg-white rounded-xl shadow divide-y">
                <Toggle label="Order Updates" isEnabled={toggles.orderUpdates} onToggle={() => handleToggle('orderUpdates')} />
                <Toggle label="Promotions & Offers" isEnabled={toggles.promotions} onToggle={() => handleToggle('promotions')} />
                <Toggle label="Booking Reminders" isEnabled={toggles.reminders} onToggle={() => handleToggle('reminders')} />
            </div>
        </div>
    );
}
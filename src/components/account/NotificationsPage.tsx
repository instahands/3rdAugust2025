// src/components/account/NotificationsPage.tsx

import React, { useState } from 'react';
import SubPageHeader from '../common/SubPageHeader';

const Toggle = ({ label, isEnabled, onToggle }) => (
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

export default function NotificationsPage({ setPage }) {
    const [toggles, setToggles] = useState({
        orderUpdates: true,
        promotions: true,
        reminders: false,
    });

    const handleToggle = (key) => {
        setToggles(prev => ({...prev, [key]: !prev[key]}));
    };
    
    return (
        <div className="max-w-2xl mx-auto">
            <SubPageHeader title="Notifications" onBack={() => setPage('account')} />
            <div className="bg-white rounded-xl shadow divide-y">
                <Toggle label="Order Updates" isEnabled={toggles.orderUpdates} onToggle={() => handleToggle('orderUpdates')} />
                <Toggle label="Promotions & Offers" isEnabled={toggles.promotions} onToggle={() => handleToggle('promotions')} />
                <Toggle label="Booking Reminders" isEnabled={toggles.reminders} onToggle={() => handleToggle('reminders')} />
            </div>
        </div>
    );
}
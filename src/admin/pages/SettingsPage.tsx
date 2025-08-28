// src/admin/pages/SettingsPage.tsx

import { useState } from 'react';

const Toggle = ({ label, isEnabled, onToggle }: { label: string, isEnabled: boolean, onToggle: () => void }) => (
    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <button 
            onClick={onToggle} 
            className={`w-14 h-8 rounded-full flex items-center transition-colors duration-300 ${isEnabled ? 'bg-blue-500' : 'bg-gray-400'}`}
        >
            <span className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
    </div>
);


const SettingsPage = () => {
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: false,
        autoAssignWorkers: true,
    });

    const handleToggle = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Notification Settings</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage how you receive alerts.</p>
                </div>
                <div className="divide-y dark:divide-gray-700">
                    <Toggle label="Email Notifications for New Orders" isEnabled={settings.emailNotifications} onToggle={() => handleToggle('emailNotifications')} />
                    <Toggle label="Push Notifications for Status Changes" isEnabled={settings.pushNotifications} onToggle={() => handleToggle('pushNotifications')} />
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
                 <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Automation</h2>
                    <p className="text-sm text-gray-500 mt-1">Configure automated workflows.</p>
                </div>
                <div className="divide-y dark:divide-gray-700">
                   <Toggle label="Automatically Assign Available Workers" isEnabled={settings.autoAssignWorkers} onToggle={() => handleToggle('autoAssignWorkers')} />
                </div>
            </div>

             <div className="flex justify-end">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default SettingsPage;

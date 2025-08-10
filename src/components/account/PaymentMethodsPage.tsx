// src/components/account/PaymentMethodsPage.tsx

import React from 'react';
import SubPageHeader from '../common/SubPageHeader';

export default function PaymentMethodsPage({ setPage }) {
    return (
        <div className="max-w-2xl mx-auto">
            <SubPageHeader title="Payment Methods" onBack={() => setPage('account')} />
            <div className="bg-white p-4 rounded-xl shadow space-y-4">
                   <p className="text-center text-gray-500 py-8">No saved payment methods.</p>
                   <p className="text-center text-xs text-gray-400">Feature coming soon!</p>
            </div>
            <button 
                disabled 
                className="w-full py-3 mt-6 text-white font-bold bg-green-600 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                Add New Card
            </button>
        </div>
    );
}
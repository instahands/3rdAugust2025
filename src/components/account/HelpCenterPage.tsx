// src/components/account/HelpCenterPage.tsx (CORRECTED)

import { useState } from 'react';
import SubPageHeader from '../common/SubPageHeader';
import { ChevronRightIcon } from '../common/Icons';

// --- NEW: Typed the props for FAQItem ---
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">
                <span className="font-medium text-gray-800">{question}</span>
                {/* This will be fixed in Icons.tsx */}
                <ChevronRightIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && <div className="p-4 pt-0 text-gray-600 bg-gray-50">{answer}</div>}
        </div>
    );
};

// --- NEW: Typed the props for the page ---
export default function HelpCenterPage({ setPage }: { setPage: (page: string) => void }) {
    return (
        <div className="max-w-2xl mx-auto">
            <SubPageHeader title="Help Center" onBack={() => setPage('account')} />
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <FAQItem 
                    question="How do I cancel a booking?" 
                    answer="You can cancel a booking from the 'My Orders' page up to 24 hours before the scheduled time. Find the order and click the 'Cancel' button." 
                />
                <FAQItem 
                    question="What are the payment options?" 
                    answer="We currently support payments via credit card, debit card, and UPI. All payments are processed securely. You can manage your payment methods in the 'Payment Methods' section." 
                />
                <FAQItem 
                    question="How are workers verified?" 
                    answer="All our manpower is background-checked and verified for your safety and peace of mind. We ensure they are trained and professional for the services they provide." 
                />
            </div>
        </div>
    );
}
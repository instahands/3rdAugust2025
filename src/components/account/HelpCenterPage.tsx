// src/components/account/HelpCenterPage.tsx (ENHANCED)

import { useState } from 'react';
import SubPageHeader from '../common/SubPageHeader';
import { ChevronRightIcon } from '../common/Icons';

// --- FAQ Item Component (No changes needed here) ---
const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50">
                <span className="font-medium text-gray-800">{question}</span>
                <ChevronRightIcon className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-gray-600 bg-gray-50">
                    <p className="whitespace-pre-line">{answer}</p>
                </div>
            )}
        </div>
    );
};

// --- Comprehensive list of Frequently Asked Questions ---
const faqs = [
    {
        question: "How do I book a service?",
        answer: "You can book a service directly from the Home page. Simply select the service category you need, choose a date and time slot, provide a brief description of the work, and confirm your booking."
    },
    {
        question: "Can I reschedule or cancel my booking?",
        answer: "Yes, you can reschedule or cancel a booking from the 'My Orders' page. Please note our cancellation policy:\n- Free cancellation up to 24 hours before the scheduled time.\n- A nominal fee may be charged for cancellations within 24 hours of the booking."
    },
    {
        question: "How is the final price calculated?",
        answer: "The price is based on the duration of the service. The rate is calculated per hour, and you can select the duration you need on the booking page. The total price is shown before you confirm your booking."
    },
    {
        question: "When do I have to pay?",
        answer: "We offer both online payment and Cash on Delivery (COD). You can choose to pay securely online when you book, or you can pay in cash to the professional after the service is completed."
    },
    {
        question: "Are the professionals verified?",
        answer: "Absolutely. Your safety is our top priority. All professionals on the InstaHands platform undergo a thorough background check and verification process before they are onboarded."
    },
    {
        question: "What if I am not satisfied with the service?",
        answer: "We strive for 100% satisfaction. If you are not happy with the service provided, please contact our support team through the 'Contact Us' section below within 24 hours of the service, and we will make it right."
    }
];

export default function HelpCenterPage({ setPage }: { setPage: (page: string) => void }) {
    return (
        <div className="max-w-2xl mx-auto px-4 pt-4 pb-24 ">
            <SubPageHeader title="Help Center" onBack={() => setPage('account')} />
            
            <div className="bg-white rounded-xl shadow overflow-hidden">
                {faqs.map((faq) => (
                    <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
            </div>

            <div className="mt-8 text-center bg-white p-6 rounded-xl shadow">
                <h3 className="font-bold text-lg text-gray-800">Still have questions?</h3>
                <p className="text-gray-600 mt-2">Our support team is ready to help you with any issue.</p>
                <a href="mailto:support@instahands.in" className="mt-4 inline-block px-8 py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700">
                    Contact Support
                </a>
            </div>
        </div>
    );
}

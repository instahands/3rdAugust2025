// src/pages/CheckoutPage.tsx

import React, { useEffect } from 'react';
import SubPageHeader from '../components/common/SubPageHeader';
import { UpiIcon, CardIcon, PaymentGraphic } from '../components/common/Icons'; // Note: You'll need to add these icons

export default function CheckoutPage({ setPage, bookingDetails, addOrder }: any) {
    if (!bookingDetails) {
        useEffect(() => { setPage('home'); }, []);
        return null;
    }

    const price = (bookingDetails.duration / 60) * bookingDetails.service.price;
    const fullAddressString = `${bookingDetails.address.street_address}, ${bookingDetails.address.city}, ${bookingDetails.address.state} ${bookingDetails.address.postal_code}`;

    const handlePayment = () => {
        const finalOrder = {
            date: bookingDetails.date,
            duration: bookingDetails.duration,
            timeSlot: bookingDetails.timeSlot,
            address: fullAddressString,
            workDescription: bookingDetails.workDescription,
            manpowerType: bookingDetails.service.manpowerType,
            subscriptionType: 'Instant',
        };
        addOrder(finalOrder);
    };

    return (
        <div className="max-w-4xl mx-auto pb-32">
            <SubPageHeader title="Confirm & Pay" onBack={() => setPage('booking')} />
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <PaymentGraphic />
                    <h2 className="text-2xl font-bold mt-4">Complete Your Payment</h2>
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-3">Booking Summary</h3>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Service:</span><span className="font-semibold">{bookingDetails.service.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-semibold">{new Date(bookingDetails.date).toDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Time:</span><span className="font-semibold">{bookingDetails.timeSlot}</span></div>
                        <div className="flex justify-between items-start"><span className="text-gray-600 flex-shrink-0 mr-2">Address:</span><span className="font-semibold text-right">{fullAddressString}</span></div>
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg mb-3">Payment Details</h3>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Base Price:</span><span>₹{price}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="text-red-500">- ₹0</span></div>
                        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span className="text-gray-800">Total Amount:</span><span>₹{price}</span></div>
                    </div>
                 </div>
                <div>
                    <h3 className="font-bold text-lg mb-3">Select Payment Method</h3>
                    <div className="space-y-3">
                        <button className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 border-green-500 bg-green-50`}> <UpiIcon /> <span>UPI (Pay on Service Completion)</span> </button>
                        {/* <button className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4`}> <CardIcon /> <span>Credit/Debit Card</span> </button> */}
                    </div>
                </div>
            </div>
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                <div className="max-w-4xl mx-auto">
                    <button onClick={handlePayment} className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 text-lg">
                        Confirm & Book (Pay Later)
                    </button>
                </div>
            </div>
        </div>
    );
}
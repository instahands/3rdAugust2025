// src/app/pages/CheckoutPage.tsx

import { useEffect, useState } from 'react';
import SubPageHeader from '../components/common/SubPageHeader';
import { CardIcon, CashIcon } from '../components/common/Icons';

export default function CheckoutPage({ setPage, bookingDetails, addOrder, userInfo }: any) {
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            const scriptElement = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
            if (scriptElement) {
                document.body.removeChild(scriptElement);
            }
        };
    }, []);

    if (!bookingDetails || !bookingDetails.service || !bookingDetails.address) {
        useEffect(() => { setPage('home'); }, []);
        return null;
    }

    const service = bookingDetails.service;
    const frequency = bookingDetails.frequency || 'daily';
    const basePrice = (bookingDetails.duration / 60) * (service.price || 0);
    let finalPrice = basePrice;
    if (frequency === 'weekly') finalPrice *= 7;
    if (frequency === 'monthly') finalPrice *= 30;

    const handleProcessBooking = async () => {
        const orderData = {
            service_name: service.name,
            date: bookingDetails.date,
            time_slot: bookingDetails.timeSlot,
            duration: bookingDetails.duration,
            work_description: bookingDetails.workDescription,
            address_id: bookingDetails.address.id,
            price: finalPrice,
            payment_method: paymentMethod,
            payment_status: paymentMethod === 'cod' ? 'Pending' : 'Paid via App', // Fix: Set to 'Pending' for COD
            status: 'Pending',
            tracking_status: 'Booked',
        };

        if (paymentMethod === 'cod') {
            await addOrder(orderData);
        } else {
            // Razorpay payment logic
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: finalPrice * 100, // Amount in the smallest currency unit
                currency: "INR",
                name: "InstaHands",
                description: `Payment for ${service.name}`,
                handler: async function (response: any) {
                    console.log('Payment successful', response);
                    await addOrder(orderData);
                },
                prefill: {
                    name: userInfo?.name,
                    email: userInfo?.email,
                    contact: userInfo?.phone
                },
                theme: {
                    color: "#34D399"
                }
            };
            // @ts-ignore
            const rzp = new window.Razorpay(options);
            rzp.open();
        }
    };

    return (
        <div className="pb-32">
            <SubPageHeader title="Checkout" onBack={() => setPage('booking')} />
            <div className="max-w-4xl mx-auto px-4 space-y-6">
                {/* Order Summary */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2">Booking Summary</h3>
                    <p><strong>Service:</strong> {service.name}</p>
                    <p><strong>Date:</strong> {new Date(bookingDetails.date).toDateString()} at {bookingDetails.timeSlot}</p>
                    <p><strong>Address:</strong> {bookingDetails.address.street_address}</p>
                    <p className="mt-2 text-lg font-bold">Total: ₹{finalPrice.toFixed(2)}</p>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h3 className="font-bold mb-4">Payment Method</h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => setPaymentMethod('cod')}
                            className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-300'}`}>
                            <CashIcon />
                            <span>Cash on Delivery (Pay after service)</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('prepaid')}
                            className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 transition-all ${paymentMethod === 'prepaid' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-300'}`}>
                            <CardIcon />
                            <span>Pay Now (Card, UPI)</span>
                        </button>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleProcessBooking}
                        disabled={paymentMethod === 'prepaid' && !scriptLoaded}
                        className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                        {paymentMethod === 'cod'
                            ? 'Confirm Booking'
                            : scriptLoaded
                                ? `Pay ₹${finalPrice.toFixed(2)} Now`
                                : 'Loading Gateway...'}
                    </button>
                </div>
            </div>
        </div>
    );
}

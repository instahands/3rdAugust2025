// src/pages/CheckoutPage.tsx

import { useEffect, useState } from 'react';
import SubPageHeader from '../components/common/SubPageHeader';


// --- Placeholder Icons (Replace with your actual icon components) ---
const UpiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V18M8.5 14.5l-1.5 1.5M15.5 14.5l1.5 1.5M12 11v3M5 18h14M4 11a8 8 0 1 1 16 0M4 11h16"/></svg>
);
const CardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
);
const PaymentGraphic = () => (
    <svg className="w-24 h-24 mx-auto text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
);
// --- End Placeholder Icons ---


export default function CheckoutPage({ setPage, bookingDetails, addOrder, userInfo }: any) {
    // State to manage which payment method is selected, defaulting to COD
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // --- MODIFIED: useEffect with enhanced logging ---
    useEffect(() => {
        console.log("Attempting to load Razorpay script...");
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        
        script.onload = () => {
            console.log("Razorpay script loaded successfully!");
            setScriptLoaded(true);
        };
        
        script.onerror = (error) => {
            console.error("Razorpay SDK could not be loaded.", error);
            alert("Could not load payment gateway. Please check the console for errors.");
            setScriptLoaded(false);
        };

        document.body.appendChild(script);

        return () => {
            const scriptElement = document.querySelector("script[src='https://checkout.razorpay.com/v1/checkout.js']");
            if (scriptElement) {
                console.log("Cleaning up Razorpay script.");
                document.body.removeChild(scriptElement);
            }
        };
    }, []);

    if (!bookingDetails) {
        useEffect(() => { setPage('home'); }, []);
        return null;
    }

    const price = (bookingDetails.duration / 60) * bookingDetails.service.price;
    const fullAddressString = `${bookingDetails.address.street_address}, ${bookingDetails.address.city}, ${bookingDetails.address.state} ${bookingDetails.address.postal_code}`;

    const confirmAndAddOrder = () => {
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

    const displayRazorpay = () => {
        if (!scriptLoaded) {
            alert('Payment gateway is still loading. Please wait a moment and try again.');
            return;
        }
        if (price <= 0) {
            alert("Invalid amount. Cannot proceed with payment.");
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: price * 100,
            currency: "INR",
            name: "InstaHands",
            description: `Payment for ${bookingDetails.service.name}`,
            image: "/logo.png",
            handler: function (response: any) {
                console.log("Payment Successful", response);
                alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                confirmAndAddOrder();
            },
            prefill: {
                name: userInfo?.name || "InstaHands User",
                email: userInfo?.email || "user@instahands.com",
                contact: userInfo?.phone || "9999999999",
            },
            notes: {
                booking_id: bookingDetails.id,
                address: fullAddressString,
            },
            theme: {
                color: "#16a34a",
            },
        };

        const rzp = new (window as any).Razorpay(options);

        rzp.on('payment.failed', function (response: any){
            console.error("Razorpay Payment Failed. Full Response:", response);
            alert(`Oops! Payment Failed.\n\nReason: ${response.error.description}\n\nPlease check the console for more details.`);
        });

        rzp.open();
    };

    const handleProcessBooking = () => {
        console.log(`Processing booking with method: ${paymentMethod}`);
        if (paymentMethod === 'cod') {
            confirmAndAddOrder();
        } else if (paymentMethod === 'razorpay') {
            displayRazorpay();
        }
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
                        <button 
                            onClick={() => setPaymentMethod('cod')}
                            className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 transition-all ${paymentMethod === 'cod' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-300'}`}
                        > 
                            <UpiIcon /> 
                            <span>Cash on Delivery (COD)</span> 
                        </button>
                        <button 
                            onClick={() => setPaymentMethod('razorpay')}
                            className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 transition-all ${paymentMethod === 'razorpay' ? 'border-green-500 bg-green-50 ring-2 ring-green-200' : 'border-gray-300'}`}
                        > 
                            <CardIcon /> 
                            <span>Pay with Razorpay (Card, UPI)</span> 
                        </button>
                    </div>
                </div>
            </div>
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                <div className="max-w-4xl mx-auto">
                    <button 
                        onClick={handleProcessBooking} 
                        disabled={paymentMethod === 'razorpay' && !scriptLoaded}
                        className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {paymentMethod === 'cod' 
                            ? 'Confirm Booking (Pay on Completion)' 
                            : scriptLoaded 
                                ? `Pay ₹${price} Now`
                                : 'Loading Payment Gateway...'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}

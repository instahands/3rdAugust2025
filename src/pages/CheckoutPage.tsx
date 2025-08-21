import { useEffect, useState } from 'react';
import SubPageHeader from '../components/common/SubPageHeader';
import { UpiIcon, PaymentGraphic, CardIcon } from '../components/common/Icons';

export default function CheckoutPage({ setPage, bookingDetails, addOrder, userInfo }: any) {
    // State to manage which payment method is selected, defaulting to COD
    const [paymentMethod, setPaymentMethod] = useState('cod');
    const [scriptLoaded, setScriptLoaded] = useState(false);

    // useEffect to load the Razorpay script
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

    // --- UPDATED to handle different frequencies ---
    const confirmAndAddOrder = () => {
        // Prepare date details based on frequency
        let date_info = {};
        let service_start_date = new Date().toISOString();

        if (bookingDetails.frequency === 'daily') {
            date_info = { date: bookingDetails.date };
            service_start_date = bookingDetails.date;
        } else if (bookingDetails.frequency === 'weekly') {
            date_info = { start_date: bookingDetails.weeklyStartDate, end_date: bookingDetails.weeklyEndDate };
            service_start_date = bookingDetails.weeklyStartDate;
        } else if (bookingDetails.frequency === 'monthly') {
            date_info = { month: bookingDetails.selectedMonth };
            service_start_date = `${bookingDetails.selectedMonth}-01`;
        }

        const finalOrder = {
            ...date_info, // This will add the correct date fields
            date: service_start_date, // Standardized start date for sorting
            duration: bookingDetails.duration,
            timeSlot: bookingDetails.timeSlot,
            address: fullAddressString,
            workDescription: bookingDetails.workDescription,
            manpowerType: bookingDetails.service.manpowerType,
            subscriptionType: bookingDetails.frequency, // Changed from 'Instant'
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
                        <div className="flex justify-between">
                            <span className="text-gray-600">Service:</span>
                            <span className="font-semibold">{bookingDetails.service.name}</span>
                        </div>
                        
                        {/* --- NEW DYNAMIC DATE DISPLAY --- */}
                        {bookingDetails.frequency === 'daily' && (
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-semibold">{new Date(bookingDetails.date).toDateString()}</span>
                            </div>
                        )}
                        {bookingDetails.frequency === 'weekly' && (
                             <div className="flex justify-between">
                                <span className="text-gray-600">For Week:</span>
                                <span className="font-semibold text-right">{bookingDetails.weeklyStartDate} to {bookingDetails.weeklyEndDate}</span>
                            </div>
                        )}
                        {bookingDetails.frequency === 'monthly' && (
                             <div className="flex justify-between">
                                <span className="text-gray-600">For Month:</span>
                                <span className="font-semibold">{bookingDetails.selectedMonth}</span>
                            </div>
                        )}
                        
                        <div className="flex justify-between">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold">{bookingDetails.timeSlot}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-gray-600 flex-shrink-0 mr-2">Address:</span>
                            <span className="font-semibold text-right">{fullAddressString}</span>
                        </div>
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

// src/app/pages/ConfirmationPage.tsx (FINAL, CORRECTED CODE)

import { CalendarIcon, ClockIcon, LocationPinIcon } from '../components/common/Icons';

export default function ConfirmationPage({ setPage, bookingDetails }: any) {
    if (!bookingDetails) {
        // This is a fallback in case the page is accessed directly
        return (
            <div className="text-center max-w-2xl mx-auto px-4 pt-16 pb-32">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">No booking details found.</h2>
                <button onClick={() => setPage('home')} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                    Back to Home
                </button>
            </div>
        );
    }

    // --- THIS IS THE FIX ---
    // Safely access and format the properties from the final bookingDetails object.
    const serviceName = bookingDetails.service?.name || bookingDetails.service_name || 'Service';
    const addressString = bookingDetails.address 
        ? `${bookingDetails.address.street_address}, ${bookingDetails.address.city}` 
        : 'Address details are being processed.';
    const orderId = bookingDetails.id?.toString().substring(0, 8) || 'N/A';
    const timeSlot = bookingDetails.time_slot || bookingDetails.timeSlot;

    return (
        <div className="text-center max-w-2xl mx-auto px-4 pt-16 pb-32">
            <div className="mx-auto w-24 h-24 flex items-center justify-center bg-green-100 rounded-full">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">Your request has been received. You can track the status in the "My Orders" section.</p>
            
            <div className="text-left bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Summary (ID: {orderId})</h3>
                <div className="space-y-3">
                    <p><strong>Service:</strong> {serviceName}</p>
                    <p className="flex items-center"><CalendarIcon /> {new Date(bookingDetails.date).toDateString()}</p>
                    <p className="flex items-center"><ClockIcon /> {timeSlot}</p>
                    <p className="flex items-start"><LocationPinIcon /> {addressString}</p>
                </div>
            </div>

            <div className="mt-8 space-x-4">
                <button onClick={() => setPage('home')} className="px-6 py-2 text-green-600 bg-green-100 rounded-lg hover:bg-green-200">
                    Back to Home
                </button>
                <button onClick={() => setPage('orders')} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                    View My Orders
                </button>
            </div>
        </div>
    );
}
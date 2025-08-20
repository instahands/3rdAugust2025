// src/pages/ConfirmationPage.tsx
import { CalendarIcon, ClockIcon, LocationPinIcon } from '../components/common/Icons';


export default function ConfirmationPage({ setPage, bookingDetails }: any) {
    if (!bookingDetails) {
        return (
            <div className="text-center max-w-2xl mx-auto py-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank you!</h2>
                <p className="text-gray-600 mb-8">Your booking request has been submitted.</p>
                <button onClick={() => setPage('home')} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                    Back to Home
                </button>
            </div>
        );
    }
    return (
        <div className="text-center max-w-2xl mx-auto py-16">
            <div className="mx-auto w-24 h-24 flex items-center justify-center bg-green-100 rounded-full">
                <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-8">Your request has been received. You can track the status in the "My Orders" section.</p>
            <div className="text-left bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Summary (ID: {bookingDetails.id?.toString().substring(0, 8)})</h3>
                <div className="space-y-3">
                    <p><strong>Service:</strong> {bookingDetails.manpowerType}</p>
                    <p className="flex items-center"><CalendarIcon /> {new Date(bookingDetails.date).toDateString()}</p>
                    <p className="flex items-center"><ClockIcon /> {bookingDetails.timeSlot}</p>
                    <p className="flex items-start"><LocationPinIcon /> {bookingDetails.address}</p>
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
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
// --- Helper Icons (as SVG components) ---

const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const LockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>;

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;

const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>;

const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 10.586V6z" clipRule="evenodd" /></svg>;

const LocationPinIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>;

const ChevronRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;

const ArrowLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>;

const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const XCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-8.66l-.707.707M4.34 4.34l-.707.707m16.32 0l-.707-.707M4.34 19.66l-.707-.707M12 12a2 2 0 100-4 2 2 0 000 4z" /></svg>;

const MoonIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;

const PaymentGraphic = () => <svg className="w-24 h-24 text-green-500 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;

const UpiIcon = () => <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 19.1482C6.22328 18.5042 5 16.9242 5 15.0002V11.0002C5 8.79118 6.79118 7.00018 9 7.00018C11.2088 7.00018 13 8.79118 13 11.0002V14.0002C13 15.1048 13.8952 16.0002 15 16.0002C16.1048 16.0002 17 15.1048 17 14.0002V10.0002M17 10.0002C17 7.79118 18.7912 6.00018 21 6.00018M17 10.0002H19M3 6.00018L3 18.0002" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const CardIcon = () => <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="18" height="12" rx="2" stroke="#4A5568" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="#4A5568" strokeWidth="2"/></svg>;

// --- Bottom Nav Icons ---

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;

const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>;

const AccountIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

// --- Service & Account Icons ---

const HousekeepingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m5 11v4m-2-2h4M12 3v1m0 16v1m-6.364 2.364L7.05 20.95m9.9-9.9l1.414 1.414M12 6a6 6 0 110 12 6 6 0 010-12z" /></svg>;

const PickupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;

const ShiftingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;

const OfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;

const OutdoorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l1.414-1.414a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-1.414 1.414M12 21v-4m0 0H8m4 0h4" /></svg>;

const TempManpowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;

const AddressIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const PaymentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;

const NotificationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>;

const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.539 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>;

const ShieldCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.016z" /></svg>;

const HeadsetIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2V10a2 2 0 012-2h8z" /></svg>;

const BadgeCheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;

const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4H5z" /></svg>;

const InfoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

const DocumentTextIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;

// --- Logo Components ---

const AuthLogo = () => (
    <div>
        <span className="text-black text-5xl font-bold">Insta</span>
        <span className="text-green-500 text-5xl font-bold">Hands</span>
    </div>
);

const HeaderLogo = () => (
    <div>
        <span className="text-black text-2xl font-bold">Insta</span>
        <span className="text-green-500 text-2xl font-bold">Hands</span>
    </div>
);

// --- Profile Setup Page (Corrected Version) ---
function ProfileSetupPage({ setPage }) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleProfileUpdate = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        // NEW: Call the database function to update the main user record
        const { error: updateError } = await supabase.rpc('update_user_profile', {
            new_name: fullName,
            new_email: email
        });

        if (updateError) {
            setError(updateError.message);
            console.error("Error updating profile:", updateError);
        } else {
            // Force a refresh to get the latest user data
            await supabase.auth.refreshSession();
            // If successful, navigate to the home page
            setPage('home');
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 -m-4 sm:-m-6">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Complete Your Profile</h2>
                <p className="text-center text-gray-500">Please provide your name and email to continue.</p>
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300">
                        {loading ? 'Saving...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}



// --- Main App Component ---

// --- Main App Component (Complete and Corrected) ---

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [session, setSession] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState('auth'); // Default page is 'auth'
    const [bookingDetails, setBookingDetails] = useState(null);
    const [selectedService, setSelectedService] = useState(null);
    const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [dataVersion, setDataVersion] = useState(0);
    const refreshData = () => setDataVersion(v => v + 1);
    
    // --- NEW, ROBUST useEffect HOOK ---
    // This is the core of the fix. It now handles session changes
    // without resetting your current page navigation.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const user = session?.user ?? null;
            setCurrentUser(user);
            setIsLoggedIn(!!session);

            // This logic now ONLY navigates on critical, one-time events.
            if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
                if (user) {
                    if (user.user_metadata && !user.user_metadata.name) {
                        setPage('profileSetup');
                    } else {
                        // This special syntax ONLY changes the page to 'home' if it's currently
                        // the default 'auth' page. Otherwise, it leaves the page as is.
                        setPage(currentPage => (currentPage === 'auth' ? 'home' : currentPage));
                    }
                }
            } else if (_event === 'SIGNED_OUT') {
                setPage('auth');
            }
            // For all other background events (like TOKEN_REFRESHED when you switch tabs),
            // this hook now does nothing, which is the correct behavior.
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []); // The empty dependency array is crucial and correct.


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [page]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
    };
    
    const addOrder = async (newOrderData) => {
        if (!currentUser) {
            alert("You must be logged in to create an order.");
            return;
        }
        const orderToInsert = { ...newOrderData, user_id: currentUser.id, status: 'Pending', trackingStatus: 'Booked' };
        const { data, error } = await supabase.from('orders').insert([orderToInsert]).select().single();
        if (error) {
            console.error("Error adding order:", error);
            alert("Sorry, there was an error booking your service.");
        } else {
            setOrders(prevOrders => [data, ...prevOrders].sort((a, b) => new Date(b.date) - new Date(a.date)));
            setBookingDetails(data);
            setPage('confirmation');
        }
    };
    
    const startBooking = (service) => {
        setSelectedService(service);
        setIsServiceDetailOpen(false);
        setPage('booking');
    };

    const viewServiceDetail = (service) => {
        setSelectedService(service);
        setIsServiceDetailOpen(true);
    };

    const closeServiceDetail = () => {
        setIsServiceDetailOpen(false);
    };

    const proceedToCheckout = (bookingData) => {
        setBookingDetails(bookingData);
        setPage('checkout');
    };

    const goBackToServiceDetail = () => {
        setPage('home'); 
        setIsServiceDetailOpen(true);
    };

  const handleEditAddressFromSelection = (addressToEdit) => {
        setEditingAddress(addressToEdit); // Set the address to be edited
        setIsAddModalOpen(true);          // Open the Add/Edit modal
    };
  
    const openAddAddressModal = () => setIsAddModalOpen(true);

    const renderPage = () => {
        switch (page) {
            case 'auth':
                return <AuthPage />;
            case 'profileSetup':
                return <ProfileSetupPage setPage={setPage} />;
            case 'home':
                return <HomePage setPage={setPage} viewServiceDetail={viewServiceDetail} currentUser={currentUser} orders={orders} />;
            case 'booking': 
                return <BookingPage 
                    setPage={setPage} 
                    service={selectedService} 
                    proceedToCheckout={proceedToCheckout} 
                    goBack={goBackToServiceDetail} 
                    currentUser={currentUser}
                    dataVersion={dataVersion}
                    openAddAddressModal={openAddAddressModal}
                    isAddModalOpen={isAddModalOpen}
                    onEditAddress={handleEditAddressFromSelection}
                />;
            case 'checkout':
                return <CheckoutPage setPage={setPage} bookingDetails={bookingDetails} addOrder={addOrder} />;
            case 'confirmation':
                return <ConfirmationPage setPage={setPage} bookingDetails={bookingDetails} />;
            case 'orders':
                return <OrdersPage setPage={setPage} currentPage={page} />;
            case 'account':
                return <AccountPage setPage={setPage} currentUser={currentUser} handleLogout={handleLogout} />;
            case 'profileDetails':
                return <ProfileDetailsPage setPage={setPage} currentUser={currentUser} />;
            case 'savedAddresses': 
                return <SavedAddressesPage 
                    setPage={setPage} 
                    currentUser={currentUser}
                    openAddAddressModal={openAddAddressModal}
                    setEditingAddress={setEditingAddress}
                />;
            case 'notifications':
                return <NotificationsPage setPage={setPage} />;
            case 'paymentMethods':
                return <PaymentMethodsPage setPage={setPage} />;
            case 'helpCenter':
                return <HelpCenterPage setPage={setPage} />;
            default:
                return <AuthPage />;
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24 bg-gray-50 min-h-screen">
            {renderPage()}

            {isLoggedIn && <BottomNavBar setPage={setPage} currentPage={page} />}

            {isServiceDetailOpen && (
                <ServiceDetailModal
                    service={selectedService}
                    startBooking={startBooking}
                    onClose={closeServiceDetail}
                />
            )}

            <AddAddressModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setEditingAddress(null);
                }}
                onSave={() => {
                    refreshData();
                    setEditingAddress(null);
                }}
                currentUser={currentUser}
                addressToEdit={editingAddress}
            />
        </div>
    );
}
// --- Bottom Navigation Bar ---

function BottomNavBar({ setPage, currentPage }) {

    const navItems = [
        { name: 'home', icon: <HomeIcon />, label: 'Home' },
        { name: 'orders', icon: <ListIcon />, label: 'Orders' },
        { name: 'account', icon: <AccountIcon />, label: 'Account' },
    ];
  
    const isAccountSubPage = ['profileDetails', 'savedAddresses', 'paymentMethods', 'notifications', 'helpCenter'].includes(currentPage);
    const isServiceSubPage = ['booking', 'checkout'].includes(currentPage);
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-t-lg border-t border-gray-200 z-40">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <button

                        key={item.name}

                        onClick={() => setPage(item.name)}

                        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${

                            (currentPage === item.name || (item.name === 'account' && isAccountSubPage) || (item.name === 'home' && isServiceSubPage)) ? 'text-green-600' : 'text-gray-500 hover:text-green-500'
                        }`}
                    >
                        {item.icon}
                        <span className="text-xs font-medium mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}



// --- Authentication Page ---

function AuthPage() {

    const [phoneNumber, setPhoneNumber] = useState('');

    const [otp, setOtp] = useState('');

    const [otpSent, setOtpSent] = useState(false);

    const [error, setError] = useState('');

    const [loading, setLoading] = useState(false);



    const handleSendOtp = async () => {

        if (phoneNumber.length < 10) {

            setError("Please enter a valid 10-digit mobile number.");

            return;

        }

        setError('');

        setLoading(true);



        const { error } = await supabase.auth.signInWithOtp({

            phone: `+91${phoneNumber}`,

        });



        if (error) {

            setError(error.message);

            console.error(error);

        } else {

            setOtpSent(true);

        }

        setLoading(false);

    };



    const handleVerifyOtp = async () => {

        if (otp.length < 6) {

            setError("Please enter a valid 6-digit OTP.");

            return;

        }

        setError('');

        setLoading(true);



        const { data, error } = await supabase.auth.verifyOtp({

            phone: `+91${phoneNumber}`,

            token: otp,

            type: 'sms'

        });



        if (error) {

            setError(error.message);

            console.error(error);

        }

        // If successful, the onAuthStateChange listener will handle the rest

        setLoading(false);

    };

    

    const handleGoogleLogin = async () => {

        const { error } = await supabase.auth.signInWithOAuth({

            provider: 'google',

        });

        if (error) {

            setError(error.message);

            console.error(error);

        }

    };



    return (

        <div className="flex items-center justify-center min-h-screen bg-gray-100 -m-4 sm:-m-6">

            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">

                <div className="mb-6">

                    <AuthLogo />

                </div>

                <h2 className="text-2xl font-bold text-center text-gray-800">Login or Sign Up</h2>

                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}

                

                {!otpSent ? (

                    <div className="space-y-4">

                        <div className="relative">

                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+91</span>

                            <input 

                                type="tel" 

                                placeholder="Mobile Number" 

                                value={phoneNumber}

                                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}

                                className="w-full pl-12 pr-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                            />

                        </div>

                        <button onClick={handleSendOtp} disabled={loading || phoneNumber.length < 10} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300">

                            {loading ? 'Sending...' : 'Send OTP'}

                        </button>

                    </div>

                ) : (

                    <div className="space-y-4">

                        <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to +91 {phoneNumber}</p>

                        <input 

                            type="tel" 

                            placeholder="Enter OTP" 

                            value={otp}

                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}

                            className="w-full px-4 py-3 text-center tracking-[0.5em] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"

                        />

                        <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300">

                            {loading ? 'Verifying...' : 'Verify OTP'}

                        </button>

                        <button onClick={() => setOtpSent(false)} className="text-sm text-gray-500 hover:underline">Change Number</button>

                    </div>

                )}



                <div className="flex items-center my-4">

                    <hr className="flex-grow border-t border-gray-300" />

                    <span className="px-2 text-sm text-gray-500">OR</span>

                    <hr className="flex-grow border-t border-gray-300" />

                </div>



                <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">

                    <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>

                    <span className="font-medium text-gray-700">Sign in with Google</span>

                </button>

            </div>

        </div>

    );

}



// --- Carousel Component ---

const AdCarousel = () => {

    const ads = [

        { id: 1, imageUrl: 'https://images.pexels.com/photos/4099468/pexels-photo-4099468.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Summer Discount 50% OFF' },

        { id: 2, imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Book Maid Services Now' },

        { id: 3, imageUrl: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Hassle-Free Shifting' },

    ];

    const [currentAd, setCurrentAd] = useState(0);



    useEffect(() => {

        const timer = setInterval(() => {

            setCurrentAd((prevAd) => (prevAd + 1) % ads.length);

        }, 3000);

        return () => clearInterval(timer);

    }, [ads.length]);



    return (

        <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-xl shadow-lg">

            {ads.map((ad, index) => (

                <img

                    key={ad.id}

                    src={ad.imageUrl}

                    alt={ad.alt}

                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentAd ? 'opacity-100' : 'opacity-0'}`}

                />

            ))}

        </div>

    );

};



// --- Home Page (Dashboard) ---

function HomePage({ setPage, viewServiceDetail, currentUser, orders }) {

    const services = [

        { name: 'Home Cleaning', icon: <HousekeepingIcon />, manpowerType: 'Home Cleaning', color: 'bg-blue-500', price: 249, description: 'Ideal for flats, villas, PGs, rentals.', imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Full Home Deep Cleaning', 'Kitchen Deep Clean', 'Bathroom Cleaning & Sanitization', 'Bedroom Cleaning', 'Sofa, Carpet & Mattress Shampooing'], needs: ['Access to water & electricity', 'Space to work'], excluded: ['Heavy furniture moving', 'Pest control'] },

        { name: 'Pack & Shift Help', icon: <ShiftingIcon />, manpowerType: 'Pack & Shift Help', color: 'bg-orange-500', price: 199, description: 'Heavy ka stress? Helping Hands is here!', imageUrl: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Full House Shifting Support', 'Packing, Loading, Unloading', 'Furniture Rearrangement', 'Office Setup or Move', 'Event Setup & Breakdown', 'Packing Support Only', 'Loading/Unloading Help', '2Hr/4Hr Labour Booking'], needs: ['Clear instructions on items to be moved', 'Access to both source and destination points', 'Parking space for vehicle (if applicable)'], excluded: ['Transportation vehicle (unless specified)', 'Insurance for valuables', 'Packing materials (unless specified)'] },

        { name: 'Pickup & Drop', icon: <PickupIcon />, manpowerType: 'Pickup & Drop', color: 'bg-indigo-500', price: 149, description: 'Bhilai\'s Instant Delivery Crew', imageUrl: 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Parcel Pickup & Drop', 'Grocery Pickup', 'Medicine Pickup', 'Tiffin/Meal Delivery', 'Courier Drop-off', 'Laundry Pickup & Drop', 'Custom Request Delivery'], needs: ['Clear pickup and drop addresses', 'Contact person details', 'Package details (size/weight)'], excluded: ['Transportation of illegal items', 'Handling of cash'] },

        { name: 'Commercial Cleaning', icon: <OfficeIcon />, manpowerType: 'Commercial Cleaning', color: 'bg-teal-500', price: 249, description: 'Offices, coaching centers, salons, gyms, shops.', imageUrl: 'https://images.pexels.com/photos/4099468/pexels-photo-4099468.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Full Office Deep Cleaning', 'Washroom Maintenance', 'Pantry & Kitchenette Cleaning', 'Glass & Window Cleaning'], needs: ['Access to the premises after hours', 'Water and power supply'], excluded: ['Cleaning of personal employee belongings', 'Heavy machinery cleaning'] },

        { name: 'On-Demand Cleaning', icon: <HousekeepingIcon />, manpowerType: 'On-Demand Cleaning', color: 'bg-purple-500', price: 199, description: 'Quick or flexible help for specific needs.', imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Single Room Quick Cleaning', 'Balcony/Terrace Cleaning', 'Fridge/Microwave/Oven Cleaning', 'One-Time Maid / Helper'], needs: ['Specific instructions for the task', 'Required cleaning agents'], excluded: ['Full home cleaning', 'Tasks requiring specialized tools'] },

        { name: 'Outdoor & Utility', icon: <OutdoorIcon />, manpowerType: 'Outdoor & Utility', color: 'bg-lime-500', price: 199, description: 'Use your manpower for outdoor help too.', imageUrl: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Garden Cleaning & Grass Cutting', 'Plant Potting & Arrangement', 'Car Washing (at home)', 'Pressure Wash for Driveway/Pathway', 'Dustbin Cleaning', 'Water Tank Top-up / Overflow Fix (basic)', 'Cloth Drying Line Setup (rooftop)'], needs: ['Access to outdoor area', 'Water source for cleaning'], excluded: ['Major landscaping', 'Handling of hazardous materials'] },

        { name: 'Temporary Manpower', icon: <TempManpowerIcon />, manpowerType: 'Temporary Manpower', color: 'bg-cyan-500', price: 199, description: 'For events, house functions, or short tasks.', imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['2 Hour Helper (Lift/Move/Setup)', '4 Hour Helper (Extra Hands at Home/Office)', 'Wedding/Event Setup Support', 'Labour for Shops/Stores (Inventory/Arranging)', 'Daily/Hourly Labour', 'Temporary Society Cleaning Helper', 'Waiters/Servers (non-hotel) for private events'], needs: ['Clear task list', 'Supervision for the task'], excluded: ['Skilled labour unless specified', 'Long-term contracts'] },

    ];



    const valueProps = [

        { icon: <StarIcon />, text: 'We Value Your Feedback' },

        { icon: <ShieldCheckIcon />, text: 'Trained Professionals' },

        { icon: <HeadsetIcon />, text: 'Dedicated Support' },

        { icon: <BadgeCheckIcon />, text: 'Verified Experts' },

    ];



    const recentBookings = orders

        .filter(order => new Date(order.date) < new Date())

        .slice(0, 5);



    return (

        <div className="max-w-4xl mx-auto space-y-8">

            {/* --- Header --- */}

            <div className="flex justify-between items-center">

                <HeaderLogo />

                <button onClick={() => setPage('account')} className="p-2 bg-white rounded-full shadow border">

                    <UserIcon />

                </button>

            </div>

            

            {/* --- Personalized Greeting --- */}

            <div>

                <h1 className="text-2xl font-bold text-gray-800">Hi, {currentUser?.user_metadata?.name?.split(' ')[0] || 'User'} 👋</h1>

                <p className="text-gray-500">What service do you need today?</p>

            </div>



            {/* --- Search Bar --- */}

            <div className="relative">

                <input 

                    type="text"

                    placeholder="Search for a service..."

                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"

                />

                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">

                    <SearchIcon />

                </div>

            </div>



            {/* --- Ad Carousel --- */}

            <AdCarousel />



            {/* --- Service Grid --- */}

            <div>

                <h2 className="text-lg font-bold text-gray-800 mb-4">Categories</h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                    {services.map(service => (

                        <button 

                            key={service.name} 

                            onClick={() => viewServiceDetail(service)}

                            className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center aspect-square"

                        >

                            <div className={`p-4 rounded-full ${service.color}`}>

                                {service.icon}

                            </div>

                            <span className="mt-3 font-semibold text-gray-700 text-sm">{service.name}</span>

                        </button>

                    ))}

                </div>

            </div>



            {/* --- Value Propositions --- */}

            <div>

                <div className="flex overflow-x-auto space-x-4 pb-4">

                    {valueProps.map(prop => (

                        <div key={prop.text} className="flex-shrink-0 w-40 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md text-center">

                            {prop.icon}

                            <p className="mt-2 text-sm font-semibold text-gray-700">{prop.text}</p>

                        </div>

                    ))}

                </div>

            </div>



            {/* --- Book Again Section --- */}

            {recentBookings.length > 0 && (

                <div>

                    <h2 className="text-lg font-bold text-gray-800 mb-4">Book Again</h2>

                    <div className="flex overflow-x-auto space-x-4 pb-4">

                        {recentBookings.map(order => (

                            <div key={order.id} className="flex-shrink-0 w-64 p-4 bg-white rounded-xl shadow-md">

                                <h3 className="font-bold text-gray-800">{order.manpowerType}</h3>

                                <p className="text-sm text-gray-500">{order.subscriptionType}</p>

                               <p className="text-sm text-gray-500 mt-2">

    Last on: {new Date(order.date).toLocaleDateString('en-US', {

        year: 'numeric',

        month: 'short',

        day: 'numeric'

    })}

</p>

                                <button onClick={() => startBooking(services.find(s => s.manpowerType === order.manpowerType))} className="mt-4 w-full py-2 text-white bg-green-600 rounded-lg text-sm font-bold">

                                    Re-Book

                                </button>

                            </div>

                        ))}

                    </div>

                </div>

            )}

            

        </div>

    );

}



// --- Service Detail Modal ---

function ServiceDetailModal({ service, startBooking, onClose }) {

    if (!service) return null;



    return (

        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">

            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-t-2xl shadow-lg flex flex-col">

                {/* Image Header */}

                <div className="relative h-48 flex-shrink-0">

                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover rounded-t-2xl" />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white hover:bg-black/50">

                        <XIcon />

                    </button>

                    <div className="absolute bottom-4 left-4 text-white">

                        <h1 className="text-2xl font-bold">{service.name}</h1>

                        <p className="text-sm">{service.description}</p>

                    </div>

                </div>

                

                <div className="p-6 space-y-6 overflow-y-auto">

                    <div className="p-4 bg-gray-50 rounded-lg">

                        <h3 className="text-lg font-bold text-gray-800 mb-3">The expert is trained to</h3>

                        <ul className="space-y-2">

                            {service.trainedTo.map(item => (

                                <li key={item} className="flex items-start">

                                    <CheckCircleIcon className="mt-1 flex-shrink-0" />

                                    <span className="ml-3 text-gray-700">{item}</span>

                                </li>

                            ))}

                        </ul>

                    </div>

                    

                    <div className="p-4 bg-gray-50 rounded-lg">

                        <h3 className="text-lg font-bold text-gray-800 mb-3">What we need from you</h3>

                         <ul className="space-y-2">

                            {service.needs.map(item => (

                                <li key={item} className="flex items-start">

                                    <CheckCircleIcon className="mt-1 flex-shrink-0" />

                                    <span className="ml-3 text-gray-700">{item}</span>

                                </li>

                            ))}

                        </ul>

                    </div>



                    <div className="p-4 bg-gray-50 rounded-lg">

                        <h3 className="text-lg font-bold text-gray-800 mb-3">Service Excluded</h3>

                         <ul className="space-y-2">

                            {service.excluded.map(item => (

                                <li key={item} className="flex items-start">

                                    <XCircleIcon className="mt-1 flex-shrink-0" />

                                    <span className="ml-3 text-gray-700">{item}</span>

                                </li>

                            ))}

                        </ul>

                    </div>

                </div>

                <div className="p-4 border-t mt-auto flex-shrink-0">

                    <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">

                        <div>

                            <p className="text-sm text-gray-600">Starting from</p>

                            <p className="text-2xl font-bold text-green-600">₹{service.price}<span className="text-base font-normal">/hour</span></p>

                        </div>

                        <button 

                            onClick={() => startBooking(service)}

                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"

                        >

                            Book Now

                        </button>

                    </div>

                </div>

            </div>

        </div>

    );

}





// --- Sub Page Header ---

const SubPageHeader = ({ title, onBack }) => (

    <div className="relative flex items-center justify-center mb-6">

        <button onClick={onBack} className="absolute left-0 p-2">

            <ArrowLeftIcon />

        </button>

        <h2 className="text-xl font-bold text-gray-800">{title}</h2>

    </div>

);





// --- Account Page ---

function AccountPage({ setPage, currentUser, handleLogout }) {

    const menuItems = [

        { name: 'Profile Details', icon: <ProfileIcon />, page: 'profileDetails' },

        { name: 'Saved Addresses', icon: <AddressIcon />, page: 'savedAddresses' },

        { name: 'Payment Methods', icon: <PaymentIcon />, page: 'paymentMethods' },

        { name: 'Notifications', icon: <NotificationIcon />, page: 'notifications' },

        { name: 'Help Center', icon: <HelpIcon />, page: 'helpCenter' },

    ];



    return (

        <div className="max-w-4xl mx-auto">

            <div className="flex items-center space-x-4 mb-8 p-4 bg-white rounded-xl shadow">

                <div className="p-3 bg-gray-100 rounded-full"><UserIcon /></div>

                <div>

                    <h2 className="text-xl font-bold text-gray-800">{currentUser?.user_metadata?.name || currentUser?.email}</h2>

                    <p className="text-gray-500">{currentUser?.phone || 'No phone number'}</p>

                </div>

            </div>



            <div className="bg-white rounded-xl shadow">

                {menuItems.map((item, index) => (

                    <button

                        key={item.name}

                        onClick={() => setPage(item.page)}

                        className={`w-full p-4 flex items-center space-x-4 text-left ${index !== menuItems.length - 1 ? 'border-b' : ''}`}

                    >

                        <span className="text-gray-500">{item.icon}</span>

                        <span className="flex-1 font-medium text-gray-700">{item.name}</span>

                        <ChevronRightIcon className="text-gray-400" />

                    </button>

                ))}

            </div>



            <div className="mt-8">

                <button 

                    onClick={handleLogout} 

                    className="w-full py-3 text-white font-bold bg-red-500 rounded-lg hover:bg-red-600 transition-colors"

                >

                    Logout

                </button>

            </div>

        </div>

    );

}



// --- Profile Details Page (Enhanced with Phone Verification) ---
function ProfileDetailsPage({ setPage, currentUser }) {
    // State for general profile editing (name, email)
    const [isEditing, setIsEditing] = useState(false);
    
    // State for the multi-step phone change process
    const [isChangingPhone, setIsChangingPhone] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);

    // State for loading and messages
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // State to hold form data for name/email
    const [fullName, setFullName] = useState(currentUser?.user_metadata?.name || '');
    const [email, setEmail] = useState(currentUser?.email || '');

    // In your ProfileDetailsPage component

const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // This now calls the special database function
    const { error: rpcError } = await supabase.rpc('update_user_profile', {
        new_name: fullName,
        new_email: email
    });

    if (rpcError) {
        setError(rpcError.message);
        console.error("Error updating profile via RPC:", rpcError);
    } else {
        setSuccess("Profile updated successfully!");
        
        // Refresh the session to get the latest user data in the app
        await supabase.auth.refreshSession(); 
        
        setIsEditing(false);
    }
    setLoading(false);
};

    const handleSendPhoneOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        // This sends the OTP. It does NOT change the number yet.
        const { error: phoneError } = await supabase.auth.updateUser({ phone: `+91${phone}` });

        if (phoneError) {
            setError(phoneError.message);
        } else {
            setPhoneOtpSent(true);
            setSuccess(`OTP sent to +91${phone}`);
        }
        setLoading(false);
    };
    
    const handleVerifyPhoneOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        // This verifies the OTP and completes the phone number change.
        const { error: verifyError } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'phone_change' });

        if (verifyError) {
            setError(verifyError.message);
        } else {
            setSuccess("Phone number updated successfully!");
            // Reset the phone change UI
            setIsChangingPhone(false);
            setPhoneOtpSent(false);
            setPhone('');
            // Note: You might need a way to refresh the parent `currentUser` state to see the change instantly.
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <SubPageHeader title="Profile Details" onBack={() => setPage('account')} />
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center bg-green-100 p-2 rounded-md">{success}</p>}

                {/* --- Name and Email Editing Section --- */}
                <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    {isEditing ? ( <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg mt-1"/> ) : ( <p className="p-3 bg-gray-100 rounded-lg mt-1">{fullName || 'Not set'}</p> )}
                </div>
                <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                     {isEditing ? ( <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 bg-gray-50 border rounded-lg mt-1"/> ) : ( <p className="p-3 bg-gray-100 rounded-lg mt-1">{email || 'Not set'}</p> )}
                </div>
                {isEditing && ( <button onClick={handleSaveProfile} disabled={loading} className="w-full py-3 mt-4 text-white font-bold bg-green-600 rounded-lg disabled:bg-gray-400"> {loading ? 'Saving...' : 'Save Changes'} </button> )}
                
                {/* --- Phone Number Section --- */}
                <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="p-3 bg-gray-100 rounded-lg mt-1 text-gray-500">{currentUser?.phone || 'Not set'}</p>
                    
                    {!isChangingPhone && (
                         <button onClick={() => { setIsChangingPhone(true); setError(''); setSuccess(''); }} className="text-sm text-green-600 font-semibold mt-2">
                           {currentUser?.phone ? 'Change Phone Number' : 'Add Phone Number'}
                        </button>
                    )}

                    {isChangingPhone && !phoneOtpSent && (
                        <div className="mt-4 space-y-2">
                             <input type="tel" placeholder="Enter new 10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full p-3 bg-gray-50 border rounded-lg"/>
                             <button onClick={handleSendPhoneOtp} disabled={loading || phone.length < 10} className="w-full py-2 text-white bg-blue-600 rounded-lg disabled:bg-gray-400"> {loading ? 'Sending...' : 'Send OTP'} </button>
                        </div>
                    )}

                    {isChangingPhone && phoneOtpSent && (
                         <div className="mt-4 space-y-2">
                             <input type="tel" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full p-3 bg-gray-50 border rounded-lg"/>
                             <button onClick={handleVerifyPhoneOtp} disabled={loading || otp.length < 6} className="w-full py-2 text-white bg-blue-600 rounded-lg disabled:bg-gray-400"> {loading ? 'Verifying...' : 'Verify & Save'} </button>
                        </div>
                    )}
                </div>

                {!isEditing && !isChangingPhone && (
                     <button onClick={() => setIsEditing(true)} className="w-full py-3 mt-4 text-white font-bold bg-green-600 rounded-lg"> Edit Profile </button>
                )}
            </div>
        </div>
    );
}

// --- Add/Edit Address Modal Component (Upgraded Version with Validation) ---
function AddAddressModal({ isOpen, onClose, onSave, currentUser, addressToEdit }) {
    if (!isOpen) return null;

    // --- NEW: Data for Chhattisgarh Validation ---
    const CHHATTISGARH_CITIES = [
        'Bhilai', 'Durg'
    ];

    const PINCODE_PREFIXES = {
        'Bhilai': ['490', '491'],
        'Durg': ['490', '491'],  
    };
    // (You can expand these lists as needed)

    const isEditMode = !!addressToEdit;
    
    // Pre-fill form for editing, or start with empty/default values for adding
    const [addressType, setAddressType] = useState(isEditMode ? addressToEdit.address_type : 'Home');
    const [streetAddress, setStreetAddress] = useState(isEditMode ? addressToEdit.street_address : '');
    const [city, setCity] = useState(isEditMode ? addressToEdit.city : '');
    // CHANGED: State is now fixed
    const [state, setState] = useState('Chhattisgarh');
    const [postalCode, setPostalCode] = useState(isEditMode ? addressToEdit.postal_code : '');
    const [phoneNumber, setPhoneNumber] = useState(isEditMode ? addressToEdit.phone_number : '');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSaveAddress = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        // --- NEW: Validation Logic ---
        const enteredCity = city.trim();
        const enteredPincode = postalCode.trim();

        // 1. Check if the city is in our list (case-insensitive)
        const cityMatch = CHHATTISGARH_CITIES.find(c => c.toLowerCase() === enteredCity.toLowerCase());
        if (!cityMatch) {
            setError("Sorry, we currently only serve major cities in Chhattisgarh. Please select from the suggestions.");
            setLoading(false);
            return;
        }

        // 2. Check if the postal code is a 6-digit number
        if (!/^\d{6}$/.test(enteredPincode)) {
            setError("Please enter a valid 6-digit postal code.");
            setLoading(false);
            return;
        }
        
        // 3. Check if the postal code matches the city's prefix
        const validPrefixes = PINCODE_PREFIXES[cityMatch];
        if (!validPrefixes || !validPrefixes.some(prefix => enteredPincode.startsWith(prefix))) {
            setError(`The postal code ${enteredPincode} doesn't seem to match the city of ${cityMatch}.`);
            setLoading(false);
            return;
        }
      
       // 4. NEW: Phone number length validation
        if (phoneNumber.trim().length !== 10) {
            setError("Please enter a valid 10-digit phone number.");
            setLoading(false);
            return;
        }
        // --- End of Validation Logic ---


        if (!currentUser) { 
            setError("You must be logged in."); 
            setLoading(false); 
            return; 
        }

        const addressData = {
            user_id: currentUser.id,
            address_type: addressType,
            street_address: streetAddress,
            city: cityMatch, // Use the correctly-cased city name
            state,
            postal_code: enteredPincode,
            phone_number: phoneNumber
        };

        let response;
        if (isEditMode) {
            response = await supabase.from('addresses').update(addressData).eq('id', addressToEdit.id);
        } else {
            response = await supabase.from('addresses').insert(addressData);
        }

        if (response.error) {
            setError(response.error.message);
        } else {
            onSave(); // This will trigger a data refresh
            onClose(); // Close the modal
        }
        setLoading(false);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-lg m-4">
                <h2 className="text-xl font-bold mb-4">{isEditMode ? 'Edit Address' : 'Add New Address'}</h2>
                {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md mb-4">{error}</p>}
                
                <form onSubmit={handleSaveAddress} className="space-y-4">
                    <input type="text" placeholder="Street Address" value={streetAddress} onChange={e => setStreetAddress(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    <div className="grid grid-cols-2 gap-4">
                        {/* CHANGED: Added list attribute for datalist */}
                        <input list="cities" type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required className="w-full p-3 border rounded-lg" />
                        {/* NEW: Datalist for city suggestions */}
                        <datalist id="cities">
                            {CHHATTISGARH_CITIES.map(c => <option key={c} value={c} />)}
                        </datalist>
                        
                        <input type="text" placeholder="Postal Code" value={postalCode} onChange={e => setPostalCode(e.target.value)} required className="w-full p-3 border rounded-lg" />
                    </div>
                    {/* CHANGED: State input is now readOnly */}
                    <input type="text" placeholder="State" value={state} readOnly required className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed" />
                    
                    <input type="tel" placeholder="10-digit Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full p-3 border rounded-lg" />
                    <select value={addressType} onChange={e => setAddressType(e.target.value)} className="w-full p-3 border rounded-lg bg-white relative z-10">
                        <option>Home</option>
                        <option>Office</option>
                        <option>Other</option>
                    </select>
                    <div className="flex justify-end space-x-3 pt-2">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg font-semibold">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 text-white bg-green-600 rounded-lg font-semibold disabled:bg-gray-400">
                            {loading ? 'Saving...' : 'Save Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- Saved Addresses Page (with Fixed Button) ---
function SavedAddressesPage({ setPage, currentUser, openAddAddressModal, setEditingAddress }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAddresses = async () => {
        if (!currentUser) { setLoading(false); return; }
        setLoading(true);
        const { data, error } = await supabase.from('addresses').select('*').eq('user_id', currentUser.id).order('created_at');
        if (error) { console.error("Error fetching addresses:", error); } 
        else if (data) { setAddresses(data); }
        setLoading(false);
    };
    
    useEffect(() => {
        fetchAddresses();
    }, [currentUser]);

    const handleDelete = async (addressId) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            const { error } = await supabase.from('addresses').delete().eq('id', addressId);
            if (error) {
                alert("Error deleting address: " + error.message);
            } else {
                setAddresses(addresses.filter(addr => addr.id !== addressId));
            }
        }
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        openAddAddressModal();
    };

    return (
        // The main container now has padding at the bottom (pb-32) to prevent the
        // fixed button from overlapping the last address in the list.
        <div className="max-w-2xl mx-auto pb-32">
            <SubPageHeader title="Saved Addresses" onBack={() => setPage('account')} />
            {loading ? ( <p className="text-center text-gray-500 py-8">Loading addresses...</p> ) : (
                <div className="space-y-4">
                    {addresses.length > 0 ? ( 
                        addresses.map(addr => ( 
                            <div key={addr.id} className="bg-white p-4 rounded-xl shadow">
                                <h3 className="font-bold">{addr.address_type}</h3>
                                <p className="text-gray-600">{`${addr.street_address}, ${addr.city}, ${addr.state} ${addr.postal_code}`}</p>
                                <p className="text-sm text-gray-500 mt-1">Phone: {addr.phone_number}</p>
                                <div className="flex justify-end space-x-4 mt-3 pt-3 border-t">
                                    <button onClick={() => handleEdit(addr)} className="text-sm font-semibold text-blue-600">Edit</button>
                                    <button onClick={() => handleDelete(addr.id)} className="text-sm font-semibold text-red-600">Delete</button>
                                </div>
                            </div> 
                        )) 
                    ) : ( 
                        <p className="text-center text-gray-500 py-8">No saved addresses found.</p> 
                    )}
                </div>
            )}

            {/* --- NEW: Fixed Button Container --- */}
            {/* This div is now fixed to the bottom of the screen */}
            <div className="fixed bottom-16 left-0 right-0 bg-transparent p-4 z-10">
                <div className="max-w-2xl mx-auto">
                    <button 
                        onClick={openAddAddressModal} 
                        className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 shadow-lg"
                    >
                         + Add New Address 
                    </button>
                </div>
            </div>
        </div>
    );
}
// --- Payment Methods Page ---

function PaymentMethodsPage({ setPage }) {

    return (

        <div className="max-w-2xl mx-auto">

            <SubPageHeader title="Payment Methods" onBack={() => setPage('account')} />

            <div className="bg-white p-4 rounded-xl shadow space-y-4">

                 <p className="text-center text-gray-500 py-8">No saved payment methods.</p>

            </div>

            <button className="w-full py-3 mt-6 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700">

                Add New Card

            </button>

        </div>

    );

}



// --- Notifications Page ---

function NotificationsPage({ setPage }) {

    const [toggles, setToggles] = useState({

        orderUpdates: true,

        promotions: true,

        reminders: false,

    });



    const handleToggle = (key) => {

        setToggles(prev => ({...prev, [key]: !prev[key]}));

    };

    

    const Toggle = ({ label, isEnabled, onToggle }) => (

        <div className="flex justify-between items-center p-4">

            <span className="font-medium text-gray-700">{label}</span>

            <button onClick={onToggle} className={`w-14 h-8 rounded-full flex items-center transition-colors duration-300 ${isEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>

                <span className={`w-6 h-6 bg-white rounded-full shadow transform transition-transform duration-300 ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`} />

            </button>

        </div>

    );



    return (

        <div className="max-w-2xl mx-auto">

            <SubPageHeader title="Notifications" onBack={() => setPage('account')} />

            <div className="bg-white rounded-xl shadow divide-y">

                <Toggle label="Order Updates" isEnabled={toggles.orderUpdates} onToggle={() => handleToggle('orderUpdates')} />

                <Toggle label="Promotions" isEnabled={toggles.promotions} onToggle={() => handleToggle('promotions')} />

                <Toggle label="Reminders" isEnabled={toggles.reminders} onToggle={() => handleToggle('reminders')} />

            </div>

        </div>

    );

}



// --- Help Center Page ---

function HelpCenterPage({ setPage }) {

    const FAQItem = ({ question, answer }) => {

        const [isOpen, setIsOpen] = useState(false);

        return (

            <div className="border-b">

                <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left">

                    <span className="font-medium text-gray-800">{question}</span>

                    <ChevronRightIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />

                </button>

                {isOpen && <div className="p-4 pt-0 text-gray-600">{answer}</div>}

            </div>

        );

    };



    return (

        <div className="max-w-2xl mx-auto">

            <SubPageHeader title="Help Center" onBack={() => setPage('account')} />

            <div className="bg-white rounded-xl shadow">

                <FAQItem question="How do I cancel a booking?" answer="You can cancel a booking from the 'My Orders' page up to 24 hours before the scheduled time. Find the order and click the 'Cancel' button." />

                <FAQItem question="What are the payment options?" answer="We currently support payments via credit card, debit card, and UPI. All payments are processed securely." />

                <FAQItem question="How are workers verified?" answer="All our manpower is background-checked and verified for your safety and peace of mind. We ensure they are trained and professional." />

            </div>

        </div>

    );

}
// --- NEW: Address Selection Modal ---
// --- Address Selection Modal (with Edit Button) ---
function AddressSelectionModal({ isOpen, onClose, addresses, onSelectAddress, onAddNew, onEdit }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
            <div className="bg-white w-full max-w-4xl max-h-[75vh] rounded-t-2xl shadow-lg flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Select an Address</h2>
                    <button onClick={onClose}><XIcon /></button>
                </div>
                <div className="space-y-3 overflow-y-auto">
                    {addresses.map(addr => (
                        // CHANGED: This is now a div to hold multiple elements
                        <div key={addr.id} className="w-full p-4 border rounded-lg flex items-center justify-between hover:bg-gray-50">
                            {/* This part selects the address */}
                            <div 
                                className="flex items-start space-x-4 cursor-pointer flex-grow"
                                onClick={() => { onSelectAddress(addr); onClose(); }}
                            >
                                <div className="mt-1 w-5 h-5 rounded-full border-2 border-gray-400 flex-shrink-0"></div>
                                <div>
                                    <p className="font-semibold">{addr.address_type}</p>
                                    <p className="text-sm text-gray-600">{`${addr.street_address}, ${addr.city}`}</p>
                                </div>
                            </div>
                            {/* NEW: The Edit button */}
                            <button 
                                onClick={() => onEdit(addr)}
                                className="text-sm font-semibold text-blue-600 ml-4 px-3 py-1 flex-shrink-0"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
                <button 
                    onClick={() => { onClose(); onAddNew(); }} 
                    className="w-full mt-4 py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700"
                >
                    + Add a New Address
                </button>
            </div>
        </div>
    );
}

// --- Booking Page (Complete and Corrected) ---
function BookingPage({ setPage, service, proceedToCheckout, goBack, currentUser, dataVersion, openAddAddressModal, isAddModalOpen, onEditAddress }) {
    if (!service) {
        useEffect(() => setPage('home'), []);
        return null;
    }

    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [isAddressSelectorOpen, setIsAddressSelectorOpen] = useState(false);

    const [bookingData, setBookingData] = useState({
        service,
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        timeSlot: '09:00 AM',
        workDescription: '',
    });
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('Morning');

    useEffect(() => {
        const fetchAddresses = async () => {
            if (!currentUser) { setLoadingAddresses(false); return; }
            setLoadingAddresses(true);
            const { data, error } = await supabase.from('addresses').select('*').eq('user_id', currentUser.id);
            if (error) { console.error("Error fetching addresses:", error); } 
            else if (data) {
                setAddresses(data);
                if (data.length > 0 && !selectedAddress) {
                    setSelectedAddress(data[0]);
                }
            }
            setLoadingAddresses(false);
        };
        fetchAddresses();
    }, [currentUser, dataVersion]);

    const handleProceed = () => {
        if (!selectedAddress) {
            alert("Please select a service address.");
            return;
        }
        const finalBookingData = { ...bookingData, address: selectedAddress };
        proceedToCheckout(finalBookingData);
    };

    const isSlotDisabled = (slot) => {
        const today = new Date();
        const currentHour = today.getHours();
        const todayISO = today.toISOString().split('T')[0];
        if (bookingData.date !== todayISO) return false;
        const hourString = slot.split(':')[0];
        const period = slot.split(' ')[1];
        let slotHour = parseInt(hourString, 10);
        if (period === 'PM' && slotHour !== 12) slotHour += 12;
        if (period === 'AM' && slotHour === 12) slotHour = 0;
        return slotHour < currentHour;
    };
    
    const durations = [ { label: '60 min', value: 60 }, { label: '90 min', value: 90 }, { label: '120 min', value: 120 }, { label: '180 min', value: 180 }, { label: '240 min', value: 240 } ];
    const timeSlots = { Morning: ['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM'], Afternoon: ['12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'], Evening: ['05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'] };
    const getFormattedDate = (offset = 0) => { const date = new Date(); date.setDate(date.getDate() + offset); return date.toISOString().split('T')[0]; };
    const calculatePrice = () => (bookingData.duration / 60) * service.price;

    return (
        <>
            <div className="max-w-4xl mx-auto pb-24">
                <SubPageHeader title={service.name} onBack={goBack} />
                <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                    
                    {/* Address Selection UI */}
                    <div>
                        <h3 className="font-bold text-lg mb-2">Service Address</h3>
                        <button 
                            onClick={() => setIsAddressSelectorOpen(true)}
                            className="w-full p-4 text-left border-2 border-dashed rounded-lg flex items-center justify-between hover:bg-gray-50"
                        >
                            {loadingAddresses ? (
                                <span className="text-gray-500">Loading addresses...</span>
                            ) : selectedAddress ? (
                                <div className="text-sm">
                                    <p className="font-bold text-base">{selectedAddress.address_type}</p>
                                    <p className="text-gray-600">{`${selectedAddress.street_address}, ${selectedAddress.city}`}</p>
                                </div>
                            ) : (
                                <span className="text-gray-500">No address selected</span>
                            )}
                            <span className="font-bold text-green-600">Change</span>
                        </button>
                    </div>

                    {/* Date Selection */}
                    <div>
                        <h3 className="font-bold text-lg mb-3">Select Date</h3>
                        <div className="grid grid-cols-3 gap-2">
                             <button onClick={() => { setBookingData({...bookingData, date: getFormattedDate(0)}); setShowDatePicker(false); }} className={`p-3 rounded-lg text-sm ${bookingData.date === getFormattedDate(0) && !showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Today</button>
                             <button onClick={() => { setBookingData({...bookingData, date: getFormattedDate(1)}); setShowDatePicker(false); }} className={`p-3 rounded-lg text-sm ${bookingData.date === getFormattedDate(1) && !showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Tomorrow</button>
                             <button onClick={() => setShowDatePicker(true)} className={`p-3 rounded-lg text-sm ${showDatePicker ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Select Date</button>
                        </div>
                        {showDatePicker && <input type="date" value={bookingData.date} onChange={e => setBookingData({...bookingData, date: e.target.value})} className="w-full mt-3 p-2 border rounded-lg" />}
                    </div>

                    {/* Duration Selection */}
                    <div>
                         <h3 className="font-bold text-lg mb-3">Select Duration</h3>
                         <div className="flex overflow-x-auto space-x-2 pb-2">
                             {durations.map(d => ( <button key={d.value} onClick={() => setBookingData({...bookingData, duration: d.value})} className={`px-4 py-2 rounded-lg text-sm flex-shrink-0 ${bookingData.duration === d.value ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{d.label}</button>))}
                         </div>
                    </div>
                    
                    {/* Time Slot Selection */}
                    <div>
                         <h3 className="font-bold text-lg mb-3">Select Time Slot</h3>
                         <div className="grid grid-cols-3 gap-2 mb-4">
                             {Object.keys(timeSlots).map(period => ( <button key={period} onClick={() => setSelectedPeriod(period)} className={`p-3 rounded-lg text-sm ${selectedPeriod === period ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>{period}</button>))}
                         </div>
                         <div className="grid grid-cols-4 gap-2">
                            {timeSlots[selectedPeriod].map(slot => (
                                <button
                                    key={slot}
                                    onClick={() => setBookingData({...bookingData, timeSlot: slot})}
                                    disabled={isSlotDisabled(slot)}
                                    className={`p-3 rounded-lg text-sm transition-colors ${ isSlotDisabled(slot) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : (bookingData.timeSlot === slot ? 'bg-green-600 text-white' : 'bg-gray-200 hover:bg-gray-300') }`}
                                >{slot}</button>
                            ))}
                         </div>
                    </div>
                    
                    {/* Description */}
                     <div>
                         <h3 className="font-bold text-lg mb-3">Describe the work <span className="text-red-500">*</span></h3>
                         <textarea value={bookingData.workDescription} onChange={e => setBookingData({...bookingData, workDescription: e.target.value})} placeholder="e.g., I need help moving a large sofa..." className="w-full p-3 border rounded-lg bg-gray-50" rows="4" required></textarea>
                    </div>

                </div>
            </div>

            {/* Sticky Footer - Conditionally Rendered */}
            {!isAddressSelectorOpen && !isAddModalOpen && (
                <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                    <div className="max-w-4xl mx-auto flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-600">Total Price</p>
                            <p className="text-2xl font-bold text-green-600">₹{calculatePrice()}</p>
                        </div>
                        <button 
                            onClick={handleProceed} 
                            disabled={!bookingData.workDescription.trim() || !selectedAddress} 
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            )}
            
            <AddressSelectionModal
                isOpen={isAddressSelectorOpen}
                onClose={() => setIsAddressSelectorOpen(false)}
                addresses={addresses}
                onSelectAddress={setSelectedAddress}
                onAddNew={openAddAddressModal}
                // NEW: Add the onEdit prop, which closes the current modal
                // and calls the function from the App component.
                onEdit={(address) => {
                    setIsAddressSelectorOpen(false);
                    onEditAddress(address);
                }}
            />
        </>
    );
}
// --- Checkout Page (with Fixed Button) ---
function CheckoutPage({ setPage, bookingDetails, addOrder }) {
    if (!bookingDetails) {
        useEffect(() => setPage('home'), []);
        return null;
    }

    const [paymentMethod, setPaymentMethod] = useState('UPI');
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
        // Add padding-bottom to the main container to make space for the fixed button
        <div className="max-w-4xl mx-auto pb-32">
            <SubPageHeader title="Confirm & Pay" onBack={() => setPage('booking')} />
            
            {/* All main content goes inside this div */}
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-6">
                <div className="text-center">
                    <PaymentGraphic />
                    <h2 className="text-2xl font-bold mt-4">Complete Your Payment</h2>
                </div>
                {/* Booking Summary */}
                <div>
                    <h3 className="font-bold text-lg mb-3">Booking Summary</h3>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Service:</span><span className="font-semibold">{bookingDetails.service.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-semibold">{new Date(bookingDetails.date).toDateString()}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Time:</span><span className="font-semibold">{bookingDetails.timeSlot}</span></div>
                        <div className="flex justify-between items-start"><span className="text-gray-600 flex-shrink-0 mr-2">Address:</span><span className="font-semibold text-right">{fullAddressString}</span></div>
                    </div>
                </div>

                {/* Coupon & Payment Details */}
                 <div>
                    <h3 className="font-bold text-lg mb-3">Payment Details</h3>
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600">Base Price:</span><span>₹{price}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600">Discount:</span><span className="text-red-500">- ₹0</span></div>
                        <div className="flex justify-between font-bold text-base border-t pt-2 mt-2"><span className="text-gray-800">Total Amount:</span><span>₹{price}</span></div>
                    </div>
                 </div>

                {/* Payment Method */}
                <div>
                    <h3 className="font-bold text-lg mb-3">Select Payment Method</h3>
                    <div className="space-y-3">
                        <button onClick={() => setPaymentMethod('UPI')} className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 ${paymentMethod === 'UPI' ? 'border-green-500 bg-green-50' : ''}`}> <UpiIcon /> <span>UPI</span> </button>
                        <button onClick={() => setPaymentMethod('Card')} className={`w-full p-4 text-left border rounded-lg flex items-center space-x-4 ${paymentMethod === 'Card' ? 'border-green-500 bg-green-50' : ''}`}> <CardIcon /> <span>Credit/Debit Card</span> </button>
                    </div>
                </div>
                <p className="text-xs text-gray-500 text-center !mt-8">By proceeding, you agree to our Terms of Service.</p>
            </div>

            {/* --- FIXED FOOTER BUTTON --- */}
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-t-lg z-10">
                <div className="max-w-4xl mx-auto">
                    <button onClick={handlePayment} className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 text-lg">
                        Proceed to Pay ₹{price}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- Confirmation Page ---

function ConfirmationPage({ setPage, bookingDetails }) {

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

            <p className="text-gray-600 mb-8">Your request has been received. We will contact you shortly to finalize the details.</p>

            <div className="text-left bg-white p-6 rounded-lg shadow-md border border-gray-200">

                <h3 className="text-lg font-semibold mb-4 border-b pb-2">Order Summary (ID: {bookingDetails.id?.toString().substring(0, 8)})</h3>

                <div className="space-y-3">

                    <p><strong>Manpower Type:</strong> {bookingDetails.manpowerType}</p>

                    <p><strong>Subscription:</strong> {bookingDetails.subscriptionType}</p>

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

                    View All My Orders

                </button>

            </div>

        </div>

    );

}



// --- Orders Page ---

function OrdersPage({ setPage, currentPage }) {

    const [activeTab, setActiveTab] = useState('upcoming');

    const [upcomingOrders, setUpcomingOrders] = useState([]);

    const [pastOrders, setPastOrders] = useState([]);

    const [loading, setLoading] = useState(true);



    useEffect(() => {

        const fetchOrders = async () => {

            setLoading(true);

            const { data, error } = await supabase

                .from('orders') 

                .select('*')

                .order('date', { ascending: false }); 



            console.log("Data fetched from Supabase:", data); // For debugging



            if (error) {

                console.error("Error fetching orders:", error);

            } else if (data) {

                const today = new Date();

                today.setHours(0, 0, 0, 0);



                setUpcomingOrders(data.filter(order => new Date(order.date) >= today));

                setPastOrders(data.filter(order => new Date(order.date) < today));

            }

            setLoading(false);

        };

        

        if (currentPage === 'orders') {

            fetchOrders();

        }

    }, [currentPage]); 



    const OrderList = ({ orders, isUpcoming }) => {

        if (orders.length === 0) {

            return (

                <div className="text-center py-10 bg-white rounded-lg shadow mt-4">

                    <p className="text-gray-600 mb-4">No {isUpcoming ? 'upcoming' : 'past'} orders found.</p>

                    {isUpcoming && (

                        <button onClick={() => setPage('home')} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">

                            Book a Service

                        </button>

                    )}

                </div>

            );

        }

        return (

            <div className="space-y-4 mt-4">

                {orders.map(order => <OrderCard key={order.id} order={order} isUpcoming={isUpcoming} />)}

            </div>

        );

    };



    return (

        <div className="max-w-4xl mx-auto">

            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h2>

            <div className="flex border-b">

                <button 

                    onClick={() => setActiveTab('upcoming')}

                    className={`px-6 py-2 font-semibold ${activeTab === 'upcoming' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}

                >

                    Upcoming

                </button>

                <button 

                    onClick={() => setActiveTab('past')}

                    className={`px-6 py-2 font-semibold ${activeTab === 'past' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}

                >

                    Past

                </button>

            </div>

            {loading ? (

                <p className="text-center mt-8 text-gray-600">Loading your orders...</p>

            ) : (

                activeTab === 'upcoming' ? 

                <OrderList orders={upcomingOrders} isUpcoming={true} /> : 

                <OrderList orders={pastOrders} isUpcoming={false} />

            )}

        </div>

    );

}



// --- Order Card Component ---

const OrderCard = ({ order, isUpcoming }) => (

    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">

        <div className="flex justify-between items-start">

            <div>

                <h3 className="text-lg font-semibold text-green-700">{order.manpowerType} - {order.subscriptionType}</h3>

                <p className="text-sm text-gray-500">Order ID: {order.id?.toString().substring(0, 8)}</p>

            </div>

            <span className={`px-3 py-1 text-sm font-medium rounded-full ${

                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :

                order.status === 'Completed' ? 'bg-green-100 text-green-800' :

                'bg-gray-100 text-gray-800'

            }`}>

                {order.status}

            </span>

        </div>

        <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">

            <p className="flex items-center"><CalendarIcon /> <strong>Scheduled for:</strong> &nbsp;{new Date(order.date).toDateString()} at {order.timeSlot}</p>

            <p className="flex items-start"><LocationPinIcon /> <strong>Location:</strong> &nbsp;{order.address}</p>

        </div>

        {isUpcoming && <ServiceTracker status={order.trackingStatus} />}

    </div>

);



// --- Service Tracker Component ---

const ServiceTracker = ({ status }) => {

    const stages = ['Booked', 'Assigned', 'On the Way', 'Completed'];

    const currentStageIndex = stages.indexOf(status);



    return (

        <div className="mt-5">

            <div className="flex items-center">

                {stages.map((stage, index) => (

                    <React.Fragment key={stage}>

                        <div className="flex flex-col items-center">

                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStageIndex ? 'bg-green-600' : 'bg-gray-300'}`}>

                                {index < currentStageIndex ? (

                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>

                                ) : (

                                    <div className={`w-3 h-3 rounded-full ${index === currentStageIndex ? 'bg-white' : 'bg-gray-400'}`} />

                                )}

                            </div>

                            <p className={`text-xs mt-1 text-center ${index <= currentStageIndex ? 'font-semibold text-green-600' : 'text-gray-500'}`}>{stage}</p>

                        </div>

                        {index < stages.length - 1 && (

                            <div className={`flex-1 h-1 ${index < currentStageIndex ? 'bg-green-600' : 'bg-gray-300'}`} />

                        )}

                    </React.Fragment>

                ))}

            </div>

        </div>

    );

};





export default App;
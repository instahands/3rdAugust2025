// src/MainApp.tsx (FINAL VERSION WITH CORRECTED AUTH LOGIC)

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { User, Session } from '@supabase/supabase-js';

// --- Import ALL pages and components needed ---
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import AccountPage from './pages/AccountPage';
import BookingPage from './pages/BookingPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmationPage from './pages/ConfirmationPage';
import AuthPage from './pages/AuthPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ServiceDetailModal from './components/home/ServiceDetailModal';
import AddAddressModal from './components/account/AddAddressModal';
import { HomeIcon, ListIcon, AccountIcon } from './components/common/Icons';

// --- Type Definitions ---
interface Service { name: string; price: number; /* Add other service properties as needed */ }
interface Address { id: number; address_type: string; street_address: string; city: string; state: string; postal_code: string; phone_number: string; }

// --- Reusable BottomNavBar ---
const BottomNavBar = ({ setPage, currentPage }: { setPage: (page: string) => void, currentPage: string | null }) => {
    const navItems = [
        { name: 'home', icon: <HomeIcon />, label: 'Home' },
        { name: 'orders', icon: <ListIcon />, label: 'Orders' },
        { name: 'account', icon: <AccountIcon />, label: 'Account' },
    ];
    const isAccountSubPage = currentPage ? ['profileDetails', 'savedAddresses', 'paymentMethods', 'notifications', 'helpCenter'].includes(currentPage) : false;
    const isServiceSubPage = currentPage ? ['booking', 'checkout', 'confirmation'].includes(currentPage) : false;
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
            <div className="flex justify-around py-2">
                {navItems.map(item => (
                    <button key={item.name} onClick={() => setPage(item.name)} className={`flex-1 flex flex-col items-center p-2 transition-colors duration-200 ${(currentPage === item.name || (item.name === 'account' && isAccountSubPage) || (item.name === 'home' && isServiceSubPage)) ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}>
                        {item.icon}
                        <span className="text-xs mt-1">{item.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default function MainApp() {
    // --- TOP-LEVEL STATE MANAGEMENT ---
    const [page, setPage] = useState<string | null>(null); // Start as null for loading state
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    
    // Booking Flow State
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [dataVersion, setDataVersion] = useState(0);
    const refreshData = () => setDataVersion(v => v + 1);

    // --- CORRECTED AUTH & DATA FETCHING EFFECT ---
    useEffect(() => {
        const fetchOrders = async (userId: string) => {
            const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false });
            if (error) console.error('Error fetching orders:', error);
            else setOrders(data || []);
        };

        // This function contains the logic to decide which page to show
        const handleSession = (session: Session | null) => {
            const user = session?.user ?? null;
            setCurrentUser(user);

            if (user) {
                fetchOrders(user.id);
                // Check if a new user needs to set up their profile (name is missing)
                if (!user.user_metadata?.name) {
                    setPage('profileSetup');
                } else {
                    // If user is logged in and has a profile, go to the home page.
                    // This logic prevents needlessly navigating if the user refreshes on another page.
                    setPage(currentPage => (currentPage === 'auth' || currentPage === 'profileSetup' || currentPage === null ? 'home' : currentPage));
                }
            } else {
                // If there is no user session, show the authentication page
                setOrders([]);
                setPage('auth');
            }
        };

        // Call handleSession when the auth state changes in the future
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleSession(session);
        });

        // ALSO call handleSession right now to check the initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);
    
    useEffect(() => { window.scrollTo(0, 0); }, [page]);

    // --- HANDLER FUNCTIONS ---
    const handleLogout = async () => { await supabase.auth.signOut(); };
    const addOrder = async (newOrderData: any) => {
        if (!currentUser) return;
        const orderToInsert = { ...newOrderData, user_id: currentUser.id, status: 'Pending', trackingStatus: 'Booked' };
        const { data, error } = await supabase.from('orders').insert([orderToInsert]).select().single();
        if (error) {
            console.error("Error adding order:", error);
            alert("Sorry, there was an error booking your service.");
        } else {
            setOrders(prev => [data, ...prev]);
            setBookingDetails(data);
            setPage('confirmation');
        }
    };
    const viewServiceDetail = (service: Service) => {
        setSelectedService(service);
        setIsServiceDetailOpen(true);
    };
    const startBooking = (service: Service) => {
        setSelectedService(service);
        setIsServiceDetailOpen(false);
        setPage('booking');
    };
    const proceedToCheckout = (bookingData: any) => {
        setBookingDetails(bookingData);
        setPage('checkout');
    };
    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setIsAddModalOpen(true);
    };

    // --- RENDER LOGIC ---
    const renderPage = () => {
        switch (page) {
            case null:
                return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">Loading...</p></div>;
            case 'auth':
                return <AuthPage />;
            case 'profileSetup':
                return <ProfileSetupPage onProfileComplete={() => setPage('home')} />;
            case 'home':
                return <HomePage setPage={setPage} currentUser={currentUser} orders={orders} viewServiceDetail={viewServiceDetail} startBooking={startBooking} />;
            case 'booking': 
                return <BookingPage setPage={setPage} service={selectedService} proceedToCheckout={proceedToCheckout} goBack={() => setPage('home')} currentUser={currentUser} dataVersion={dataVersion} openAddAddressModal={() => setIsAddModalOpen(true)} onEditAddress={handleEditAddress} />;
            case 'checkout':
                return <CheckoutPage setPage={setPage} bookingDetails={bookingDetails} addOrder={addOrder} />;
            case 'confirmation':
                return <ConfirmationPage setPage={setPage} bookingDetails={bookingDetails} />;
            case 'orders':
                return <OrdersPage setPage={setPage} currentPage={page} />;
            case 'account':
                return <AccountPage setPage={setPage} currentUser={currentUser} handleLogout={handleLogout} />;
            default:
                return <AuthPage />;
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <div>{renderPage()}</div>
            {(page && page !== 'auth' && page !== 'profileSetup') && <BottomNavBar page={page} setPage={setPage} />}
            {isServiceDetailOpen && <ServiceDetailModal service={selectedService} onClose={() => setIsServiceDetailOpen(false)} startBooking={startBooking} />}
            <AddAddressModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingAddress(null); }} onSave={() => { refreshData(); setIsAddModalOpen(false); setEditingAddress(null); }} currentUser={currentUser} addressToEdit={editingAddress} />
        </div>
    );
}
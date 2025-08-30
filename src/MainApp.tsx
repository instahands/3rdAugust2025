// src/MainApp.tsx (CORRECTED)
import { useState, useEffect } from 'react';
import { supabase } from './shared/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import HomePage from './app/pages/HomePage';
import OrdersPage from './app/pages/OrdersPage';
import AccountPage from './app/pages/AccountPage';
import BookingPage from './app/pages/BookingPage';
import CheckoutPage from './app/pages/CheckoutPage';
import ConfirmationPage from './app/pages/ConfirmationPage';
import AuthPage from './app/pages/AuthPage';
import ProfileSetupPage from './app/pages/ProfileSetupPage';
import ServiceDetailModal from './app/components/home/ServiceDetailModal';
import AddAddressModal from './app/components/account/AddAddressModal';
import { HomeIcon, ListIcon, AccountIcon } from './app/components/common/Icons';
import { Address, Service } from './shared/types/types';

const BottomNavBar = ({ setPage, currentPage }: { setPage: (page: string) => void, currentPage: string | null }) => {
    const navItems = [
        { name: 'home', icon: <HomeIcon />, label: 'Home' },
        { name: 'orders', icon: <ListIcon />, label: 'Orders' },
        { name: 'account', icon: <AccountIcon />, label: 'Account' },
    ];
    const isAccountSubPage = currentPage ? ['profileDetails', 'savedAddresses', 'notifications', 'helpCenter', 'about', 'referral'].includes(currentPage) : false;
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
    const [page, setPage] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<any[]>([]);
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [dataVersion, setDataVersion] = useState(0);
    const refreshData = () => setDataVersion(v => v + 1);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('#ref=')) {
            const code = hash.split('=')[1];
            if (code) {
                localStorage.setItem('referral_code', code);
                console.log('Referral code captured:', code);
            }
        }
    }, []);

    useEffect(() => {
        const fetchOrders = async (userId: string) => {
            const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).order('date', { ascending: false });
            if (error) console.error('Error fetching orders:', error);
            else setOrders(data || []);
        };
        
        const checkLocationAndSetPage = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    () => {
                        setPage(currentPage => (currentPage === 'auth' || currentPage === 'profileSetup' || currentPage === null ? 'home' : currentPage));
                    },
                    () => {
                        setPage(currentPage => (currentPage === 'auth' || currentPage === 'profileSetup' || currentPage === null ? 'home' : currentPage));
                    }
                );
            } else {
                setPage(currentPage => (currentPage === 'auth' || currentPage === 'profileSetup' || currentPage === null ? 'home' : currentPage));
            }
        };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            setCurrentUser(user);
            if (user) {
                fetchOrders(user.id);
                if (!user.user_metadata?.name) {
                    setPage('profileSetup');
                } else {
                    checkLocationAndSetPage();
                }
            } else {
                setOrders([]);
                setPage('auth');
            }
        });
        return () => subscription.unsubscribe();
    }, []);
    
    useEffect(() => { window.scrollTo(0, 0); }, [page]);

    const handleLogout = async () => { await supabase.auth.signOut(); };

    // --- THIS FUNCTION HAS BEEN CORRECTED TO FIX THE DATABASE ERROR ---
   const addOrder = async (bookingInfo: any) => {
    if (!currentUser) return;

    // --- FINAL FIX ---
    // The error happens because bookingInfo.service can be null on a page refresh.
    // We now correctly get the service name from bookingDetails, which is reliable.
    const serviceName = bookingDetails?.service?.name || 'Unknown Service';

    const orderToInsert = {
        user_id: currentUser.id,
        address_id: bookingInfo.address.id,
        service_name: serviceName, // Use the safely retrieved service name
        date: bookingInfo.date,
        time_slot: bookingInfo.timeSlot,
        duration: bookingInfo.duration,
        work_description: bookingInfo.workDescription,
        price: bookingInfo.price, 
        status: 'Pending',
        tracking_status: 'Booked'
    };

    const { data, error } = await supabase.from('orders').insert([orderToInsert]).select().single();
    
    if (error) {
        console.error("DATABASE ERROR:", error);
        alert("Sorry, there was an error booking your service. Check the console for details.");
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

    const renderPage = () => {
        switch (page) {
            case null: return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">Loading...</p></div>;
            case 'auth': return <AuthPage />;
            case 'profileSetup': return <ProfileSetupPage onProfileComplete={() => setPage('home')} />;
            case 'home': return <HomePage setPage={setPage} currentUser={currentUser} orders={orders} viewServiceDetail={viewServiceDetail} startBooking={startBooking} />;
            case 'booking': return <BookingPage setPage={setPage} service={selectedService} proceedToCheckout={proceedToCheckout} goBack={() => setPage('home')} currentUser={currentUser} dataVersion={dataVersion} openAddAddressModal={() => setIsAddModalOpen(true)} onEditAddress={handleEditAddress} />;
            case 'checkout': return <CheckoutPage setPage={setPage} bookingDetails={bookingDetails} addOrder={addOrder} userInfo={currentUser?.user_metadata} />;
            case 'confirmation': return <ConfirmationPage setPage={setPage} bookingDetails={bookingDetails} />;
            case 'orders': return <OrdersPage setPage={setPage} currentPage={page} />;
            case 'account': return <AccountPage setPage={setPage} currentUser={currentUser} handleLogout={handleLogout} />;
            default: return <AuthPage />;
        }
    };
    
    return (
        <div className="bg-gray-50 min-h-screen">
            <div>{renderPage()}</div>
            {(page && page !== 'auth' && page !== 'profileSetup') && <BottomNavBar setPage={setPage} currentPage={page} />}
            {isServiceDetailOpen && <ServiceDetailModal service={selectedService} onClose={() => setIsServiceDetailOpen(false)} startBooking={startBooking} />}
            <AddAddressModal isOpen={isAddModalOpen} onClose={() => { setIsAddModalOpen(false); setEditingAddress(null); }} onSave={() => { refreshData(); setIsAddModalOpen(false); setEditingAddress(null); }} currentUser={currentUser} addressToEdit={editingAddress} />
        </div>
    );
}
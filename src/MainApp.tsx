// src/MainApp.tsx (FINAL, CORRECTED)
import { useState, useEffect, useCallback } from 'react';
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
import { Address, Service, Order } from './shared/types/types';
import OrderStatusPage from './app/pages/OrderStatusPage';

const BottomNavBar = ({ setPage, currentPage }: { setPage: (page: string) => void, currentPage: string | null }) => {
    const navItems = [
        { name: 'home', icon: <HomeIcon />, label: 'Home' },
        { name: 'orders', icon: <ListIcon />, label: 'Orders' },
        { name: 'account', icon: <AccountIcon />, label: 'Account' },
    ];
    const isAccountSubPage = currentPage ? ['profileDetails', 'savedAddresses', 'notifications', 'helpCenter', 'about', 'referral'].includes(currentPage) : false;
    const isServiceSubPage = currentPage ? ['booking', 'checkout', 'confirmation', 'orderStatus'].includes(currentPage) : false;
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-40">
            <div className="flex justify-around py-2">
                {navItems.map(item => (
                    <button key={item.name} onClick={() => setPage(item.name)} className={`flex-1 flex flex-col items-center p-2 transition-colors duration-200 ${(currentPage === item.name || (item.name === 'account' && isAccountSubPage) || (item.name === 'home' && !isServiceSubPage) || (item.name === 'orders' && isServiceSubPage)) ? 'text-green-600' : 'text-gray-500 hover:text-green-500'}`}>
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
    const [orders, setOrders] = useState<Order[]>([]);
    const [bookingDetails, setBookingDetails] = useState<any>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [isServiceDetailOpen, setIsServiceDetailOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [dataVersion, setDataVersion] = useState(0);
    const refreshData = () => setDataVersion(v => v + 1);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);

    const fetchOrders = useCallback(async (userId: string) => {
        const { data, error } = await supabase.from('orders').select('*, address:addresses!address_id(*), worker:profiles!worker_id(name, phone)').eq('user_id', userId).order('date', { ascending: false });
        if (error) {
            console.error('Error fetching orders:', error);
        } else {
            setOrders(data || []);
        }
    }, []);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('#ref=')) {
            const code = hash.split('=')[1];
            if (code) {
                localStorage.setItem('referral_code', code);
            }
        }
    }, []);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            setCurrentUser(user);
            if (user) {
                fetchOrders(user.id);
                if (!user.user_metadata?.name) {
                    setPage('profileSetup');
                } else {
                    setPage(currentPage => (currentPage === 'auth' || currentPage === 'profileSetup' || currentPage === null ? 'home' : currentPage));
                }
            } else {
                setOrders([]);
                setPage('auth');
            }
        });
        return () => subscription.unsubscribe();
    }, [fetchOrders]);
    
    useEffect(() => {
        if (!currentUser) return;
        const ordersSubscription = supabase.channel(`public:orders:user-${currentUser.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => { fetchOrders(currentUser.id); }).subscribe();
        return () => { supabase.removeChannel(ordersSubscription); };
    }, [currentUser, fetchOrders]);

    useEffect(() => {
        if (page === 'orderStatus' && activeOrder) {
            const updatedActiveOrder = orders.find(o => o.id === activeOrder.id);
            if (updatedActiveOrder && JSON.stringify(updatedActiveOrder) !== JSON.stringify(activeOrder)) {
                setActiveOrder(updatedActiveOrder);
            }
        }
    }, [orders, activeOrder, page]);
    
    useEffect(() => { window.scrollTo(0, 0); }, [page]);

    const handleLogout = async () => { await supabase.auth.signOut(); };

    const addOrder = async () => {
        if (!currentUser || !bookingDetails) {
            alert("Session expired or booking details are missing.");
            setPage('home');
            return;
        }
        const { service, address, frequency, duration, date, timeSlot, workDescription } = bookingDetails;
        if (!service || !address) {
            alert("Service or address information is missing.");
            setPage('booking');
            return;
        }
        const basePrice = (duration / 60) * (service.price || 0);
        let finalPrice = basePrice;
        if (frequency === 'weekly') finalPrice *= 0.9;
        if (frequency === 'monthly') finalPrice *= 0.85;

        const orderToInsert = { user_id: currentUser.id, address_id: address.id, service_name: service.name, date, time_slot: timeSlot, duration, work_description: workDescription, price: finalPrice, status: 'Pending', tracking_status: 'Booked' };
        const { data, error } = await supabase.from('orders').insert([orderToInsert]).select().single();

        if (error) {
            console.error("DATABASE ERROR:", error);
            alert("Sorry, there was an error booking your service.");
        } else {
            setBookingDetails({ ...data, address, service });
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

    // --- THIS IS THE FIX ---
    // This function now saves new addresses before proceeding.
    const proceedToCheckout = async (bookingData: any) => {
        if (bookingData.address && !bookingData.address.created_at && currentUser) {
            const newAddressToSave = {
                user_id: currentUser.id,
                address_type: bookingData.address.address_type,
                street_address: bookingData.address.street_address,
                city: bookingData.address.city,
                state: bookingData.address.state,
                postal_code: bookingData.address.postal_code,
                phone_number: bookingData.address.phone_number,
            };

            const { data: savedAddress, error } = await supabase
                .from('addresses')
                .insert(newAddressToSave)
                .select()
                .single();

            if (error) {
                alert("Could not save the new address. Please try again.");
                return;
            }
            bookingData.address = savedAddress;
            refreshData();
        }

        setBookingDetails(bookingData);
        setPage('checkout');
    };

    const handleEditAddress = (address: Address) => {
        setEditingAddress(address);
        setIsAddModalOpen(true);
    };

    const viewOrderStatus = (order: Order) => {
        setActiveOrder(order);
        setPage('orderStatus');
    };

    const renderPage = () => {
        if (page === null) {
            return <div className="flex items-center justify-center h-screen"><p className="text-gray-500">Initializing...</p></div>;
        }

        switch (page) {
            case 'auth': return <AuthPage />;
            case 'profileSetup': return <ProfileSetupPage onProfileComplete={() => setPage('home')} />;
            case 'home': return <HomePage setPage={setPage} currentUser={currentUser} orders={orders} viewServiceDetail={viewServiceDetail} startBooking={startBooking} />;
            case 'booking': return <BookingPage setPage={setPage} service={selectedService} proceedToCheckout={proceedToCheckout} goBack={() => setPage('home')} currentUser={currentUser} dataVersion={dataVersion} openAddAddressModal={() => setIsAddModalOpen(true)} onEditAddress={handleEditAddress} />;
            case 'checkout': return <CheckoutPage setPage={setPage} bookingDetails={bookingDetails} addOrder={addOrder} userInfo={currentUser?.user_metadata} />;
            case 'confirmation': return <ConfirmationPage setPage={setPage} bookingDetails={bookingDetails} />;
            case 'orders': return <OrdersPage setPage={setPage} orders={orders} viewOrderStatus={viewOrderStatus} />;
            case 'orderStatus': return <OrderStatusPage setPage={setPage} order={activeOrder} />;
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
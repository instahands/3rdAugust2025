// src/admin/AdminPanel.tsx (CORRECTED)

import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import WorkerManagementPage from './pages/WorkerManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import AddressManagementPage from './pages/AddressManagementPage';
import SettingsPage from './pages/SettingsPage';
import { DataItem, Notification, Profile, Banner } from '../shared/types/types';
import { supabase } from '../shared/lib/supabaseClient';
import Modal from './components/shared/Modal';
import FormComponent from './components/shared/FormComponent';
import BannerManagementPage from './pages/BannerManagementPage';
import { useAdminData } from './hooks/useAdminData';

export const AdminPanel = () => {
    const [activePage, setActivePage] = useState('Dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isDarkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const { users, orders, addresses, banners, loading, refetchData } = useAdminData();
    const workers = users.filter(u => u.role === 'worker');

    // --- TEMPORARY DEBUG LOGS (remove after debugging) ---
    console.log('USERS', users);
    console.log('WORKERS', workers);

    const [isModalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<{ title: string; data: DataItem | Partial<DataItem> | null; type: string }>({ title: '', data: null, type: '' });

    useEffect(() => {
        const ordersChannel = supabase.channel('public:orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' },
            (payload) => {
                const newOrder = payload.new;
                setNotifications(prev => [{
                    id: `order-${newOrder.id}`,
                    // --- FIX #1: Use 'service_name' instead of 'manpowerType' ---
                    message: `New order for ${newOrder.service_name}.`,
                    type: 'order', timestamp: new Date(), isRead: false,
                }, ...prev]);
                refetchData();
            }
            ).subscribe();
            
        const profilesChannel = supabase.channel('public:profiles')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' },
            (payload) => {
                const newUser = payload.new as Profile;
                if (newUser.role === 'worker' && newUser.worker_status === 'pending') {
                    setNotifications(prev => [{
                        id: `user-${newUser.id}`,
                        message: `New worker registration: ${newUser.name || newUser.email}.`,
                        type: 'user', timestamp: new Date(), isRead: false,
                    }, ...prev]);
                }
                refetchData();
            }
            ).subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(profilesChannel);
        };
    }, [refetchData]);

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/app';
    };
    
    const handleAdd = (type: string, emptyState: Partial<DataItem>) => {
        setModalContent({ title: `Add New ${type}`, data: emptyState, type });
        setModalOpen(true);
    };
    
    const handleEdit = (type: string, item: DataItem) => {
        setModalContent({ title: `Edit ${type}`, data: item, type });
        setModalOpen(true);
    };

    const handleDelete = async (type: string, id: string | number) => {
        const tableName = type === 'User' || type === 'Worker' ? 'profiles' : type === 'Order' ? 'orders' : type === 'Banner' ? 'banners' : 'addresses';
        if (window.confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
            const { error } = await supabase.from(tableName).delete().eq('id', id);
            if (error) {
                alert(`Error deleting ${type}: ${error.message}`);
            } else {
                refetchData();
            }
        }
    };
    
    const handleSave = async (formData: Partial<DataItem>) => {
        const isNewWorker = modalContent.title === 'Add New Worker';

        if (isNewWorker) {
            try {
                const { name, email, password } = formData as any;
                if (!name || !email || !password) {
                    throw new Error("Name, email, and password are required.");
                }

                const { data, error } = await supabase.functions.invoke('create-worker', {
                    body: { name, email, password },
                });

                if (error) throw error;
                console.log(data);

            } catch (error: any) {
                console.error("Failed to create worker:", error.message);
                alert(`Error creating worker: ${error.message}`);
            }
        } else {
            const isEditing = modalContent.data && 'id' in modalContent.data && modalContent.data.id;
            const tableName = modalContent.type === 'User' || modalContent.type === 'Worker' ? 'profiles' : modalContent.type === 'Order' ? 'orders' : modalContent.type === 'Banner' ? 'banners' : 'addresses';
            
            let response;
            if (isEditing) {
                const { id, ...updateData } = formData;
                response = await supabase.from(tableName).update(updateData).eq('id', id).select().single();
            } else {
                response = await supabase.from(tableName).insert(formData).select().single();
            }

            if (response.error) {
                alert(`Error saving ${modalContent.type}: ${response.error.message}`);
            }
        }

        refetchData();
        setModalOpen(false);
    };

    const handleApproveWorker = async (workerId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ worker_status: 'approved' })
            .eq('id', workerId);
        if (error) console.error("Error approving worker:", error);
        else refetchData();
    };

    const handleRejectWorker = async (workerId: string) => {
        const { error } = await supabase
            .from('profiles')
            .update({ worker_status: 'rejected' })
            .eq('id', workerId);
        if (error) console.error("Error rejecting worker:", error);
        else refetchData();
    };

    const renderPage = () => {
        if (loading && !users.length) {
            return <div className="flex items-center justify-center h-full"><p className="text-gray-500 dark:text-gray-400">Loading data...</p></div>;
        }
        
        switch (activePage) {
            case 'Dashboard':
                return <DashboardPage />;
            case 'User Management':
                return <UserManagementPage
                    users={users.filter(u => u.role !== 'worker')}
                    onAdd={() => handleAdd('User', { name: '', email: '', role: 'user' })}
                    onEdit={(user) => handleEdit('User', user)}
                    onDelete={(id) => handleDelete('User', id)}
                />;
            case 'Worker Management':
                return <WorkerManagementPage
                    workers={workers}
                    onAdd={() => handleAdd('Worker', { name: '', email: '', password: '', role: 'worker', worker_status: 'approved' })}
                    onEdit={(worker) => handleEdit('Worker', worker)}
                    onDelete={(id) => handleDelete('Worker', id)}
                    onApprove={handleApproveWorker}
                    onReject={handleRejectWorker}
                />;
            case 'Order Management':
                return <OrderManagementPage
                    orders={orders}
                    // --- FIX #2: Use 'service_name' instead of 'manpowerType' ---
                    onAdd={() => handleAdd('Order', { service_name: 'New Service', status: 'Pending', date: new Date().toISOString() })}
                    onEdit={(order) => handleEdit('Order', order)}
                    onDelete={(id) => handleDelete('Order', id)}
                />;
            case 'Address Management':
                return <AddressManagementPage
                    addresses={addresses}
                    onAdd={() => handleAdd('Address', { address_type: 'Home', street_address: '', city: '' })}
                    onEdit={(address) => handleEdit('Address', address)}
                    onDelete={(id) => handleDelete('Address', id)}
                />;
            case 'Banner Management':
                return <BannerManagementPage
                    banners={banners}
                    refetchData={refetchData}
                />;
            case 'Settings':
                return <SettingsPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 font-sans ${isDarkMode ? 'dark' : ''}`}>
            <Sidebar isSidebarOpen={isSidebarOpen} activePage={activePage} setActivePage={setActivePage} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    isSidebarOpen={isSidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    isDarkMode={isDarkMode} 
                    setDarkMode={setDarkMode} 
                    onLogout={handleLogout}
                    notifications={notifications}
                    markAsRead={markAsRead}
                />
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">{renderPage()}</main>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
                {modalContent.data && <FormComponent 
                    item={modalContent.data} 
                    onSave={handleSave} 
                    onCancel={() => setModalOpen(false)}
                    isNewWorker={modalContent.title === 'Add New Worker'}
                />}
            </Modal>
        </div>
    );
};
// src/admin/AdminPanel.tsx

import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import AddressManagementPage from './pages/AddressManagementPage';
import SettingsPage from './pages/SettingsPage';
// CORRECTED: Removed unused Profile and Address imports
import { DataItem } from '../shared/types/types';
import { supabase } from '../shared/lib/supabaseClient';
import Modal from './components/shared/Modal';
import FormComponent from './components/shared/FormComponent';
import { useAdminData } from './hooks/useAdminData';
import { User } from '@supabase/supabase-js';

const AdminPanel = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const { users, orders, addresses, loading, removeUserFromState } = useAdminData();

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; data: DataItem | Partial<DataItem> | null; type: string }>({ title: '', data: null, type: '' });

  useEffect(() => {
    const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setCurrentUser(session?.user ?? null);
    };
    checkSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setCurrentUser(session?.user ?? null);
    });
    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []);

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
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      const tableName = type === 'User' ? 'profiles' : type === 'Order' ? 'orders' : 'addresses';
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) {
        alert(`Error deleting ${type}: ${error.message}`);
      } else {
        if (type === 'User') removeUserFromState(id);
        // You can add logic to refetch or update state for other types here
      }
    }
  };
  
  const handleSave = async (formData: Partial<DataItem>) => {
    console.log("Saving:", formData);
    setModalOpen(false);
  };

  const renderPage = () => {
    if (!currentUser) {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-bold">You are not logged in.</h2>
                <p className="mt-2">Please log in through the main app to access the admin panel.</p>
                <a href="/app" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded-lg">Go to Login</a>
            </div>
        );
    }
    if (loading) {
        return <div className="flex items-center justify-center h-full"><p className="text-gray-500 dark:text-gray-400">Loading data...</p></div>;
    }
    
    switch (activePage) {
      case 'Dashboard':
        return <DashboardPage />;
      case 'User Management':
        return <UserManagementPage
          users={users}
          onAdd={() => handleAdd('User', { name: '', email: '', role: 'user' })}
          onEdit={(user) => handleEdit('User', user)}
          onDelete={(id) => handleDelete('User', id)}
        />;
      case 'Order Management':
        return <OrderManagementPage
            orders={orders}
            onAdd={() => handleAdd('Order', { manpowerType: '', status: 'Pending', date: new Date().toISOString() })}
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
        <Header isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} isDarkMode={isDarkMode} setDarkMode={setDarkMode} onLogout={handleLogout} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">{renderPage()}</main>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
          {modalContent.data && <FormComponent item={modalContent.data} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
      </Modal>
    </div>
  );
};

export default AdminPanel;

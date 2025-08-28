// src/admin/AdminPanel.tsx

import { useState, useEffect } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import DashboardPage from './pages/DashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import OrderManagementPage from './pages/OrderManagementPage';
import SettingsPage from './pages/SettingsPage';
import { Profile, DataItem } from '../shared/types/types';
import { supabase } from '../shared/lib/supabaseClient';
import Modal from './components/shared/Modal';
import FormComponent from './components/shared/FormComponent';
import { useAdminData } from './hooks/useAdminData';
import { User } from '@supabase/supabase-js'; // User type import karein

const AdminPanel = () => {
  const [activePage, setActivePage] = useState('Dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);
  
  // YEH NAYA STATE HAI LOGIN CHECK KARNE KE LIYE
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const { users, orders, loading, addUserToState, updateUserInState, removeUserFromState } = useAdminData();

  const [isModalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; data: DataItem | Partial<DataItem> | null; type: string }>({ title: '', data: null, type: '' });

  // YEH NAYA useEffect HAI JO SIRF LOGIN SESSION CHECK KAREGA
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
    // Logout ke baad app par redirect karein
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
      const tableName = type === 'User' ? 'profiles' : 'orders';
      const { error } = await supabase.from(tableName).delete().eq('id', id);

      if (error) {
        alert(`Error deleting ${type}: ${error.message}`);
      } else {
        if (type === 'User') {
          removeUserFromState(id);
        } 
      }
    }
  };
  
  const handleSave = async (formData: Partial<DataItem>) => {
    const isEditing = modalContent.data && 'id' in modalContent.data && modalContent.data.id;
    const tableName = modalContent.type === 'User' ? 'profiles' : 'orders';
    
    let response;
    if (isEditing) {
        const { id, ...updateData } = formData;
        response = await supabase.from(tableName).update(updateData).eq('id', id).select().single();
    } else {
        response = await supabase.from(tableName).insert(formData).select().single();
    }

    if (response.error) {
        alert(`Error saving ${modalContent.type}: ${response.error.message}`);
    } else if (response.data) {
        if (modalContent.type === 'User') {
            isEditing ? updateUserInState(response.data as Profile) : addUserToState(response.data as Profile);
        }
        setModalOpen(false);
    }
  };

  const renderPage = () => {
    // Agar user logged in nahi hai, toh use login karne ko kahein
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
      case 'Settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 font-sans ${isDarkMode ? 'dark' : ''}`}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isDarkMode={isDarkMode}
          setDarkMode={setDarkMode}
          onLogout={handleLogout}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          {renderPage()}
        </main>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title={modalContent.title}>
          {modalContent.data && <FormComponent item={modalContent.data} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
      </Modal>
    </div>
  );
};

export default AdminPanel;

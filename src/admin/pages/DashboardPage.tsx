// src/admin/pages/DashboardPage.tsx

import { Users, Briefcase, Wrench, BookOpen } from 'lucide-react';
import StatCard from '../components/shared/StatCard';
import { useAdminData } from '../hooks/useAdminData'; // Import the hook to get data

const DashboardPage = () => {
    // Use the hook to get the live data and loading state
    const { users, orders, loading } = useAdminData();

    // While the data is being fetched, show a loading message
    if (loading) {
        return (
            <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
                <p className="mt-4 text-gray-500">Loading live data from Supabase...</p>
            </div>
        );
    }

    // Once data is loaded, calculate the stats
    const totalUsers = users.length;
    const pendingBookings = orders.filter(order => order.status === 'Pending').length;
    const completedServices = orders.filter(order => order.status === 'Completed').length;
    // We'll count users with the 'worker' role as active workers
    const activeWorkers = users.filter(user => user.role === 'worker').length;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard 
                    icon={<Users />} 
                    title="Total Users" 
                    value={totalUsers.toString()} // Display real user count
                    change="" // You can add logic for this later
                    color="text-blue-500" 
                 />
                 <StatCard 
                    icon={<Briefcase />} 
                    title="Active Workers" 
                    value={activeWorkers.toString()} // Display real worker count
                    change="" 
                    color="text-green-500" 
                 />
                 <StatCard 
                    icon={<Wrench />} 
                    title="Services Completed" 
                    value={completedServices.toString()} // Display real completed count
                    change="" 
                    color="text-purple-500" 
                 />
                 <StatCard 
                    icon={<BookOpen />} 
                    title="Pending Bookings" 
                    value={pendingBookings.toString()} // Display real pending count
                    change="" 
                    color="text-yellow-500" 
                 />
            </div>
            {/* You can add charts here later that also use the live 'users' and 'orders' data */}
        </div>
    );
};

export default DashboardPage;

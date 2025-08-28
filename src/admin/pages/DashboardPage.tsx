// src/admin/pages/DashboardPage.tsx

import { Users, Briefcase, Wrench, BookOpen } from 'lucide-react';
import StatCard from '../components/shared/StatCard';

const DashboardPage = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                 <StatCard icon={<Users />} title="Total Users" value="5,480" change="+15% this month" color="text-blue-500" />
                 <StatCard icon={<Briefcase />} title="Active Workers" value="125" change="+12 this month" color="text-green-500" />
                 <StatCard icon={<Wrench />} title="Services Completed" value="8,950" change="+450 this month" color="text-purple-500" />
                 <StatCard icon={<BookOpen />} title="Pending Bookings" value="12" change="+3 today" color="text-yellow-500" />
            </div>
            {/* You can add your chart components back here when ready */}
        </div>
    );
};

export default DashboardPage;

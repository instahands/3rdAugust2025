// src/admin/components/layout/Sidebar.tsx

import { Users, Briefcase, Wrench, Settings, BookOpen, BarChart2, Tag, FileText, Globe, MapPin } from 'lucide-react'; // Added MapPin icon
import NavItem from './NavItem';

interface SidebarProps {
    isSidebarOpen: boolean;
    activePage: string;
    setActivePage: (page: string) => void;
}

const Sidebar = ({ isSidebarOpen, activePage, setActivePage }: SidebarProps) => {
    return (
        <aside className={`bg-gray-800 dark:bg-gray-900 text-white flex flex-col transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-center h-20 border-b border-gray-700">
                <Wrench size={30} className="text-blue-400" />
                <h1 className={`text-2xl font-bold ml-2 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>ServicePanel</h1>
            </div>
            <nav className="flex-1 px-4 py-4 overflow-y-auto">
                <ul>
                    <NavItem icon={<BarChart2 size={20} />} text="Dashboard" active={activePage === 'Dashboard'} onClick={() => setActivePage('Dashboard')} isSidebarOpen={isSidebarOpen} />
                    <NavItem icon={<Briefcase size={20} />} text="Management" isSidebarOpen={isSidebarOpen}>
                        <NavItem icon={<Users size={16} />} text="Users" active={activePage === 'User Management'} onClick={() => setActivePage('User Management')} isSidebarOpen={isSidebarOpen} />
                        <NavItem icon={<BookOpen size={16} />} text="Orders" active={activePage === 'Order Management'} onClick={() => setActivePage('Order Management')} isSidebarOpen={isSidebarOpen} />
                        {/* ADDED: New NavItem for Addresses */}
                        <NavItem icon={<MapPin size={16} />} text="Addresses" active={activePage === 'Address Management'} onClick={() => setActivePage('Address Management')} isSidebarOpen={isSidebarOpen} />
                    </NavItem>
                     <NavItem icon={<Globe size={20} />} text="Marketing" isSidebarOpen={isSidebarOpen}>
                        <NavItem icon={<Tag size={16} />} text="Coupons" active={activePage === 'Coupon Management'} onClick={() => setActivePage('Coupon Management')} isSidebarOpen={isSidebarOpen} />
                        <NavItem icon={<FileText size={16} />} text="Banners" active={activePage === 'Banner Management'} onClick={() => setActivePage('Banner Management')} isSidebarOpen={isSidebarOpen} />
                    </NavItem>
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700">
                <NavItem icon={<Settings size={20} />} text="Settings" active={activePage === 'Settings'} onClick={() => setActivePage('Settings')} isSidebarOpen={isSidebarOpen} />
            </div>
        </aside>
    );
};

export default Sidebar;

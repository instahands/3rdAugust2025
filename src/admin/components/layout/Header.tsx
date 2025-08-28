// src/admin/components/layout/Header.tsx

import { Menu, Sun, Moon, Bell, LogOut } from 'lucide-react';

interface HeaderProps {
    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
    isDarkMode: boolean;
    setDarkMode: (isDark: boolean) => void;
    onLogout: () => void;
}

const Header = ({ setSidebarOpen, isSidebarOpen, isDarkMode, setDarkMode, onLogout }: HeaderProps) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md h-20 flex items-center justify-between px-6 flex-shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="text-gray-600 dark:text-gray-300">
                    <Menu size={24} />
                </button>
            </div>
            <div className="flex items-center gap-6">
                <button onClick={() => setDarkMode(!isDarkMode)} className="text-gray-600 dark:text-gray-300">
                    {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
                </button>
                <button 
                    onClick={() => alert("Notifications feature coming soon!")} 
                    className="relative text-gray-600 dark:text-gray-300"
                >
                    <Bell size={22} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">5</span>
                </button>
                <div className="flex items-center gap-3">
                    <img src="https://placehold.co/40x40/93C5FD/1E40AF?text=A" alt="Admin" className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="font-semibold text-sm text-gray-800 dark:text-white">Admin</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Super Admin</p>
                    </div>
                    <button 
                        onClick={onLogout} 
                        className="ml-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400" 
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;

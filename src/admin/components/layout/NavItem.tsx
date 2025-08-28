import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NavItemProps {
    icon: React.ReactElement;
    text: string;
    isSidebarOpen: boolean;
    active?: boolean;
    onClick?: () => void;
    children?: React.ReactNode;
}

const NavItem = ({ icon, text, active, onClick, children, isSidebarOpen }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = children && React.Children.count(children) > 0;
    const isChildActive = hasChildren && React.Children.toArray(children).some(child => (child as React.ReactElement<any>).props.active);

    return (
        <li>
            <a href="#" onClick={(e) => { e.preventDefault(); hasChildren ? setIsOpen(!isOpen) : onClick && onClick(); }} className={`flex items-center justify-between p-3 my-1 rounded-lg transition-colors ${active || isChildActive ? 'bg-blue-500 text-white shadow-lg' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}>
                <div className="flex items-center">
                    {icon}
                    <span className={`ml-3 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}>{text}</span>
                </div>
                {hasChildren && isSidebarOpen && (isOpen || isChildActive ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
            </a>
            {hasChildren && (isOpen || isChildActive) && isSidebarOpen && (
                <ul className="pl-8 mt-1 space-y-1">
                    {children}
                </ul>
            )}
        </li>
    );
};

export default NavItem;
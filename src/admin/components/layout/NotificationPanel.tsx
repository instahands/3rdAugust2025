// src/admin/components/layout/NotificationPanel.tsx

import { Notification } from '../../../shared/types/types';
import { Bell, UserPlus, ShoppingCart } from 'lucide-react';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  markAsRead: (id: string) => void;
}

const NotificationPanel = ({ notifications, markAsRead }: NotificationPanelProps) => {
  
  // Helper function to display time like "2 minutes ago"
  const timeSince = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="absolute top-20 right-6 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
              onClick={() => markAsRead(notif.id)}
            >
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                {notif.type === 'order' ? <ShoppingCart className="h-5 w-5 text-green-500" /> : <UserPlus className="h-5 w-5 text-blue-500" />}
              </div>
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">{timeSince(notif.timestamp)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Bell className="mx-auto h-10 w-10" />
            <p className="mt-2">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;

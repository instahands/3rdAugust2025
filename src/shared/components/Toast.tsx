import { useNotification } from '../context/NotificationContext';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = () => {
    const { toasts, removeToast } = useNotification();

    const getIcon = (type: string) => {
        switch (type) {
            case 'success':
                return <CheckCircle size={20} className="text-green-600" />;
            case 'error':
                return <AlertCircle size={20} className="text-red-600" />;
            case 'warning':
                return <AlertTriangle size={20} className="text-yellow-600" />;
            case 'info':
            default:
                return <Info size={20} className="text-blue-600" />;
        }
    };

    const getBackgroundColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            case 'info':
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
        }
    };

    const getTextColor = (type: string) => {
        switch (type) {
            case 'success':
                return 'text-green-800 dark:text-green-300';
            case 'error':
                return 'text-red-800 dark:text-red-300';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-300';
            case 'info':
            default:
                return 'text-blue-800 dark:text-blue-300';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto animate-slide-in-right ${getBackgroundColor(
                        toast.type
                    )} ${getTextColor(toast.type)}`}
                >
                    {getIcon(toast.type)}
                    <div className="flex-1">
                        <p className="text-sm font-medium">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:opacity-70 transition-opacity"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}

            <style>{`
                @keyframes slide-in-right {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                .animate-slide-in-right {
                    animation: slide-in-right 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Toast;

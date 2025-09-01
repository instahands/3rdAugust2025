// src/app/pages/OrderStatusPage.tsx (NEW FILE)

import { Order } from '../../shared/types/types';
import SubPageHeader from '../components/common/SubPageHeader';
import { PhoneIcon, UserCircleIcon } from '../components/common/Icons';

const ServiceTracker = ({ status }: { status: string }) => {
    const stages = ['Booked', 'Assigned', 'On the Way', 'Completed'];
    const currentStageIndex = stages.indexOf(status);
    return (
        <div className="my-6">
            <div className="flex items-center">
                {stages.map((stage, index) => (
                    <div key={stage} className={`flex-1 flex flex-col items-center ${index > 0 ? 'relative' : ''}`}>
                        {index > 0 && <div className={`absolute w-full h-1 top-4 right-1/2 ${index <= currentStageIndex ? 'bg-green-600' : 'bg-gray-300'}`} />}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${index <= currentStageIndex ? 'bg-green-600' : 'bg-gray-300'}`}>
                            {index < currentStageIndex && <span className="text-white">✔</span>}
                        </div>
                        <p className={`text-xs mt-2 text-center ${index <= currentStageIndex ? 'font-semibold text-green-600' : 'text-gray-500'}`}>{stage}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function OrderStatusPage({ setPage, order }: { setPage: (page: string) => void, order: Order | null }) {
    if (!order) {
        return <div>Order not found. <button onClick={() => setPage('orders')} className="text-green-600">Go Back</button></div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-32">
            <SubPageHeader title={`Order #${order.id.toString().substring(0, 8)}`} onBack={() => setPage('orders')} />
            
            <ServiceTracker status={order.tracking_status} />

            <div className="bg-white p-6 rounded-xl shadow-lg space-y-6 mt-6">
                
                <div className="text-center bg-green-50 p-6 rounded-lg border-2 border-dashed border-green-300">
                    <h3 className="font-bold text-lg mb-2 text-gray-700">Your One-Time Password (OTP)</h3>
                    <p className="text-gray-600 text-sm">Share this code with the worker to start and complete the job.</p>
                    <div className="my-4 text-5xl font-bold tracking-widest text-green-600">
                        <span>{order.otp || '----'}</span>
                    </div>
                    <p className="text-xs text-gray-500">Do not share this OTP with anyone else.</p>
                </div>

                {order.worker_id && (
                    <div>
                        <h3 className="font-bold text-lg mb-3">Assigned Worker Details</h3>
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-4">
                            <UserCircleIcon className="h-12 w-12 text-gray-400" />
                            <div>
                                <p className="font-semibold">{order.worker?.name || 'InstaHands Professional'}</p>
                                <a href={`tel:${order.worker?.phone}`} className="text-sm text-green-600 flex items-center">
                                    <PhoneIcon className="h-4 w-4 mr-1" />
                                    {order.worker?.phone || 'Contact not available'}
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
import { Order } from '../../shared/types/types';
import SubPageHeader from '../components/common/SubPageHeader';
import { PhoneIcon, UserCircleIcon } from '../components/common/Icons';
import { Timer } from '../../worker/components/details/Timer'; 
// --- THIS IS THE FIX: The import path has been corrected ---
import WorkerMapTracker from '../components/orders/WorkerMapTracker'; 
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
}

export default function OrderStatusPage({ setPage, order }: { setPage: (page: string) => void, order: Order | null }) {
    if (!order) {
        return (
            <div>
                <SubPageHeader title="Order Status" onBack={() => setPage('orders')} />
                <p className="text-center mt-8">Order not found.</p>
            </div>
        );
    }
    
    const otpDetails = (() => {
        if (order.tracking_status === 'Assigned') return { title: 'OTP to Start Work', description: 'Share this with the worker to begin the service.', otp: order.start_otp };
        if (order.tracking_status === 'On the Way') return { title: 'OTP to Complete Work', description: 'Share this with the worker upon satisfactory completion.', otp: order.complete_otp };
        return null;
    })();

    const CodPaymentPrompt = () => {
      // FIX 1: The payment prompt should be visible until the payment is not pending, and regardless of the tracking status (as long as it's not completed)
      if (order.payment_method === 'cod' && order.payment_status === 'Pending' && order.tracking_status !== 'Completed') {
        return (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <h3 className="font-bold text-blue-800">Payment Required</h3>
            <p className="text-sm text-blue-700 mt-1">Please pay the worker <strong>₹{order.price}</strong> upon arrival to start the service.</p>
            <div className="mt-3 text-xs text-gray-500">You can pay via Cash or Online (worker's QR).</div>
          </div>
        )
      }
      return null;
    }

    return (
        <div className="pb-24">
            <SubPageHeader title="Order Status" onBack={() => setPage('orders')} />
            <div className="max-w-2xl mx-auto px-4 space-y-6">
                
                {(order.tracking_status === 'Assigned' || order.tracking_status === 'On the Way') && order.worker_id && order.address && (
                    <WorkerMapTracker 
                        workerId={order.worker_id} 
                        destinationAddress={`${order.address.street_address}, ${order.address.city}`} 
                    />
                )}

                <ServiceTracker status={order.tracking_status} />

                {(order.tracking_status === 'On the Way' || order.tracking_status === 'Completed') && (
                     <Timer startTime={order.start_time || null} endTime={order.end_time} language="en" isCompleted={order.tracking_status === 'Completed'} />
                )}

                <CodPaymentPrompt />

                {otpDetails && (
                    <div className="p-4 bg-white rounded-lg shadow-sm text-center">
                        <h3 className="font-bold text-lg text-gray-800">{otpDetails.title}</h3>
                        <p className="text-gray-600 text-sm">{otpDetails.description}</p>
                        <div className="my-4 text-5xl font-bold tracking-widest text-green-600">
                            <span>{otpDetails.otp || '----'}</span>
                        </div>
                        <p className="text-xs text-gray-500">Do not share this OTP with anyone else.</p>
                    </div>
                )}

                {order.worker_id && (
                    <div>
                        <h3 className="font-bold text-lg mb-3">Assigned Worker Details</h3>
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-4">
                            <UserCircleIcon className="h-12 w-12 text-gray-400" />
                            <div>
                                {/* FIX 2: Correctly display the worker's name and phone number if available */}
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
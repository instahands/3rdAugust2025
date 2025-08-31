// src/app/components/orders/OrderCard.tsx (FINAL, CORRECTED CODE)

import React from 'react';
import { CalendarIcon, LocationPinIcon } from '../common/Icons';
import { Order } from '../../../shared/types/types';

const ServiceTracker = ({ status }: { status: string }) => {
    const stages = ['Booked', 'Assigned', 'On the Way', 'Completed'];
    const currentStageIndex = stages.indexOf(status);
    return (
        <div className="mt-5">
            <div className="flex items-center">
                {stages.map((stage, index) => (
                    <React.Fragment key={stage}>
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${index <= currentStageIndex ? 'bg-green-600' : 'bg-gray-300'}`}>
                                {index < currentStageIndex ? (
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <div className={`w-3 h-3 rounded-full ${index === currentStageIndex ? 'bg-white' : 'bg-gray-400'}`} />
                                )}
                            </div>
                            <p className={`text-xs mt-1 text-center ${index <= currentStageIndex ? 'font-semibold text-green-600' : 'text-gray-500'}`}>{stage}</p>
                        </div>
                        {index < stages.length - 1 && (
                            <div className={`flex-1 h-1 ${index < currentStageIndex ? 'bg-green-600' : 'bg-gray-300'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const OrderCard = ({ order, isUpcoming }: { order: Order, isUpcoming: boolean }) => (
    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-semibold text-green-700">{order.service_name}</h3>
                <p className="text-sm text-gray-500">Order ID: {order.id?.toString().substring(0, 8)}</p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {order.status}
            </span>
        </div>
        <div className="mt-4 border-t pt-4 text-sm text-gray-700 space-y-2">
            <p className="flex items-center"><CalendarIcon /> <strong>Scheduled for:</strong> &nbsp;{new Date(order.date).toDateString()} at {order.time_slot}</p>
            <p className="flex items-start"><LocationPinIcon /> <strong>Location:</strong> &nbsp;
                {/* --- THIS IS THE FIX --- */}
                {/* It now correctly creates a string from the address object */}
                {order.address ? `${order.address.street_address}, ${order.address.city}` : 'Address not available'}
            </p>
        </div>
        {isUpcoming && <ServiceTracker status={order.tracking_status} />}
    </div>
);

export default OrderCard;
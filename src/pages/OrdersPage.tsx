// src/pages/OrdersPage.tsx (FIXED PADDING)

import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import OrderCard from '../components/orders/OrderCard';

interface Order {
    id: string;
    date: string;
    manpowerType: string;
    subscriptionType: string;
    status: string;
    trackingStatus: string;
    address: string;
}

interface OrdersPageProps {
    setPage: (page: string) => void;
    currentPage: string;
}

export default function OrdersPage({ setPage, currentPage }: OrdersPageProps) {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [upcomingOrders, setUpcomingOrders] = useState<Order[]>([]);
    const [pastOrders, setPastOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.error("Error fetching orders:", error);
            } else if (data) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                setUpcomingOrders(data.filter(order => new Date(order.date) >= today));
                setPastOrders(data.filter(order => new Date(order.date) < today));
            }
            setLoading(false);
        };
        
        if (currentPage === 'orders') {
            fetchOrders();
        }
    }, [currentPage]);

    const OrderList = ({ orders, isUpcoming }: { orders: Order[], isUpcoming: boolean }) => {
        if (orders.length === 0) {
            return (
                <div className="text-center py-10 bg-white rounded-lg shadow mt-4">
                    <p className="text-gray-600 mb-4">No {isUpcoming ? 'upcoming' : 'past'} orders found.</p>
                    {isUpcoming && (
                        <button onClick={() => setPage('home')} className="px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700">
                            Book a Service
                        </button>
                    )}
                </div>
            );
        }
        return (
            <div className="space-y-4 mt-4">
                {orders.map((order: Order) => <OrderCard key={order.id} order={order} isUpcoming={isUpcoming} />)}
            </div>
        );
    };

    return (
        // FIX: Added pb-32 for padding to prevent overlap with the bottom nav bar
        <div className="max-w-4xl mx-auto px-4 pt-4 pb-32">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">My Orders</h2>
            <div className="flex border-b">
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-6 py-2 font-semibold ${activeTab === 'upcoming' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setActiveTab('past')}
                    className={`px-6 py-2 font-semibold ${activeTab === 'past' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500'}`}
                >
                    Past
                </button>
            </div>
            {loading ? (
                <p className="text-center mt-8 text-gray-600">Loading your orders...</p>
            ) : (
                activeTab === 'upcoming' ?
                <OrderList orders={upcomingOrders} isUpcoming={true} /> :
                <OrderList orders={pastOrders} isUpcoming={false} />
            )}
        </div>
    );
}
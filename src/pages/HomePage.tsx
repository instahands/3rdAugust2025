// src/pages/HomePage.tsx (CORRECTED)

import { User } from '@supabase/supabase-js';
// This now imports the single, correct Service type
import { Service } from '../types'; 

// Import reusable components
import { UserIcon, SearchIcon, StarIcon, ShieldCheckIcon, HeadsetIcon, BadgeCheckIcon } from '../components/common/Icons';
import AdCarousel from '../components/home/AdCarousel';
import ServiceGrid from '../components/home/ServiceGrid';

// --- REMOVED: Local interface declarations ---
// The local Service and Order interfaces have been removed to avoid conflicts.

// --- PROPS INTERFACE USING IMPORTED TYPES ---
interface HomePageProps {
    setPage: (page: string) => void;
    currentUser: User | null;
    orders: any[]; // Using 'any[]' for orders as its full shape isn't defined globally yet
    viewServiceDetail: (service: Service) => void;
    startBooking: (service: Service) => void;
}

// --- Service data remains the same ---
const services: Service[] = [
    { name: 'Home Cleaning', manpowerType: 'Home Cleaning', color: 'bg-blue-500', price: 249, description: 'Ideal for flats, villas, PGs, rentals.', imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Full Home Deep Cleaning', 'Kitchen Deep Clean', 'Bathroom Cleaning & Sanitization', 'Bedroom Cleaning', 'Sofa, Carpet & Mattress Shampooing'], needs: ['Access to water & electricity', 'Space to work'], excluded: ['Heavy furniture moving', 'Pest control'] },
    { name: 'Pack & Shift Help', manpowerType: 'Pack & Shift Help', color: 'bg-orange-500', price: 199, description: 'Heavy ka stress? Helping Hands is here!', imageUrl: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Full House Shifting Support', 'Packing, Loading, Unloading', 'Furniture Rearrangement', 'Office Setup or Move', 'Event Setup & Breakdown', 'Packing Support Only', 'Loading/Unloading Help', '2Hr/4Hr Labour Booking'], needs: ['Clear instructions on items to be moved', 'Access to both source and destination points', 'Parking space for vehicle (if applicable)'], excluded: ['Transportation vehicle (unless specified)', 'Insurance for valuables', 'Packing materials (unless specified)'] },
    { name: 'Pickup & Drop', manpowerType: 'Pickup & Drop', color: 'bg-indigo-500', price: 1, description: 'Bhilai\'s Instant Delivery Crew', imageUrl: 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Parcel Pickup & Drop', 'Grocery Pickup', 'Medicine Pickup', 'Tiffin/Meal Delivery', 'Courier Drop-off', 'Laundry Pickup & Drop', 'Custom Request Delivery'], needs: ['Clear pickup and drop addresses', 'Contact person details', 'Package details (size/weight)'], excluded: ['Transportation of illegal items', 'Handling of cash'] },
    { name: 'Commercial Cleaning', manpowerType: 'Commercial Cleaning', color: 'bg-teal-500', price: 249, description: 'Offices, coaching centers, salons, gyms, shops.', imageUrl: 'https://images.pexels.com/photos/4099468/pexels-photo-4099468.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Full Office Deep Cleaning', 'Washroom Maintenance', 'Pantry & Kitchenette Cleaning', 'Glass & Window Cleaning'], needs: ['Access to the premises after hours', 'Water and power supply'], excluded: ['Cleaning of personal employee belongings', 'Heavy machinery cleaning'] },
    { name: 'On-Demand Cleaning', manpowerType: 'On-Demand Cleaning', color: 'bg-purple-500', price: 199, description: 'Quick or flexible help for specific needs.', imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Single Room Quick Cleaning', 'Balcony/Terrace Cleaning', 'Fridge/Microwave/Oven Cleaning', 'One-Time Maid / Helper'], needs: ['Specific instructions for the task', 'Required cleaning agents'], excluded: ['Full home cleaning', 'Tasks requiring specialized tools'] },
    { name: 'Outdoor & Utility', manpowerType: 'Outdoor & Utility', color: 'bg-lime-500', price: 199, description: 'Use your manpower for outdoor help too.', imageUrl: 'https://images.pexels.com/photos/1108572/pexels-photo-1108572.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['Garden Cleaning & Grass Cutting', 'Plant Potting & Arrangement', 'Car Washing (at home)', 'Pressure Wash for Driveway/Pathway', 'Dustbin Cleaning', 'Water Tank Top-up / Overflow Fix (basic)', 'Cloth Drying Line Setup (rooftop)'], needs: ['Access to outdoor area', 'Water source for cleaning'], excluded: ['Major landscaping', 'Handling of hazardous materials'] },
    { name: 'Temporary Manpower', manpowerType: 'Temporary Manpower', color: 'bg-cyan-500', price: 199, description: 'For events, house functions, or short tasks.', imageUrl: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', trainedTo: ['2 Hour Helper (Lift/Move/Setup)', '4 Hour Helper (Extra Hands at Home/Office)', 'Wedding/Event Setup Support', 'Labour for Shops/Stores (Inventory/Arranging)', 'Daily/Hourly Labour', 'Temporary Society Cleaning Helper', 'Waiters/Servers (non-hotel) for private events'], needs: ['Clear task list', 'Supervision for the task'], excluded: ['Skilled labour unless specified', 'Long-term contracts'] },
];

const valueProps = [
    { icon: <StarIcon />, text: 'We Value Your Feedback' },
    { icon: <ShieldCheckIcon />, text: 'Trained Professionals' },
    { icon: <HeadsetIcon />, text: 'Dedicated Support' },
    { icon: <BadgeCheckIcon />, text: 'Verified Experts' },
];

const HeaderLogo = () => (
    <div>
        <span className="text-black text-2xl font-bold">Insta</span>
        <span className="text-green-500 text-2xl font-bold">Hands</span>
    </div>
);

// --- Component remains the same, but now uses the correct types ---
export default function HomePage({ setPage, currentUser, orders, viewServiceDetail, startBooking }: HomePageProps) {
    const recentBookings = orders.filter(order => new Date(order.date) < new Date()).slice(0, 5);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
                <HeaderLogo />
                <button onClick={() => setPage('account')} className="p-2 bg-white rounded-full shadow border"><UserIcon /></button>
            </header>
            
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Hi, {currentUser?.user_metadata?.name?.split(' ')[0] || 'User'} 👋</h1>
                <p className="text-gray-500">What service do you need today?</p>
            </div>

            <div className="relative">
                <input type="text" placeholder="Search for a service..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"/>
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><SearchIcon /></div>
            </div>
            
            <AdCarousel />

            <div>
                <h2 className="text-lg font-bold text-gray-800 mb-4">Categories</h2>
                {/* This now passes the correct Service type */}
                <ServiceGrid services={services} onServiceClick={viewServiceDetail} />
            </div>

            <div>
                <div className="flex overflow-x-auto space-x-4 pb-4">
                    {valueProps.map(prop => (
                        <div key={prop.text} className="flex-shrink-0 w-40 flex flex-col items-center justify-center p-4 bg-white rounded-xl shadow-md text-center">
                            {prop.icon}
                            <p className="mt-2 text-sm font-semibold text-gray-700">{prop.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {recentBookings.length > 0 && (
                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Book Again</h2>
                    <div className="flex overflow-x-auto space-x-4 pb-4">
                        {recentBookings.map(order => (
                            <div key={order.id} className="flex-shrink-0 w-64 p-4 bg-white rounded-xl shadow-md">
                                <h3 className="font-bold text-gray-800">{order.manpowerType}</h3>
                                <p className="text-sm text-gray-500">{order.subscriptionType}</p>
                                <p className="text-sm text-gray-500 mt-2">Last on: {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                <button onClick={() => startBooking(services.find(s => s.manpowerType === order.manpowerType)!)} className="mt-4 w-full py-2 text-white bg-green-600 rounded-lg text-sm font-bold">
                                    Re-Book
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
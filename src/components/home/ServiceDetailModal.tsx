// src/components/home/ServiceDetailModal.tsx (CORRECTED)


import { XIcon, CheckCircleIcon, XCircleIcon } from '../common/Icons';
import { Service } from '../../types'; // --- NEW: Import the Service type ---

// --- NEW: Typed the component props ---
interface ServiceDetailModalProps {
    service: Service | null;
    onClose: () => void;
    startBooking: (service: Service) => void;
}

export default function ServiceDetailModal({ service, onClose, startBooking }: ServiceDetailModalProps) {
    if (!service) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-end z-50">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-t-2xl shadow-lg flex flex-col">
                <header className="relative h-48 flex-shrink-0">
                    <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover rounded-t-2xl" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/30 rounded-full text-white hover:bg-black/50">
                        <XIcon />
                    </button>
                    <div className="absolute bottom-4 left-4 text-white">
                        <h1 className="text-2xl font-bold">{service.name}</h1>
                        <p className="text-sm">{service.description}</p>
                    </div>
                </header>
                
                <main className="p-6 space-y-6 overflow-y-auto">
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">The expert is trained to</h3>
                        <ul className="space-y-2">
                            {/* --- MODIFIED: Added key and type for item --- */}
                            {service.trainedTo.map((item: string) => (
                                <li key={item} className="flex items-start">
                                    <CheckCircleIcon />
                                    <span className="ml-3 text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">What we need from you</h3>
                        <ul className="space-y-2">
                            {/* --- MODIFIED: Added key and type for item --- */}
                            {service.needs.map((item: string) => (
                                <li key={item} className="flex items-start">
                                    <CheckCircleIcon />
                                    <span className="ml-3 text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-3">Service Excluded</h3>
                        <ul className="space-y-2">
                            {/* --- MODIFIED: Added key and type for item --- */}
                            {service.excluded.map((item: string) => (
                                <li key={item} className="flex items-start">
                                    <XCircleIcon />
                                    <span className="ml-3 text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </main>

                <footer className="p-4 border-t mt-auto flex-shrink-0">
                    <div className="flex justify-between items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div>
                            <p className="text-sm text-gray-600">Starting from</p>
                            <p className="text-2xl font-bold text-green-600">₹{service.price}<span className="text-base font-normal">/hour</span></p>
                        </div>
                        <button
                            onClick={() => startBooking(service)}
                            className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
                        >
                            Book Now
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
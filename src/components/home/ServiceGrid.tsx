// src/components/home/ServiceGrid.tsx (CORRECTED)
import { Service } from '../../types'; // --- NEW: Import the correct Service type

// --- Icon definitions remain the same ---
const HousekeepingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m5 11v4m-2-2h4M12 3v1m0 16v1m-6.364 2.364L7.05 20.95m9.9-9.9l1.414 1.414M12 6a6 6 0 110 12 6 6 0 010-12z" /></svg>;
const ShiftingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const PickupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const OfficeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const OutdoorIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293l1.414-1.414a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-1.414 1.414M12 21v-4m0 0H8m4 0h4" /></svg>;
const TempManpowerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.282-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.282.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

const serviceIcons: { [key: string]: JSX.Element } = {
    'Home Cleaning': <HousekeepingIcon />,
    'Pack & Shift Help': <ShiftingIcon />,
    'Pickup & Drop': <PickupIcon />,
    'Commercial Cleaning': <OfficeIcon />,
    'On-Demand Cleaning': <HousekeepingIcon />,
    'Outdoor & Utility': <OutdoorIcon />,
    'Temporary Manpower': <TempManpowerIcon />,
};

// --- REMOVED: The local Service interface is gone ---

// --- MODIFIED: Props now use the imported Service type ---
interface ServiceGridProps {
    services: Service[];
    onServiceClick: (service: Service) => void;
}

const ServiceGrid = ({ services, onServiceClick }: ServiceGridProps) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map(service => (
                <button
                    key={service.name}
                    onClick={() => onServiceClick(service)}
                    className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col items-center justify-center text-center"
                >
                    <div className={`p-4 rounded-full ${service.color}`}>
                        {serviceIcons[service.manpowerType] || <HousekeepingIcon />}
                    </div>
                    <span className="mt-3 font-semibold text-gray-700 text-sm">{service.name}</span>
                </button>
            ))}
        </div>
    );
};

export default ServiceGrid;
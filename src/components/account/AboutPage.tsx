// src/components/account/AboutPage.tsx

import SubPageHeader from '../common/SubPageHeader';

// --- Placeholder icons for visual appeal. You can replace these with your actual icon components if you have them ---
const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.016z" />
    </svg>
);
const ClockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16v4m-2-2h4m5 11v4m-2-2h4M12 3v1m0 16v1m-6.364 2.364L7.05 20.95m9.9-9.9l1.414 1.414M12 6a6 6 0 110 12 6 6 0 010-12z" />
    </svg>
);


export default function AboutPage({ setPage }: { setPage: (page: string) => void }) {
    return (
        // Added bottom padding to prevent being covered by the nav bar
        <div className="max-w-2xl mx-auto pb-24">
            <SubPageHeader title="About InstaHands" onBack={() => setPage('account')} />
            
            <div className="space-y-6">
                {/* --- Our Mission Section --- */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800">Our Mission</h3>
                    <p className="text-gray-600 mt-2">
                        To provide reliable, on-demand help with a single tap. We connect our community in Bhilai & Durg with verified, professional manpower to make everyday life easier and more productive.
                    </p>
                </div>

                {/* --- Our Values Section --- */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Our Core Values</h3>
                    <div className="space-y-4">
                        <div className="flex items-start space-x-4">
                            <ShieldIcon />
                            <div>
                                <h4 className="font-semibold">Trust & Safety</h4>
                                <p className="text-gray-600 text-sm">Every professional on our platform is background-verified to ensure your complete peace of mind.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <ClockIcon />
                            <div>
                                <h4 className="font-semibold">Convenience</h4>
                                <p className="text-gray-600 text-sm">Book any service in under a minute. We handle the scheduling so you can focus on what matters.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <StarIcon />
                            <div>
                                <h4 className="font-semibold">Quality Service</h4>
                                <p className="text-gray-600 text-sm">We are committed to high standards of service and continuously seek your feedback to improve.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- How It Works Section --- */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">How It Works</h3>
                    <ol className="space-y-2 text-gray-600">
                        <li><span className="font-bold">1. Select a Service:</span> Choose from our wide range of on-demand services.</li>
                        <li><span className="font-bold">2. Schedule Your Time:</span> Pick a date and time slot that works for you.</li>
                        <li><span className="font-bold">3. Relax:</span> A verified professional will arrive on time to get the job done.</li>
                    </ol>
                </div>

                {/* --- Contact & Legal Section --- */}
                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-xl font-bold text-gray-800">Get in Touch</h3>
                    <p className="text-gray-600 mt-2">
                        Have questions? Our support team is here to help!
                    </p>
                    <p className="font-semibold text-green-600 mt-2">support@instahands.in</p>
                    
                    <div className="mt-4 border-t pt-4 text-sm">
                        <a href="#" className="text-green-600 hover:underline">Terms of Service</a>
                        <span className="mx-2 text-gray-400">|</span>
                        <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>
                    </div>
                </div>
            </div>
        </div>
    );
}

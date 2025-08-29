// src/worker/WorkerDashboard.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../shared/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useWorkerData } from './hooks/useWorkerData';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { OtpModal } from './components/shared/OtpModal';
import { WorkerOnboardingPage } from './pages/WorkerOnboardingPage';
import { WorkerPendingPage } from './pages/WorkerPendingPage';
import { Profile } from '../shared/types/types';

export const WorkerDashboard = () => {
    const [worker, setWorker] = useState<User | null>(null);
    const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const checkWorkerSession = useCallback(async () => {
        setAuthLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user ?? null;
        setWorker(user);

        if (user) {
            // Fetch the user's profile
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();

            // Handle potential errors, but don't log out for a missing profile
            if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found", which is OK for a new user.
                console.error("Error fetching worker profile:", error);
                await supabase.auth.signOut(); // Log out only on actual DB errors
                setWorker(null);
                setWorkerProfile(null);
            } else if (profile && profile.role !== 'worker') {
                // If a profile exists but it's not for a worker, log them out.
                console.warn("Authenticated user is not a worker. Logging out.");
                await supabase.auth.signOut();
                setWorker(null);
                setWorkerProfile(null);
            } else {
                // If profile is found OR if it's null (new user), set it.
                // The render logic below will correctly show the onboarding page.
                setWorkerProfile(profile);
            }
        } else {
            // No user session, so clear the profile
            setWorkerProfile(null);
        }
        setAuthLoading(false);
    }, []);

    useEffect(() => {
        checkWorkerSession();
        const { data: authListener } = supabase.auth.onAuthStateChange(() => {
            // This runs on SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, etc.
            checkWorkerSession();
        });
        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [checkWorkerSession]);

    const {
        filteredJobs, currentLanguage, switchLanguage, activeTab, setActiveTab,
        activeJob, selectJob, deselectJob, acceptJob,
        otpConfig, showOtpModal, hideOtpModal, verifyOtp, loading
    } = useWorkerData(worker);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!worker) {
        return <LoginPage />;
    }

    // This logic is now robust. If the profile doesn't exist yet (null) OR doesn't have a name, show onboarding.
    if (!workerProfile?.name) {
        return <WorkerOnboardingPage user={worker} onOnboardingComplete={checkWorkerSession} />;
    }

    if (workerProfile.worker_status === 'pending') {
        return <WorkerPendingPage handleLogout={handleLogout} />;
    }

    if (workerProfile.worker_status === 'rejected') {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-4 text-center">
                <h2 className="text-xl font-bold">Application Not Approved</h2>
                <p className="mt-2">Your profile could not be approved. Please contact support.</p>
                <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md">Logout</button>
            </div>
        );
    }
    
    if (workerProfile.worker_status === 'approved') {
        const otpMessages: { [key in 'start' | 'complete']: { [key in 'en' | 'hi']: { title: string; message: string } } } = {
            start: { en: { title: 'Start Work OTP', message: 'Enter the 4-digit OTP from the customer to start the work.' }, hi: { title: 'काम शुरू करने के लिए OTP', message: 'काम शुरू करने के लिए ग्राहक से 4 अंकों का OTP दर्ज करें।' } },
            complete: { en: { title: 'Complete Work OTP', message: 'Enter the 4-digit OTP from the customer to complete the work.' }, hi: { title: 'काम पूरा करने के लिए OTP', message: 'काम पूरा करने के लिए ग्राहक से 4 अंकों का OTP दर्ज करें।' } }
        };
        const currentOtpContent = otpConfig.action ? otpMessages[otpConfig.action][currentLanguage] : { title: '', message: '' };

        return (
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-lg font-sans">
                {activeJob ? (
                    <OrderDetailsPage job={activeJob} language={currentLanguage} onBack={deselectJob} onShowOtp={showOtpModal} />
                ) : (
                    <DashboardPage 
                        jobs={filteredJobs} language={currentLanguage} activeTab={activeTab}
                        onTabChange={setActiveTab} onSelectJob={selectJob} onAcceptJob={acceptJob}
                        onSwitchLanguage={switchLanguage} onLogout={handleLogout} isLoading={loading}
                    />
                )}
                <OtpModal isOpen={otpConfig.isOpen} onClose={hideOtpModal} onVerify={verifyOtp} title={currentOtpContent.title} message={currentOtpContent.message} />
            </div>
        );
    }

    return <div className="flex items-center justify-center h-screen">An unexpected error occurred. Please try again.</div>;
};


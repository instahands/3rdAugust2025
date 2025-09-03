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
            const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (error && error.code !== 'PGRST116') {
                console.error("Error fetching worker profile:", error);
                await supabase.auth.signOut();
                setWorker(null);
                setWorkerProfile(null);
            } else {
                setWorkerProfile(profile);
            }
        }
        setAuthLoading(false);
    }, []);

    useEffect(() => {
        checkWorkerSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const user = session?.user ?? null;
            setWorker(user);
            if (!user) {
                setWorkerProfile(null);
            } else {
                 checkWorkerSession();
            }
        });
        return () => subscription.unsubscribe();
    }, [checkWorkerSession]);

    const {
        filteredJobs, loading, currentLanguage, activeTab, activeJob, otpConfig, hasActiveJob,
        switchLanguage, setActiveTab, selectJob, deselectJob, acceptJob, verifyOtp, showOtpModal, hideOtpModal, confirmPayment
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

    if (!workerProfile?.name) {
        return <WorkerOnboardingPage user={worker} onOnboardingComplete={checkWorkerSession} />;
    }

    if (workerProfile.worker_status === 'pending') {
        return <WorkerPendingPage handleLogout={handleLogout} />;
    }

    if (workerProfile.worker_status === 'approved') {
        const otpMessages = {
            start: { en: { title: 'OTP to Start Work', message: 'Please enter the 4-digit OTP from the customer to start the work.' }, hi: { title: 'काम शुरू करने के लिए OTP', message: 'काम शुरू करने के लिए ग्राहक से 4 अंकों का OTP दर्ज करें।' } },
            complete: { en: { title: 'OTP to Complete Work', message: 'Please enter the 4-digit OTP from the customer to complete the work.' }, hi: { title: 'काम पूरा करने के लिए OTP', message: 'काम पूरा करने के लिए ग्राहक से 4 अंकों का OTP दर्ज करें।' } }
        };
        const currentOtpContent = otpConfig.action ? otpMessages[otpConfig.action][currentLanguage] : { title: '', message: '' };

        return (
            <div className="max-w-md mx-auto min-h-screen bg-gray-50 shadow-lg font-sans">
                {activeJob ? (
                    <OrderDetailsPage 
                        job={activeJob} 
                        language={currentLanguage} 
                        onBack={deselectJob} 
                        onShowOtp={showOtpModal} 
                        onConfirmPayment={confirmPayment} 
                    />
                ) : (
                    <DashboardPage
                        jobs={filteredJobs}
                        language={currentLanguage}
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                        onSelectJob={selectJob}
                        onAcceptJob={acceptJob}
                        onSwitchLanguage={switchLanguage}
                        onLogout={handleLogout}
                        isLoading={loading}
                        hasActiveJob={hasActiveJob}
                    />
                )}
                <OtpModal isOpen={otpConfig.isOpen} onClose={hideOtpModal} onVerify={verifyOtp} title={currentOtpContent.title} message={currentOtpContent.message} />
            </div>
        );
    }

    return <div className="flex items-center justify-center h-screen">An unexpected error occurred. Please try again.</div>;
};

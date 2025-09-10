// src/worker/WorkerDashboard.tsx (FINAL, CORRECTED)

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
import { ProfilePage } from './pages/ProfilePage';

export const WorkerDashboard = () => {
    const [worker, setWorker] = useState<User | null>(null);
    const [workerProfile, setWorkerProfile] = useState<Profile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const watchId = useRef<number | null>(null);
    
    const [workerPosition, setWorkerPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [geolocationError, setGeolocationError] = useState<string | null>(null);
    const [activeWorkerPage, setActiveWorkerPage] = useState<'dashboard' | 'profile'>('dashboard');

    const {
        jobs, // Get the full, unfiltered list of jobs
        filteredJobs, 
        loading, 
        currentLanguage, 
        activeTab, 
        activeJob, 
        otpConfig, 
        hasActiveJob,
        switchLanguage, 
        setActiveTab, 
        selectJob, 
        deselectJob, 
        acceptJob, 
        verifyOtp, 
        showOtpModal, 
        hideOtpModal, 
        confirmPayment
    } = useWorkerData(worker);

    // --- THIS IS THE NEW, ROBUST CALCULATION ---
    const totalEarnings = useMemo(() => {
        if (!worker || !jobs) return 0;
        return jobs
            .filter(j => j.worker_id === worker.id && j.workerStatus === 'completed')
            .reduce((sum, job) => sum + (job.earning || 0), 0);
    }, [jobs, worker]);

    // ... (rest of the component is unchanged)

    const startLocationTracking = () => {
        if (!navigator.geolocation) {
            console.error("Geolocation is not supported.");
            setGeolocationError("Your browser does not support geolocation.");
            return;
        }
        if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);

        watchId.current = navigator.geolocation.watchPosition(
            async (position) => {
                if (worker) {
                    const { latitude, longitude } = position.coords;
                    setWorkerPosition({ lat: latitude, lng: longitude });
                    setGeolocationError(null);
                    const { error } = await supabase.from('worker_locations').upsert({
                        worker_id: worker.id,
                        lat: latitude,
                        lng: longitude,
                        updated_at: new Date().toISOString()
                    });
                     if (error) {
                        console.error("Error updating worker location:", error);
                    } else {
                        console.log("Worker location updated successfully.");
                    }
                }
            },
            (error) => {
                console.error("Geolocation Error:", error);
                setGeolocationError(error.message);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
    };
    
    const stopLocationTracking = () => {
        if (watchId.current !== null) {
            navigator.geolocation.clearWatch(watchId.current);
            watchId.current = null;
        }
    };
    
    useEffect(() => {
        if (hasActiveJob) {
            startLocationTracking();
        } else {
            stopLocationTracking();
        }
        return () => stopLocationTracking();
    }, [hasActiveJob, worker]);


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
            start: { en: { title: 'OTP to Start Work', message: 'Please enter the 4-digit OTP from the customer to start the work.' }, hi: { title: 'काम शुरू करने के लिए OTP', message: 'काम शुरू करने के लिए ग्राहक से 4 अंकों का OTP दर्ज करें।' } }
            ,
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
                        workerPosition={workerPosition}
                        geolocationError={geolocationError}
                    />
                ) : activeWorkerPage === 'profile' ? (
                    <ProfilePage 
                        workerProfile={workerProfile}
                        onBack={() => setActiveWorkerPage('dashboard')}
                        onLogout={handleLogout}
                    />
                ) : (
                    <DashboardPage
                        jobs={filteredJobs}
                        language={currentLanguage}
                        activeTab={activeTab}
                        totalEarnings={totalEarnings}
                        onTabChange={setActiveTab}
                        onSelectJob={selectJob}
                        onAcceptJob={acceptJob}
                        onSwitchLanguage={switchLanguage}
                        onLogout={handleLogout}
                        isLoading={loading}
                        hasActiveJob={hasActiveJob}
                        onGoToProfile={() => setActiveWorkerPage('profile')}
                    />
                )}
                <OtpModal isOpen={otpConfig.isOpen} onClose={hideOtpModal} onVerify={verifyOtp} title={currentOtpContent.title} message={currentOtpContent.message} />
            </div>
        );
    }

    return <div className="flex items-center justify-center h-screen">An unexpected error occurred. Please try again.</div>;
};
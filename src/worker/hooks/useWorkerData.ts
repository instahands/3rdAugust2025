// src/worker/hooks/useWorkerData.ts

import { useState, useEffect, useCallback } from 'react';
import { Job } from '../types/workerTypes';
import { supabase } from '../../shared/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

export const useWorkerData = (worker: User | null) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
    const [activeTab, setActiveTab] = useState<'new' | 'ongoing' | 'completed'>('new');
    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [otpConfig, setOtpConfig] = useState<{ isOpen: boolean; action: 'start' | 'complete' | null; jobId: number | null }>({ isOpen: false, action: null, jobId: null });

    const fetchJobs = useCallback(async () => {
        if (!worker) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                customerProfile:profiles!user_id(name)
            `)
            .or(`status.eq.Pending,worker_id.eq.${worker.id}`);

        if (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
        } else if (data) {
            // --- FIX: Map the database 'order' object to the frontend 'Job' type ---
            // This translates the status values and flattens the customer name.
            const mappedJobs: Job[] = data.map((order: any) => ({
                ...order,
                customerName: order.customerProfile?.name || 'N/A',
                status: order.status === 'Pending' ? 'new' 
                      : order.status === 'Assigned' ? 'ongoing' 
                      : 'completed',
            }));
            setJobs(mappedJobs);
        }
        setLoading(false);
    }, [worker]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    const acceptJob = async (jobId: number) => {
        if (!worker) return;
        const { error } = await supabase.from('orders').update({ worker_id: worker.id, status: 'Assigned' }).eq('id', jobId);
        if (error) console.error("Error accepting job:", error);
        else fetchJobs();
    };

    const verifyOtp = async (otp: string) => {
        if (!otpConfig.jobId || !otpConfig.action) return;
        const { error } = await supabase.rpc('verify_work_otp', { p_order_id: otpConfig.jobId, p_otp: otp, p_action: otpConfig.action });
        if (error) console.error(`Error ${otpConfig.action}ing work:`, error);
        else {
            hideOtpModal();
            fetchJobs();
        }
    };

    const switchLanguage = () => setCurrentLanguage(lang => lang === 'en' ? 'hi' : 'en');
    const selectJob = (jobId: number) => setActiveJobId(jobId);
    const deselectJob = () => setActiveJobId(null);
    const showOtpModal = (jobId: number, action: 'start' | 'complete') => setOtpConfig({ isOpen: true, action, jobId });
    const hideOtpModal = () => setOtpConfig({ isOpen: false, action: null, jobId: null });
    
    const activeJob = jobs.find(job => job.id === activeJobId) || null;

    // --- FIX: Update the filtering logic to use the new frontend statuses ---
    // This logic now works correctly because the 'jobs' state contains the mapped data.
    const getJobsByStatus = (status: 'new' | 'ongoing' | 'completed') => {
        switch (status) {
            case 'new': return jobs.filter(j => j.status === 'new' && !j.worker_id);
            case 'ongoing': return jobs.filter(j => j.worker_id === worker?.id && j.status === 'ongoing');
            case 'completed': return jobs.filter(j => j.worker_id === worker?.id && j.status === 'completed');
            default: return [];
        }
    };
    const filteredJobs = getJobsByStatus(activeTab);

    return {
        filteredJobs, currentLanguage, switchLanguage, activeTab, setActiveTab,
        activeJob, selectJob, deselectJob, acceptJob,
        otpConfig, showOtpModal, hideOtpModal, verifyOtp, loading
    };
};
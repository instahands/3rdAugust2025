// src/worker/hooks/useWorkerData.ts (FINAL, WITH JOB LIMIT LOGIC)

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
            .select(`*, customerProfile:profiles!user_id(name, phone), address:addresses!address_id(*)`)
            .or(`status.eq.Pending,worker_id.eq.${worker.id}`);

        if (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
        } else if (data) {
            const mappedJobs: Job[] = data.map((order: any) => ({
                ...order,
                service_en: order.service_name,
                service_hi: order.service_name,
                customerName: order.customerProfile?.name || 'N/A',
                address: order.address ? `${order.address.street_address}, ${order.address.city}` : 'Address not found',
                dateTime: `${new Date(order.date).toDateString()} at ${order.time_slot}`,
                earning: order.price || 0,
                status: order.worker_id ? (order.status === 'Completed' ? 'completed' : 'ongoing') : 'new',
                statusDetail: 'pending',
                workDetails_en: order.work_description,
                workDetails_hi: order.work_description,
                distance: '5 km',
                mapUrl: order.address ? `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${order.address.street_address}, ${order.address.city}`)}` : '',
                directionsUrl: order.address ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${order.address.street_address}, ${order.address.city}`)}` : '',
                startTime: order.start_time || null,
                endTime: order.end_time || null,
            }));
            setJobs(mappedJobs);
        }
        setLoading(false);
    }, [worker]);
    
    useEffect(() => {
        fetchJobs();
        const channel = supabase.channel('public:orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchJobs()).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [fetchJobs]);

    const acceptJob = async (jobId: number) => {
        if (!worker) return;
        const { data, error } = await supabase.rpc('accept_order', {
            p_order_id: jobId,
            p_worker_id: worker.id
        });

        if (error || (data && data.includes('Error'))) {
            const errorMessage = error?.message || data;
            console.error("Error accepting job:", errorMessage);
            alert(errorMessage);
        }
    };

    const verifyOtp = async (otp: string) => {
        if (!otpConfig.jobId || !otpConfig.action) return;
        const { data, error } = await supabase.rpc('verify_work_otp', { p_order_id: otpConfig.jobId, p_otp: otp, p_action: otpConfig.action });
        if (error || (data && data.includes('Error'))) {
            const errorMessage = error?.message || data;
            alert(`Error: ${errorMessage}`);
        } else {
            hideOtpModal();
        }
    };

    const switchLanguage = () => setCurrentLanguage(lang => lang === 'en' ? 'hi' : 'en');
    const selectJob = (jobId: number) => setActiveJobId(jobId);
    const deselectJob = () => setActiveJobId(null);
    const showOtpModal = (jobId: number, action: 'start' | 'complete') => setOtpConfig({ isOpen: true, action, jobId });
    const hideOtpModal = () => setOtpConfig({ isOpen: false, action: null, jobId: null });
    
    const activeJob = jobs.find(job => job.id === activeJobId) || null;
    const filteredJobs = jobs.filter(job => job.status === activeTab);
    const hasActiveJob = jobs.some(job => job.worker_id === worker?.id && job.status === 'ongoing');

    return {
        filteredJobs, hasActiveJob, currentLanguage, switchLanguage, activeTab, setActiveTab,
        activeJob, selectJob, deselectJob, acceptJob,
        otpConfig, showOtpModal, hideOtpModal, verifyOtp, loading
    };
};


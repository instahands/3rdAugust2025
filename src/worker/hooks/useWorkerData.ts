// src/worker/hooks/useWorkerData.ts (CORRECTED)

import { useState, useEffect, useCallback } from 'react';
import { Job } from '../types/workerTypes';
import { supabase } from '../../shared/lib/supabaseClient';
import { User, RealtimeChannel } from '@supabase/supabase-js';
import { Order } from '../../shared/types/types';

export const useWorkerData = (worker: User | null) => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentLanguage, setCurrentLanguage] = useState<'en' | 'hi'>('en');
    const [activeTab, setActiveTab] = useState<'new' | 'ongoing' | 'completed'>('new');
    const [activeJobId, setActiveJobId] = useState<number | null>(null);
    const [otpConfig, setOtpConfig] = useState<{ isOpen: boolean; action: 'start' | 'complete' | null; jobId: number | null }>({ isOpen: false, action: null, jobId: null });
    const [totalEarnings, setTotalEarnings] = useState(0);

    const fetchJobs = useCallback(async () => {
        if (!worker) return;
        setLoading(true);

        const { data, error } = await supabase
            .from('orders')
            .select(`*, customerProfile:profiles!user_id(name, phone), address:addresses!address_id(*)`)
            .or(`status.eq.Pending,worker_id.eq.${worker.id}`);

        if (error) {
            console.error("Error fetching jobs:", error);
            // --- FIX 1: Do not clear jobs on error, so the UI doesn't flicker ---
        } else if (data) {
            const mappedJobs: Job[] = data.map((order: any) => ({
                ...order,
                service_en: order.service_name,
                service_hi: order.service_name,
                customerName: order.customerProfile?.name || 'N/A',
                address: order.address ? `${order.address.street_address}, ${order.address.city}`: 'N/A',
                dateTime: new Date(order.date).toLocaleString(),
                earning: order.price,
                workerStatus: order.status === 'Completed' ? 'completed' : (order.status === 'Pending' && !order.worker_id) ? 'new' : 'ongoing',
                workDetails_en: order.work_description,
                workDetails_hi: order.work_description,
                distance: 'Calculating...',
                mapUrl: `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${order.address?.street_address},${order.address?.city}`,
                directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${order.address?.street_address},${order.address?.city}`,
                customerPhone: order.customerProfile?.phone
            }));
            setJobs(mappedJobs);
        }
        setLoading(false);
    }, [worker]);

    useEffect(() => {
        if (worker) {
            fetchJobs();

            const channel: RealtimeChannel = supabase.channel(`public:orders`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
                () => {
                    fetchJobs();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [worker, fetchJobs]);
    
    useEffect(() => {
        // Only calculate if there is a worker and the jobs array is not empty.
        // This prevents the total from being reset to 0 during re-renders.
        if (worker && jobs.length > 0) {
            const completedJobs = jobs.filter(j => j.worker_id === worker.id && j.workerStatus === 'completed');
            const total = completedJobs.reduce((sum, job) => sum + (job.earning || 0), 0);
            setTotalEarnings(total);
        }
    }, [jobs, worker]);

    const acceptJob = async (jobId: number) => {
        if (!worker) return;
        const { error } = await supabase.from('orders').update({ worker_id: worker.id, status: 'Assigned', tracking_status: 'On the Way' }).eq('id', jobId);
        if (error) console.error("Error accepting job:", error);
        else await fetchJobs();
    };

    const verifyOtp = async (otp: string) => {
        if (!otpConfig.jobId || !otpConfig.action) return;

        const { data: order, error: fetchError } = await supabase
            .from('orders')
            .select('start_otp, complete_otp')
            .eq('id', otpConfig.jobId)
            .single();

        if (fetchError || !order) {
            alert('Error fetching job details. Please try again.');
            console.error('OTP Fetch Error:', fetchError);
            return;
        }

        const otpField = otpConfig.action === 'start' ? 'start_otp' : 'complete_otp';
        
        if (order[otpField] === otp) {
            const newTrackingStatus = otpConfig.action === 'start' ? 'Work Started' : 'Completed';
            const timeField = otpConfig.action === 'start' ? 'start_time' : 'end_time';
            
            const updateData: Partial<Order> = { tracking_status: newTrackingStatus };
            (updateData as any)[timeField] = new Date().toISOString();
            
            if (newTrackingStatus === 'Completed') {
                updateData.status = 'Completed';
            }

            const { error: updateError } = await supabase.from('orders').update(updateData).eq('id', otpConfig.jobId);

            if (updateError) {
                alert('Failed to update job status.');
                console.error("Error updating job status:", updateError);
            } else {
                hideOtpModal();
                await fetchJobs();
            }
        } else {
            alert('Invalid OTP. Please try again.');
        }
    };
    
    const confirmPayment = async (jobId: number, method: 'Cash' | 'Worker QR') => {
        const { error } = await supabase.from('orders').update({ payment_status: `Paid via ${method}` }).eq('id', jobId);
        if (error) console.error("Error confirming payment:", error);
        else await fetchJobs();
    };

    const switchLanguage = () => setCurrentLanguage(lang => lang === 'en' ? 'hi' : 'en');
    const selectJob = (jobId: number) => setActiveJobId(jobId);
    const deselectJob = () => setActiveJobId(null);
    const showOtpModal = (jobId: number, action: 'start' | 'complete') => setOtpConfig({ isOpen: true, action, jobId });
    const hideOtpModal = () => setOtpConfig({ isOpen: false, action: null, jobId: null });
    
    const activeJob = jobs.find(job => job.id === activeJobId) || null;
    
    const getJobsByStatus = (status: 'new' | 'ongoing' | 'completed') => {
        switch (status) {
            case 'new': return jobs.filter(j => j.workerStatus === 'new');
            case 'ongoing': return jobs.filter(j => j.worker_id === worker?.id && j.workerStatus === 'ongoing');
            case 'completed': return jobs.filter(j => j.worker_id === worker?.id && j.workerStatus === 'completed');
            default: return [];
        }
    };
    const filteredJobs = getJobsByStatus(activeTab);

    const hasActiveJob = jobs.some(job => job.worker_id === worker?.id && job.workerStatus === 'ongoing');

    return {
        filteredJobs,
        loading,
        currentLanguage,
        activeTab,
        activeJob,
        otpConfig,
        hasActiveJob,
        totalEarnings,
        switchLanguage,
        setActiveTab,
        selectJob,
        deselectJob,
        acceptJob,
        verifyOtp,
        showOtpModal,
        hideOtpModal,
        confirmPayment,
    };
};
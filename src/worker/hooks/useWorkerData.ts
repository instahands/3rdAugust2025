// src/worker/hooks/useWorkerData.ts (FINAL, CORRECT MAP URLS)

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
                customerProfile:profiles!user_id(name, phone),
                address:addresses!address_id(*)
            `)
            .or(`status.eq.Pending,worker_id.eq.${worker.id}`);

        if (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
        } else if (data) {
            const mappedJobs: Job[] = data.map((order: any) => {
                
                // --- THIS IS THE FIX ---
                const addressText = order.address ? `${order.address.street_address}, ${order.address.city}, ${order.address.state}` : '';
                const encodedAddress = encodeURIComponent(addressText);
                
                // Use the correct Google Maps Embed API URL format
                const mapUrl = addressText
                    ? `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodedAddress}`
                    : '';
                
                // Use the correct Google Maps Directions URL format
                const directionsUrl = addressText
                    ? `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`
                    : '';

                return {
                    ...order,
                    service_en: order.service_name,
                    service_hi: order.service_name,
                    customerName: order.customerProfile?.name || 'N/A',
                    address: addressText || 'Address not found',
                    dateTime: `${new Date(order.date).toDateString()} at ${order.time_slot}`,
                    earning: order.price || 0,
                    status: order.worker_id ? (order.status === 'Completed' ? 'completed' : 'ongoing') : 'new',
                    statusDetail: 'pending',
                    workDetails_en: order.work_description,
                    workDetails_hi: order.work_description,
                    distance: '5 km', // Placeholder
                    mapUrl: mapUrl,
                    directionsUrl: directionsUrl,
                    startTime: order.startTime || null,
                    endTime: order.endTime || null,
                };
            });
            setJobs(mappedJobs);
        }
        setLoading(false);
    }, [worker]);
    
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    
    // All other functions (acceptJob, verifyOtp, etc.) remain the same
    const acceptJob = async (jobId: number) => {
        if (!worker) return;
        const { error } = await supabase
            .from('orders')
            .update({ worker_id: worker.id, status: 'Assigned', tracking_status: 'Assigned' })
            .eq('id', jobId)
            .eq('status', 'Pending');
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
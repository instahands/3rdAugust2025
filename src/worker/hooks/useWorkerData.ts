import { useState, useEffect, useCallback } from 'react';
import { Job } from '../types/workerTypes';
import { supabase } from '../../shared/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { RealtimeChannel } from '@supabase/supabase-js';

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
                address: order.address ? `${order.address.street_address}, ${order.address.city}`: 'N/A',
                dateTime: new Date(order.date).toLocaleString(),
                earning: order.price,
                status: order.status === 'Pending' ? 'new' : order.tracking_status === 'Completed' ? 'completed' : 'ongoing',
                statusDetail: order.tracking_status,
                workDetails_en: order.work_description,
                workDetails_hi: order.work_description,
                distance: 'Calculating...',
                mapUrl: `https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${order.address?.street_address},${order.address?.city}`,
                directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${order.address?.street_address},${order.address?.city}`,
                startTime: order.start_time,
                endTime: order.end_time,
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
                (payload) => {
                    console.log('Change received!', payload);
                    fetchJobs();
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [worker, fetchJobs]);
    

    const acceptJob = async (jobId: number) => {
        if (!worker) return;
        const { error } = await supabase.from('orders').update({ worker_id: worker.id, status: 'Assigned', tracking_status: 'Assigned' }).eq('id', jobId);
        if (error) console.error("Error accepting job:", error);
        else fetchJobs();
    };

    const verifyOtp = async (otp: string) => {
        if (!otpConfig.jobId || !otpConfig.action) return;

        const job = jobs.find(j => j.id === otpConfig.jobId);
        if (!job) return;

        const otpField = otpConfig.action === 'start' ? 'start_otp' : 'complete_otp';
        const newTrackingStatus = otpConfig.action === 'start' ? 'On the Way' : 'Completed';
        const timeField = otpConfig.action === 'start' ? 'start_time' : 'end_time';

        if (job[otpField] === otp) {
            const updateData: any = { tracking_status: newTrackingStatus };
            updateData[timeField] = new Date().toISOString();
            
            if(newTrackingStatus === 'Completed') {
                updateData.status = 'Completed';
            }

            const { error } = await supabase.from('orders').update(updateData).eq('id', otpConfig.jobId);
            if (error) console.error("Error updating job status:", error);
            else {
                hideOtpModal();
                fetchJobs();
            }
        } else {
            alert('Invalid OTP');
        }
    };
    
    const confirmPayment = async (jobId: number, method: 'Cash' | 'Worker QR') => {
        const { error } = await supabase.from('orders').update({ payment_status: `Paid via ${method}` }).eq('id', jobId);
        if (error) console.error("Error confirming payment:", error);
        else {
            fetchJobs();
            deselectJob();
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

    const hasActiveJob = jobs.some(job => job.worker_id === worker?.id && job.status === 'ongoing');

    return {
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
        confirmPayment,
    };
};

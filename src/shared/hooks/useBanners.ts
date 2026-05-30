// src/shared/hooks/useBanners.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Banner } from '../types/types';

export const useBanners = (enableRealtime = false) => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const subscriptionRef = useRef<any>(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                setError(fetchError.message);
                setBanners([]);
            } else {
                setBanners(data || []);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanners();

        // Setup real-time subscription if enabled
        if (enableRealtime) {
            const channel = supabase
                .channel('public:banners')
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'banners',
                    },
                    (payload: any) => {
                        if (payload.eventType === 'INSERT') {
                            setBanners(prev => [payload.new, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setBanners(prev =>
                                prev.map(b => (b.id === payload.new.id ? payload.new : b))
                            );
                        } else if (payload.eventType === 'DELETE') {
                            setBanners(prev => prev.filter(b => b.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();

            subscriptionRef.current = channel;

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [fetchBanners, enableRealtime]);

    return { banners, loading, error, refetch: fetchBanners };
};

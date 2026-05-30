// src/shared/hooks/useBanners.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Banner } from '../types/types';

export const useBanners = () => {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase.from('banners').select('*').order('id', { ascending: true });
        if (error) {
            setError(error.message);
            setBanners([]);
        } else {
            setBanners(data || []);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    return { banners, loading, error, refetch: fetchBanners };
};

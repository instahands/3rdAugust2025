// src/admin/hooks/useAdminData.ts

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../shared/lib/supabaseClient';
import { Profile, Order, Address } from '../../shared/types/types';

export const useAdminData = () => {
    const [users, setUsers] = useState<Profile[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        console.log("--- DEBUG: Starting data fetch... ---");
        setLoading(true);
        setError(null);

        try {
            // STEP 1: Session check
            console.log("DEBUG: Checking for Supabase session...");
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("DEBUG: Session Error!", sessionError);
                throw new Error(`Authentication error: ${sessionError.message}`);
            }
            
            if (!sessionData.session) {
                console.warn("DEBUG: No active session found. User is not logged in.");
                setLoading(false);
                return;
            }
            
            console.log("DEBUG: Session found for user:", sessionData.session.user.id);

            // STEP 2: Data fetching
            console.log("DEBUG: Session confirmed. Fetching users, orders, and addresses...");
            const [usersResponse, ordersResponse, addressesResponse] = await Promise.all([
                supabase.from('profiles').select('*'),
                supabase.from('orders').select('*'),
                supabase.from('addresses').select('*')
            ]);

            // Log users response
            if (usersResponse.error) {
                console.error("DEBUG: Error fetching users!", usersResponse.error);
                throw new Error(`Failed to fetch users: ${usersResponse.error.message}`);
            }
            console.log("DEBUG: Users data received from Supabase:", usersResponse.data);
            setUsers(usersResponse.data || []);

            // Log orders response
            if (ordersResponse.error) {
                console.error("DEBUG: Error fetching orders!", ordersResponse.error);
                throw new Error(`Failed to fetch orders: ${ordersResponse.error.message}`);
            }
            console.log("DEBUG: Orders data received from Supabase:", ordersResponse.data);
            setOrders(ordersResponse.data || []);

            // Log addresses response
            if (addressesResponse.error) {
                console.error("DEBUG: Error fetching addresses!", addressesResponse.error);
                throw new Error(`Failed to fetch addresses: ${addressesResponse.error.message}`);
            }
            console.log("DEBUG: Addresses data received from Supabase:", addressesResponse.data);
            setAddresses(addressesResponse.data || []);

        } catch (err: any) {
            console.error("--- DEBUG: A critical error occurred! ---", err);
            setError(err.message);
        } finally {
            console.log("--- DEBUG: Data fetch process finished. ---");
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const removeUserFromState = (userId: string | number) => {
        setUsers(users.filter(user => user.id !== userId));
    };
    
    return { 
        users, 
        orders, 
        addresses, 
        loading, 
        error, 
        refetchData: fetchData,
        removeUserFromState
    };
};

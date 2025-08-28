// src/pages/ProfileSetupPage.tsx

import { useState, FormEvent, useEffect } from 'react'; // Add useEffect
import { supabase } from '../../shared/lib/supabaseClient';

interface ProfileSetupPageProps {
    onProfileComplete: () => void;
}

export default function ProfileSetupPage({ onProfileComplete }: ProfileSetupPageProps) {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- NEW: useEffect to apply a captured referral code ---
    useEffect(() => {
        const applyCode = async () => {
            const referralCode = localStorage.getItem('referral_code');
            if (referralCode) {
                console.log('Found referral code, applying it now...');
                const { error } = await supabase.rpc('apply_referral_code', { referral_code: referralCode });
                if (error) {
                    console.error('Error applying referral code:', error);
                } else {
                    console.log('Referral code applied successfully.');
                }
                // Clean up the code from storage so it's not used again
                localStorage.removeItem('referral_code');
            }
        };
        applyCode();
    }, []);

    const handleProfileUpdate = async (event: FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        const { error: updateError } = await supabase.auth.updateUser({
            data: { name: fullName, email: email }
        });
        if (updateError) {
            setError(updateError.message);
        } else {
            onProfileComplete();
        }
        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 -m-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center text-gray-800">Complete Your Profile</h2>
                <p className="text-center text-gray-500">Please provide your name and email to continue.</p>
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
                    </div>
                    <div>
                        <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300">
                        {loading ? 'Saving...' : 'Save and Continue'}
                    </button>
                </form>
            </div>
        </div>
    );
}
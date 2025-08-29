// src/worker/pages/WorkerOnboardingPage.tsx
import { useState, FormEvent } from 'react';
import { supabase } from '../../shared/lib/supabaseClient';
import { User } from '@supabase/supabase-js';

interface WorkerOnboardingPageProps {
  user: User;
  onOnboardingComplete: () => void;
}

export const WorkerOnboardingPage = ({ user, onOnboardingComplete }: WorkerOnboardingPageProps) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Update the profile created during sign-up with the new details
        const { error: profileError } = await supabase
            .from('profiles')
            .update({
                name: name,
                phone: phone,
                address: address,
                worker_status: 'pending'
            })
            .eq('id', user.id);
        
        if (profileError) {
            setError(profileError.message);
        } else {
            onOnboardingComplete();
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-100">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-center text-gray-800">Complete Your Worker Profile</h1>
                <p className="text-center text-sm text-gray-500">Submit your details for verification. You'll be notified once your account is approved.</p>
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <input type="tel" placeholder="10-digit Phone Number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} required className="w-full px-4 py-3 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <textarea placeholder="Full Address" value={address} onChange={e => setAddress(e.target.value)} required rows={3} className="w-full px-4 py-3 text-gray-700 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    <button type="submit" disabled={loading} className="w-full py-3 px-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
                        {loading ? 'Submitting...' : 'Submit for Approval'}
                    </button>
                </form>
            </div>
        </div>
    );
};

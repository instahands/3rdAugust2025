// src/components/account/ProfileDetailsPage.tsx (CORRECTED)

import { useState } from 'react';
import { supabase } from '../../supabaseClient';
import SubPageHeader from '../common/SubPageHeader';
import { User } from '@supabase/supabase-js'; // --- NEW: Import User type

// --- NEW: Typed props for the page ---
interface ProfileDetailsPageProps {
    setPage: (page: string) => void;
    currentUser: User | null;
}

export default function ProfileDetailsPage({ setPage, currentUser }: ProfileDetailsPageProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPhone, setIsChangingPhone] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [phoneOtpSent, setPhoneOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [fullName, setFullName] = useState(currentUser?.user_metadata?.name || '');
    // --- MODIFIED: Removed unused setEmail ---
    const [email] = useState(currentUser?.email || '');

    const handleSaveProfile = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        // --- MODIFIED: Removed unused 'data' variable ---
        const { error: updateError } = await supabase.auth.updateUser({
            data: { name: fullName }
        });

        if (updateError) {
            setError(updateError.message);
        } else {
            setSuccess("Profile updated successfully!");
            setIsEditing(false);
        }
        setLoading(false);
    };

    const handleSendPhoneOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const { error: phoneError } = await supabase.auth.updateUser({ phone: `+91${phone}` });
        if (phoneError) {
            setError(phoneError.message);
        } else {
            setPhoneOtpSent(true);
            setSuccess(`OTP sent to +91${phone}`);
        }
        setLoading(false);
    };

    const handleVerifyPhoneOtp = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const { error: verifyError } = await supabase.auth.verifyOtp({ phone: `+91${phone}`, token: otp, type: 'phone_change' });
        if (verifyError) {
            setError(verifyError.message);
        } else {
            setSuccess("Phone number updated successfully!");
            setIsChangingPhone(false);
            setPhoneOtpSent(false);
            setPhone('');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto px-4 pt-4">
            <SubPageHeader title="Profile Details" onBack={() => setPage('account')} />
            <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                {success && <p className="text-green-500 text-sm text-center bg-green-100 p-2 rounded-md">{success}</p>}
                
                <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!isEditing} className="w-full p-3 bg-gray-50 border rounded-lg mt-1 disabled:bg-gray-100"/>
                </div>
                
                <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="p-3 bg-gray-100 rounded-lg mt-1 text-gray-500">{email || 'Not set'}</p>
                </div>

                {isEditing && ( <button onClick={handleSaveProfile} disabled={loading} className="w-full py-3 mt-4 text-white font-bold bg-green-600 rounded-lg disabled:bg-gray-400"> {loading ? 'Saving...' : 'Save Changes'} </button> )}
                
                <div className="pt-4 border-t">
                    <label className="text-sm font-medium text-gray-500">Phone Number</label>
                    <p className="p-3 bg-gray-100 rounded-lg mt-1 text-gray-500">{currentUser?.phone || 'Not set'}</p>
                    {!isChangingPhone && (
                         <button onClick={() => { setIsChangingPhone(true); setError(''); setSuccess(''); }} className="text-sm text-green-600 font-semibold mt-2">
                           {currentUser?.phone ? 'Change Phone Number' : 'Add Phone Number'}
                        </button>
                    )}
                    {isChangingPhone && !phoneOtpSent && (
                        <div className="mt-4 space-y-2">
                             <input type="tel" placeholder="Enter new 10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full p-3 bg-gray-50 border rounded-lg"/>
                             <button onClick={handleSendPhoneOtp} disabled={loading || phone.length < 10} className="w-full py-2 text-white bg-blue-600 rounded-lg disabled:bg-gray-400"> {loading ? 'Sending...' : 'Send OTP'} </button>
                        </div>
                    )}
                    {isChangingPhone && phoneOtpSent && (
                         <div className="mt-4 space-y-2">
                             <input type="tel" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full p-3 bg-gray-50 border rounded-lg"/>
                             <button onClick={handleVerifyPhoneOtp} disabled={loading || otp.length < 6} className="w-full py-2 text-white bg-blue-600 rounded-lg disabled:bg-gray-400"> {loading ? 'Verifying...' : 'Verify & Save'} </button>
                        </div>
                    )}
                </div>
                
                {!isEditing && !isChangingPhone && (
                     <button onClick={() => setIsEditing(true)} className="w-full py-3 mt-4 text-white font-bold bg-green-600 rounded-lg"> Edit Profile </button>
                )}
            </div>
        </div>
    );
}
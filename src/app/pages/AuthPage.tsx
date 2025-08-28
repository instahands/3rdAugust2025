// src/pages/AuthPage.tsx

import { useState } from 'react';
import { supabase } from '../../shared/lib/supabaseClient';

// --- Helper Components ---
const AuthLogo = () => (
    <div>
        <span className="text-black text-5xl font-bold">Insta</span>
        <span className="text-green-500 text-5xl font-bold">Hands</span>
    </div>
);

const GoogleIcon = () => <svg className="w-6 h-6 mr-2" viewBox="0 0 48 48"><path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>;


export default function AuthPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (phoneNumber.length < 10) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }
        setError('');
        setLoading(true);
        const { error } = await supabase.auth.signInWithOtp({ phone: `+91${phoneNumber}` });
        if (error) {
            setError(error.message);
        } else {
            setOtpSent(true);
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (otp.length < 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }
        setError('');
        setLoading(true);
        const { error } = await supabase.auth.verifyOtp({ phone: `+91${phoneNumber}`, token: otp, type: 'sms' });
        if (error) {
            setError(error.message);
        }
        // If successful, the onAuthStateChange listener in MainApp will handle navigation.
        setLoading(false);
    };
    
    // --- THIS IS THE CORRECTED FUNCTION ---
    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'https://instahands.in/app',
            },
        });
        if (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 -m-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg text-center">
                <div className="mb-6"><AuthLogo /></div>
                <h2 className="text-2xl font-bold text-center text-gray-800">Login or Sign Up</h2>
                {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
                
                {!otpSent ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+91</span>
                            <input type="tel" placeholder="Mobile Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="w-full pl-12 pr-4 py-3 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
                        </div>
                        <button onClick={handleSendOtp} disabled={loading || phoneNumber.length < 10} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300">
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">Enter the 6-digit OTP sent to +91 {phoneNumber}</p>
                        <input type="tel" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full px-4 py-3 text-center tracking-[0.5em] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"/>
                        <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-300">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button onClick={() => setOtpSent(false)} className="text-sm text-gray-500 hover:underline">Change Number</button>
                    </div>
                )}
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-t border-gray-300" />
                    <span className="px-2 text-sm text-gray-500">OR</span>
                    <hr className="flex-grow border-t border-gray-300" />
                </div>
                <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    <GoogleIcon />
                    <span className="font-medium text-gray-700">Sign in with Google</span>
                </button>
            </div>
        </div>
    );
}
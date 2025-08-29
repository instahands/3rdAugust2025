// src/worker/pages/LoginPage.tsx
import { useState, FormEvent } from 'react';
import { supabase } from '../../shared/lib/supabaseClient';

// --- Reusable Logo Component ---
const AuthLogo = () => (
    <div className="text-center mb-4">
        <span className="text-black text-5xl font-bold">Insta</span>
        <span className="text-green-500 text-5xl font-bold">Hands</span>
        <p className="text-gray-500 mt-2 font-semibold">for Workers</p>
    </div>
);

// --- NEW: Google Icon Component ---
const GoogleIcon = () => (
    <svg className="w-6 h-6 mr-3" viewBox="0 0 48 48">
        <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.28l7.73 6C42.47 40.49 48 33.16 48 24c0-.66-.07-1.3-.18-1.93l-1.44-1.52z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);


export const LoginPage = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`,
      options: {
        shouldCreateUser: true, 
      }
    });

    if (error) {
      setError(error.message);
    } else {
      setOtpSent(true);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms'
    });

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  // --- NEW: Google Login Handler ---
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/worker`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <AuthLogo />
        {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
        
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <h2 className="text-center text-lg font-semibold text-gray-700">
              Enter your phone number to login or register
            </h2>
            <div className="flex items-center border border-gray-200 rounded-lg focus-within:ring-2 focus-within:ring-green-500">
              <span className="px-3 text-gray-500 bg-gray-50 py-3 rounded-l-lg">+91</span>
              <input 
                type="tel" 
                placeholder="10-digit mobile number" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                required 
                className="w-full px-4 py-3 text-gray-700 bg-white border-l-0 rounded-r-lg focus:outline-none"
              />
            </div>
            <button type="submit" disabled={loading || phone.length < 10} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 flex flex-col items-center">
             <h2 className="text-center text-lg font-semibold text-gray-700">
              Enter the OTP sent to +91 {phone}
            </h2>
            <input 
              type="tel" 
              placeholder="6-digit OTP" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              className="w-full p-3 text-center tracking-[0.5em] text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button type="submit" disabled={loading || otp.length < 6} className="w-full py-3 px-4 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400">
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button onClick={() => setOtpSent(false)} className="text-sm text-gray-500 hover:underline">
              Change Number
            </button>
          </form>
        )}

        {/* --- NEW: Divider and Google Login Button --- */}
        <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="px-4 text-sm font-semibold text-gray-400">OR</span>
            <hr className="flex-grow border-t border-gray-300" />
        </div>

        <button 
            onClick={handleGoogleLogin} 
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
            <GoogleIcon />
            <span className="font-semibold text-gray-700">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};


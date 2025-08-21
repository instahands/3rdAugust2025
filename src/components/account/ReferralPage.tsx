// src/components/account/ReferralPage.tsx (FINAL CORRECTED VERSION)

import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js';
import SubPageHeader from '../common/SubPageHeader';

interface Referral {
    id: string;
    status: 'pending' | 'completed';
    referred_user_name: string;
    created_at: string;
}

interface ReferralPageProps {
    setPage: (page: string) => void;
    currentUser: User | null;
}

const ShareIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367-2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
);

export default function ReferralPage({ setPage, currentUser }: ReferralPageProps) {
    const [loading, setLoading] = useState(true);
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [referrals, setReferrals] = useState<Referral[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) {
                setLoading(false);
                return;
            }

            try {
                const [profileRes, referralsRes] = await Promise.all([
                    supabase
                        .from('profiles')
                        .select('referral_code')
                        .eq('user_id', currentUser.id)
                        .maybeSingle(), // FIX 1: Use .maybeSingle() for more resilient code
                    supabase
                        .from('referrals')
                        .select(`
                            id,
                            status,
                            created_at,
                            referred_user_profile:profiles!referred_user_id(name)
                        `) // FIX 2: Explicitly state the foreign key 'referred_user_id' for the join
                        .eq('referrer_id', currentUser.id)
                ]);

                if (profileRes.error && profileRes.error.code !== 'PGRST116') throw profileRes.error;
                if (profileRes.data) setReferralCode(profileRes.data.referral_code);

                if (referralsRes.error) throw referralsRes.error;
                if (referralsRes.data) {
                    const formattedReferrals = referralsRes.data.map((r: any) => ({
                        id: r.id,
                        status: r.status,
                        referred_user_name: r.referred_user_profile?.name || 'New User',
                        created_at: r.created_at,
                    }));
                    setReferrals(formattedReferrals);
                }

            } catch (error) {
                console.error('Error fetching referral data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    const referralLink = `https://instahands.in/app#ref=${referralCode}`;

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Get 50% Off at InstaHands!',
                text: `I'm using InstaHands for on-demand help. Sign up with my code ${referralCode} to get 50% off your first booking!`,
                url: referralLink,
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(referralLink);
            alert("Referral link copied to clipboard!");
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-24">
            <SubPageHeader title="Refer & Earn" onBack={() => setPage('account')} />
            
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow text-center">
                    {loading ? (
                        <p>Loading your referral code...</p>
                    ) : referralCode ? (
                        <>
                            <h3 className="text-xl font-bold">Invite a Friend, Get ₹100!</h3>
                            <p className="text-gray-600 mt-2">Share your link with friends. When they complete their first booking, you get ₹100 in your wallet.</p>
                            <div className="my-4 p-3 bg-gray-100 border-2 border-dashed rounded-lg">
                                <p className="font-mono text-lg tracking-wider">{referralCode}</p>
                            </div>
                            <button onClick={handleShare} className="w-full py-3 text-white font-bold bg-green-600 rounded-lg hover:bg-green-700 flex items-center justify-center">
                                <ShareIcon />
                                Share Your Link
                            </button>
                        </>
                    ) : (
                        <p>Could not find your referral code. Please contact support.</p>
                    )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">How It Works</h3>
                    <ol className="space-y-3 text-gray-600">
                        <li className="flex items-start"><span className="bg-green-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">1</span>Invite your friends to InstaHands with your unique referral code.</li>
                        <li className="flex items-start"><span className="bg-green-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">2</span>Your friend gets 50% off on their first booking.</li>
                        <li className="flex items-start"><span className="bg-green-600 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold mr-3">3</span>You get ₹100 in your wallet after their service is completed.</li>
                    </ol>
                </div>

                <div className="bg-white p-6 rounded-xl shadow">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">My Referrals</h3>
                    {loading ? (
                        <p className="text-sm text-gray-500">Loading your referrals...</p>
                    ) : referrals.length > 0 ? (
                        <div className="space-y-3">
                            {referrals.map(ref => (
                                <div key={ref.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold">{ref.referred_user_name}</p>
                                        <p className="text-xs text-gray-500">Invited on {new Date(ref.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${ref.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {ref.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">You haven't referred anyone yet. Share your link to start earning!</p>
                    )}
                </div>
            </div>
        </div>
    );
}
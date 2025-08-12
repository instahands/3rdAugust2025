// src/pages/LandingPage.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient'; // Using the shared client

// --- DATA CONSTANTS ---
const problems = ['Who will Clean my room?', 'Too much laundry to wash?', 'No time to fold clothes?', 'Need help with Home cleaning?', 'Who will get my groceries?', 'No maid? Who will help?', 'Tired of doing everything alone?'];
const services = ["Full home cleaning", "Kitchen cleaning", "Laundry sorted", "Groceries delivered", "Errands run", "Clothes folded", "Room tidied up", "Bathroom deep cleaned"];
const locationData = [{ name: "Sector 10, Bhilai", coords: { top: '48%', left: '35%' } }, { name: "Padmanabhpur, Durg", coords: { top: '70%', left: '75%' } }, { name: "Mohan Nagar, Durg", coords: { top: '55%', left: '60%' } }, { name: "Smriti Nagar, Bhilai", coords: { top: '30%', left: '42%' } }, { name: "Civic Center, Bhilai", coords: { top: '40%', left: '50%' } }, { name: "Risali, Bhilai", coords: { top: '65%', left: '30%' } }, { name: "Sector 6, Bhilai", coords: { top: '55%', left: '40%' } }, { name: "Hudco, Bhilai", coords: { top: '75%', left: '45%' } }, { name: "Vaishali Nagar, Bhilai", coords: { top: '25%', left: '55%' } }, { name: "Borsi, Durg", coords: { top: '80%', left: '65%' } }, { name: "Station Road, Durg", coords: { top: '40%', left: '70%' } }, { name: "Nehru Nagar, Bhilai", coords: { top: '35%', left: '60%' } }];

// --- TYPE DEFINITIONS ---
interface Popup {
    id: number;
    text: string;
    coords: { top: string; left: string };
    exiting: boolean;
}

// --- THE REACT COMPONENT ---
const LandingPage = () => {
    // State managed by React hooks
    const [problemStatement, setProblemStatement] = useState(problems[0]);
    const [mobileNumber, setMobileNumber] = useState('');
    const [validationMessage, setValidationMessage] = useState({ text: '', type: 'error' });
    const [formState, setFormState] = useState({ loading: false, success: false });
    const [popups, setPopups] = useState<Popup[]>([]);

    // Effect for rotating problem statements
    useEffect(() => {
        const problemElement = document.getElementById('problem-statement');
        if (!problemElement) return;
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            problemElement.style.opacity = '0';
            setTimeout(() => {
                currentIndex = (currentIndex + 1) % problems.length;
                setProblemStatement(problems[currentIndex]);
                problemElement.style.opacity = '1';
            }, 500);
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);

    // Effect for social proof popups
    useEffect(() => {
        const createPopup = () => {
            const randomService = services[Math.floor(Math.random() * services.length)];
            const randomLocation = locationData[Math.floor(Math.random() * locationData.length)];
            const newPopup: Popup = { id: Date.now() + Math.random(), text: `✅ ${randomService} in ${randomLocation.name}!`, coords: randomLocation.coords, exiting: false };
            setPopups(prev => [...prev, newPopup]);
            setTimeout(() => {
                setPopups(prev => prev.map(p => p.id === newPopup.id ? { ...p, exiting: true } : p));
                setTimeout(() => setPopups(prev => prev.filter(p => p.id !== newPopup.id)), 400);
            }, 3500);
        };
        const intervalId = setInterval(createPopup, 4000);
        return () => clearInterval(intervalId);
    }, []);

    // Form submission handler
    const handleOfferSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (mobileNumber.length !== 10) {
            setValidationMessage({ text: 'Please enter a valid 10-digit mobile number.', type: 'error' });
            return;
        }
        if (!supabase) return;
        setFormState({ ...formState, loading: true });
        try {
            const { data } = await supabase.from('landing_page_leads').select('id').eq('phone_number', mobileNumber).single();
            if (data) {
                setValidationMessage({ text: 'This number has already claimed the offer.', type: 'error' });
            } else {
                const { error } = await supabase.from('landing_page_leads').insert({ phone_number: mobileNumber });
                if (error) throw error;
                setValidationMessage({ text: 'Offer successfully claimed!', type: 'success' });
                setFormState({ loading: false, success: true });
            }
        } catch (error: any) {
            setValidationMessage({ text: 'An error occurred. Please try again.', type: 'error' });
        } finally {
            setFormState(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <>
            <Helmet>
                <title>Your Personal Helper in Bhilai & Durg</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet" />
            </Helmet>

            <header className="absolute top-0 left-0 right-0 p-6 z-30">
                <div className="container mx-auto flex justify-between items-center">
                    <a href="#" className="text-2xl font-bold">
                        <span className="text-black">Insta</span><span className="text-green-900">Hands</span>
                    </a>
                    <a href="/app" className="bg-white text-green-800 font-bold py-2 px-6 rounded-full shadow-sm hover:bg-gray-100 transition-colors">
                        Login/Sign Up
                    </a>
                </div>
            </header>

            <main className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12">
                <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 opacity-50"></div>
                <div className="container mx-auto text-center px-6 z-10">
                    <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 h-48 md:h-32 flex items-center justify-center">
                        <span id="problem-statement" className="text-gradient">{problemStatement}</span>
                    </h2>
                    <p className="text-lg md:text-xl text-green-800 max-w-2xl mx-auto mb-8">
                        Insta Hands- One Tap, All Sorted !
                    </p>
                    <a href="/app" className="bg-green-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg shadow-green-500/50">
                        LogIn & Get a Hand
                    </a>
                    <div className="mt-12 max-w-lg mx-auto">
                        <div className="bg-white/60 backdrop-blur-sm border border-green-200/50 rounded-2xl shadow-lg p-6 text-center">
                            <h3 className="text-2xl font-bold text-green-900">Get <span className="text-yellow-500">50% OFF</span> On Your First Task!</h3>
                            <p className="text-green-800 mt-1 mb-4">Limited-time offer! Enter your number now.</p>
                            <form onSubmit={handleOfferSubmit}>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="relative flex-grow">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                            </svg>
                                        </div>
                                        <input type="text" placeholder="Enter your mobile number" className="w-full p-3 pl-10 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500" maxLength={10} value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))} disabled={formState.success} />
                                    </div>
                                    <button type="submit" className="bg-green-800 text-white font-bold py-3 px-6 rounded-full hover:bg-green-900 transition-colors whitespace-nowrap disabled:bg-gray-400" disabled={formState.loading || formState.success}>
                                        {formState.success ? 'Claimed!' : formState.loading ? 'Checking...' : 'Claim My Offer'}
                                    </button>
                                </div>
                                <p className={`text-sm mt-2 h-5 text-left sm:text-center ${validationMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>{validationMessage.text}</p>
                            </form>
                        </div>
                    </div>
                </div>
            </main>

            <section id="local-buzz" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-green-900">Trusted By Your Neighbors</h3>
                        <p className="text-gray-600 mt-2">See the activity happening right now in Bhilai & Durg.</p>
                    </div>
                    <div id="map-container" className="relative max-w-4xl mx-auto aspect-video rounded-2xl bg-green-100 border-4 border-green-200 shadow-lg overflow-hidden">
                        <iframe src="http://googleusercontent.com/maps.google.com/5" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={false} loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                        <div id="map-overlay" className="absolute inset-0 pointer-events-none">
                            {popups.map(popup => (
                                <div key={popup.id} className={`popup-animation ${popup.exiting ? 'exiting' : ''} absolute bg-white/80 backdrop-blur-sm text-green-900 text-xs sm:text-sm font-semibold py-2 px-3 rounded-full shadow-lg pointer-events-auto`} style={{ top: popup.coords.top, left: popup.coords.left }}>
                                    {popup.text}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h3 className="text-4xl font-bold text-green-900">Get Started in 3 Easy Steps</h3>
                        <p className="text-gray-600 mt-2">Booking your next service is simple and fast.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 md:gap-8 text-center relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-24">
                            <svg width="100%" height="100%">
                                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="8 8" />
                            </svg>
                        </div>
                        <div className="flex flex-col items-center z-10 bg-gray-50 px-4">
                            <div className="flex items-center justify-center bg-green-600 text-white w-20 h-20 rounded-full text-3xl font-bold mb-4 shadow-lg border-4 border-white">1</div>
                            <h4 className="text-xl font-bold text-green-800 mb-2">Select Service</h4>
                            <p className="text-gray-600">Browse our curated list of services and pick what you need.</p>
                        </div>
                        <div className="flex flex-col items-center z-10 bg-gray-50 px-4">
                            <div className="flex items-center justify-center bg-green-600 text-white w-20 h-20 rounded-full text-3xl font-bold mb-4 shadow-lg border-4 border-white">2</div>
                            <h4 className="text-xl font-bold text-green-800 mb-2">Select Date & Time</h4>
                            <p className="text-gray-600">Choose a time slot that works perfectly with your schedule.</p>
                        </div>
                        <div className="flex flex-col items-center z-10 bg-gray-50 px-4">
                            <div className="flex items-center justify-center bg-green-600 text-white w-20 h-20 rounded-full text-3xl font-bold mb-4 shadow-lg border-4 border-white">3</div>
                            <h4 className="text-xl font-bold text-green-800 mb-2">Pay & Book</h4>
                            <p className="text-gray-600">Confirm with a secure payment and you're all set!</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="stories" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-bold text-green-900">Why People Love Us</h3>
                        <p className="text-gray-600 mt-2">Real stories from our amazing customers.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="card-hover bg-gray-50 p-8 rounded-xl shadow-md">
                            <p className="text-gray-700 mb-4">"I never knew I could get such amazing deals locally. This app changed how I shop in Bhilai. It's a must-have for anyone looking to save money and discover new places."</p>
                            <div className="font-bold text-green-800">- Anjali S., Sector 10, Bhilai</div>
                        </div>
                        <div className="card-hover bg-gray-50 p-8 rounded-xl shadow-md">
                            <p className="text-gray-700 mb-4">"The convenience is unmatched. I found a fantastic offer for a local restaurant in Durg and had a wonderful evening with my family. Highly recommended!"</p>
                            <div className="font-bold text-green-800">- Rahul V., Padmanabhpur, Durg</div>
                        </div>
                        <div className="card-hover bg-gray-50 p-8 rounded-xl shadow-md">
                            <p className="text-gray-700 mb-4">"Finally, an app that understands the local market. The offers are relevant, and the platform is so easy to use. It's my go-to for everything now."</p>
                            <div className="font-bold text-green-800">- Priya M., Civic Center, Bhilai</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="vlogs" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-bold text-green-900">Latest From Our Vlog</h3>
                        <p className="text-gray-600 mt-2">Check out our latest tips, tricks, and local highlights.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="card-hover bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://placehold.co/600x400/16a34a/ffffff?text=Vlog+1" alt="Vlog thumbnail" className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-bold text-xl mb-2 text-green-800">Discovering Hidden Gems in Durg</h4>
                                <p className="text-gray-600 text-sm">Join us as we explore some of the best-kept secrets in the city.</p>
                            </div>
                        </div>
                        <div className="card-hover bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://placehold.co/600x400/15803d/ffffff?text=Vlog+2" alt="Vlog thumbnail" className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-bold text-xl mb-2 text-green-800">5 Tips for Saving Big in Bhilai</h4>
                                <p className="text-gray-600 text-sm">Learn how to make the most of our app with these pro tips.</p>
                            </div>
                        </div>
                        <div className="card-hover bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://placehold.co/600x400/14532d/ffffff?text=Vlog+3" alt="Vlog thumbnail" className="w-full h-48 object-cover" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h4 className="font-bold text-xl mb-2 text-green-800">A Day in the Life</h4>
                                <p className="text-gray-600 text-sm">Follow our team and see how we bring the best offers to you.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="contact" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h3 className="text-4xl font-bold text-green-900">Get In Touch</h3>
                        <p className="text-gray-600 mt-2">Have questions? We'd love to hear from you.</p>
                    </div>
                    <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl shadow-lg">
                        <form>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input type="text" id="name" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Your Name" />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input type="email" id="email" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="Your Email" />
                                </div>
                            </div>
                            <div className="mt-6">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea id="message" rows={5} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" placeholder="How can we help?"></textarea>
                            </div>
                            <div className="text-center mt-8">
                                <button type="submit" className="bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg shadow-green-500/50">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </section>

            <footer className="bg-green-900 text-white py-8">
                <div className="container mx-auto text-center">
                    <p>© {new Date().getFullYear()} Insta Hands. All Rights Reserved.</p>
                </div>
            </footer>

            <style>{`
                body {
                    font-family: 'Inter', sans-serif;
                    background-color: #f0fdf4;
                    scroll-behavior: smooth;
                    color: #1f2937;
                }
                .text-gradient {
                    background: linear-gradient(to right, #16a34a, #15803d);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                #problem-statement {
                    transition: opacity 0.5s ease-in-out;
                    display: inline-block;
                }
                .card-hover {
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .card-hover:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }
                @keyframes popup-enter {
                    0% { transform: scale(0.5) translateY(10px); opacity: 0; }
                    70% { transform: scale(1.05) translateY(0); opacity: 1; }
                    100% { transform: scale(1) translateY(0); opacity: 1; }
                }
                @keyframes popup-exit {
                    0% { transform: scale(1); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0; }
                }
                .popup-animation {
                    animation: popup-enter 0.4s ease-out forwards;
                }
                .popup-animation.exiting {
                    animation: popup-exit 0.4s ease-in forwards;
                }
                #map-container iframe {
                    filter: grayscale(80%) contrast(90%) brightness(110%);
                }
                #map-overlay {
                    background-color: rgba(209, 250, 229, 0.2);
                }
            `}</style>
        </>
    );
};

export default LandingPage;


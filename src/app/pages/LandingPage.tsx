// src/pages/LandingPage.tsx

"use client";

import { useState, useEffect, FormEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../../shared/lib/supabaseClient';
import { GoogleMap, useJsApiLoader, Polygon, OverlayView } from '@react-google-maps/api';

// --- Local Imports for Service Logic and Data ---
import { isLocationInServiceArea } from '../../shared/lib/locationService';
import { bhilaiDurgServiceAreaCoords, locationDataWithCoords } from '../data/coordinates';

// --- Environment Variable for API Key ---
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// --- DATA CONSTANTS ---
const problems = ['Who will Clean my room?', 'Too much laundry to wash?', 'No time to fold clothes?', 'Need help with Home cleaning?', 'Who will get my groceries?', 'No maid? Who will help?', 'Tired of doing everything alone?'];
const services = ["Full home cleaning", "Kitchen cleaning", "Laundry sorted", "Groceries delivered", "Errands run", "Clothes folded", "Room tidied up", "Bathroom deep cleaned"];

// --- Map-related Constants ---
const polygonPath = bhilaiDurgServiceAreaCoords.map(coord => ({ lat: coord[1], lng: coord[0] }));
const mapContainerStyle = { width: '100%', height: '100%' };
const center = { lat: 21.195, lng: 81.32 };
const mapOptions = {
    disableDefaultUI: true,
    gestureHandling: 'none',
    zoomControl: false,
    scrollwheel: false,
    styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] }
    ]
};
const polygonOptions = {
  fillColor: '#16a34a',
  fillOpacity: 0.2,
  strokeColor: '#16a34a',
  strokeOpacity: 0.9,
  strokeWeight: 2,
  clickable: false,
  draggable: false,
  editable: false,
  geodesic: false,
  zIndex: 1
};

// --- TYPE DEFINITIONS ---
interface Popup {
    id: number;
    text: string;
    lat: number;
    lng: number;
    exiting: boolean;
}

// --- THE REACT COMPONENT ---
const LandingPage = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: API_KEY as string,
        libraries: ['places'],
    });

    // --- Component State ---
    const [popups, setPopups] = useState<Popup[]>([]);
    const [problemStatement, setProblemStatement] = useState(problems[6]);
    const [mobileNumber, setMobileNumber] = useState('');
    const [validationMessage, setValidationMessage] = useState({ text: '', type: 'error' });
    const [formState, setFormState] = useState({ loading: false, success: false });
    const [checkAddress, setCheckAddress] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [checkResult, setCheckResult] = useState({ message: '', type: '' });

    // Effect for rotating problem statements
    useEffect(() => {
        let currentIndex = 6;
        const intervalId = setInterval(() => {
            const problemElement = document.getElementById('problem-statement');
            if(problemElement) {
                problemElement.style.opacity = '0';
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % problems.length;
                    setProblemStatement(problems[currentIndex]);
                    problemElement.style.opacity = '1';
                }, 500);
            }
        }, 3000);
        return () => clearInterval(intervalId);
    }, []);

    // Effect for social proof popups
    useEffect(() => {
        const createPopup = () => {
            const randomService = services[Math.floor(Math.random() * services.length)];
            const randomLocation = locationDataWithCoords[Math.floor(Math.random() * locationDataWithCoords.length)];
            const newPopup: Popup = {
                id: Date.now() + Math.random(),
                text: `${randomService} in ${randomLocation.name}!`,
                lat: randomLocation.lat,
                lng: randomLocation.lng,
                exiting: false
            };
            setPopups(prev => [...prev, newPopup]);
            setTimeout(() => {
                setPopups(prev => prev.map(p => p.id === newPopup.id ? { ...p, exiting: true } : p));
                setTimeout(() => setPopups(prev => prev.filter(p => p.id !== newPopup.id)), 400);
            }, 3500);
        };
        const intervalId = setInterval(createPopup, 4000);
        return () => clearInterval(intervalId);
    }, []);

    // Form submission handler for the offer
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

    // Form submission handler for the availability check
    const handleCheckAvailability = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!checkAddress) return;
        setIsChecking(true);
        setCheckResult({ message: '', type: '' });
        if (!window.google) {
            setCheckResult({ message: 'Map service not loaded. Please try again.', type: 'error' });
            setIsChecking(false);
            return;
        }
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: checkAddress, componentRestrictions: { country: 'IN' } }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                const userCoords = { lat: location.lat(), lng: location.lng() };
                const isInArea = isLocationInServiceArea(userCoords);
                if (isInArea) {
                    setCheckResult({ message: 'Great news! We are available in your area.', type: 'success' });
                } else {
                    setCheckResult({ message: "Sorry, we're not in your area yet, but we're expanding!", type: 'error' });
                }
            } else {
                setCheckResult({ message: 'Could not find that location. Please try a different address.', type: 'error' });
            }
            setIsChecking(false);
        });
    };

    return (
        <>
            <Helmet>
                <title>InstaHands: Top-Rated Home Services in Bhilai & Durg | 50% Off First Booking</title>
                <meta name="description" content="Get reliable and fast on-demand home services in Bhilai and Durg with InstaHands. From cleaning and laundry to grocery delivery, we handle your daily chores. Book now and get 50% off your first task!" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Helmet>

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
                @keyframes popupFadeIn {
                  0% { opacity: 0; transform: scale(0.8); }
                  100% { opacity: 1; transform: scale(1); }
                }
                @keyframes popupFadeOut {
                  0% { opacity: 1; transform: scale(1); }
                  100% { opacity: 0; transform: scale(0.8); }
                }
                .popup-animation {
                  animation: popupFadeIn 0.4s ease forwards;
                }
                .popup-animation.exiting {
                  animation: popupFadeOut 0.4s ease forwards;
                }
            `}</style>

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
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4">
                        Your One-Tap Solution for Home Services in <span className="text-gradient">Bhilai & Durg</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mt-6 mb-8">
                        Welcome to InstaHands, the top-rated app for all your home service needs. Reclaim your free time by making a booking with our trusted professionals for cleaning, laundry, and more.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 mb-8">
                        <p className="text-lg md:text-xl text-green-800" id="problem-statement">
                           {problemStatement}
                        </p>
                        <a href="/app" className="bg-green-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-lg shadow-green-500/50 whitespace-nowrap">
                            LogIn & Get a Hand
                        </a>
                    </div>
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
                        <h2 className="text-4xl font-bold text-green-900">Trusted By Your Neighbors</h2>
                        <p className="text-gray-600 mt-2">See the activity happening right now in Bhilai & Durg.</p>
                    </div>
                    <div id="map-container" className="relative max-w-4xl mx-auto aspect-video rounded-2xl bg-green-100 border-4 border-green-200 shadow-lg overflow-hidden">
                        {isLoaded ? (
                            <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={12} options={mapOptions}>
                                <Polygon paths={polygonPath} options={polygonOptions} />
                                {popups.map(popup => (
                                  <OverlayView key={popup.id} position={{ lat: popup.lat, lng: popup.lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
                                    <div className={`popup-animation ${popup.exiting ? "exiting" : ""} inline-flex items-center bg-white text-green-800 text-base sm:text-lg font-semibold px-3 py-1 rounded-lg shadow-lg border border-gray-200 whitespace-nowrap -translate-x-1/2 -translate-y-1/2`}>
                                      ✓ {popup.text}
                                    </div>
                                  </OverlayView>
                                ))}
                            </GoogleMap>
                        ) : (
                            <div className="flex items-center justify-center h-full">Loading Map...</div>
                        )}
                    </div>
                </div>
            </section>

            <section id="area-check" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12 max-w-2xl mx-auto">
                        <h2 className="text-4xl font-bold text-green-900">Check Your Area</h2>
                        <p className="text-gray-600 mt-2">Enter your location to see if we're in your neighborhood.</p>
                    </div>
                    <div className="max-w-xl mx-auto">
                        <form onSubmit={handleCheckAvailability} className="bg-white p-6 rounded-2xl shadow-lg">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <input type="text" placeholder="Enter your address, area, or pincode" className="w-full p-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-green-500 focus:border-green-500" value={checkAddress} onChange={(e) => setCheckAddress(e.target.value)} disabled={isChecking} />
                                <button type="submit" className="bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-colors whitespace-nowrap disabled:bg-gray-400" disabled={isChecking}>
                                    {isChecking ? 'Checking...' : 'Check Availability'}
                                </button>
                            </div>
                        </form>
                        {checkResult.message && (
                            <p className={`text-center mt-4 font-semibold ${checkResult.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                {checkResult.message}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <section id="how-it-works" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-green-900">Get Started in 3 Easy Steps</h2>
                        <p className="text-gray-600 mt-2">Booking your next service is simple and fast.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-12 md:gap-8 text-center relative">
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-px -translate-y-24">
                            <svg width="100%" height="100%"><line x1="0" y1="50%" x2="100%" y2="50%" stroke="#d1d5db" strokeWidth="2" strokeDasharray="8 8" /></svg>
                        </div>
                        <div className="flex flex-col items-center z-10 bg-gray-50 px-4">
                            <div className="flex items-center justify-center bg-green-600 text-white w-20 h-20 rounded-full text-3xl font-bold mb-4 shadow-lg border-4 border-white">1</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Select Service</h3>
                            <p className="text-gray-600">Browse our curated list of services and pick what you need.</p>
                        </div>
                        <div className="flex flex-col items-center z-10 bg-gray-50 px-4">
                            <div className="flex items-center justify-center bg-green-600 text-white w-20 h-20 rounded-full text-3xl font-bold mb-4 shadow-lg border-4 border-white">2</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Select Date & Time</h3>
                            <p className="text-gray-600">Choose a time slot that works perfectly with your schedule.</p>
                        </div>
                        <div className="flex flex-col items-center z-10 bg-gray-50 px-4">
                            <div className="flex items-center justify-center bg-green-600 text-white w-20 h-20 rounded-full text-3xl font-bold mb-4 shadow-lg border-4 border-white">3</div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Pay & Book</h3>
                            <p className="text-gray-600">Confirm with a secure payment and you're all set!</p>
                        </div>
                    </div>
                </div>
            </section>

            <section id="stories" className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-green-900">Why People Love Us</h2>
                        <p className="text-gray-600 mt-2">Real stories from our amazing customers.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="card-hover bg-gray-50 p-8 rounded-xl shadow-md">
                            <p className="text-gray-700 mb-4">"Booked a home cleaning service through Insta Hands and I’m so happy with the results! The team was punctual, polite, and did a spotless job. My house feels fresh and tidy — highly recommend for anyone in Bhilai!"</p>
                            <div className="font-bold text-green-800">- Anjali S., Nehrunagar, Bhilai</div>
                        </div>
                        <div className="card-hover bg-gray-50 p-8 rounded-xl shadow-md">
                            <p className="text-gray-700 mb-4">"I needed temporary manpower for shifting goods at my shop. Insta Hands arranged two helpers quickly, and they worked very efficiently. The booking process was smooth, and the support team kept me updated throughout."</p>
                            <div className="font-bold text-green-800">- Rahul V., Chouhan Town, Bhilai</div>
                        </div>
                        <div className="card-hover bg-gray-50 p-8 rounded-xl shadow-md">
                            <p className="text-gray-700 mb-4">"I needed temporary manpower for shifting goods at my shop. Insta Hands arranged two helpers quickly, and they worked very efficiently. The booking process was smooth, and the support team kept me updated throughout."</p>
                            <div className="font-bold text-green-800">- Priya M., Civic Center, Bhilai</div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="vlogs" className="py-20 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-green-900">Latest From Our Vlog</h2>
                        <p className="text-gray-600 mt-2">Check out our latest tips, tricks, and local highlights.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="card-hover bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://placehold.co/600x400/16a34a/ffffff?text=Vlog+1" alt="Vlog thumbnail" className="w-full h-48 object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 text-green-800">Discovering Hidden Gems in Durg</h3>
                                <p className="text-gray-600 text-sm">Join us as we explore some of the best-kept secrets in the city.</p>
                            </div>
                        </div>
                        <div className="card-hover bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://placehold.co/600x400/15803d/ffffff?text=Vlog+2" alt="Vlog thumbnail" className="w-full h-48 object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 text-green-800">5 Tips for Saving Big in Bhilai</h3>
                                <p className="text-gray-600 text-sm">Learn how to make the most of our app with these pro tips.</p>
                            </div>
                        </div>
                        <div className="card-hover bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="relative">
                                <img src="https://placehold.co/600x400/14532d/ffffff?text=Vlog+3" alt="Vlog thumbnail" className="w-full h-48 object-cover" loading="lazy" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <svg className="w-16 h-16 text-white/80" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-xl mb-2 text-green-800">A Day in the Life</h3>
                                <p className="text-gray-600 text-sm">Follow our team and see how we bring the best offers to you.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-green-900 text-white py-12">
                <div className="container mx-auto text-center">
                    <div className="mb-6">
                        <p className="text-lg font-semibold mb-3">Follow Us</p>
                        <div className="flex justify-center space-x-6">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm0 1.623c-2.387 0-2.71.01-3.66.058a3.262 3.262 0 00-1.595.454c-.457.218-.86.49-1.232.86s-.645.775-.86 1.232c-.236.595-.405 1.236-.454 1.595-.048.95-.058 1.272-.058 3.66s.01 2.71.058 3.66c.049.36.218.999.454 1.595.218.457.49.86.86 1.232.372.372.775.645 1.232.86.595.236 1.236.405 1.595.454.95.048 1.272.058 3.66.058s2.71-.01 3.66-.058c.36-.049.999-.218 1.595-.454.457-.218.86-.49 1.232-.86.372-.372.645-.775.86-1.232.236-.595.405-1.236.454-1.595.048-.95.058-1.272.058-3.66s-.01-2.71-.058-3.66c-.049-.36-.218-.999-.454-1.595-.218-.457-.49-.86-.86-1.232a3.262 3.262 0 00-1.232-.86c-.595-.236-1.236-.405-1.595-.454-.95-.048-1.272-.058-3.66-.058zM12 8.118a3.882 3.882 0 100 7.764 3.882 3.882 0 000-7.764zm0 6.138a2.256 2.256 0 110-4.512 2.256 2.256 0 010 4.512zM16.812 6.163a.93.93 0 100 1.86.93.93 0 000-1.86z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                            </a>
                        </div>
                    </div>
                    <p className="mt-6">© 2024 Insta Hands. All Rights Reserved.</p>
                </div>
            </footer>
        </>
    );
};

export default LandingPage;

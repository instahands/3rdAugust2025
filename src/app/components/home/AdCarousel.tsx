// src/components/home/AdCarousel.tsx

import { useState, useEffect } from 'react';
import { Banner } from '../../shared/types/types';
import { Loader2 } from 'lucide-react';

interface AdCarouselProps {
    banners?: Banner[];
    loading?: boolean;
}

const AdCarousel = ({ banners, loading = false }: AdCarouselProps) => {
    const defaultAds = [
        { id: 1, imageUrl: 'https://placehold.co/1200x400/10b981/ffffff?text=50%25+Off+to+all+new+user!!', alt: '50% Off to all new user' },
        { id: 2, imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Book Maid Services Now' },
        { id: 3, imageUrl: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Hassle-Free Shifting' },
    ];
    const ads = banners && banners.length > 0 ? banners.map(banner => ({ id: banner.id, imageUrl: banner.image_url, alt: banner.alt_text })) : defaultAds;
    const [currentAd, setCurrentAd] = useState(0);
    const [imageLoading, setImageLoading] = useState<number | null>(null);

    useEffect(() => {
        if (ads.length === 0) return;
        
        const timer = setInterval(() => {
            setCurrentAd((prevAd) => (prevAd + 1) % ads.length);
        }, 4000); // Changed to 4 seconds for better readability
        
        return () => clearInterval(timer);
    }, [ads.length]);

    const handleImageLoad = () => {
        setImageLoading(null);
    };

    const handleImageError = (index: number) => {
        setImageLoading(null);
    };

    if (loading) {
        return (
            <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-xl shadow-lg bg-gray-100 dark:bg-gray-800 group">
            {ads.map((ad, index) => (
                <div
                    key={ad.id}
                    className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
                        index === currentAd ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                    <img
                        src={ad.imageUrl}
                        alt={ad.alt}
                        className="w-full h-full object-cover"
                        onLoad={handleImageLoad}
                        onError={() => handleImageError(index)}
                    />
                </div>
            ))}

            {/* Carousel Indicators */}
            {ads.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentAd(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentAd
                                    ? 'bg-white w-6'
                                    : 'bg-white/50 w-2 hover:bg-white/70'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Auto-play indicator */}
            <div className="absolute top-3 right-3 text-white text-xs bg-black/40 px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {currentAd + 1} / {ads.length}
            </div>
        </div>
    );
};

export default AdCarousel;
// src/components/home/AdCarousel.tsx

import { useState, useEffect } from 'react';
import { Banner } from '../../shared/types/types';

interface AdCarouselProps {
    banners?: Banner[];
}

const AdCarousel = ({ banners }: AdCarouselProps) => {
    const defaultAds = [
        { id: 1, imageUrl: 'https://placehold.co/1200x400/10b981/ffffff?text=50%25+Off+to+all+new+user!!', alt: '50% Off to all new user' },
        { id: 2, imageUrl: 'https://images.pexels.com/photos/4107120/pexels-photo-4107120.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Book Maid Services Now' },
        { id: 3, imageUrl: 'https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop', alt: 'Hassle-Free Shifting' },
    ];
    const ads = banners && banners.length > 0 ? banners.map(banner => ({ id: banner.id, imageUrl: banner.image_url, alt: banner.alt_text })) : defaultAds;
    const [currentAd, setCurrentAd] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentAd((prevAd) => (prevAd + 1) % ads.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [ads.length]);

    return (
        <div className="relative w-full h-40 md:h-48 overflow-hidden rounded-xl shadow-lg">
            {ads.map((ad, index) => (
                <img
                    key={ad.id}
                    src={ad.imageUrl}
                    alt={ad.alt}
                    className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${index === currentAd ? 'opacity-100' : 'opacity-0'}`}
                />
            ))}
        </div>
    );
};

export default AdCarousel;
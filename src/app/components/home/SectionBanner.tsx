// src/components/home/SectionBanner.tsx

import { useState, useEffect } from 'react';
import { Banner } from '../../shared/types/types';

interface SectionBannerProps {
    banners?: Banner[];
    loading?: boolean;
}

const SectionBanner = ({ banners, loading = false }: SectionBannerProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (!banners || banners.length === 0) return;

        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % banners.length);
        }, 5000); // 5 seconds for section banners

        return () => clearInterval(timer);
    }, [banners?.length]);

    if (!banners || banners.length === 0) return null;

    const currentBanner = banners[currentIndex];

    return (
        <div className="relative w-full rounded-lg overflow-hidden shadow-md group bg-gray-100 dark:bg-gray-800">
            {/* Banner Image */}
            <div className="relative h-24 sm:h-32">
                <img
                    src={currentBanner.image_url}
                    alt={currentBanner.alt_text}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/1200x200/e2e8f0/94a3b8?text=Image+Not+Found`;
                    }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />

                {/* Banner Content */}
                {(currentBanner.title || currentBanner.description) && (
                    <div className="absolute inset-0 flex flex-col justify-center pl-4 sm:pl-6">
                        {currentBanner.title && (
                            <h3 className="text-white font-bold text-lg sm:text-xl truncate">
                                {currentBanner.title}
                            </h3>
                        )}
                        {currentBanner.description && (
                            <p className="text-white/80 text-sm truncate">
                                {currentBanner.description}
                            </p>
                        )}
                    </div>
                )}

                {/* Click CTA */}
                {currentBanner.link && (
                    <a
                        href={currentBanner.link}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute top-1/2 right-4 -translate-y-1/2 px-4 py-2 bg-white/90 hover:bg-white rounded-lg text-sm font-semibold text-gray-800 transition-colors shadow-sm"
                    >
                        Learn More
                    </a>
                )}
            </div>

            {/* Indicators */}
            {banners.length > 1 && (
                <div className="flex justify-center gap-2 py-2 bg-gray-50 dark:bg-gray-700/50">
                    {banners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === currentIndex
                                    ? 'bg-blue-600 w-6'
                                    : 'bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400'
                            }`}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SectionBanner;

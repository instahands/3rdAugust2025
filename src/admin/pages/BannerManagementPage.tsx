// src/admin/pages/BannerManagementPage.tsx

import { useState, useEffect } from 'react';
import { Banner } from '../../shared/types/types';
import { supabase } from '../../shared/lib/supabaseClient';
import BannerEditModal from '../components/banners/BannerEditModal';
import { useNotification } from '../../shared/context/NotificationContext';
import {
    Trash2,
    Edit3,
    PlusCircle,
    MapPin,
    Image as ImageIcon,
    ExternalLink,
    LayoutGrid,
    Loader2,
    Eye,
    Grid3x3,
} from 'lucide-react';

interface BannerManagementPageProps {
    banners: Banner[];
    refetchData: () => void;
}

// Hardcode the specific placements that actually exist in the frontend
const PREDEFINED_PLACEMENTS = [
    { page: 'home', section: 'carousel', label: 'Home Page', subLabel: 'Carousel (Top)' },
    { page: 'home', section: 'categories', label: 'Home Page', subLabel: 'Categories Section' },
    { page: 'landing', section: 'vlogs', label: 'Landing Page', subLabel: 'Vlogs' }
];

const BannerCard = ({ banner, onEdit, onDelete, isDeleting }: any) => (
    <div
        className={`group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 ${
            isDeleting ? 'opacity-50 pointer-events-none' : ''
        }`}
    >
        {/* Image */}
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-600 overflow-hidden">
            <img
                src={banner.image_url}
                alt={banner.alt_text}
                className="w-full h-full object-cover"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://placehold.co/400x200/e2e8f0/94a3b8?text=Image+Not+Found`;
                }}
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-3">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(banner)}
                        className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-800 hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        <Edit3 size={13} /> Edit
                    </button>
                    <button
                        onClick={() => onDelete(banner)}
                        disabled={isDeleting}
                        className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isDeleting ? (
                            <Loader2 size={13} className="animate-spin" />
                        ) : (
                            <Trash2 size={13} />
                        )}
                        {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                    {banner.link && (
                        <a
                            href={banner.link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1.5 bg-white rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <ExternalLink size={13} />
                        </a>
                    )}
                </div>
            </div>

            {/* ID Badge */}
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full text-[10px] text-white font-medium">
                #{banner.id}
            </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-1">
            {banner.title && (
                <h3 className="font-semibold text-sm text-gray-800 dark:text-white truncate">
                    {banner.title}
                </h3>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {banner.alt_text || 'No alt text'}
            </p>
            {banner.description && (
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {banner.description}
                </p>
            )}
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium pt-1">
                {banner.page}/{banner.section}
            </div>
        </div>
    </div>
);

const BannerManagementPage = ({ banners, refetchData }: BannerManagementPageProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [modalDefaults, setModalDefaults] = useState({ page: 'home', section: 'carousel' });
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [localBanners, setLocalBanners] = useState<Banner[]>(banners);
    const [viewMode, setViewMode] = useState<'all' | 'organized'>('all');
    const { showToast } = useNotification();

    useEffect(() => {
        setLocalBanners(banners);
    }, [banners]);

    // Setup real-time subscription
    useEffect(() => {
        const channel = supabase
            .channel('public:banners')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'banners',
                },
                (payload: any) => {
                    if (payload.eventType === 'INSERT') {
                        setLocalBanners(prev => [payload.new, ...prev]);
                    } else if (payload.eventType === 'UPDATE') {
                        setLocalBanners(prev =>
                            prev.map(b => (b.id === payload.new.id ? payload.new : b))
                        );
                    } else if (payload.eventType === 'DELETE') {
                        setLocalBanners(prev => prev.filter(b => b.id !== payload.old.id));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const openAddModal = (page: string, section: string) => {
        setEditingBanner(null);
        setModalDefaults({ page, section });
        setModalOpen(true);
    };

    const openEditModal = (banner: Banner) => {
        setEditingBanner(banner);
        setModalDefaults({ page: banner.page, section: banner.section });
        setModalOpen(true);
    };

    const handleDelete = async (banner: Banner) => {
        if (!window.confirm(`Delete banner "${banner.alt_text || banner.title || `#${banner.id}`}"? This cannot be undone.`)) return;

        setDeletingId(banner.id);
        try {
            // Delete from storage if it's a Supabase URL
            if (banner.image_url.includes('supabase')) {
                const urlParts = banner.image_url.split('/');
                const filePath = `${banner.page}/${banner.section}/${urlParts[urlParts.length - 1]}`;
                
                try {
                    await supabase.storage.from('banners').remove([filePath]);
                } catch (err) {
                    console.warn('Could not delete image from storage:', err);
                }
            }

            const { error } = await supabase.from('banners').delete().eq('id', banner.id);
            if (error) {
                showToast(`Error deleting banner: ${error.message}`, 'error');
            } else {
                showToast('Banner deleted successfully!', 'success');
                refetchData();
            }
        } catch (err: any) {
            showToast(`Error deleting banner: ${err.message}`, 'error');
        } finally {
            setDeletingId(null);
        }
    };

    // Get unique page/section combinations
    const uniquePlacements = Array.from(
        new Map(
            localBanners.map(b => [`${b.page}/${b.section}`, { page: b.page, section: b.section }])
        ).values()
    );

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
                        <LayoutGrid size={28} className="text-blue-500" />
                        Banner Management
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage all banners across your website
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <ImageIcon size={16} />
                    <span><strong className="text-gray-800 dark:text-white">{localBanners.length}</strong> total banners</span>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex gap-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Live Updates Enabled</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
                        Banner changes appear instantly on the frontend. No page refresh needed!
                    </p>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 w-fit bg-white dark:bg-gray-800">
                <button
                    onClick={() => setViewMode('all')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Eye size={16} />
                    All Banners
                </button>
                <button
                    onClick={() => setViewMode('organized')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        viewMode === 'organized'
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                    <Grid3x3 size={16} />
                    By Location
                </button>
            </div>

            {/* ALL BANNERS VIEW */}
            {viewMode === 'all' && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <ImageIcon size={18} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-800 dark:text-white text-lg">
                                    All Banners
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {localBanners.length} banner{localBanners.length !== 1 ? 's' : ''} across all locations
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {localBanners.length === 0 ? (
                            <div className="text-center py-12">
                                <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No banners yet</p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Create your first banner to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {localBanners.map(banner => (
                                    <BannerCard
                                        key={banner.id}
                                        banner={banner}
                                        onEdit={openEditModal}
                                        onDelete={handleDelete}
                                        isDeleting={deletingId === banner.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ORGANIZED BY LOCATION VIEW */}
            {viewMode === 'organized' && (
                <div className="space-y-8">
                    {/* Predefined Placements */}
                    {PREDEFINED_PLACEMENTS.map((placement) => {
                        const placementBanners = localBanners.filter(b => b.page === placement.page && b.section === placement.section);

                        return (
                            <section
                                key={`${placement.page}-${placement.section}`}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
                            >
                                {/* Section Header */}
                                <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <MapPin size={18} className="text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-gray-800 dark:text-white text-lg">
                                                {placement.label} <span className="text-gray-400 dark:text-gray-500 mx-1">→</span> {placement.subLabel}
                                            </h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {placementBanners.length} banner{placementBanners.length !== 1 ? 's' : ''} active
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openAddModal(placement.page, placement.section)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                    >
                                        <PlusCircle size={16} />
                                        Add Banner Here
                                    </button>
                                </div>

                                {/* Banner Grid */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                        {placementBanners.map(banner => (
                                            <BannerCard
                                                key={banner.id}
                                                banner={banner}
                                                onEdit={openEditModal}
                                                onDelete={handleDelete}
                                                isDeleting={deletingId === banner.id}
                                            />
                                        ))}

                                        {/* Add New Banner Card Placeholder if Empty */}
                                        {placementBanners.length === 0 && (
                                            <button
                                                onClick={() => openAddModal(placement.page, placement.section)}
                                                className="aspect-video flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/20 text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer"
                                            >
                                                <PlusCircle size={28} />
                                                <span className="text-sm font-medium">Add First Banner</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </section>
                        );
                    })}

                    {/* Other Banners Section */}
                    {uniquePlacements.some(p => !PREDEFINED_PLACEMENTS.some(dp => dp.page === p.page && dp.section === p.section)) && (
                        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-750 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                                        <ImageIcon size={18} className="text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800 dark:text-white text-lg">
                                            Other Banners
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Banners in other locations
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {uniquePlacements
                                        .filter(p => !PREDEFINED_PLACEMENTS.some(dp => dp.page === p.page && dp.section === p.section))
                                        .map((placement) => {
                                            const placementBanners = localBanners.filter(b => b.page === placement.page && b.section === placement.section);
                                            return (
                                                <div key={`${placement.page}-${placement.section}`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-800 dark:text-white">
                                                                {placement.page} / {placement.section}
                                                            </h3>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {placementBanners.length} banner{placementBanners.length !== 1 ? 's' : ''}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                                        {placementBanners.map(banner => (
                                                            <BannerCard
                                                                key={banner.id}
                                                                banner={banner}
                                                                onEdit={openEditModal}
                                                                onDelete={handleDelete}
                                                                isDeleting={deletingId === banner.id}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}

            {/* Banner Edit Modal */}
            <BannerEditModal
                isOpen={modalOpen}
                onClose={() => { setModalOpen(false); setEditingBanner(null); }}
                onSave={refetchData}
                banner={editingBanner}
                defaultPage={modalDefaults.page}
                defaultSection={modalDefaults.section}
            />
        </div>
    );
};

export default BannerManagementPage;

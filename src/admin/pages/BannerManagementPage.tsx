// src/admin/pages/BannerManagementPage.tsx

import { useState } from 'react';
import { Banner } from '../../shared/types/types';
import { supabase } from '../../shared/lib/supabaseClient';
import BannerEditModal from '../components/banners/BannerEditModal';
import {
    Trash2,
    Edit3,
    PlusCircle,
    MapPin,
    Image as ImageIcon,
    ExternalLink,
    LayoutGrid,
} from 'lucide-react';

interface BannerManagementPageProps {
    banners: Banner[];
    refetchData: () => void;
}

// Group banners by page + section
type BannerGroup = {
    key: string;
    page: string;
    section: string;
    banners: Banner[];
};

function groupBanners(banners: Banner[]): BannerGroup[] {
    const map = new Map<string, BannerGroup>();

    for (const banner of banners) {
        const key = `${banner.page}::${banner.section}`;
        if (!map.has(key)) {
            map.set(key, { key, page: banner.page, section: banner.section, banners: [] });
        }
        map.get(key)!.banners.push(banner);
    }

    return Array.from(map.values());
}

function formatLabel(str: string): string {
    return str.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const BannerManagementPage = ({ banners, refetchData }: BannerManagementPageProps) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [modalDefaults, setModalDefaults] = useState({ page: 'home', section: 'carousel' });
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // For "Add New Placement" flow
    const [showNewPlacement, setShowNewPlacement] = useState(false);
    const [newPage, setNewPage] = useState('');
    const [newSection, setNewSection] = useState('');

    const groups = groupBanners(banners);

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
            const { error } = await supabase.from('banners').delete().eq('id', banner.id);
            if (error) {
                alert(`Error deleting banner: ${error.message}`);
            } else {
                refetchData();
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleNewPlacementAdd = () => {
        if (!newPage.trim() || !newSection.trim()) return;
        openAddModal(newPage.trim().toLowerCase(), newSection.trim().toLowerCase());
        setShowNewPlacement(false);
        setNewPage('');
        setNewSection('');
    };

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
                        Manage banners across all pages and sections of your website
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
                    <ImageIcon size={16} />
                    <span><strong className="text-gray-800 dark:text-white">{banners.length}</strong> banners across <strong className="text-gray-800 dark:text-white">{groups.length}</strong> placements</span>
                </div>
            </div>

            {/* Banner Groups */}
            {groups.map(group => (
                <section
                    key={group.key}
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
                                    {formatLabel(group.page)} <span className="text-gray-400 dark:text-gray-500 mx-1">→</span> {formatLabel(group.section)}
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {group.banners.length} banner{group.banners.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => openAddModal(group.page, group.section)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        >
                            <PlusCircle size={16} />
                            Add Banner
                        </button>
                    </div>

                    {/* Banner Grid */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {group.banners.map(banner => (
                                <div
                                    key={banner.id}
                                    className={`group relative bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 ${
                                        deletingId === banner.id ? 'opacity-50 pointer-events-none' : ''
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
                                                    onClick={() => openEditModal(banner)}
                                                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-gray-800 hover:bg-blue-50 transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Edit3 size={13} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(banner)}
                                                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <Trash2 size={13} /> Delete
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
                                            {banner.alt_text}
                                        </p>
                                        {banner.description && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                                {banner.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Add New Banner Card */}
                            <button
                                onClick={() => openAddModal(group.page, group.section)}
                                className="aspect-video flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50/50 dark:bg-gray-700/20 text-gray-400 dark:text-gray-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-200 cursor-pointer"
                            >
                                <PlusCircle size={28} />
                                <span className="text-sm font-medium">Add Banner</span>
                            </button>
                        </div>
                    </div>
                </section>
            ))}

            {/* Empty State */}
            {groups.length === 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-16 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">No Banners Yet</h3>
                    <p className="text-gray-400 dark:text-gray-500 mb-6">
                        Create your first banner to get started.
                    </p>
                    <button
                        onClick={() => setShowNewPlacement(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle size={16} />
                        Add Your First Banner
                    </button>
                </div>
            )}

            {/* Add New Placement */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {!showNewPlacement ? (
                    <button
                        onClick={() => setShowNewPlacement(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <div className="p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                            <PlusCircle size={18} />
                        </div>
                        <span className="font-medium">Add New Placement Section</span>
                    </button>
                ) : (
                    <div className="p-6 space-y-4">
                        <h3 className="font-bold text-gray-800 dark:text-white">New Placement</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Define where on the website this banner group will appear.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Page</label>
                                <input
                                    type="text"
                                    value={newPage}
                                    onChange={(e) => setNewPage(e.target.value)}
                                    placeholder="e.g. home, landing, services"
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Section</label>
                                <input
                                    type="text"
                                    value={newSection}
                                    onChange={(e) => setNewSection(e.target.value)}
                                    placeholder="e.g. carousel, hero, sidebar"
                                    className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleNewPlacementAdd}
                                disabled={!newPage.trim() || !newSection.trim()}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <PlusCircle size={16} />
                                Add Banner to This Placement
                            </button>
                            <button
                                onClick={() => { setShowNewPlacement(false); setNewPage(''); setNewSection(''); }}
                                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

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

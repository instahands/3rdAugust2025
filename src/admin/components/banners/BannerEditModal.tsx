// src/admin/components/banners/BannerEditModal.tsx

import { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Banner } from '../../../shared/types/types';
import { supabase } from '../../../shared/lib/supabaseClient';

interface BannerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
    banner: Banner | null;       // null = adding new
    defaultPage: string;         // pre-fill when adding
    defaultSection: string;      // pre-fill when adding
}

const BannerEditModal = ({ isOpen, onClose, onSave, banner, defaultPage, defaultSection }: BannerEditModalProps) => {
    const [formData, setFormData] = useState({
        page: '',
        section: '',
        image_url: '',
        alt_text: '',
        title: '',
        description: '',
        link: '',
    });
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (banner) {
            setFormData({
                page: banner.page,
                section: banner.section,
                image_url: banner.image_url,
                alt_text: banner.alt_text,
                title: banner.title || '',
                description: banner.description || '',
                link: banner.link || '',
            });
        } else {
            setFormData({
                page: defaultPage,
                section: defaultSection,
                image_url: '',
                alt_text: '',
                title: '',
                description: '',
                link: '',
            });
        }
        setError('');
    }, [banner, defaultPage, defaultSection, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${formData.page}/${formData.section}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('banners')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (uploadError) {
                // If storage bucket doesn't exist, fall back gracefully
                if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
                    setError('Storage bucket "banners" not found. Please create it in Supabase Dashboard, or paste an image URL instead.');
                } else {
                    setError(`Upload failed: ${uploadError.message}`);
                }
                return;
            }

            const { data: urlData } = supabase.storage.from('banners').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
        } catch (err: any) {
            setError(`Upload error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.image_url) {
            setError('Please provide an image URL or upload an image.');
            return;
        }
        if (!formData.alt_text) {
            setError('Alt text is required.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            if (banner) {
                // Update existing
                const { error: updateError } = await supabase
                    .from('banners')
                    .update({
                        image_url: formData.image_url,
                        alt_text: formData.alt_text,
                        title: formData.title || null,
                        description: formData.description || null,
                        link: formData.link || null,
                        page: formData.page,
                        section: formData.section,
                    })
                    .eq('id', banner.id);

                if (updateError) throw updateError;
            } else {
                // Insert new
                const { error: insertError } = await supabase
                    .from('banners')
                    .insert({
                        page: formData.page,
                        section: formData.section,
                        image_url: formData.image_url,
                        alt_text: formData.alt_text,
                        title: formData.title || null,
                        description: formData.description || null,
                        link: formData.link || null,
                    });

                if (insertError) throw insertError;
            }

            onSave();
            onClose();
        } catch (err: any) {
            setError(`Save failed: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-scale-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        {banner ? 'Edit Banner' : 'Add New Banner'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </header>

                {/* Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Image Preview */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                            Banner Image
                        </label>
                        <div className="relative group rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 h-48 flex items-center justify-center">
                            {formData.image_url ? (
                                <>
                                    <img
                                        src={formData.image_url}
                                        alt={formData.alt_text || 'Preview'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-3 py-2 bg-white rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors flex items-center gap-2"
                                        >
                                            <Upload size={16} /> Replace
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <Loader2 size={32} className="animate-spin" />
                                    ) : (
                                        <>
                                            <ImageIcon size={32} />
                                            <span className="text-sm font-medium">Click to upload or drag an image</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />

                        {/* URL Input */}
                        <div className="relative">
                            <LinkIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="image_url"
                                value={formData.image_url}
                                onChange={handleChange}
                                placeholder="Or paste image URL here..."
                                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Page & Section (side by side) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Page</label>
                            <input
                                type="text"
                                name="page"
                                value={formData.page}
                                onChange={handleChange}
                                placeholder="e.g. home, landing"
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Section</label>
                            <input
                                type="text"
                                name="section"
                                value={formData.section}
                                onChange={handleChange}
                                placeholder="e.g. carousel, vlogs"
                                required
                                className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Banner title"
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Alt Text */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Alt Text</label>
                        <input
                            type="text"
                            name="alt_text"
                            value={formData.alt_text}
                            onChange={handleChange}
                            placeholder="Describe the image for accessibility"
                            required
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Short description"
                            rows={2}
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Link */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Link URL <span className="text-gray-400 font-normal">(optional)</span></label>
                        <input
                            type="text"
                            name="link"
                            value={formData.link}
                            onChange={handleChange}
                            placeholder="https://..."
                            className="w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}
                </form>

                {/* Footer */}
                <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        {banner ? 'Save Changes' : 'Add Banner'}
                    </button>
                </footer>
            </div>

            <style>{`
                @keyframes scale-in {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-scale-in {
                    animation: scale-in 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default BannerEditModal;

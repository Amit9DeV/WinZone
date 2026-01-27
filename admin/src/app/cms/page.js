'use client';

import { useState, useEffect } from 'react';
import { adminAPI } from '@/lib/api';
import { Megaphone, Image as ImageIcon, Plus, Trash2, Save, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Since the admin and server might be on different ports/domains in dev,
// we need the full URL for images if not proxied. 
// Assuming server is at localhost:5001 for now based on previous files.
const SERVER_URL = 'https://winzone-final.onrender.com';

export default function CMSPage() {
    const [loading, setLoading] = useState(true);
    const [banners, setBanners] = useState([]);
    const [announcement, setAnnouncement] = useState({ text: '', active: true });

    // Upload State
    const [uploading, setUploading] = useState(false);
    const [newBanner, setNewBanner] = useState({ file: null, linkUrl: '' });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            const [bannerRes, announceRes] = await Promise.all([
                adminAPI.getBanners(),
                adminAPI.getAnnouncement()
            ]);

            if (bannerRes.data.success) setBanners(bannerRes.data.data);
            if (announceRes.data.success && announceRes.data.data) {
                setAnnouncement({
                    text: announceRes.data.data.text || '',
                    active: announceRes.data.data.active
                });
            }
        } catch (error) {
            toast.error('Failed to load content');
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!newBanner.file) return toast.error('Please select an image');

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('image', newBanner.file);
            formData.append('linkUrl', newBanner.linkUrl);

            await adminAPI.uploadBanner(formData);
            toast.success('Banner uploaded successfully');
            setNewBanner({ file: null, linkUrl: '' });
            fetchContent();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this banner?')) return;
        try {
            await adminAPI.deleteBanner(id);
            toast.success('Banner deleted');
            setBanners(banners.filter(b => b._id !== id));
        } catch (error) {
            toast.error('Failed to delete banner');
        }
    };

    const saveAnnouncement = async () => {
        try {
            await adminAPI.updateAnnouncement(announcement.text, announcement.active);
            toast.success('Announcement updated');
        } catch (error) {
            toast.error('Failed to update announcement');
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-400">Loading CMS...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <ImageIcon className="text-pink-500" /> Content Management
                    </h1>
                    <p className="text-gray-400 text-sm">Manage homepage banners and announcements.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Banner Management (2/3) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Homepage Banners</h3>

                        {/* Upload Form */}
                        <form onSubmit={handleUpload} className="bg-gray-800/50 p-4 rounded-xl mb-6 border border-gray-700/50">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-400 mb-1 block">Banner Image (16:9 recommended)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setNewBanner({ ...newBanner, file: e.target.files[0] })}
                                        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                                    />
                                </div>
                                <div className="w-1/3">
                                    <label className="text-xs text-gray-400 mb-1 block">Link URL (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="/games/aviator"
                                        value={newBanner.linkUrl}
                                        onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                                >
                                    {uploading ? '...' : <Plus size={16} />} Upload
                                </button>
                            </div>
                        </form>

                        {/* Banner List */}
                        <div className="space-y-4">
                            {banners.map((banner) => (
                                <motion.div
                                    key={banner._id}
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="relative group rounded-xl overflow-hidden border border-gray-700 aspect-[21/9] md:aspect-[3/1]"
                                >
                                    <img
                                        src={`${SERVER_URL}${banner.imageUrl}`}
                                        alt={banner.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                        <button
                                            onClick={() => handleDelete(banner._id)}
                                            className="p-2 bg-red-600 rounded-lg text-white hover:bg-red-700 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                        {banner.linkUrl && (
                                            <a
                                                href={banner.linkUrl} target="_blank"
                                                className="p-2 bg-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors"
                                            >
                                                <ExternalLink size={20} />
                                            </a>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-xs text-white backdrop-blur-sm">
                                        Order: {banner.order}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Announcement (1/3) */}
                <div className="space-y-6">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Megaphone className="text-yellow-500" size={20} /> Announcement
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Ticker Text</label>
                                <textarea
                                    rows={4}
                                    value={announcement.text}
                                    onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })}
                                    placeholder="Enter global announcement..."
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-yellow-500"
                                />
                            </div>

                            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
                                <span className="text-sm text-gray-300">Active</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={announcement.active}
                                        onChange={(e) => setAnnouncement({ ...announcement, active: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                                </label>
                            </div>

                            <button
                                onClick={saveAnnouncement}
                                className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                            >
                                <Save size={18} /> Update Ticker
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

const express = require('express');
const router = express.Router();
const Content = require('../models/Content.model');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Multer Config for Banners ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/banners');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `banner-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (/jpeg|jpg|png|gif|webp/.test(path.extname(file.originalname).toLowerCase())) {
            cb(null, true);
        } else {
            cb(new Error('Only images allowed'));
        }
    }
});

// --- Public Endpoints ---

// Get active Banners
router.get('/banners', async (req, res) => {
    try {
        const banners = await Content.find({ type: 'banner', active: true }).sort('order');
        res.json({ success: true, data: banners });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get active Announcement
router.get('/announcement', async (req, res) => {
    try {
        const announcement = await Content.findOne({ type: 'announcement', active: true }).sort('-createdAt');
        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// --- Admin Endpoints ---

// Upload Banner
router.post('/banners/upload', authenticate, isAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) throw new Error('No file uploaded');

        const { title, linkUrl, order } = req.body;
        const banner = await Content.create({
            type: 'banner',
            title: title || 'New Banner',
            imageUrl: `/uploads/banners/${req.file.filename}`,
            linkUrl,
            order: order || 0,
            active: true
        });

        res.json({ success: true, data: banner });
    } catch (error) {
        console.error('Banner upload error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update/Delete Banner
router.delete('/banners/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const banner = await Content.findById(req.params.id);
        if (!banner) return res.status(404).json({ message: 'Banner not found' });

        // Delete file
        if (banner.imageUrl) {
            const filePath = path.join(__dirname, '../..', banner.imageUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await Content.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Banner deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Set Announcement
router.post('/announcement', authenticate, isAdmin, async (req, res) => {
    try {
        const { text, active } = req.body;

        // Deactivate old announcements
        await Content.updateMany({ type: 'announcement' }, { active: false });

        const announcement = await Content.create({
            type: 'announcement',
            text,
            active: active !== false
        });

        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;

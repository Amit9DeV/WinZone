const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User.model');
const { authenticate } = require('../middleware/auth.middleware');

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../../uploads/avatars');

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Create unique filename: userId-timestamp.extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `${req.user.userId}-${uniqueSuffix}${ext}`);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: fileFilter
});

/**
 * @route   POST /api/user/upload-avatar
 * @desc    Upload user profile picture
 * @access  Private
 */
router.post('/upload-avatar', authenticate, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const user = await User.findById(req.user.userId);

        if (!user) {
            // Delete uploaded file if user not found
            fs.unlinkSync(req.file.path);
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete old avatar file if it exists
        if (user.avatar && user.avatar.startsWith('/uploads/')) {
            const oldAvatarPath = path.join(__dirname, '../..', user.avatar);
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
            }
        }

        // Update user avatar with relative path
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;
        user.avatar = avatarUrl;
        user.updatedAt = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture uploaded successfully',
            data: {
                avatar: avatarUrl
            }
        });
    } catch (error) {
        // Delete uploaded file on error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error('Avatar upload error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload profile picture'
        });
    }
});

/**
 * @route   DELETE /api/user/delete-avatar
 * @desc    Delete user profile picture
 * @access  Private
 */
router.delete('/delete-avatar', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete avatar file if it exists
        if (user.avatar && user.avatar.startsWith('/uploads/')) {
            const avatarPath = path.join(__dirname, '../..', user.avatar);
            if (fs.existsSync(avatarPath)) {
                fs.unlinkSync(avatarPath);
            }
        }

        // Clear avatar field
        user.avatar = '';
        user.updatedAt = Date.now();
        await user.save();

        res.json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Avatar delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete profile picture'
        });
    }
});

module.exports = router;

const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['banner', 'announcement', 'popup'],
        required: true
    },
    title: { type: String, default: '' },
    imageUrl: { type: String }, // For banners
    text: { type: String }, // For announcements/popups
    linkUrl: { type: String, default: '' }, // Click destination
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 }, // For sorting banners
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Content', contentSchema);

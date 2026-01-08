const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'WinZone'
    },
    supportEmail: {
        type: String,
        default: 'support@winzone.com'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    allowRegistrations: {
        type: Boolean,
        default: true
    },
    minDeposit: {
        type: Number,
        default: 100
    },
    maxWithdrawal: {
        type: Number,
        default: 50000
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

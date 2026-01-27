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
    },
    // Bot Configuration
    botConfig: {
        enabled: { type: Boolean, default: false },
        games: {
            aviator: {
                enabled: { type: Boolean, default: true },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 1000 }
            },
            mines: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 500 }
            },
            dice: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 1 },
                maxBet: { type: Number, default: 500 }
            },
            plinko: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 500 }
            },
            limbo: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 1 },
                maxBet: { type: Number, default: 500 }
            },
            coinflip: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 500 }
            },
            wheel: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 500 }
            },
            keno: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 500 }
            },
            slots: {
                enabled: { type: Boolean, default: false },
                minBet: { type: Number, default: 10 },
                maxBet: { type: Number, default: 1000 }
            }
        }
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

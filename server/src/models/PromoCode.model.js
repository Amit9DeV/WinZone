const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['fixed', 'percentage'], // fixed = adds ₹X, percentage = adds X% of (something? usually deposit, but here just bonus)
        default: 'fixed'
    },
    value: {
        type: Number,
        required: true
    },
    maxUses: {
        type: Number,
        default: 100
    },
    usedCount: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date
    },
    usedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Check if valid
promoCodeSchema.methods.isValid = function (userId) {
    if (!this.isActive) return false;
    if (this.expiresAt && new Date() > this.expiresAt) return false;
    if (this.usedCount >= this.maxUses) return false;
    if (this.usedBy.includes(userId)) return false; // User already used
    return true;
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);

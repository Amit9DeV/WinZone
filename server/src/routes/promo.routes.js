const express = require('express');
const router = express.Router();
const PromoCode = require('../models/PromoCode.model');
const User = require('../models/User.model');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');

// --- Admin Endpoints ---

// Create Promo Code
router.post('/create', authenticate, isAdmin, async (req, res) => {
    try {
        const { code, type, value, maxUses, expiresAt } = req.body;

        // Validation
        if (!code || !value) throw new Error('Code and Value are required');

        const exists = await PromoCode.findOne({ code: code.toUpperCase() });
        if (exists) throw new Error('Promo code already exists');

        const promo = await PromoCode.create({
            code,
            type,
            value,
            maxUses,
            expiresAt
        });

        res.json({ success: true, data: promo });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

// List Promo Codes
router.get('/list', authenticate, isAdmin, async (req, res) => {
    try {
        const promos = await PromoCode.find().sort('-createdAt');
        res.json({ success: true, data: promos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete/Deactivate
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await PromoCode.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Promo code deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


// --- User Endpoints ---

// Redeem Code
router.post('/redeem', authenticate, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) throw new Error('Code is required');

        const promo = await PromoCode.findOne({ code: code.toUpperCase() });
        if (!promo) throw new Error('Invalid promo code');

        // Check Validity
        if (!promo.isActive) throw new Error('Promo code is inactive');
        if (promo.expiresAt && new Date() > promo.expiresAt) throw new Error('Promo code expired');
        if (promo.usedCount >= promo.maxUses) throw new Error('Promo code usage limit reached');
        if (promo.usedBy.includes(req.user.userId)) throw new Error('You have already redeemed this code');

        // Apply Bonus
        const user = await User.findById(req.user.userId);
        if (!user) throw new Error('User not found');

        let bonusAmount = 0;
        if (promo.type === 'fixed') {
            bonusAmount = promo.value;
        } else if (promo.type === 'percentage') {
            // Usually percentage is on deposit, but here strictly as a bonus
            // Lets assume percentage of current balance? No that's risky. 
            // Percentage of what? 
            // For simplified MVP, let's say Percentage isn't fully supported for "redeem", only for "deposit bonus".
            // But if we must, let's fallback to fixed or error.
            // Actually, let's treat it as a fixed bonus for now to avoid confusion unless we link it to a deposit transaction.
            bonusAmount = promo.value;
        }

        user.balance += bonusAmount;
        // user.bonusBalance += bonusAmount; // If we had separate bonus wallet

        // Transaction Log (Optional but good practice)
        // await Transaction.create({...})

        await user.save();

        // Update Promo
        promo.usedCount += 1;
        promo.usedBy.push(user._id);
        await promo.save();

        res.json({
            success: true,
            message: `Redeemed ₹${bonusAmount} successfully!`,
            newBalance: user.balance
        });

    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

module.exports = router;

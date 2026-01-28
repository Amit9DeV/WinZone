const express = require('express');
const router = express.Router();
const Friendship = require('../models/Friendship');
const User = require('../models/User.model');
const { authenticate } = require('../middleware/auth.middleware');

// Send Friend Request
router.post('/request', authenticate, async (req, res) => {
    try {
        const { recipientId } = req.body;
        const requesterId = req.user._id; // authenticate middleware usually sets req.user or req.userId

        if (requesterId === recipientId) {
            return res.status(400).json({ message: "You cannot add yourself as a friend." });
        }

        const existingFriendship = await Friendship.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId }
            ]
        });

        if (existingFriendship) {
            if (existingFriendship.status === 'accepted') {
                return res.status(400).json({ message: "You are already friends." });
            }
            if (existingFriendship.status === 'pending') {
                return res.status(400).json({ message: "Friend request already pending." });
            }
        }

        const newFriendship = new Friendship({
            requester: requesterId,
            recipient: recipientId,
            status: 'pending'
        });

        await newFriendship.save();

        res.status(201).json({ success: true, message: "Friend request sent." });
    } catch (error) {
        console.error("Friend Request Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Accept Friend Request
router.put('/accept', authenticate, async (req, res) => {
    try {
        const { friendshipId } = req.body;
        const userId = req.user._id;

        const friendship = await Friendship.findById(friendshipId);

        if (!friendship) {
            return res.status(404).json({ message: "Friend request not found." });
        }

        if (friendship.recipient.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized to accept this request." });
        }

        if (friendship.status !== 'pending') {
            return res.status(400).json({ message: "Request is not pending." });
        }

        friendship.status = 'accepted';
        friendship.updatedAt = Date.now();
        await friendship.save();

        res.json({ success: true, message: "Friend request accepted." });
    } catch (error) {
        console.error("Accept Friend Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// List Friends
router.get('/list', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        const friendships = await Friendship.find({
            $or: [{ requester: userId }, { recipient: userId }],
            status: 'accepted'
        })
            .populate('requester', 'name avatar') // Assuming User model has name/avatar
            .populate('recipient', 'name avatar');

        const friends = friendships.map(f => {
            return f.requester._id.toString() === userId ? f.recipient : f.requester;
        });

        res.json({ success: true, friends });
    } catch (error) {
        console.error("List Friends Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// List Pending Requests (Received)
router.get('/requests', authenticate, async (req, res) => {
    try {
        const userId = req.user._id;

        const requests = await Friendship.find({
            recipient: userId,
            status: 'pending'
        }).populate('requester', 'name avatar');

        res.json({ success: true, requests });
    } catch (error) {
        console.error("List Requests Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;

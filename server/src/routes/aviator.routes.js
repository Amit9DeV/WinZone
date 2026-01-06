/**
 * Aviator-specific Routes
 * Scheduling and admin controls
 */

const express = require('express');
const { authenticate, isAdmin } = require('../middleware/auth.middleware');
const AviatorSchedule = require('../models/AviatorSchedule.model');
const GameRound = require('../models/GameRound.model');
const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(isAdmin);

/**
 * Create schedule (one-time crash at specific date/time)
 * POST /api/admin/aviator/schedule
 * Body: { date: "YYYY-MM-DD", times: ["HH:MM", ...], crashAt: 100 }
 */
router.post('/schedule', async (req, res) => {
  try {
    const { date, times, crashAt } = req.body;
    
    if (!date || !times || !Array.isArray(times) || times.length === 0 || !crashAt) {
      return res.status(400).json({
        success: false,
        message: 'date, times array, and crashAt are required',
      });
    }
    
    if (crashAt < 1.01) {
      return res.status(400).json({
        success: false,
        message: 'crashAt must be at least 1.01',
      });
    }
    
    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'date must be in YYYY-MM-DD format',
      });
    }
    
    // Validate time format (HH:MM)
    for (const time of times) {
      if (!/^\d{2}:\d{2}$/.test(time)) {
        return res.status(400).json({
          success: false,
          message: `Invalid time format: ${time}. Use HH:MM format`,
        });
      }
    }
    
    // Create schedules
    const schedules = [];
    for (const time of times) {
      const schedule = await AviatorSchedule.create({
        date,
        time,
        crashAt,
        used: false,
        createdBy: req.userId,
      });
      schedules.push(schedule);
    }
    
    res.json({
      success: true,
      data: schedules,
      message: `Created ${schedules.length} schedule(s) for ${date}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get all schedules
 * GET /api/admin/aviator/schedules
 */
router.get('/schedules', async (req, res) => {
  try {
    const { date, used } = req.query;
    
    const query = {};
    if (date) query.date = date;
    if (used !== undefined) query.used = used === 'true';
    
    const schedules = await AviatorSchedule.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: 1, time: 1 });
    
    res.json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Delete schedule
 * DELETE /api/admin/aviator/schedules/:scheduleId
 */
router.delete('/schedules/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    
    const schedule = await AviatorSchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found',
      });
    }
    
    if (schedule.used) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete used schedule',
      });
    }
    
    await schedule.deleteOne();
    
    res.json({
      success: true,
      message: 'Schedule deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get recent rounds
 * GET /api/admin/aviator/rounds
 */
router.get('/rounds', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    
    const rounds = await GameRound.find({ game: 'aviator' })
      .sort({ createdAt: -1 })
      .limit(limit);
    
    res.json({
      success: true,
      data: rounds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;


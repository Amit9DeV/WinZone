/**
 * Activity Service
 * Manages user activity timeline
 */

const UserActivity = require('../models/UserActivity.model');

const activityService = {
  /**
   * Create activity entry
   */
  async createActivity(data) {
    return UserActivity.create(data);
  },
  
  /**
   * Get user activity feed
   */
  async getUserActivity(userId, options = {}) {
    const {
      gameId = null,
      limit = 50,
      skip = 0,
      type = null,
    } = options;
    
    const query = { userId };
    if (gameId) query.gameId = gameId;
    if (type) query.type = type;
    
    return UserActivity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  },
  
  /**
   * Get recent activity count
   */
  async getRecentActivityCount(userId, hours = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return UserActivity.countDocuments({
      userId,
      createdAt: { $gte: since },
    });
  },
};

module.exports = activityService;



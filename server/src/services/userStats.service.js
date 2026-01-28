/**
 * User Stats Service
 * Updates user statistics when bets are settled
 * Stats are stored, not calculated on request
 */

const User = require('../models/User.model');
const UserGameStats = require('../models/UserGameStats.model');

const userStatsService = {
  /**
   * Update stats when bet is won
   */
  async recordWin(userId, gameId, amount, payout) {
    // Update overall user stats
    const user = await User.findById(userId);
    if (!user) return;

    user.totalBets += 1;
    user.totalWins += 1;
    user.totalLosses = user.totalBets - user.totalWins;
    user.winPercentage = (user.totalWins / user.totalBets) * 100;
    user.totalWagered = (user.totalWagered || 0) + amount;
    user.totalWon = (user.totalWon || 0) + payout;

    if (payout > (user.biggestWin || 0)) {
      user.biggestWin = payout;
    }

    await user.save();

    // Update game-specific stats
    let gameStats = await UserGameStats.findOne({ userId, gameId });
    if (!gameStats) {
      gameStats = await UserGameStats.create({
        userId,
        gameId,
        totalBets: 0,
        wins: 0,
        losses: 0,
        totalWagered: 0,
        totalWon: 0,
      });
    }

    gameStats.totalBets += 1;
    gameStats.wins += 1;
    gameStats.losses = gameStats.totalBets - gameStats.wins;
    gameStats.winPercentage = (gameStats.wins / gameStats.totalBets) * 100;
    gameStats.totalWagered += amount;
    gameStats.totalWon += payout;
    await gameStats.save();
  },

  /**
   * Update stats when bet is lost
   */
  async recordLoss(userId, gameId, amount) {
    // Update overall user stats
    const user = await User.findById(userId);
    if (!user) return;

    user.totalBets += 1;
    user.totalLosses += 1;
    user.winPercentage = (user.totalWins / user.totalBets) * 100;
    user.totalWagered = (user.totalWagered || 0) + amount;
    await user.save();

    // Update game-specific stats
    let gameStats = await UserGameStats.findOne({ userId, gameId });
    if (!gameStats) {
      gameStats = await UserGameStats.create({
        userId,
        gameId,
        totalBets: 0,
        wins: 0,
        losses: 0,
        totalWagered: 0,
        totalWon: 0,
      });
    }

    gameStats.totalBets += 1;
    gameStats.losses += 1;
    gameStats.wins = gameStats.totalBets - gameStats.losses;
    gameStats.winPercentage = (gameStats.wins / gameStats.totalBets) * 100;
    gameStats.totalWagered += amount;
    await gameStats.save();
  },

  /**
   * Revert stats when a loss is converted to a win (late cashout)
   */
  async revertLoss(userId, gameId, amount) {
    // No changes needed for revertLoss as it reverts a LOSS (payout 0), so totalWon remains unchanged.
    // Revert overall user stats
    const user = await User.findById(userId);
    if (!user) return;

    user.totalBets -= 1;
    user.totalLosses -= 1;
    // winPercentage will be recalculated in recordWin
    user.totalWagered = (user.totalWagered || 0) - amount;
    await user.save();

    // Revert game-specific stats
    const gameStats = await UserGameStats.findOne({ userId, gameId });
    if (gameStats) {
      gameStats.totalBets -= 1;
      gameStats.losses -= 1;
      gameStats.totalWagered -= amount;
      await gameStats.save();
    }
  },

  /**
   * Get user stats
   */
  async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const gameStats = await UserGameStats.find({ userId });

    return {
      overall: {
        totalBets: user.totalBets,
        totalWins: user.totalWins,
        totalWon: user.totalWon,
        totalLosses: user.totalLosses,
        winPercentage: user.winPercentage,
        balance: user.balance,
        totalWagered: user.totalWagered,
        biggestWin: user.biggestWin,
      },
      games: gameStats.reduce((acc, stat) => {
        acc[stat.gameId] = {
          totalBets: stat.totalBets,
          wins: stat.wins,
          losses: stat.losses,
          winPercentage: stat.winPercentage,
          totalWagered: stat.totalWagered,
          totalWon: stat.totalWon,
        };
        return acc;
      }, {}),
    };
  },

  /**
   * Get game-specific stats
   */
  async getGameStats(userId, gameId) {
    const gameStats = await UserGameStats.findOne({ userId, gameId });
    if (!gameStats) {
      return {
        totalBets: 0,
        wins: 0,
        losses: 0,
        winPercentage: 0,
        totalWagered: 0,
        totalWon: 0,
      };
    }

    return {
      totalBets: gameStats.totalBets,
      wins: gameStats.wins,
      losses: gameStats.losses,
      winPercentage: gameStats.winPercentage,
      totalWagered: gameStats.totalWagered,
      totalWon: gameStats.totalWon,
    };
  },
};

module.exports = userStatsService;



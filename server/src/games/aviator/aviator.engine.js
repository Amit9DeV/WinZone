/**
 * Aviator Game Engine
 * Main game loop and state management
 * Connects to existing Aviator frontend
 */

const GameRound = require('../../models/GameRound.model');
const Bet = require('../../models/Bet.model');
const User = require('../../models/User.model');
const AviatorSchedule = require('../../models/AviatorSchedule.model');
const { calculateMultiplier, generateCrashMultiplier, shouldCrash } = require('./aviator.logic');
const walletService = require('../../services/wallet.service');
const userStatsService = require('../../services/userStats.service');
const activityService = require('../../services/activity.service');
const { initializeAviatorSockets } = require('./aviator.socket');
const bots = require('./aviator.bots');

let io = null;
let activeRealBets = []; // Cache for real bets
let gameState = {
  status: 'WAITING', // WAITING, FLYING, CRASHED
  roundId: null,
  currentMultiplier: 1.0,
  crashMultiplier: null,
  startTime: null,
  crashTime: null,
  intervalId: null,
  waitingTimeout: null,
};

// Game configuration
const CONFIG = {
  WAITING_DURATION: 5000, // 5 seconds waiting time
  UPDATE_INTERVAL: 50, // Update every 50ms (20 FPS)
  SCHEDULE_CHECK_INTERVAL: 60000, // Check schedules every minute
};

/**
 * Initialize Aviator game engine
 */
async function initialize(socketIO, gameConfig) {
  io = socketIO;
  console.log('🎮 Initializing Aviator game engine...');

  // Initialize socket handlers
  // Initialize socket handlers
  initializeAviatorSockets(io, {
    getCurrentState: getState,
    onBetPlaced: handleRealBetPlaced,
    onBetCashout: handleRealBetCashout,
  });

  // Start game loop
  startGameLoop();

  // Start schedule checker
  startScheduleChecker();

  console.log('✅ Aviator game engine initialized');
}

/**
 * Start the main game loop
 */
function startGameLoop() {
  // Start first round
  startWaitingPhase();
}

function handleRealBetPlaced(betData) {
  activeRealBets.push(betData);
  broadcastActiveBets();
}

function handleRealBetCashout(betId, multiplier, payout) {
  const bet = activeRealBets.find(b => b.betId && b.betId.toString() === betId.toString());
  if (bet) {
    bet.cashouted = true;
    bet.cashOut = payout;
    bet.target = multiplier;
    broadcastActiveBets();
  }
}

function broadcastActiveBets() {
  if (!io) return;
  const botBets = bots.getBots();
  const allBets = [...activeRealBets, ...botBets];

  io.of('/aviator').emit('bettedUserInfo', allBets);
}

/**
 * Start waiting phase (betting phase)
 */
async function startWaitingPhase() {
  gameState.status = 'WAITING';
  gameState.currentMultiplier = 1.0;
  gameState.crashMultiplier = null;
  gameState.startTime = null;
  gameState.crashTime = null;

  // Reset bets
  activeRealBets = [];
  bots.placeBets(gameState.roundId);
  broadcastActiveBets();

  // Generate round ID
  gameState.roundId = `AV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Create round record
  await GameRound.create({
    game: 'aviator',
    roundId: gameState.roundId,
    status: 'WAITING',
  });

  // Broadcast waiting state
  if (io) {
    const aviatorIO = io.of('/aviator');

    aviatorIO.to('game').emit('game:waiting', {
      roundId: gameState.roundId,
      time: CONFIG.WAITING_DURATION,
    });

    // Also emit for existing frontend compatibility
    aviatorIO.to('game').emit('gameState', {
      GameState: 'BET',
      currentNum: 1.0,
      currentSecondNum: 1.0,
      time: CONFIG.WAITING_DURATION,
    });
  }

  // After waiting duration, start flying
  gameState.waitingTimeout = setTimeout(() => {
    startFlyingPhase();
  }, CONFIG.WAITING_DURATION);
}

/**
 * Start flying phase (multiplier increasing)
 */
async function startFlyingPhase() {
  // Check for scheduled crash
  const scheduledCrash = await checkScheduledCrash();

  if (scheduledCrash) {
    gameState.crashMultiplier = scheduledCrash.crashAt;
    console.log(`📅 Using scheduled crash: ${scheduledCrash.crashAt}x at ${scheduledCrash.date} ${scheduledCrash.time}`);
  } else {
    // Generate random crash multiplier
    gameState.crashMultiplier = generateCrashMultiplier();
  }

  gameState.status = 'FLYING';
  gameState.startTime = Date.now();

  // Update round status
  await GameRound.findOneAndUpdate(
    { roundId: gameState.roundId },
    {
      status: 'FLYING',
      startedAt: new Date(),
      crashMultiplier: gameState.crashMultiplier,
    }
  );

  // Broadcast start
  if (io) {
    const aviatorIO = io.of('/aviator');

    aviatorIO.to('game').emit('game:start', {
      roundId: gameState.roundId,
      crashMultiplier: gameState.crashMultiplier, // For admin/debugging
    });

    // Also emit for existing frontend compatibility
    aviatorIO.to('game').emit('gameState', {
      GameState: 'PLAYING',
      currentNum: 1.0,
      currentSecondNum: 1.0,
      time: 0,
    });
  }

  // Start multiplier update loop
  startMultiplierLoop();
}

/**
 * Multiplier update loop
 */
function startMultiplierLoop() {
  gameState.intervalId = setInterval(() => {
    const elapsedSeconds = (Date.now() - gameState.startTime) / 1000;
    gameState.currentMultiplier = calculateMultiplier(elapsedSeconds);

    // Check if should crash
    if (shouldCrash(gameState.currentMultiplier, gameState.crashMultiplier)) {
      crashRound();
      return;
    }

    // Update bots
    if (bots.updateBots(gameState.currentMultiplier)) {
      broadcastActiveBets();
    }

    // Broadcast multiplier update
    if (io) {
      const aviatorIO = io.of('/aviator');

      aviatorIO.to('game').emit('game:update', {
        roundId: gameState.roundId,
        multiplier: gameState.currentMultiplier,
        time: elapsedSeconds,
      });

      // Also emit for existing frontend compatibility
      aviatorIO.to('game').emit('gameState', {
        GameState: 'PLAYING',
        currentNum: gameState.currentMultiplier,
        currentSecondNum: gameState.currentMultiplier,
        time: Math.floor(elapsedSeconds * 1000),
      });
    }
  }, CONFIG.UPDATE_INTERVAL);
}

/**
 * Crash the round
 */
async function crashRound() {
  // Clear intervals
  if (gameState.intervalId) {
    clearInterval(gameState.intervalId);
    gameState.intervalId = null;
  }

  gameState.status = 'CRASHED';
  gameState.crashTime = Date.now();
  gameState.currentMultiplier = gameState.crashMultiplier;

  // Update round
  await GameRound.findOneAndUpdate(
    { roundId: gameState.roundId },
    {
      status: 'CRASHED',
      crashedAt: new Date(),
      crashMultiplier: gameState.crashMultiplier,
    }
  );

  // Broadcast crash
  if (io) {
    const aviatorIO = io.of('/aviator');

    aviatorIO.to('game').emit('game:crash', {
      roundId: gameState.roundId,
      multiplier: gameState.crashMultiplier,
    });

    // Also emit for existing frontend compatibility
    aviatorIO.to('game').emit('gameState', {
      GameState: 'GAMEEND',
      currentNum: gameState.crashMultiplier,
      currentSecondNum: gameState.crashMultiplier,
      time: (gameState.crashTime - gameState.startTime) / 1000,
    });

    // Emit history update
    aviatorIO.to('game').emit('history', [gameState.crashMultiplier]);
  }

  // Settle all pending bets (auto-cashout those who didn't cash out)
  await settlePendingBets();

  // Send finishGame event to all clients (resets UI state)
  await sendFinishGame();

  // Wait a bit before starting next round
  setTimeout(() => {
    startWaitingPhase();
  }, 3000);
}

/**
 * Settle all pending bets for crashed round
 */
async function settlePendingBets() {
  try {
    const pendingBets = await Bet.find({
      gameId: 'aviator',
      roundId: gameState.roundId,
      result: 'PENDING',
      cashedOut: false,
    });

    for (const bet of pendingBets) {
      // Bet lost (didn't cash out in time)
      bet.result = 'LOST';
      bet.payout = 0;
      // Save crash multiplier in metadata for history
      if (!bet.metadata) bet.metadata = {};
      bet.metadata.crashMultiplier = gameState.crashMultiplier;
      bet.markModified('metadata');
      await bet.save();

      // Update stats
      await userStatsService.recordLoss(bet.userId, 'aviator', bet.amount);

      // Record activity
      await activityService.createActivity({
        userId: bet.userId,
        gameId: 'aviator',
        type: 'BET_LOST',
        title: 'Aviator Loss',
        description: `Round crashed at ${gameState.crashMultiplier.toFixed(2)}x`,
        amount: bet.amount,
        payout: 0,
        balanceAfter: await walletService.getBalance(bet.userId),
        metadata: {
          betId: bet._id,
          roundId: gameState.roundId,
          crashMultiplier: gameState.crashMultiplier,
        },
      });
    }

    console.log(`💰 Settled ${pendingBets.length} pending bets for round ${gameState.roundId}`);
  } catch (error) {
    console.error('Error settling bets:', error);
  }
}

/**
 * Send finishGame event to all connected clients
 * This is required for the frontend to reset bet buttons and update balance
 */
async function sendFinishGame() {
  if (!io) return;

  const aviatorNamespace = io.of('/aviator');
  const sockets = aviatorNamespace.sockets; // Map of sockets

  for (const [socketId, socket] of sockets) {
    const userId = socket.userId;
    if (!userId) continue;

    try {
      const user = await User.findById(userId);
      if (!user) continue;

      const bets = await Bet.find({
        userId: userId,
        gameId: 'aviator',
        roundId: gameState.roundId
      });

      const fBet = bets.find(b => b.metadata && b.metadata.type === 'f');
      const sBet = bets.find(b => b.metadata && b.metadata.type === 's');

      socket.emit('finishGame', {
        balance: user.balance,
        userType: user.role === 'ADMIN',
        userName: user.name,
        f: {
          betted: false, // Reset for next round
          cashouted: fBet ? fBet.cashedOut : false,
          cashAmount: fBet ? fBet.payout : 0,
          betAmount: fBet ? fBet.amount : 0,
          auto: false, // Frontend restores this
        },
        s: {
          betted: false,
          cashouted: sBet ? sBet.cashedOut : false,
          cashAmount: sBet ? sBet.payout : 0,
          betAmount: sBet ? sBet.amount : 0,
          auto: false,
        }
      });
    } catch (err) {
      console.error(`Error sending finishGame to ${userId}:`, err);
    }
  }
}

/**
 * Check for scheduled crash at current time
 */
async function checkScheduledCrash() {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Find unused schedule for today
    const schedule = await AviatorSchedule.findOne({
      date: currentDate,
      time: currentTime,
      used: false,
    });

    if (schedule) {
      // Mark as used
      schedule.used = true;
      schedule.executedAt = new Date();
      schedule.roundId = gameState.roundId;
      await schedule.save();

      return schedule;
    }

    // Also check with ±1 minute window
    const minute = now.getMinutes();
    const timesToCheck = [
      `${String(now.getHours()).padStart(2, '0')}:${String((minute - 1 + 60) % 60).padStart(2, '0')}`,
      currentTime,
      `${String(now.getHours()).padStart(2, '0')}:${String((minute + 1) % 60).padStart(2, '0')}`,
    ];

    for (const time of timesToCheck) {
      const schedule = await AviatorSchedule.findOne({
        date: currentDate,
        time,
        used: false,
      });

      if (schedule) {
        schedule.used = true;
        schedule.executedAt = new Date();
        schedule.roundId = gameState.roundId;
        await schedule.save();

        return schedule;
      }
    }

    return null;
  } catch (error) {
    console.error('Error checking scheduled crash:', error);
    return null;
  }
}

/**
 * Start schedule checker (runs periodically)
 */
function startScheduleChecker() {
  // Check every minute for scheduled crashes
  setInterval(async () => {
    // This is handled in checkScheduledCrash() when starting flying phase
  }, CONFIG.SCHEDULE_CHECK_INTERVAL);
}

/**
 * Get current game state (sanitized for Socket.IO)
 */
function getState() {
  // Return only serializable properties (exclude Timeout/Interval objects)
  return {
    status: gameState.status,
    roundId: gameState.roundId,
    currentMultiplier: gameState.currentMultiplier,
    crashMultiplier: gameState.crashMultiplier,
    startTime: gameState.startTime,
    crashTime: gameState.crashTime,
    elapsedTime: gameState.startTime
      ? (Date.now() - gameState.startTime) / 1000
      : 0,
  };
}

/**
 * Stop game engine
 */
function stop() {
  if (gameState.intervalId) {
    clearInterval(gameState.intervalId);
  }
  if (gameState.waitingTimeout) {
    clearTimeout(gameState.waitingTimeout);
  }
  console.log('🛑 Aviator game engine stopped');
}

module.exports = {
  initialize,
  getState,
  stop,
};


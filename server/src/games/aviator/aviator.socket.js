/**
 * Aviator Socket Handlers
 * Handles Socket.IO events for Aviator game
 */

const Bet = require('../../models/Bet.model');
const GameRound = require('../../models/GameRound.model');
const walletService = require('../../services/wallet.service');
const userStatsService = require('../../services/userStats.service');
const activityService = require('../../services/activity.service');
const fraudService = require('../../services/fraudService'); // Fraud Detection

// Import CONFIG for time calculations
const CONFIG = {
  WAITING_DURATION: 5000,
};

/**
 * Initialize Aviator socket handlers
 */
function initializeAviatorSockets(io, gameEngine) {
  // Namespace for Aviator game
  const aviatorNamespace = io.of('/aviator');

  aviatorNamespace.on('connection', async (socket) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    const userId = socket.handshake.query.userId || socket.handshake.auth.userId;

    console.log(`🎮 Aviator: Client connected - ${socket.id}`);
    console.log(`   Token: ${token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing'}`);
    console.log(`   User ID: ${userId || 'Anonymous'}`);
    console.log(`   Auth keys:`, Object.keys(socket.handshake.auth));
    console.log(`   Query keys:`, Object.keys(socket.handshake.query));

    // Verify token and get user info
    let userInfo = null;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const User = require('../../models/User.model');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
        userInfo = await User.findById(decoded.userId);

        if (userInfo) {
          // Send user info immediately
          socket.emit('myInfo', {
            balance: userInfo.balance,
            userType: userInfo.role === 'ADMIN',
            userName: userInfo.name,
            userId: userInfo._id.toString(),
            currency: 'INR',
          });
        }
      } catch (error) {
        console.error('Token verification failed:', error.message);
      }
    }

    // Join user-specific room
    if (userId || userInfo?._id) {
      const uid = userId || userInfo._id.toString();
      socket.join(`user:${uid}`);
      socket.userId = uid;
    }

    // Join game room to receive updates
    socket.join('game');

    // Send current game state on connection
    const currentState = gameEngine.getCurrentState();
    // getState() already returns sanitized state, safe to log and send
    console.log('📊 Sending initial game state:', {
      status: currentState.status,
      roundId: currentState.roundId,
      currentMultiplier: currentState.currentMultiplier,
    });

    socket.emit('game:state', currentState);

    // Also emit legacy format for existing frontend (required!)
    const gameStateLegacy = {
      GameState: currentState.status === 'WAITING' ? 'BET' : currentState.status === 'FLYING' ? 'PLAYING' : 'GAMEEND',
      currentNum: currentState.currentMultiplier || 1.0,
      currentSecondNum: currentState.currentMultiplier || 1.0,
      time: currentState.startTime ? Math.floor((Date.now() - currentState.startTime) / 1000) : CONFIG.WAITING_DURATION / 1000,
    };

    console.log('📤 Emitting gameState:', gameStateLegacy);
    socket.emit('gameState', gameStateLegacy);

    // Send bet limits
    socket.emit('getBetLimits', { max: 1000, min: 1 });

    /**
     * Place bet
     * Client → Server: bet:place
     */
    socket.on('bet:place', async (data) => {
      try {
        const currentUserId = socket.userId || userId;
        if (!currentUserId) {
          return socket.emit('error', { message: 'Authentication required' });
        }


        const Game = require('../../models/Game.model');

        const { betAmount, target, type = 'f', auto = false } = data;

        // Fetch Game Config (should cache this in production)
        const gameConfig = await Game.findOne({ gameId: 'aviator' });
        const minBet = gameConfig?.minBet || 1;
        const maxBet = gameConfig?.maxBet || 10000;

        if (!betAmount || betAmount <= 0) {
          return socket.emit('error', { message: 'Invalid bet amount', type });
        }

        if (betAmount < minBet) {
          return socket.emit('error', { message: `Minimum bet is ₹${minBet}`, type });
        }

        if (betAmount > maxBet) {
          return socket.emit('error', { message: `Maximum bet is ₹${maxBet}`, type });
        }

        // Check if game is in betting phase
        const state = gameEngine.getCurrentState();

        // Fix: Allow bets if WAITING or if just started FLYING (Grace period for latency)
        // logic: if status is waiting OR (status is flying AND multiplier is still very low < 1.1)
        const isBettingPhase =
          state.status === 'WAITING' ||
          (state.status === 'FLYING' && state.currentMultiplier <= 1.1);

        if (!isBettingPhase) {
          return socket.emit('error', { message: 'Betting phase closed', type });
        }

        // Prevent duplicate bets for the same type in the same round
        const existingBet = await Bet.findOne({
          userId: currentUserId,
          gameId: 'aviator',
          roundId: state.roundId,
          'metadata.type': type
        });

        if (existingBet) {
          return socket.emit('error', { message: 'Bet already placed for this round', type });
        }

        // Check balance
        const balance = await walletService.getBalance(currentUserId);
        if (balance < betAmount) {
          return socket.emit('error', { message: 'Insufficient balance', type });
        }

        // Deduct balance
        await walletService.updateBalance(currentUserId, -betAmount, 'Aviator bet placed');

        // Update user balance in real-time
        const newBalance = await walletService.getBalance(currentUserId);
        socket.emit('myInfo', {
          balance: newBalance,
          userType: userInfo?.role === 'ADMIN',
          userName: userInfo?.name || '',
        });

        // Create bet record
        const bet = await Bet.create({
          userId: currentUserId,
          gameId: 'aviator',
          roundId: state.roundId,
          amount: betAmount,
          multiplier: null,
          result: 'PENDING',
          cashedOut: false,
          metadata: {
            target: target || null,
            type,
            auto,
          },
        });

        // Record activity
        await activityService.createActivity({
          userId: currentUserId,
          gameId: 'aviator',
          type: 'BET_PLACED',
          title: 'Aviator Bet',
          description: `Bet placed: ${betAmount} on round ${state.roundId}`,
          amount: betAmount,
          payout: 0,
          balanceAfter: newBalance,
          metadata: {
            betId: bet._id,
            roundId: state.roundId,
            target,
          },
        });

        // Notify user
        socket.emit('bet:success', {
          betId: bet._id,
          amount: betAmount,
          roundId: state.roundId,
        });

        // Broadcast to all players (bet placed)
        aviatorNamespace.to('game').emit('bet:placed', {
          userId: currentUserId,
          amount: betAmount,
          roundId: state.roundId,
        });

        // Notify game engine for All Bets panel
        if (gameEngine.onBetPlaced) {
          gameEngine.onBetPlaced({
            betId: bet._id,
            userId: currentUserId,
            name: userInfo?.name || 'Unknown',
            avatar: userInfo?.avatar || '/avatars/av-5.png',
            betAmount: betAmount,
            target: 0,
            cashouted: false,
            cashOut: 0,
          });
        }

        // RISK CHECK: Analyze bet
        fraudService.analyzeBet(
          currentUserId,
          { amount: betAmount },
          socket.handshake.address
        ).catch(e => console.error('Fraud Check Error:', e));

      } catch (error) {
        console.error('Bet placement error:', error);
        socket.emit('error', { message: error.message, type: data?.type || 'f' });
      }
    });

    /**
     * Cash out
     * Client → Server: bet:cashout
     */
    socket.on('bet:cashout', async (data) => {
      try {
        const currentUserId = socket.userId || userId;
        const { endTarget, type = 'f' } = data;

        if (!currentUserId) {
          return socket.emit('error', { message: 'Authentication required. Please login.', type });
        }

        if (!endTarget || endTarget < 1.01) {
          return socket.emit('error', { message: 'Invalid cashout multiplier', type });
        }

        // Get current state (sanitized)
        const state = gameEngine.getCurrentState();

        // Validate cashout validity
        let isValidCashout = false;

        if (state.status === 'FLYING') {
          // Relaxed Validation (Bug #4 Fix)
          // We allow a larger buffer (1.0x) for latency or minor mismatches.
          // Ideally, we should check timestamps, but increasing buffer helps significantly.
          if (endTarget <= state.currentMultiplier + 1.0) {
            isValidCashout = true;
          }
        } else if (state.status === 'CRASHED') {
          // In crashed state, cashout is valid ONLY if it was below the crash point
          if (endTarget < state.crashMultiplier) {
            isValidCashout = true;
          }
        }

        if (!isValidCashout) {
          return socket.emit('error', { message: 'Cashout failed: Game ended or invalid multiplier', type });
        }

        // Find active bet for this user and round
        const query = {
          userId: currentUserId,
          gameId: 'aviator',
          roundId: state.roundId,
          cashedOut: false,
          'metadata.type': type,
        };

        if (state.status === 'FLYING') {
          query.result = 'PENDING';
        } else {
          // In crashed state, we accept PENDING or LOST (if settled)
          query.result = { $in: ['PENDING', 'LOST'] };
        }

        const bet = await Bet.findOne(query);

        if (!bet) {
          return socket.emit('error', { message: 'No active bet found', type });
        }

        // If bet was marked as LOST, revert stats
        if (bet.result === 'LOST') {
          await userStatsService.revertLoss(currentUserId, 'aviator', bet.amount);
        }

        // Calculate payout
        const payout = bet.amount * endTarget;

        // Update bet
        bet.result = 'WON';
        bet.cashedOut = true;
        bet.cashedOutAt = new Date();
        bet.multiplier = endTarget;
        bet.payout = payout;
        await bet.save();

        // Add balance
        await walletService.updateBalance(currentUserId, payout, `Aviator cashout at ${endTarget}x`);
        const newBalance = await walletService.getBalance(currentUserId);

        // Send updated balance
        socket.emit('myInfo', {
          balance: newBalance,
          userType: userInfo?.role === 'ADMIN',
          userName: userInfo?.name || '',
        });

        // Update stats
        await userStatsService.recordWin(currentUserId, 'aviator', bet.amount, payout);

        // RISK CHECK: Trigger analysis for big wins
        // RISK CHECK: Trigger analysis for big wins
        if (endTarget > 5 || payout > 5000) {
          // Run asynchronously
          fraudService.analyzeResult(currentUserId, payout, bet.amount)
            .catch(e => console.error('Fraud Check Error:', e));
        }

        // Record activity
        await activityService.createActivity({
          userId: currentUserId,
          gameId: 'aviator',
          type: 'BET_WON',
          title: 'Aviator Win',
          description: `Cashed out at ${endTarget.toFixed(2)}x`,
          amount: bet.amount,
          payout,
          balanceAfter: newBalance + payout,
          metadata: {
            betId: bet._id,
            roundId: state.roundId,
            multiplier: endTarget,
          },
        });

        // Notify user
        socket.emit('cashout:success', {
          betId: bet._id,
          multiplier: endTarget,
          payout,
          type: bet.metadata.type,
        });

        // Broadcast cashout
        aviatorNamespace.to('game').emit('bet:cashout', {
          userId,
          multiplier: endTarget,
          roundId: state.roundId,
        });

        // Notify game engine for All Bets panel
        if (gameEngine.onBetCashout) {
          gameEngine.onBetCashout(bet._id, endTarget, payout);
        }

      } catch (error) {
        console.error('Cashout error:', error);
        socket.emit('error', { message: error.message, type: data?.type || 'f' });
      }
    });

    /**
     * Enter room (for existing frontend compatibility)
     */
    socket.on('enterRoom', async (data) => {
      try {
        const { token } = data;
        let userBalance = 0;
        let userName = '';
        let userType = false;

        if (token) {
          try {
            const jwt = require('jsonwebtoken');
            const User = require('../../models/User.model');
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret');
            const user = await User.findById(decoded.userId);

            if (user) {
              userBalance = user.balance;
              userName = user.name;
              userType = user.role === 'ADMIN';
              socket.userId = user._id.toString();
              socket.join(`user:${socket.userId}`);
            }
          } catch (error) {
            console.error('Token verification failed:', error.message);
          }
        } else if (socket.userId) {
          userBalance = await walletService.getBalance(socket.userId);
        }

        socket.emit('myInfo', {
          balance: userBalance,
          userType: userType,
          userName: userName,
          userId: socket.userId || '',
          currency: 'INR',
        });
      } catch (error) {
        console.error('Enter room error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🎮 Aviator: Client disconnected - ${socket.id}`);
    });

    /**
     * Chat Message
     * Client → Server: sendMsg
     */
    socket.on('sendMsg', async (data) => {
      try {
        const { msgContent, msgType, userInfo: senderInfo } = data;

        // Basic validation
        if (!msgContent) return;

        // Use the authenticated user ID if available, otherwise trust the client (less secure but compatible)
        // Ideally we use socket.userId and database user info
        const Chat = require('../../models/Chat.model');
        const chatService = require('../../services/chat.service');

        // Create message object
        const chatData = {
          userInfo: {
            userId: socket.userId || senderInfo?.userId || 'anon',
            userName: senderInfo?.userName || 'Guest',
            avatar: senderInfo?.avatar || '',
          },
          msgContent,
          msgType
        };

        // Save to DB
        const savedChat = await chatService.saveMessage(chatData);

        // Broadcast to all
        // The client expects the same format as the DB document
        aviatorNamespace.emit('msg:new', savedChat);

      } catch (error) {
        console.error('Chat error:', error);
      }
    });
  });

  return aviatorNamespace;
}

module.exports = { initializeAviatorSockets };


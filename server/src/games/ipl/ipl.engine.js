/**
 * IPL Probo Game Engine
 * Real-time prediction markets driven by CricketData.org API
 */

const cricketService = require('../../services/cricket.service');
const { v4: uuidv4 } = require('uuid');

let io = null;
let gameConfig = null;
let pollInterval = null;

// State
let activeMatches = [];
let questions = []; // List of active prediction markets
// { id: 'q1', text: 'CSK to win?', options: ['Yes', 'No'], odds: {Yes: 1.8, No: 2.1}, status: 'OPEN'|'LOCKED'|'SETTLED', result: null }

/**
 * Initialize IPL game engine
 */
async function initialize(socketIO, config) {
  io = socketIO;
  gameConfig = config;
  console.log('🏏 Initializing IPL Probo Engine...');

  const nsp = io.of('/ipl');

  nsp.on('connection', (socket) => {
    // Send initial state
    socket.emit('init', { matches: activeMatches, questions });

    socket.on('bet:place', (data) => handleBet(socket, data));
  });

  // Start Polling Loop
  startMatchLoop(nsp);

  console.log('✅ IPL Probo Engine active');
}

/**
 * Main Loop: Fetch Data -> Update State -> Broadcast
 */
function startMatchLoop(nsp) {
  // Poll every 5 seconds
  pollInterval = setInterval(async () => {
    try {
      // 1. Fetch Live Data
      const matches = await cricketService.getCurrentMatches();
      activeMatches = matches;

      // 2. Generate/Update Questions based on Match State
      updateMarkets(matches);

      // 3. Broadcast Updates
      nsp.emit('match:update', { matches, questions });

    } catch (e) {
      console.error('IPL Loop Error:', e.message);
    }
  }, 5000);
}

/**
 * Logic to generate/settle markets
 */
function updateMarkets(matches) {
  // For each live match, ensure we have basic markets
  matches.forEach(match => {
    // 1. Match Winner Market (Persistent)
    const winnerMarketId = `winner-${match.id}`;
    if (!questions.find(q => q.id === winnerMarketId)) {
      questions.push({
        id: winnerMarketId,
        matchId: match.id,
        text: `Who will win ${match.name}?`,
        type: 'winner',
        options: match.teamInfo.map(t => t.shortname),
        odds: { [match.teamInfo[0].shortname]: 1.9, [match.teamInfo[1].shortname]: 1.9 }, // Mock odds
        status: 'OPEN',
        createdAt: Date.now()
      });
    }

    // 2. Dynamic Overs Market (Mock Logic for demo)
    // If score is roughly X.4 or X.5, open a "Run in next over" market
    // For MVP, we will just create a random fake market if none exists
    const dynamicId = `runs-${match.id}-${Math.floor(Date.now() / 60000)}`; // New q every minute
    if (!questions.find(q => q.matchId === match.id && q.type === 'dynamic' && q.status === 'OPEN')) {
      // Create a new dynamic question
      questions.push({
        id: uuidv4(),
        matchId: match.id,
        text: `Will there be a boundary in the next over?`,
        type: 'dynamic',
        options: ['Yes', 'No'],
        odds: { Yes: 2.1, No: 1.7 },
        status: 'OPEN',
        createdAt: Date.now()
      });
    }
  });

  // Cleanup settled/old questions (omitted for brevity)
}

const User = require('../../models/User.model');
const Bet = require('../../models/Bet.model');

async function handleBet(socket, data) {
  try {
    const { userId, questionId, selection, amount } = data;

    // 1. Validate User & Balance
    const user = await User.findById(userId);
    if (!user) return socket.emit('error', { message: 'User not found' });
    if (user.balance < amount) return socket.emit('error', { message: 'Insufficient balance' });

    // 2. Deduct Balance
    user.balance -= amount;
    user.totalBets += 1;
    user.wagered += amount;
    await user.save();

    // 3. Create Bet
    // Find market odds if possible, or use default mock 1.9 for now since dynamic
    const question = questions.find(q => q.id === questionId);
    const odds = question ? (question.odds[selection] || 1.9) : 1.9;

    const newBet = await Bet.create({
      userId: user._id,
      gameId: 'ipl',
      roundId: questionId, // using questionId as roundId
      amount: amount,
      result: 'PENDING',
      metadata: { selection, odds, questionText: question?.text }
    });

    // 4. Confirm
    socket.emit('bet:accepted', {
      id: newBet._id,
      questionId,
      selection,
      amount,
      payout: amount * odds,
      balance: user.balance
    });

  } catch (err) {
    console.error('IPL Bet Error:', err);
    socket.emit('error', { message: 'Bet failed' });
  }
}

function stop() {
  if (pollInterval) clearInterval(pollInterval);
}

module.exports = {
  initialize,
  stop
};

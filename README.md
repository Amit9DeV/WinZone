# 🎰 WinZone - Full-Stack Gaming Platform

**WinZone** is a modern, real-time online gaming platform built with cutting-edge web technologies. Play 10+ provably fair games, manage your wallet, chat with players, and compete on leaderboards!

---

## 🎮 Games Library

### 1. **Dice** 🎲
Roll the dice and predict Over or Under a target number.
- **Features**: Dynamic odds, 2-98 target range, up to 990x multiplier
- **Min Bet**: ₹10
- **Strategy**: Lower targets = higher risk/reward

### 2. **Mines** 💣
Reveal tiles to find diamonds while avoiding bombs.
- **Features**: 5×5 grid, adjustable bomb count (1-24), increasing multipliers
- **Min Bet**: ₹10
- **Strategy**: Cash out early or risk it for higher multipliers

### 3. **Slots** 🍒
Classic 3-reel slot machine with various symbol combinations.
- **Features**: 6 symbols, auto-spin animation, instant results
- **Payouts**: 5x to 200x (🍀🍀🍀 = 200x!)
- **Min Bet**: ₹10

### 4. **Plinko** 🎯
Drop balls through pegs to land in multiplier slots.
- **Features**: Adjustable rows (8-16), risk levels, auto-bet mode
- **Multipliers**: Up to 110x on edge slots
- **Min Bet**: ₹10

### 5. **Limbo** 🚀
Guess if the multiplier will go higher than your target.
- **Features**: Set target multipliers, 99% win chance at 1.01x
- **Max Multiplier**: Unlimited (theoretical)
- **Min Bet**: ₹10

### 6. **Keno** 🎱
Pick up to 10 numbers from 80, match drawn numbers to win.
- **Features**: 20 numbers drawn per round, dynamic payouts based on hits
- **Animated Drawing**: Number reveal animation
- **Min Bet**: ₹10

### 7. **Wheel** 🎡
Spin the color wheel and bet on where it lands.
- **Features**: 6 color segments, multipliers from 2x to 5x
- **Colors**: Red, Blue, Green, Yellow, Orange, Purple
- **Min Bet**: ₹10

### 8. **Triple Number** 🔢
Fast-paced social betting - pick 1, 2, or 3 before time runs out!
- **Features**: 20-second rounds, 2.8x multiplier, community results
- **Timer**: Live countdown, betting window closes at 3s
- **Min Bet**: ₹10

### 9. **Coin Flip** 🪙
Classic heads or tails - 50/50 chance to double your money.
- **Features**: Instant results, 2x payout, simple gameplay
- **Min Bet**: ₹10

### 10. **Color Prediction** 🌈
Predict the winning color from multiple options.
- **Features**: Multiple color choices, varying odds
- **Min Bet**: ₹10

---

## ✨ Platform Features

### 💰 **Wallet System**
- Real-time balance updates via WebSocket
- Deposit & withdrawal requests
- Transaction history
- Admin approval workflow

### 🎁 **Daily Rewards**
- Login streak system (7 days)
- Incremental rewards: ₹10 → ₹100
- Confetti celebration on claim
- Auto-popup on login

### 💬 **Global Chat**
- Real-time messaging with Socket.IO
- 200 character limit
- 2-second cooldown (rate limiting)
- Message history (last 50 messages)
- Mobile-optimized sidebar

### 🤖 **Help Chatbot**
- Floating assistant button
- Pre-defined FAQs (Getting Started, Games, Account)
- Expandable categories
- Custom question input
- "Back to Menu" navigation

### 📊 **User Dashboard**
- Game statistics (wins, losses, profit)
- Bet history
- Profile customization
- Avatar upload

### 🌐 **Multi-Language Support**
- English & Hindi
- Language toggle in navigation
- Persistent language preference

### 🔔 **Notifications**
- Toast notifications for wins/losses
- Real-time game updates
- Balance change alerts

### 📱 **Mobile Responsive**
- Optimized for all screen sizes
- Touch-friendly controls
- Full-screen chat on mobile
- Adaptive grid layouts

### ⏱️ **Server Status Detection**
- Loading screen for cold starts (Render.com)
- Countdown timer & status messages
- Auto-reconnection logic
- Health check polling (3s interval)

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI**: React 18, TailwindCSS
- **Animations**: Framer Motion
- **State**: Context API (Auth, Language, Server Status)
- **Real-time**: Socket.IO Client
- **Forms**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.IO Server
- **File Upload**: Multer

### Game Engines
Each game has a dedicated Socket.IO namespace with server-side logic:
- `/dice`, `/mines`, `/slots`, `/plinko`, `/limbo`, `/keno`, `/wheel`, `/triple-number`, etc.
- Provably fair random generation
- Server-authoritative game state

---

## 🚀 Getting Started

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Amit9DeV/WinZone.git
cd WinZone
```

2. **Install dependencies**
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install

# Admin (optional)
cd ../admin
npm install
```

3. **Configure environment variables**

**Server** (`server/.env`):
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/winzone
JWT_SECRET=your_secret_key_here
CORS_ORIGIN=http://localhost:3000
```

**Client** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
```

4. **Run the application**

Open 2 terminals:

**Terminal 1 - Server**:
```bash
cd server
npm run dev
```

**Terminal 2 - Client**:
```bash
cd client
npm run dev
```

5. **Access the app**
- Client: http://localhost:3000
- API: http://localhost:5001/api

---

## 📁 Project Structure

```
WinZone/
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── dice/
│   │   │   ├── mines/
│   │   │   ├── slots/
│   │   │   └── ...
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts
│   │   └── lib/           # Utilities & API client
│   └── public/            # Static assets
├── server/                # Express backend
│   └── src/
│       ├── games/         # Game engines
│       ├── middleware/    # Auth, CORS, etc.
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       └── server.js      # Entry point
└── admin/                 # Admin dashboard (optional)
```

---

## 🎯 Features Roadmap

- [x] 10+ Games
- [x] Real-time multiplayer
- [x] Wallet system
- [x] Daily rewards
- [x] Global chat
- [x] Help chatbot
- [x] Mobile responsive
- [x] Server cold start detection
- [ ] Leaderboards
- [ ] Tournaments
- [ ] Referral system
- [ ] Social login (Google, Facebook)
- [ ] Payment gateway integration

---

## 🤝 Contributing

Contributions are welcome! Fork the repo and submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Developer

Built with ❤️ by **Amit9DeV**

- GitHub: [@Amit9DeV](https://github.com/Amit9DeV)
- Portfolio: [Coming Soon]

---

## 🙏 Acknowledgments

- Socket.IO for real-time communication
- Next.js team for the amazing framework
- Tailwind Labs for TailwindCSS
- Framer Motion for smooth animations

---

**Star ⭐ this repo if you found it helpful!**

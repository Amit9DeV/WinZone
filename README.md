# WinZone Gaming Platform

WinZone is a comprehensive, full-stack online gaming platform featuring a robust backend, a modern Next.js client, and a high-performance, real-time Aviator game module.

## 🚀 Features

### ✈️ Aviator Game
*   **Real-Time Multiplayer**: Seamless WebSocket-based gameplay with synchronized state across all clients.
*   **Provably Fair Logic**: Server-side crash generation with configurable probability distributions.
*   **Smart Bots**: 15-40 intelligent bots per round that place bets and cash out realistically to simulate a lively environment.
*   **Live Bet History**: "All Bets" panel showing real-time bets from bots and real users.
*   **Top Wins**: Leaderboard displaying daily, monthly, and yearly top winners.
*   **Auto-Bet & Auto-Cashout**: Fully functional automation tools for players.
*   **Dual Betting**: Support for placing two simultaneous bets in a single round.

### 💰 Wallet & Economy
*   **Balance Management**: Secure deposit and withdrawal request system.
*   **Transaction History**: Detailed logs of all financial activities.
*   **Admin Approval**: Manual admin verification for deposit/withdrawal requests.

### 👤 User System
*   **Authentication**: JWT-based secure login and registration.
*   **Profiles**: Customizable user profiles with avatars.
*   **Statistics**: Comprehensive game stats (total bets, wins, losses, profit).

### 🛠️ Admin Dashboard
*   **Game Control**: Monitor active games and force crash rounds if necessary.
*   **User Management**: View and manage user accounts.
*   **Financial Oversight**: Approve or reject wallet requests.

---

## 🛠️ Tech Stack

*   **Frontend (Client)**: Next.js 14, React 18, TailwindCSS
*   **Frontend (Aviator)**: React 18, TypeScript, Unity WebGL (for animations)
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)
*   **Real-Time**: Socket.IO (v4)
*   **Authentication**: JSON Web Tokens (JWT)

---

## 📚 API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Body |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user | `{ name, email, password }` |
| `POST` | `/login` | Login user | `{ email, password }` |
| `GET` | `/verify` | Verify JWT token | Header: `Authorization: Bearer <token>` |

### User (`/api/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/profile` | Get current user profile | Yes |
| `GET` | `/stats` | Get user game statistics | Yes |
| `GET` | `/activity` | Get recent activity log | Yes |
| `POST` | `/my-info` | Get bet history (Aviator) | No (uses name) |
| `GET` | `/get-day-history` | Top wins of the day | No |
| `GET` | `/get-month-history` | Top wins of the month | No |
| `GET` | `/get-year-history` | Top wins of the year | No |

### Wallet (`/api/wallet`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/balance` | Get current wallet balance | Yes |
| `POST` | `/request` | Request deposit/withdraw | Yes |
| `GET` | `/requests` | View request history | Yes |

### Games (`/api/games`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all available games | No |
| `GET` | `/:gameId` | Get game details | No |
| `GET` | `/:gameId/state` | Get current game state | Yes |

---

## 🔌 Socket.IO Events (Aviator)

Namespace: `/aviator`

### Client -> Server
*   `enterRoom`: Join the game room (requires token).
*   `bet:place`: Place a bet. Payload: `{ betAmount, target, type, auto }`.
*   `bet:cashout`: Cash out a bet. Payload: `{ type, endTarget }`.

### Server -> Client
*   `gameState`: Updates game phase (WAITING, FLYING, CRASHED).
*   `game:waiting`: Round starts waiting phase.
*   `game:start`: Plane takes off.
*   `game:update`: Multiplier update (20Hz).
*   `game:crash`: Round crashed.
*   `bet:placed`: Confirmation of bet placement.
*   `cashout:success`: Confirmation of cashout.
*   `bettedUserInfo`: List of all active bets (Real Users + Bots).
*   `finishGame`: End of round summary (resets UI).
*   `myInfo`: Balance updates.

---

## ⚙️ Setup & Installation

### Prerequisites
*   Node.js (v16 or higher)
*   MongoDB (Local or Atlas)

### 1. Install Dependencies
Run the following commands in the respective directories:

```bash
# Client
cd client
npm install

# Server
cd ../server
npm install

# Aviator Game
cd ../Aviator
npm install
```

### 2. Configuration
Create `.env` files in `client/` and `server/` based on your environment.

**Server `.env`**:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/winzone
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

**Client `.env`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

**Aviator Config**:
Edit `Aviator/src/config.json` to point to your server URL.

### 3. Running the Application
You must run all three components simultaneously.

**Terminal 1: Server**
```bash
cd server
npm run dev
```

**Terminal 2: Client**
```bash
cd client
npm run dev
```

**Terminal 3: Aviator**
```bash
cd Aviator
npm start
```

Access the main application at `http://localhost:3000`.
The Aviator game runs on `http://localhost:3001` but is embedded/linked from the main client.

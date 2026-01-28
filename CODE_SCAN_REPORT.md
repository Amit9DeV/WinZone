# 🏗️ WinZone Codebase Scan Report

## 📦 Project Structure
The project behaves like a monorepo but lacks a root workspace manager. It consists of three distinct applications:
1.  **Server (`/server`)**: Node.js/Express backend.
2.  **Client (`/client`)**: Next.js 16 (App Router) main platform.
3.  **Aviator (`/Aviator`)**: Standalone React 18 (CRA) application for the Aviator game.

## 🛠️ Technology Stack

### Backend (`/server`)
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Mongoose ODM)
*   **Real-time**: Socket.IO
*   **Key Dependencies**: `axios`, `cors`, `dotenv`, `jsonwebtoken`, `multer`, `node-cron`.
*   **Entry Point**: `src/server.js` (Port 5001 default)

### Frontend - Main Platform (`/client`)
*   **Framework**: Next.js 16.1.1
*   **Styling**: Tailwind CSS v4, Sass
*   **State/Logic**: React 19, `socket.io-client`
*   **UI Components**: `framer-motion`, `lucide-react`, `react-icons`, `react-hot-toast`

### Frontend - Aviator Game (`/Aviator`)
*   **Framework**: Create React App (React 18)
*   **Build Tool**: `react-app-rewired`
*   **Styling**: SCSS, Tailwind CSS v3
*   **Features**: `react-unity-webgl` (suggests potential Unity integration?), `ethers` (crypto support?), `gif-picker-react`.

## 🔍 Key Observations & Architecture

### Server Architecture
*   **Game Registry**: Games are modularized in `src/games/` and loaded via `src/games/index.js`.
*   **Bot Service**: The server includes a `BotService` (`src/services/bot.service`), likely to simulate activity.
*   **Global Socket**: The `io` instance is attached to the `global` object (`global.io = io`), which allows any file to emit events but can lead to tighter coupling.
*   **DNS Hack**: `server.js` forces DNS to `8.8.8.8` at startup. This is a specific fix for the host environment but might cause issues in other network environments.
*   **Cron Jobs**: Leaderboards update every minute via `setInterval`.

### Client/Aviator Separation
*   The **Aviator** game is a completely separate React application from the main **Client**.
*   **Implication**: In production, this likely requires two separate frontend deployments, or the Next.js app must be configured to rewrite/proxy requests to the Aviator app for that specific route.

### "TODOs" and Technical Debt
*   A search for `TODO` and `FIXME` returned **0 results**. This implies either a very clean codebase or, more likely, that comments are not used for tracking debt.

## ⚠️ Potential Action Items
1.  **Unified Build**: Consider adding a root `package.json` with workspaces to manage dependencies and scripts from the top level.
2.  **DNS Fix**: Review the explicit `dns.setServers` in `server.js` - it should probably be configurable via environment variables in case the production environment blocks Google DNS.
3.  **Deployment Strategy**: rigorous testing is needed to ensure the separate Aviator app integrates seamlessly with the Next.js auth session (likely shared via cookies/tokens).

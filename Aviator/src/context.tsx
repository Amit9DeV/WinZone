/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { UnityContext } from "react-unity-webgl";
import { useLocation } from "react-router";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { config } from "./config";
import { UserType, BettedUserType, GameHistory } from "./utils/interfaces";

export interface PlayerType {
  auto: boolean;
  betted: boolean;
  cashouted: boolean;
  betAmount: number;
  cashAmount: number;
  target: number;
}

interface GameStatusType {
  currentNum: number;
  currentSecondNum: number;
  GameState: string;
  time: number;
}

interface GameBetLimit {
  maxBet: number;
  minBet: number;
}

interface UserStatusType {
  fbetState: boolean;
  fbetted: boolean;
  sbetState: boolean;
  sbetted: boolean;
}

interface ContextDataType {
  myBets: GameHistory[];
  width: number;
  userInfo: UserType;
  seed: string;
  fautoCashoutState: boolean;
  fautoCound: number;
  finState: boolean;
  fdeState: boolean;
  fsingle: boolean;
  fincrease: number;
  fdecrease: number;
  fsingleAmount: number;
  fdefaultBetAmount: number;
  sautoCashoutState: boolean;
  sautoCound: number;
  sincrease: number;
  sdecrease: number;
  ssingleAmount: number;
  sinState: boolean;
  sdeState: boolean;
  ssingle: boolean;
  sdefaultBetAmount: number;
  myUnityContext: UnityContext;
}

interface ContextType extends GameBetLimit, UserStatusType, GameStatusType {
  state: ContextDataType;
  unityState: boolean;
  unityLoading: boolean;
  currentProgress: number;
  bettedUsers: BettedUserType[];
  previousHand: UserType[];
  history: number[];
  rechargeState: boolean;
  myUnityContext: UnityContext;
  currentTarget: number;
  userInfo: UserType;
  socket: any;
  msgTab: boolean;
  msgReceived: boolean;
  setMsgReceived: (received: boolean) => void;
  msgData: any[];
  setMsgData: (msgs: any[]) => void;
  toggleMsgTab: () => void;
  handleChangeUserSeed: (seed: string) => void;
  updateUserInfo: (attrs: Partial<UserType>) => void;
  handleGetSeed: (id?: number) => void;
  seed: string;
  handleGetSeedOfRound: (param: any) => Promise<any>;
  setCurrentTarget(attrs: Partial<number>);
  update(attrs: Partial<ContextDataType>);
  getMyBets();
  updateUserBetState(attrs: Partial<UserStatusType>);
}

const unityContext = new UnityContext({
  loaderUrl: "unity/AirCrash.loader.js",
  dataUrl: "unity/AirCrash.data.unityweb",
  frameworkUrl: "unity/AirCrash.framework.js.unityweb",
  codeUrl: "unity/AirCrash.wasm.unityweb",
});

const init_state = {
  myBets: [],
  width: 1500,
  userInfo: {
    balance: 0,
    userType: false,
    avatar: "",
    userId: "",
    currency: "INR",
    userName: "",
    ipAddress: "",
    platform: "",
    token: "",
    Session_Token: "",
    isSoundEnable: true,
    isMusicEnable: true,
    msgVisible: true,
    f: {
      auto: false,
      autocashout: false,
      betid: "",
      betted: false,
      cashouted: false,
      cashAmount: 0,
      betAmount: 20,
      target: 2,
    },
    s: {
      auto: false,
      autocashout: false,
      betid: "",
      betted: false,
      cashouted: false,
      cashAmount: 0,
      betAmount: 20,
      target: 2,
    },
  },
  seed: "",
  fautoCashoutState: false,
  fautoCound: 0,
  finState: false,
  fdeState: false,
  fsingle: false,
  fincrease: 0,
  fdecrease: 0,
  fsingleAmount: 0,
  fdefaultBetAmount: 20,
  sautoCashoutState: false,
  sautoCound: 0,
  sincrease: 0,
  sdecrease: 0,
  ssingleAmount: 0,
  sinState: false,
  sdeState: false,
  ssingle: false,
  sdefaultBetAmount: 20,
  myUnityContext: unityContext,
} as ContextDataType;

const Context = React.createContext<ContextType>(null!);

// Socket will be initialized in Provider with token
let socketInstance: any = null;

export const callCashOut = (at: number, index: "f" | "s") => {
  // Try to get socket from global or instance
  const socket = socketInstance || (window as any).aviatorSocket;
  if (!socket) {
    console.error('Socket not initialized');
    toast.error('Not connected to game server');
    return;
  }
  let data = { type: index, endTarget: at };
  socket.emit("bet:cashout", data);
};

let fIncreaseAmount = 0;
let fDecreaseAmount = 0;
let sIncreaseAmount = 0;
let sDecreaseAmount = 0;

let newState;
let newBetState;

export const Provider = ({ children }: any) => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("cert") ||
    new URLSearchParams(location.search).get("token");
  const userId = new URLSearchParams(location.search).get("userId");
  const [state, setState] = React.useState<ContextDataType>(init_state);

  // Initialize socket connection
  React.useEffect(() => {
    console.log('🔍 Socket initialization check:');
    console.log('  Token:', token ? 'Present (' + token.substring(0, 20) + '...)' : 'Missing');
    console.log('  User ID:', userId || 'Not provided');
    console.log('  Config WSS:', config.wss);
    console.log('  Socket instance exists:', !!socketInstance);

    if (!token) {
      console.error('❌ No token found in URL. Please login first.');
      console.log('Current URL:', window.location.href);
      console.log('URL params:', new URLSearchParams(window.location.search).toString());
      toast.error('Authentication required. Please login.');
      return;
    }

    if (!config.wss) {
      console.error('❌ WebSocket URL not configured');
      return;
    }

    // Always create new socket if token/config changes
    if (socketInstance) {
      console.log('🔄 Disconnecting existing socket...');
      socketInstance.disconnect();
      socketInstance = null;
    }

    // Ensure we're connecting to the /aviator namespace
    const baseUrl = config.wss.replace(/\/$/, ''); // Remove trailing slash
    const socketUrl = `${baseUrl}/aviator`;
    console.log('🔌 Creating new Socket.IO connection:', socketUrl);
    console.log('🔑 Token:', token.substring(0, 30) + '...');
    console.log('👤 User ID:', userId || 'Not provided');

    socketInstance = io(socketUrl, {
      auth: {
        token: token,
      },
      query: {
        userId: userId || '',
        token: token, // Also pass in query for compatibility
      },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
      forceNew: true, // Force new connection
      timeout: 20000, // 20 second timeout
    });

    // Global socket reference for callCashOut
    (window as any).aviatorSocket = socketInstance;

    console.log('✅ Socket instance created:', socketInstance.id || 'Connecting...');

    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up socket...');
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        (window as any).aviatorSocket = null;
      }
    };
  }, [token, userId]);

  newState = state;
  const [unity, setUnity] = React.useState({
    unityState: false,
    unityLoading: false,
    currentProgress: 0,
  });
  const [gameState, setGameState] = React.useState({
    currentNum: 0,
    currentSecondNum: 0,
    GameState: "",
    time: 0,
  });

  const [bettedUsers, setBettedUsers] = React.useState<BettedUserType[]>([]);
  const update = (attrs: Partial<ContextDataType>) => {
    setState({ ...state, ...attrs });
  };
  const [previousHand, setPreviousHand] = React.useState<UserType[]>([]);
  const [history, setHistory] = React.useState<number[]>([]);
  const [userBetState, setUserBetState] = React.useState<UserStatusType>({
    fbetState: false,
    fbetted: false,
    sbetState: false,
    sbetted: false,
  });
  newBetState = userBetState;
  const [rechargeState, setRechargeState] = React.useState(false);
  const [currentTarget, setCurrentTarget] = React.useState(0);
  const updateUserBetState = (attrs: Partial<UserStatusType>) => {
    setUserBetState({ ...userBetState, ...attrs });
  };

  const [betLimit, setBetLimit] = React.useState<GameBetLimit>({
    maxBet: 1000,
    minBet: 1,
  });

  // Chat State
  const [msgData, setMsgData] = React.useState<any[]>([]);
  const [msgTab, setMsgTab] = React.useState(false);
  const [msgReceived, setMsgReceived] = React.useState(false);

  const toggleMsgTab = () => {
    setMsgTab(!msgTab);
  };
  React.useEffect(function () {
    unityContext.on("GameController", function (message) {
      if (message === "Ready") {
        setUnity({
          currentProgress: 100,
          unityLoading: true,
          unityState: true,
        });
      }
    });
    unityContext.on("progress", (progression) => {
      const currentProgress = progression * 100;
      if (progression === 1) {
        setUnity({ currentProgress, unityLoading: true, unityState: true });
      } else {
        setUnity({ currentProgress, unityLoading: false, unityState: false });
      }
    });
    return () => unityContext.removeAllEventListeners();
  }, []);

  React.useEffect(() => {
    if (!socketInstance) {
      console.warn('⚠️ Socket instance not initialized yet');
      return;
    }

    console.log('🔌 Setting up Socket.IO event listeners...');
    console.log('Socket instance:', socketInstance);
    console.log('Socket connected:', socketInstance.connected);

    // Remove existing listeners to avoid duplicates
    socketInstance.removeAllListeners();

    socketInstance.on("connect", () => {
      console.log('✅ Socket connected! Socket ID:', socketInstance.id);
      console.log('📤 Emitting enterRoom with token:', token ? 'Present' : 'Missing');
      socketInstance.emit("enterRoom", { token });
    });

    socketInstance.on("disconnect", (reason: string) => {
      console.log('❌ Socket disconnected. Reason:', reason);
    });

    socketInstance.on("connect_error", (error: any) => {
      console.error('❌ Socket connection error:', error);
      console.error('Error details:', error.message, error.type);
      toast.error('Failed to connect to game server: ' + (error.message || 'Unknown error'));
    });

    socketInstance.on("reconnect", (attemptNumber: number) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
    });

    socketInstance.on("reconnect_error", (error: any) => {
      console.error('❌ Socket reconnection error:', error);
    });

    // If already connected, emit enterRoom immediately
    if (socketInstance.connected) {
      console.log('📤 Socket already connected, emitting enterRoom...');
      socketInstance.emit("enterRoom", { token });
    }

    socketInstance.on("bettedUserInfo", (bettedUsers: BettedUserType[]) => {
      setBettedUsers(bettedUsers);
    });

    socketInstance.on("myBetState", (user: UserType) => {
      const attrs = userBetState;
      attrs.fbetState = false;
      attrs.fbetted = user.f.betted;
      attrs.sbetState = false;
      attrs.sbetted = user.s.betted;
      setUserBetState(attrs);
    });

    socketInstance.on("myInfo", (user: UserType) => {
      console.log('💰 Balance update:', user.balance);
      let attrs = state;
      attrs.userInfo.balance = user.balance;
      attrs.userInfo.userType = user.userType;
      attrs.userInfo.userName = user.userName;
      update(attrs);
    });

    socketInstance.on("history", (history: any) => {
      setHistory(history);
    });

    socketInstance.on("gameState", (gameState: GameStatusType) => {
      setGameState(gameState);
    });

    socketInstance.on("previousHand", (previousHand: UserType[]) => {
      setPreviousHand(previousHand);
    });

    socketInstance.on("finishGame", (user: UserType) => {
      let attrs = newState;
      let fauto = attrs.userInfo.f.auto;
      let sauto = attrs.userInfo.s.auto;
      let fbetAmount = attrs.userInfo.f.betAmount;
      let sbetAmount = attrs.userInfo.s.betAmount;
      let betStatus = newBetState;
      attrs.userInfo = user;
      attrs.userInfo.f.betAmount = fbetAmount;
      attrs.userInfo.s.betAmount = sbetAmount;
      attrs.userInfo.f.auto = fauto;
      attrs.userInfo.s.auto = sauto;
      if (!user.f.betted) {
        betStatus.fbetted = false;
        if (attrs.userInfo.f.auto) {
          if (user.f.cashouted) {
            fIncreaseAmount += user.f.cashAmount;
            if (attrs.finState && attrs.fincrease - fIncreaseAmount <= 0) {
              attrs.userInfo.f.auto = false;
              betStatus.fbetState = false;
              fIncreaseAmount = 0;
            } else if (
              attrs.fsingle &&
              attrs.fsingleAmount <= user.f.cashAmount
            ) {
              attrs.userInfo.f.auto = false;
              betStatus.fbetState = false;
            } else {
              attrs.userInfo.f.auto = true;
              betStatus.fbetState = true;
            }
          } else {
            fDecreaseAmount += user.f.betAmount;
            if (attrs.fdeState && attrs.fdecrease - fDecreaseAmount <= 0) {
              attrs.userInfo.f.auto = false;
              betStatus.fbetState = false;
              fDecreaseAmount = 0;
            } else {
              attrs.userInfo.f.auto = true;
              betStatus.fbetState = true;
            }
          }
        }
      }
      if (!user.s.betted) {
        betStatus.sbetted = false;
        if (user.s.auto) {
          if (user.s.cashouted) {
            sIncreaseAmount += user.s.cashAmount;
            if (attrs.sinState && attrs.sincrease - sIncreaseAmount <= 0) {
              attrs.userInfo.s.auto = false;
              betStatus.sbetState = false;
              sIncreaseAmount = 0;
            } else if (
              attrs.ssingle &&
              attrs.ssingleAmount <= user.s.cashAmount
            ) {
              attrs.userInfo.s.auto = false;
              betStatus.sbetState = false;
            } else {
              attrs.userInfo.s.auto = true;
              betStatus.sbetState = true;
            }
          } else {
            sDecreaseAmount += user.s.betAmount;
            if (attrs.sdeState && attrs.sdecrease - sDecreaseAmount <= 0) {
              attrs.userInfo.s.auto = false;
              betStatus.sbetState = false;
              sDecreaseAmount = 0;
            } else {
              attrs.userInfo.s.auto = true;
              betStatus.sbetState = true;
            }
          }
        }
      }
      update(attrs);
      setUserBetState(betStatus);
    });

    socketInstance.on("getBetLimits", (betAmounts: { max: number; min: number }) => {
      setBetLimit({ maxBet: betAmounts.max, minBet: betAmounts.min });
    });

    socketInstance.on("recharge", () => {
      setRechargeState(true);
    });

    socketInstance.on("error", (data: any) => {
      console.error('Socket error:', data);

      // Fix Bug #6: Safely handle missing index/type
      const betType = data.index || data.type;

      if (betType === 'f' || betType === 's') {
        setUserBetState(prev => ({
          ...prev,
          [`${betType}betted`]: false,
          [`${betType}betState`]: false
        }));
      } else {
        // If type is unknown, just reset both to be safe? 
        // No, better to leave them as is to avoid phantom resets.
        // Or we could try to determine based on logic, but for now just logging it.
        console.warn('Received error without valid type/index, cannot reset bet state automatically.');
      }

      toast.error(data.message || 'An error occurred');
    });

    socketInstance.on("success", (data: any) => {
      toast.success(data);
    });

    socketInstance.on("cashout:success", (data: any) => {
      toast.success(`Cashed out at ${data.multiplier}x! Win: ${data.payout.toFixed(2)}`);

      // Play cashout sound
      if (state.userInfo.isSoundEnable) {
        const cashoutAudio = document.getElementById("cashoutAudio") as HTMLAudioElement;
        if (cashoutAudio) {
          cashoutAudio.currentTime = 0;
          cashoutAudio.play().catch(e => console.log("Audio play failed", e));
        }
      }

      setUserBetState((prev) => {
        const newState = { ...prev };
        if (data.type === 'f') {
          newState.fbetted = false;
        } else if (data.type === 's') {
          newState.sbetted = false;
        }
        return newState;
      });
    });

    return () => {
      if (socketInstance) {
        socketInstance.off("connect");
        socketInstance.off("disconnect");
        socketInstance.off("myBetState");
        socketInstance.off("myInfo");
        socketInstance.off("history");
        socketInstance.off("gameState");
        socketInstance.off("previousHand");
        socketInstance.off("finishGame");
        socketInstance.off("getBetLimits");
        socketInstance.off("recharge");
        socketInstance.off("error");
        socketInstance.off("success");
        socketInstance.off("success");
        socketInstance.off("cashout:success");
        socketInstance.off("msg:new");
      }
    };
  }, [socketInstance, token]);

  // Listen for new messages separately to depend on msgData state if needed, 
  // or use functional state update
  React.useEffect(() => {
    if (!socketInstance) return;

    socketInstance.on('msg:new', (newMsg: any) => {
      console.log('📨 New message received:', newMsg);
      // Append new message to list
      setMsgData(currentMsgs => [newMsg, ...currentMsgs]);
      // Note: The UI maps keys by index, so order matters. 
      // Chat usually shows newest at bottom? 
      // The CSS/HTML structure suggests standard list. 
      // Check Chat/index.tsx map... it just maps.
      // Chat history API calls .sort({ createdAt: -1 }), so newest first? 
      // If UI shows newest at bottom, we should PREPEND or APPEND depending on flex-direction.
      // Assuming standard "newest at bottom" for chat apps, but "newest at top" for feeds.
      // API returns recent chats desc (newest first). 
      // If Chat UI renders top-to-bottom, then [new, ...old] puts new at top.
      // If Chat UI is `flex-direction: column-reverse`, then new at top is physically at bottom.
      // Let's assume [new, ...old] matches the API data order.
    });

    return () => {
      socketInstance.off('msg:new');
    };
  }, [socketInstance]);

  React.useEffect(() => {
    let attrs = state;
    let betStatus = userBetState;
    if (gameState.GameState === "BET") {
      if (betStatus.fbetState) {
        if (state.userInfo.f.auto) {
          if (state.fautoCound > 0) attrs.fautoCound -= 1;
          else {
            attrs.userInfo.f.auto = false;
            betStatus.fbetState = false;
            return;
          }
        }
        let data = {
          betAmount: state.userInfo.f.betAmount,
          target: state.userInfo.f.target,
          type: "f",
          auto: state.userInfo.f.auto,
        };
        if (attrs.userInfo.balance - state.userInfo.f.betAmount < 0) {
          toast.error("Your balance is not enough");
          betStatus.fbetState = false;
          betStatus.fbetted = false;
          return;
        }
        attrs.userInfo.balance -= state.userInfo.f.betAmount;
        if (socketInstance) {
          socketInstance.emit("bet:place", data);
        } else {
          toast.error("Not connected to game server");
        }
        betStatus.fbetState = false;
        betStatus.fbetted = true;
        // update(attrs);
        setUserBetState(betStatus);
      }
      if (betStatus.sbetState) {
        if (state.userInfo.s.auto) {
          if (state.sautoCound > 0) attrs.sautoCound -= 1;
          else {
            attrs.userInfo.s.auto = false;
            betStatus.sbetState = false;
            return;
          }
        }
        let data = {
          betAmount: state.userInfo.s.betAmount,
          target: state.userInfo.s.target,
          type: "s",
          auto: state.userInfo.s.auto,
        };
        if (attrs.userInfo.balance - state.userInfo.s.betAmount < 0) {
          toast.error("Your balance is not enough");
          betStatus.sbetState = false;
          betStatus.sbetted = false;
          return;
        }
        attrs.userInfo.balance -= state.userInfo.s.betAmount;
        if (socketInstance) {
          socketInstance.emit("bet:place", data);
        } else {
          toast.error("Not connected to game server");
        }
        betStatus.sbetState = false;
        betStatus.sbetted = true;
        // update(attrs);
        setUserBetState(betStatus);
      }
    }
  }, [gameState.GameState, userBetState.fbetState, userBetState.sbetState, state.userInfo.f.betAmount, state.userInfo.s.betAmount]);

  const getMyBets = async () => {
    try {
      const response = await fetch(`${config.api}/my-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: state.userInfo.userName }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          update({ myBets: data.data as GameHistory[] });
        }
      } else {
        console.error("Error:", response.statusText);
      }
    } catch (error) {
      console.log("getMyBets", error);
    }
  };

  useEffect(() => {
    if (gameState.GameState === "BET") getMyBets();
  }, [gameState.GameState]);

  const [audioAllowed, setAudioAllowed] = React.useState(false);

  // Sound Handler
  useEffect(() => {
    if (!state.userInfo.isSoundEnable || !audioAllowed) return;

    const takeOffAudio = document.getElementById("takeOffAudio") as HTMLAudioElement;
    const flewAwayAudio = document.getElementById("flewAwayAudio") as HTMLAudioElement;

    if (gameState.GameState === "PLAYING") {
      if (takeOffAudio) {
        takeOffAudio.currentTime = 0;
        takeOffAudio.play().catch(e => console.log("Audio play failed", e));
      }
    } else if (gameState.GameState === "GAMEEND") {
      if (takeOffAudio) {
        takeOffAudio.pause();
      }
      if (flewAwayAudio) {
        flewAwayAudio.currentTime = 0;
        flewAwayAudio.play().catch(e => console.log("Audio play failed", e));
      }
    }
  }, [gameState.GameState, state.userInfo.isSoundEnable, audioAllowed]);

  const unlockAudio = () => {
    if (audioAllowed) return;

    const mainAudio = document.getElementById("mainAudio") as HTMLAudioElement;
    if (mainAudio) {
      mainAudio.volume = 0.5;
      mainAudio.play().then(() => {
        console.log("Audio Context Unlocked");
        setAudioAllowed(true);
        toast.success("Audio Enabled!");
      }).catch(e => {
        console.error("Audio unlock failed:", e);
        // Even if it fails (e.g. race condition), we mark as allowed to stop blocking
        // But usually failure here means no interaction, so we might want to keep it false.
        // For now, let's assume click = intent.
        setAudioAllowed(true);
      });
    } else {
      setAudioAllowed(true);
    }
  };

  return (
    <Context.Provider
      value={{
        state: state,
        ...betLimit,
        ...userBetState,
        ...unity,
        ...gameState,
        currentTarget,
        rechargeState,
        myUnityContext: unityContext,
        bettedUsers: [...bettedUsers],
        previousHand: [...previousHand],
        history: [...history],
        userInfo: state.userInfo,
        socket: socketInstance,
        msgTab,
        msgReceived,
        setMsgReceived,
        msgData,
        setMsgData,
        toggleMsgTab,
        handleChangeUserSeed: () => { },
        updateUserInfo: () => { },
        handleGetSeed: () => { },
        seed: state.seed,
        handleGetSeedOfRound: async () => { },
        setCurrentTarget,
        update,
        getMyBets,
        updateUserBetState,
      }}
    >
      {children}

      {!audioAllowed && (
        <div
          onClick={unlockAudio}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 10000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div style={{
            backgroundColor: '#1b1b1b',
            padding: '20px 40px',
            borderRadius: '10px',
            border: '2px solid #e91e63',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold',
            boxShadow: '0 0 20px rgba(233, 30, 99, 0.5)',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '10px', fontSize: '30px' }}>🔊</div>
            CLICK ANYWHERE TO START GAME
          </div>
        </div>
      )}

      <audio id="mainAudio" loop preload="auto" onError={(e) => { console.error("Audio Error main:", e); toast.error("Main Audio Load Error"); }}>
        <source src="/sound/main.mp3" />
      </audio>
      <audio id="takeOffAudio" onError={(e) => console.error("Audio Error takeOff:", e)}>
        <source src="/sound/take_off.mp3" type="audio/mpeg" />
      </audio>
      <audio id="flewAwayAudio" onError={(e) => console.error("Audio Error flewAway:", e)}>
        <source src="/sound/take_off.mp3" type="audio/mpeg" />
      </audio>
      <audio id="cashoutAudio" onError={(e) => console.error("Audio Error cashout:", e)}>
        <source src="/sound/cashout.mp3" type="audio/mpeg" />
      </audio>
    </Context.Provider>
  );
};

export default Context;

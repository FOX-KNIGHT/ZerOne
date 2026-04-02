import { io } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socket = io(SOCKET_URL, {
  autoConnect: false, // Connect manually when authenticated or viewing projector
});

export const setupSocketListeners = () => {
  const store = useAppStore.getState();

  socket.on('connect', () => {
    store.setSocketConnected(true);
    console.log('Connected to real-time server');
  });

  socket.on('disconnect', () => {
    store.setSocketConnected(false);
  });

  // Server broadcasts these when admin starts/ends rounds
  socket.on('startRound', (round) => {
    store.setActiveRound(round);
  });

  socket.on('endRound', () => {
    store.setActiveRound(null);
    store.updateTimer(null);
  });

  // Legacy events
  socket.on('roundActivated', (round) => {
    store.setActiveRound(round);
  });

  // Real-time score/leaderboard
  socket.on('scoreUpdate', () => {
    // Leaderboard page will re-fetch on this event
  });

  socket.on('liveLeaderboardUpdate', () => {
    // Leaderboard page re-fetches
  });

  socket.on('leaderboard:update', () => {
    // Round 2/3 score updated — pages re-fetch
  });

  socket.on('timerTick', ({ remainingTime, roundNumber }) => {
    store.updateTimer(remainingTime);
    // Keep activeRound in sync with the round number from the tick
    const current = store.activeRound
    if (!current || current.roundNumber !== roundNumber) {
      store.setActiveRound({ roundNumber })
    }
  });

  socket.on('recentSolve', (activity) => {
    store.addRecentActivity({
      team: activity.teamName,
      challenge: activity.challengeTitle,
      time: new Date(activity.timestamp).toLocaleTimeString(),
    });
  });

  socket.on('forceLogout', ({ reason }) => {
    console.error('FORCE LOGOUT:', reason);
    store.setGlobalDisqualified(true, reason);
  });
};

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

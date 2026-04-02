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

  socket.on('scoreUpdate', (data) => {
    store.updateScores(data);
  });

  socket.on('roundActivated', (round) => {
    store.setActiveRound(round);
  });

  socket.on('timerTick', (timeLeft) => {
    store.updateTimer(timeLeft);
  });

  socket.on('recentSolve', (activity) => {
    store.addRecentActivity(activity);
  });

  socket.on('forceLogout', ({ reason }) => {
    console.error('FORCE LOGOUT:', reason);
    store.setGlobalDisqualified(true, reason);
    // AntiCheatWrapper will handle the countdown and navigation
  });
};

export const connectSocket = (token) => {
  socket.auth = { token };
  socket.connect();
};

export const disconnectSocket = () => {
  socket.disconnect();
};

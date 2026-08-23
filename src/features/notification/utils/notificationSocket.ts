import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getNotificationSocket = (token?: string | null): Socket | null => {
  const authToken = token || localStorage.getItem('accessToken');
  if (!authToken) {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    return null;
  }

  if (socket && socket.connected) {
    return socket;
  }

  try {
    const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const origin = rawApiUrl.startsWith('http')
      ? new URL(rawApiUrl).origin
      : window.location.origin;

    if (!socket) {
      socket = io(`${origin}/notifications`, {
        auth: { token: authToken },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
      });
    } else if (!socket.connected) {
      socket.connect();
    }

    return socket;
  } catch {
    return null;
  }
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

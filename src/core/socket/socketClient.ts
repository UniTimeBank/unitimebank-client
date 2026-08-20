import { io, Socket } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SOCKET_URL = API_URL.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('access_token');
    socket = io(SOCKET_URL, {
      auth: {
        token: token ? `Bearer ${token}` : '',
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });


    socket.on('connect', () => {
      console.log('[Socket] Connected to API Gateway with id:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      console.warn('[Socket] Connection error:', error.message);
    });
  }
  return socket;
};

export const updateSocketAuth = (token: string | null) => {
  if (socket) {
    socket.auth = {
      token: token ? `Bearer ${token}` : '',
    };
    if (socket.connected) {
      socket.disconnect().connect();
    }
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

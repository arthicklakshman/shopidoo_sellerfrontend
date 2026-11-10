import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const socket = io(SOCKET_URL, {
  autoConnect: Boolean(localStorage.getItem('sellerAccessToken')),
  withCredentials: true,
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  auth: (cb) => {
    cb({ token: localStorage.getItem('sellerAccessToken') });
  },
});

socket.on('connect', () => {
  console.log('SELLER SOCKET CONNECTED:', socket.id);
});

socket.on('connect_error', (err) => {
  console.warn('Seller socket connect error:', err.message);
});

export const connectSellerSocket = () => {
  const token = localStorage.getItem('sellerAccessToken');
  if (token) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }
};

export const disconnectSellerSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

socket.connectSellerSocket = connectSellerSocket;
socket.disconnectSellerSocket = disconnectSellerSocket;

export default socket;

import { io } from 'socket.io-client';

const socket = io(
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
  {
    transports: ['websocket'],
    withCredentials: true,
  }
);

socket.on('connect', () => {
  console.log('SELLER SOCKET CONNECTED:', socket.id);
});

export default socket;
import { io } from 'socket.io-client';

const socket = io('https://codesync-production-cf26.up.railway.app', {
  autoConnect: false
});

export default socket;
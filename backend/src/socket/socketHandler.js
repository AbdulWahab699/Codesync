const Room = require('../models/Room');

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room
    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;

      // Notify everyone in room
      io.to(roomId).emit('user-joined', {
        username,
        socketId: socket.id
      });

      // Send current online users to the newly joined user
      const clients = await io.in(roomId).fetchSockets();
      const onlineUsers = clients.map(client => ({
        socketId: client.id,
        username: client.username
      }));

      socket.emit('online-users', onlineUsers);

      console.log(`${username} joined room ${roomId}`);
    });

    

    // Disconnect
    socket.on('disconnect', () => {
      if (socket.roomId) {
        io.to(socket.roomId).emit('user-left', {
          username: socket.username,
          socketId: socket.id
        });
      }
      console.log('User disconnected:', socket.id);
    });
  });
};

module.exports = socketHandler;
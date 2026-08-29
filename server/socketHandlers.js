const roomManager = require('./roomManager');

const USER_COLORS = [
  '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#9b59b6', '#e74c3c', '#1abc9c', '#f39c12',
  '#3498db', '#e91e63', '#00d2ff', '#ff9ff3'
];

function pickColor() {
  return USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
}

function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    socket.on('join-room', ({ roomId, displayName }) => {
      currentRoom = roomId;
      currentUser = {
        displayName,
        color: pickColor()
      };

      socket.join(roomId);
      roomManager.addUser(roomId, socket.id, currentUser);

      const room = roomManager.getRoom(roomId);

      socket.emit('room-state', {
        strokes: room ? room.strokes : [],
        textNotes: room ? room.textNotes : [],
        users: roomManager.getUsersInRoom(roomId)
      });

      socket.to(roomId).emit('user-joined', {
        id: socket.id,
        ...currentUser
      });

      io.to(roomId).emit('users-update', roomManager.getUsersInRoom(roomId));
    });

    socket.on('draw-stroke', (stroke) => {
      if (!currentRoom) return;
      roomManager.addStroke(currentRoom, stroke);
      socket.to(currentRoom).emit('draw-stroke', stroke);
    });

    socket.on('undo', () => {
      if (!currentRoom) return;
      roomManager.undoLastStroke(currentRoom, socket.id);
      const room = roomManager.getRoom(currentRoom);
      if (room) {
        io.to(currentRoom).emit('strokes-update', room.strokes);
      }
    });

    socket.on('clear-canvas', () => {
      if (!currentRoom) return;
      roomManager.clearStrokes(currentRoom);
      io.to(currentRoom).emit('canvas-cleared');
    });

    socket.on('cursor-move', (position) => {
      if (!currentRoom) return;
      socket.to(currentRoom).emit('cursor-move', {
        id: socket.id,
        ...position
      });
    });

    socket.on('webrtc-signal', ({ to, signal }) => {
      io.to(to).emit('webrtc-signal', {
        from: socket.id,
        signal
      });
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        roomManager.removeUser(currentRoom, socket.id);
        socket.to(currentRoom).emit('user-left', { id: socket.id });
        io.to(currentRoom).emit('users-update', roomManager.getUsersInRoom(currentRoom));
      }
    });
  });
}

module.exports = { setupSocketHandlers };

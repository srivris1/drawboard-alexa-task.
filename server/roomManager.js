

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(roomId) {
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: new Map(),
        strokes: [],
        textNotes: []
      });
    }
    return this.rooms.get(roomId);
  }

  addUser(roomId, socketId, userData) {
    const room = this.createRoom(roomId);
    room.users.set(socketId, userData);
    return room;
  }

  removeUser(roomId, socketId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.users.delete(socketId);

    if (room.users.size === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  addStroke(roomId, stroke) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.strokes.push(stroke);
    }
  }

  undoLastStroke(roomId, userId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (let i = room.strokes.length - 1; i >= 0; i--) {
      if (room.strokes[i].userId === userId) {
        room.strokes.splice(i, 1);
        return;
      }
    }
  }

  clearStrokes(roomId) {
    const room = this.rooms.get(roomId);
    if (room) {
      room.strokes = [];
      room.textNotes = [];
    }
  }

  getUsersInRoom(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return [];

    return Array.from(room.users.entries()).map(([id, data]) => ({
      id,
      ...data
    }));
  }
}

module.exports = new RoomManager();

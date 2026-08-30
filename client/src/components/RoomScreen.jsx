import { useState } from 'react';

function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default function RoomScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const handleCreate = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onJoin(name.trim(), generateRoomId());
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!name.trim() || !roomCode.trim()) return;
    onJoin(name.trim(), roomCode.trim().toUpperCase());
  };

  return (
    <div className="room-screen">
      <div className="room-card glass-elevated" id="room-card">
        <div className="logo">DrawBoard</div>
        <p className="subtitle">Draw together, talk together</p>

        <form onSubmit={handleCreate}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              autoFocus
              id="name-input"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!name.trim()}
            id="create-room-btn"
          >
            Create New Room
          </button>
        </form>

        <div className="divider">or join an existing room</div>

        <form onSubmit={handleJoin}>
          <div className="input-group">
            <input
              type="text"
              placeholder="Room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              id="room-code-input"
            />
          </div>

          <button
            type="submit"
            className="btn-secondary"
            disabled={!name.trim() || !roomCode.trim()}
            id="join-room-btn"
          >
            Join Room
          </button>
        </form>
      </div>
    </div>
  );
}

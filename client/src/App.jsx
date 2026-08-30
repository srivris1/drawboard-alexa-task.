import { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import RoomScreen from './components/RoomScreen';
import Canvas from './components/Canvas';
import Toolbar from './components/Toolbar';
import UserCursors from './components/UserCursors';
import VoiceChat from './components/VoiceChat';
import VoiceCommands from './components/VoiceCommands';
import { useWebRTC } from './hooks/useWebRTC';
import { useSpeech } from './hooks/useSpeech';
import { exportAsPNG, exportAsPDF } from './utils/exportUtils';
import './App.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

export default function App() {
  
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const [screen, setScreen] = useState('room');
  const [roomId, setRoomId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [users, setUsers] = useState([]);

  const [strokes, setStrokes] = useState([]);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#ffffff');
  const [brushSize, setBrushSize] = useState(8);
  const [cursors, setCursors] = useState({});

  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const newSocket = io(SERVER_URL, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => setConnected(true));
    newSocket.on('disconnect', () => setConnected(false));

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onRoomState = ({ strokes: s, users: u }) => {
      setStrokes(s);
      setUsers(u);
    };

    const onUsersUpdate = (u) => setUsers(u);

    const onUserJoined = (user) => {
      showToast(`${user.displayName} joined`, 'info');
    };

    const onUserLeft = ({ id }) => {
      setCursors(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    };

    const onDrawStroke = (stroke) => {
      setStrokes(prev => [...prev, stroke]);
    };

    const onStrokesUpdate = (s) => setStrokes(s);

    const onCanvasCleared = () => {
      setStrokes([]);
      showToast('Canvas cleared', 'info');
    };

    const onCursorMove = ({ id, x, y }) => {
      setCursors(prev => ({ ...prev, [id]: { x, y } }));
    };

    socket.on('room-state', onRoomState);
    socket.on('users-update', onUsersUpdate);
    socket.on('user-joined', onUserJoined);
    socket.on('user-left', onUserLeft);
    socket.on('draw-stroke', onDrawStroke);
    socket.on('strokes-update', onStrokesUpdate);
    socket.on('canvas-cleared', onCanvasCleared);
    socket.on('cursor-move', onCursorMove);

    return () => {
      socket.off('room-state', onRoomState);
      socket.off('users-update', onUsersUpdate);
      socket.off('user-joined', onUserJoined);
      socket.off('user-left', onUserLeft);
      socket.off('draw-stroke', onDrawStroke);
      socket.off('strokes-update', onStrokesUpdate);
      socket.off('canvas-cleared', onCanvasCleared);
      socket.off('cursor-move', onCursorMove);
    };
  }, [socket]);

  const showToast = useCallback((message, type = 'info') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setToast(null), 400);
    }, 2500);
  }, []);

  const { isMuted, voiceActive, toggleMute, cleanup: cleanupVoice } = useWebRTC(socket);

  const handleToggleMute = useCallback(() => {
    toggleMute(users);
  }, [toggleMute, users]);

  const handleVoiceCommand = useCallback((cmd) => {
    switch (cmd.type) {
      case 'color':
        setColor(cmd.value);
        setTool('pen');
        showToast(`Color → ${cmd.label}`, 'success');
        break;
      case 'size':
        setBrushSize(cmd.value);
        showToast(`Size → ${cmd.label}`, 'success');
        break;
      case 'tool':
        setTool(cmd.value);
        showToast(`Tool → ${cmd.value}`, 'success');
        break;
      case 'action':
        if (cmd.value === 'clear') handleClear();
        else if (cmd.value === 'undo') handleUndo();
        break;
      default:
        break;
    }
  }, []);

  const { isListening, transcript, toggleListening, isSupported } = useSpeech(handleVoiceCommand);

  const handleJoinRoom = useCallback((name, room) => {
    if (!socket) return;
    setDisplayName(name);
    setRoomId(room);
    socket.emit('join-room', { roomId: room, displayName: name });
    setScreen('canvas');
  }, [socket]);

  const handleLeaveRoom = useCallback(() => {
    cleanupVoice();
    if (isListening) toggleListening();
    setScreen('room');
    setStrokes([]);
    setUsers([]);
    setCursors({});
    setRoomId('');
  }, [cleanupVoice, isListening, toggleListening]);

  const handleStrokeComplete = useCallback((stroke) => {
    const full = { ...stroke, userId: socket?.id };
    setStrokes(prev => [...prev, full]);
    socket?.emit('draw-stroke', full);
  }, [socket]);

  const handleCursorMove = useCallback((pos) => {
    socket?.emit('cursor-move', pos);
  }, [socket]);

  const handleUndo = useCallback(() => {
    setStrokes(prev => {
      
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].userId === socket?.id || !prev[i].userId) {
          const next = [...prev];
          next.splice(i, 1);
          return next;
        }
      }
      return prev;
    });
    socket?.emit('undo');
  }, [socket]);

  const handleClear = useCallback(() => {
    setStrokes([]);
    socket?.emit('clear-canvas');
  }, [socket]);

  const handleExport = useCallback((format) => {
    const canvas = document.getElementById('base-canvas');
    if (!canvas) return;

    if (format === 'png') exportAsPNG(canvas);
    else if (format === 'pdf') exportAsPDF(canvas);

    showToast(`Exported as ${format.toUpperCase()}`, 'success');
  }, [showToast]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (screen !== 'canvas') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'p': setTool('pen'); break;
        case 'e': setTool('eraser'); break;
        default: break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [screen, handleUndo]);

  if (screen === 'room') {
    return <RoomScreen onJoin={handleJoinRoom} />;
  }

  return (
    <div className="workspace" id="workspace">
      <Canvas
        strokes={strokes}
        tool={tool}
        color={color}
        brushSize={brushSize}
        onStrokeComplete={handleStrokeComplete}
        onCursorMove={handleCursorMove}
      />

      <UserCursors cursors={cursors} users={users} />

      <Toolbar
        tool={tool} setTool={setTool}
        color={color} setColor={setColor}
        brushSize={brushSize} setBrushSize={setBrushSize}
        onUndo={handleUndo}
        onClear={handleClear}
        onExport={handleExport}
      />

      <div className="side-panel">
        <VoiceChat
          users={users}
          isMuted={isMuted}
          voiceActive={voiceActive}
          onToggleMute={handleToggleMute}
          myId={socket?.id}
        />
        <VoiceCommands
          isListening={isListening}
          transcript={transcript}
          onToggle={toggleListening}
          supported={isSupported}
        />
      </div>

      <div className="room-info glass" id="room-info">
        <span
          className="room-code"
          onClick={() => {
            navigator.clipboard.writeText(roomId);
            showToast('Room code copied!', 'success');
          }}
          title="Click to copy room code"
        >
          {roomId}
        </span>
        <span className="user-count">
          <span className="online-dot" />
          {users.length} online
        </span>
        <button className="leave-btn" onClick={handleLeaveRoom} id="leave-btn">
          Leave
        </button>
      </div>

      {toast && (
        <div className={`toast ${toast.type} ${toast.visible ? 'visible' : ''}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default function VoiceChat({ users, isMuted, voiceActive, onToggleMute, myId }) {
  const others = users.filter(u => u.id !== myId);

  return (
    <div className="panel-card glass-elevated voice-chat" id="voice-panel">
      <h3>Voice Chat</h3>

      <div className="peer-list">
        {others.length === 0 && (
          <p className="empty-msg">Waiting for others to join...</p>
        )}
        {others.map(user => (
          <div key={user.id} className="peer-item">
            <span className="peer-dot" style={{ backgroundColor: user.color }} />
            <span>{user.displayName}</span>
          </div>
        ))}
      </div>

      <button
        className={`mic-btn ${isMuted || !voiceActive ? 'off' : 'on'}`}
        onClick={onToggleMute}
        id="mic-btn"
      >
        {!voiceActive ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Join Voice
          </>
        ) : isMuted ? (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="23" y2="23"/>
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.49-.34 2.17"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Unmute
          </>
        ) : (
          <>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            Mute
          </>
        )}
      </button>
    </div>
  );
}

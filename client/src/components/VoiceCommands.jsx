export default function VoiceCommands({ isListening, transcript, onToggle, supported }) {
  if (!supported) return null;

  return (
    <div className="panel-card glass-elevated voice-commands" id="voice-commands-panel">
      <h3>Voice Commands</h3>

      <button
        className={`cmd-btn ${isListening ? 'listening' : ''}`}
        onClick={onToggle}
        id="voice-cmd-btn"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
        {isListening ? 'Listening...' : 'Start Voice Control'}
      </button>

      {transcript && (
        <p className="transcript">&ldquo;{transcript}&rdquo;</p>
      )}

      <p className="hint">
        Try: &ldquo;color red&rdquo;, &ldquo;size large&rdquo;, &ldquo;eraser&rdquo;, &ldquo;undo&rdquo;, &ldquo;clear&rdquo;
      </p>
    </div>
  );
}

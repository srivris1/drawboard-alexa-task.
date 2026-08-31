import { useState, useRef, useEffect } from 'react';

const PALETTE = [
  '#ffffff', '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
  '#9b59b6', '#e91e63', '#f39c12', '#00d2ff', '#1a1a2e'
];

export default function Toolbar({
  tool, setTool,
  color, setColor,
  brushSize, setBrushSize,
  onUndo, onClear,
  onExport
}) {
  const [showColors, setShowColors] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const colorRef = useRef(null);
  const exportRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (colorRef.current && !colorRef.current.contains(e.target)) {
        setShowColors(false);
      }
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExport(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="toolbar glass-elevated" id="toolbar">
      
      <button
        className={`tool-btn ${tool === 'pen' ? 'active' : ''}`}
        onClick={() => setTool('pen')}
        title="Pen (P)"
        id="pen-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
        </svg>
      </button>

      <button
        className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
        onClick={() => setTool('eraser')}
        title="Eraser (E)"
        id="eraser-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/>
          <path d="M22 21H7"/>
          <path d="m5 11 9 9"/>
        </svg>
      </button>

      <div className="separator" />

      <div className="color-trigger" ref={colorRef}>
        <div
          className="color-dot"
          style={{ backgroundColor: color }}
          onClick={() => setShowColors(!showColors)}
          title="Pick color"
          id="color-btn"
        />
        {showColors && (
          <div className="color-popover glass-elevated" id="color-palette">
            {PALETTE.map(c => (
              <div
                key={c}
                className={`swatch ${color === c ? 'picked' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => { setColor(c); setShowColors(false); }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="separator" />

      <div className="size-control">
        <span className="size-label">{brushSize}</span>
        <input
          type="range"
          className="size-slider"
          min="2"
          max="32"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          title="Brush size"
          id="size-slider"
        />
      </div>

      <div className="separator" />

      <button
        className="tool-btn"
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
        id="undo-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v6h6"/>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
        </svg>
      </button>

      <button
        className="tool-btn"
        onClick={onClear}
        title="Clear canvas"
        id="clear-btn"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18"/>
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        </svg>
      </button>

      <div className="separator" />

      <div className="export-wrapper" ref={exportRef}>
        <button
          className="tool-btn"
          onClick={() => setShowExport(!showExport)}
          title="Export canvas"
          id="export-btn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
        {showExport && (
          <div className="export-dropdown glass-elevated" id="export-menu">
            <button onClick={() => { onExport('png'); setShowExport(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="m21 15-5-5L5 21"/>
              </svg>
              Save as PNG
            </button>
            <button onClick={() => { onExport('pdf'); setShowExport(false); }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <path d="M14 2v6h6"/>
              </svg>
              Save as PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

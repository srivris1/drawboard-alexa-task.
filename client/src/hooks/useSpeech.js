import { useState, useRef, useCallback, useEffect } from 'react';

const COLOR_MAP = {
  red: '#ff6b6b',
  blue: '#4d96ff',
  green: '#6bcb77',
  yellow: '#ffd93d',
  purple: '#9b59b6',
  orange: '#f39c12',
  pink: '#e91e63',
  white: '#ffffff',
  black: '#1a1a2e',
  cyan: '#00d2ff'
};

const SIZE_MAP = {
  small: 4,
  thin: 4,
  medium: 8,
  normal: 8,
  large: 16,
  big: 16,
  huge: 28,
  thick: 28
};

export function useSpeech(onCommand) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const onCommandRef = useRef(onCommand);

  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  const parseCommand = useCallback((text) => {
    const words = text.toLowerCase().trim();

    for (const [name, hex] of Object.entries(COLOR_MAP)) {
      if (words.includes(name)) {
        onCommandRef.current?.({ type: 'color', value: hex, label: name });
        return;
      }
    }

    for (const [name, value] of Object.entries(SIZE_MAP)) {
      if (words.includes(name)) {
        onCommandRef.current?.({ type: 'size', value, label: name });
        return;
      }
    }

    if (words.includes('eraser') || words.includes('erase')) {
      onCommandRef.current?.({ type: 'tool', value: 'eraser' });
      return;
    }
    if (words.includes('pen') || words.includes('draw') || words.includes('pencil') || words.includes('brush')) {
      onCommandRef.current?.({ type: 'tool', value: 'pen' });
      return;
    }

    if (words.includes('clear') || words.includes('clean') || words.includes('reset') || words.includes('wipe')) {
      onCommandRef.current?.({ type: 'action', value: 'clear' });
      return;
    }
    if (words.includes('undo') || words.includes('go back') || words.includes('oops')) {
      onCommandRef.current?.({ type: 'action', value: 'undo' });
      return;
    }
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      setTranscript(interimText || finalText);

      if (finalText) {
        parseCommand(finalText);
      }
    };

    recognition.onerror = (event) => {
      
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.warn('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try { recognition.stop(); } catch (e) {}
      recognitionRef.current = null;
    };
  }, [parseCommand]);

  const toggleListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListeningRef.current) {
      recognition.stop();
      setIsListening(false);
      setTranscript('');
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start speech recognition:', err);
      }
    }
  }, []);

  const isSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  return { isListening, transcript, toggleListening, isSupported };
}

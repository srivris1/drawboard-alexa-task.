import { useRef, useState, useCallback, useEffect } from 'react';

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function useWebRTC(socket) {
  const [isMuted, setIsMuted] = useState(true);
  const [voiceActive, setVoiceActive] = useState(false);
  const localStreamRef = useRef(null);
  const connectionsRef = useRef(new Map());
  const audioElementsRef = useRef(new Map());

  const createConnection = useCallback(async (peerId, initiator) => {
    if (!localStreamRef.current || !socket) return null;
    if (connectionsRef.current.has(peerId)) return connectionsRef.current.get(peerId);

    const pc = new RTCPeerConnection(RTC_CONFIG);
    connectionsRef.current.set(peerId, pc);

    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current);
    });

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (!audioElementsRef.current.has(peerId)) {
        const audio = new Audio();
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audioElementsRef.current.set(peerId, audio);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-signal', {
          to: peerId,
          signal: { type: 'candidate', candidate: event.candidate }
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        closeConnection(peerId);
      }
    };

    if (initiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-signal', {
          to: peerId,
          signal: { type: 'offer', sdp: pc.localDescription }
        });
      } catch (err) {
        console.error('Failed to create offer:', err);
      }
    }

    return pc;
  }, [socket]);

  const closeConnection = useCallback((peerId) => {
    const pc = connectionsRef.current.get(peerId);
    if (pc) {
      pc.close();
      connectionsRef.current.delete(peerId);
    }
    const audio = audioElementsRef.current.get(peerId);
    if (audio) {
      audio.srcObject = null;
      audioElementsRef.current.delete(peerId);
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleSignal = async ({ from, signal }) => {
      try {
        if (signal.type === 'offer') {
          if (!localStreamRef.current) return;
          const pc = await createConnection(from, false);
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-signal', {
            to: from,
            signal: { type: 'answer', sdp: pc.localDescription }
          });
        } else if (signal.type === 'answer') {
          const pc = connectionsRef.current.get(from);
          if (pc && pc.signalingState !== 'stable') {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          }
        } else if (signal.type === 'candidate') {
          const pc = connectionsRef.current.get(from);
          if (pc && pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.error('WebRTC signal handling error:', err);
      }
    };

    const handleUserLeft = ({ id }) => {
      closeConnection(id);
    };

    socket.on('webrtc-signal', handleSignal);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('webrtc-signal', handleSignal);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, createConnection, closeConnection]);

  const toggleMute = useCallback(async (allUsers) => {
    if (!voiceActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setVoiceActive(true);
        setIsMuted(false);

        if (allUsers && socket) {
          for (const user of allUsers) {
            if (user.id !== socket.id) {
              await createConnection(user.id, true);
            }
          }
        }
      } catch (err) {
        console.error('Mic permission denied:', err);
      }
    } else {
      
      const track = localStreamRef.current?.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  }, [voiceActive, socket, createConnection]);

  const cleanup = useCallback(() => {
    connectionsRef.current.forEach((_, id) => closeConnection(id));
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setVoiceActive(false);
    setIsMuted(true);
  }, [closeConnection]);

  return { isMuted, voiceActive, toggleMute, cleanup };
}

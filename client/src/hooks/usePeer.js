import { useState, useRef, useCallback } from 'react';
import Peer from 'peerjs';

export const usePeer = (roomId, userId) => {
  const [peerId, setPeerId] = useState(null);
  const [isPeerReady, setIsPeerReady] = useState(false);
  const peerRef = useRef(null);

  const initializePeer = useCallback(() => {
    if (!userId || peerRef.current) return;

    const peer = new Peer(`${userId}-${roomId}`, {
      host: 'videoconf-api.onrender.com',
      port: 443,
      path: '/peerjs',
      secure: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ]
      }
    });

    peer.on('open', (id) => {
      console.log('PeerJS connected with ID:', id);
      setPeerId(id);
      setIsPeerReady(true);
    });

    peer.on('call', (call) => {
      console.log('PeerJS incoming call from:', call.peer);
    });

    peer.on('error', (error) => {
      console.error('PeerJS error:', error.type, error.message);
    });

    peer.on('disconnected', () => {
      console.log('PeerJS disconnected');
    });

    peerRef.current = peer;
  }, [roomId, userId]);

  const callPeer = useCallback((remotePeerId, stream) => {
    if (!peerRef.current || !stream) return null;
    console.log('Calling peer:', remotePeerId);
    return peerRef.current.call(remotePeerId, stream);
  }, []);

  const destroyPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
      setIsPeerReady(false);
      setPeerId(null);
    }
  }, []);

  return {
    peerId,
    peer: peerRef.current,
    isPeerReady,
    initializePeer,
    callPeer,
    destroyPeer
  };
};

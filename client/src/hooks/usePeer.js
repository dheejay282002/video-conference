import { useState, useRef, useCallback } from 'react';
import Peer from 'peerjs';

const PEER_SERVER_URL = import.meta.env.VITE_PEER_SERVER_URL || 'https://videoconf-api.onrender.com/peerjs';

export const usePeer = (roomId, userId) => {
  const [peerId, setPeerId] = useState(null);
  const [isPeerReady, setIsPeerReady] = useState(false);
  const peerRef = useRef(null);

  const initializePeer = useCallback(() => {
    if (!userId) return;

    const peer = new Peer(`${userId}-${roomId}`, {
      host: 'videoconf-api.onrender.com',
      port: 443,
      path: '/peerjs',
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
      console.log('Peer connected with ID:', id);
      setPeerId(id);
      setIsPeerReady(true);
    });

    peer.on('error', (error) => {
      console.error('Peer error:', error);
    });

    peerRef.current = peer;

    return peer;
  }, [roomId, userId]);

  const callPeer = useCallback((remotePeerId, stream) => {
    if (!peerRef.current || !stream) return null;
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

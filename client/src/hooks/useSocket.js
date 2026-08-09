import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://videoconf-api.onrender.com';

export const useSocket = (roomId, userId, userName, userAvatar) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socket.emit('join-room', roomId, userId, userName, userAvatar);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    socket.on('room-users', (users) => {
      setRemoteUsers(users.filter(u => u.userId !== userId));
    });

    socket.on('user-connected', (newUserId, newUserName, newUserAvatar) => {
      console.log('User connected:', newUserName);
      setRemoteUsers(prev => {
        if (prev.some(u => u.userId === newUserId)) return prev;
        return [...prev, { userId: newUserId, userName: newUserName, userAvatar: newUserAvatar, isMuted: false, isVideoOff: false }];
      });
    });

    socket.on('user-disconnected', (disconnectedUserId) => {
      console.log('User disconnected:', disconnectedUserId);
      setRemoteUsers(prev => prev.filter(u => u.userId !== disconnectedUserId));
    });

    socket.on('user-toggle-mute', (targetUserId, isMuted) => {
      setRemoteUsers(prev => prev.map(u => 
        u.userId === targetUserId ? { ...u, isMuted } : u
      ));
    });

    socket.on('user-toggle-video', (targetUserId, isVideoOff) => {
      setRemoteUsers(prev => prev.map(u => 
        u.userId === targetUserId ? { ...u, isVideoOff } : u
      ));
    });

    socket.on('chat-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('meeting-ended', () => {
      window.location.href = '/dashboard';
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, userName, userAvatar]);

  const sendMessage = useCallback((message) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('chat-message', roomId, message);
      setMessages(prev => [...prev, message]);
    }
  }, [roomId]);

  const toggleMute = useCallback((isMuted) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('toggle-mute', roomId, userId, isMuted);
    }
  }, [roomId, userId]);

  const toggleVideo = useCallback((isVideoOff) => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('toggle-video', roomId, userId, isVideoOff);
    }
  }, [roomId, userId]);

  const screenShareStarted = useCallback(() => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('screen-share-started', roomId, userId);
    }
  }, [roomId, userId]);

  const screenShareStopped = useCallback(() => {
    if (socketRef.current && roomId && userId) {
      socketRef.current.emit('screen-share-stopped', roomId, userId);
    }
  }, [roomId, userId]);

  const endMeeting = useCallback(() => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('end-meeting', roomId);
    }
  }, [roomId]);

  return {
    isConnected,
    remoteUsers,
    messages,
    sendMessage,
    toggleMute,
    toggleVideo,
    screenShareStarted,
    screenShareStopped,
    endMeeting,
    socket: socketRef.current
  };
};

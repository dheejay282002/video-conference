import { useState, useRef, useCallback, useEffect } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://videoconf-api.onrender.com';

export const useSocket = (roomId, userId, userName, userAvatar) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [lobbyState, setLobbyState] = useState('none');
  const [isKicked, setIsKicked] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [lobbyRequests, setLobbyRequests] = useState([]);
  const socketRef = useRef(null);

  const addToast = useCallback((message, type = 'info', duration = 5000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

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

    socket.on('waiting-in-lobby', () => {
      setLobbyState('waiting');
    });

    socket.on('you-are-host', () => {
      setLobbyState('host');
    });

    socket.on('lobby-join-request', (joinerUserId, joinerName, joinerAvatar, joinerSocketId) => {
      console.log('Lobby request from:', joinerName);
      setLobbyRequests(prev => [...prev, { userId: joinerUserId, userName: joinerName, userAvatar: joinerAvatar, socketId: joinerSocketId }]);
      addToast(`${joinerName} wants to join the meeting`, 'lobby');
    });

    socket.on('lobby-accepted', () => {
      setLobbyState('accepted');
      addToast('You have been admitted to the meeting!', 'success');
    });

    socket.on('lobby-rejected', () => {
      setLobbyState('rejected');
      addToast('The host declined your request to join.', 'error');
    });

    socket.on('lobby-cancelled', (cancelledUserId) => {
      setLobbyRequests(prev => prev.filter(r => r.userId !== cancelledUserId));
    });

    socket.on('user-kicked', () => {
      setIsKicked(true);
      addToast('You have been removed from the meeting by the host.', 'error');
    });

    socket.on('room-users', (users) => {
      setRemoteUsers(users.filter(u => u.userId !== userId));
    });

    socket.on('user-connected', (newUserId, newUserName, newUserAvatar) => {
      console.log('User connected:', newUserName);
      addToast(`${newUserName} joined the meeting`, 'info');
      setRemoteUsers(prev => {
        if (prev.some(u => u.userId === newUserId)) return prev;
        return [...prev, { userId: newUserId, userName: newUserName, userAvatar: newUserAvatar, isMuted: false, isVideoOff: false }];
      });
    });

    socket.on('user-disconnected', (disconnectedUserId) => {
      console.log('User disconnected:', disconnectedUserId);
      setRemoteUsers(prev => {
        const user = prev.find(u => u.userId === disconnectedUserId);
        if (user) addToast(`${user.userName} left the meeting`, 'info');
        return prev.filter(u => u.userId !== disconnectedUserId);
      });
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
      if (message.senderId !== userId) {
        addToast(`${message.sender}: ${message.text}`, 'message', 4000);
      }
    });

    socket.on('meeting-ended', () => {
      setIsEnded(true);
      addToast('The host has ended the meeting.', 'error');
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId, userId, userName, userAvatar, addToast]);

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

  const acceptJoiner = useCallback((joinerUserId) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('lobby-accept', roomId, joinerUserId);
      setLobbyRequests(prev => prev.filter(r => r.userId !== joinerUserId));
    }
  }, [roomId]);

  const rejectJoiner = useCallback((joinerUserId) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('lobby-reject', roomId, joinerUserId);
      setLobbyRequests(prev => prev.filter(r => r.userId !== joinerUserId));
    }
  }, [roomId]);

  const kickUser = useCallback((targetUserId) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit('kick-user', roomId, targetUserId);
    }
  }, [roomId]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return {
    isConnected,
    remoteUsers,
    messages,
    toasts,
    lobbyState,
    lobbyRequests,
    isKicked,
    isEnded,
    sendMessage,
    toggleMute,
    toggleVideo,
    screenShareStarted,
    screenShareStopped,
    endMeeting,
    acceptJoiner,
    rejectJoiner,
    kickUser,
    dismissToast,
    socket: socketRef.current
  };
};

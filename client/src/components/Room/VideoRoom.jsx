import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePeer } from '../../hooks/usePeer';
import { useSocket } from '../../hooks/useSocket';
import { roomAPI } from '../../services/api';
import VideoGrid from './VideoGrid';
import VideoPlayer from './VideoPlayer';
import RoomControls from './RoomControls';
import Chat from './Chat';
import ParticipantList from './ParticipantList';
import { Video, Copy, Check } from 'lucide-react';

const VideoRoom = ({ roomCode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [room, setRoom] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef([]);

  // Initialize PeerJS
  const { peerId, peer, isPeerReady, initializePeer, callPeer, destroyPeer } = usePeer(roomCode, user?._id);

  // Initialize Socket
  const {
    isConnected,
    remoteUsers,
    messages,
    sendMessage,
    toggleMute,
    toggleVideo,
    screenShareStarted,
    screenShareStopped,
    endMeeting
  } = useSocket(roomCode, user?._id, user?.displayName, user?.avatar);

  // Fetch room info
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomAPI.getRoom(roomCode);
        setRoom(response.data);
      } catch (error) {
        setError('Failed to load room. It may have ended.');
        console.error('Fetch room error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode]);

  // Get local media stream
  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        localStreamRef.current = stream;
        initializePeer();
      } catch (error) {
        console.error('Error getting media:', error);
        setError('Could not access camera/microphone. Please check permissions.');
      }
    };

    if (user) {
      getMediaStream();
    }

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      destroyPeer();
    };
  }, [user]);

  // Handle incoming calls
  useEffect(() => {
    if (!peer || !localStream) return;

    peer.on('call', (call) => {
      call.answer(localStream);
      
      call.on('stream', (remoteStream) => {
        const peerUserId = call.peer.split('-')[0];
        if (!remoteStreamsRef.current.some(rs => rs.userId === peerUserId)) {
          const newStream = { userId: peerUserId, stream: remoteStream };
          remoteStreamsRef.current = [...remoteStreamsRef.current, newStream];
          setRemoteStreams([...remoteStreamsRef.current]);
        }
      });

      call.on('close', () => {
        const peerUserId = call.peer.split('-')[0];
        remoteStreamsRef.current = remoteStreamsRef.current.filter(rs => rs.userId !== peerUserId);
        setRemoteStreams([...remoteStreamsRef.current]);
      });
    });

    return () => {
      peer.off('call');
    };
  }, [peer, localStream]);

  // Call new users when they join
  useEffect(() => {
    if (!isPeerReady || !localStream || !remoteUsers.length) return;

    remoteUsers.forEach((remoteUser) => {
      const remotePeerId = `${remoteUser.userId}-${roomCode}`;
      const alreadyConnected = remoteStreams.some(rs => rs.userId === remoteUser.userId);
      
      if (!alreadyConnected) {
        const call = callPeer(remotePeerId, localStream);
        if (call) {
          call.on('stream', (remoteStream) => {
            if (!remoteStreamsRef.current.some(rs => rs.userId === remoteUser.userId)) {
              const newStream = { userId: remoteUser.userId, stream: remoteStream };
              remoteStreamsRef.current = [...remoteStreamsRef.current, newStream];
              setRemoteStreams([...remoteStreamsRef.current]);
            }
          });

          call.on('close', () => {
            remoteStreamsRef.current = remoteStreamsRef.current.filter(rs => rs.userId !== remoteUser.userId);
            setRemoteStreams([...remoteStreamsRef.current]);
          });
        }
      }
    });
  }, [remoteUsers, isPeerReady, localStream]);

  // Handle user disconnect
  useEffect(() => {
    const handleUserDisconnect = (userId) => {
      remoteStreamsRef.current = remoteStreamsRef.current.filter(rs => rs.userId !== userId);
      setRemoteStreams([...remoteStreamsRef.current]);
    };

    window.addEventListener('user-disconnected', (e) => {
      if (e.detail?.userId) {
        handleUserDisconnect(e.detail.userId);
      }
    });

    return () => {
      window.removeEventListener('user-disconnected', handleUserDisconnect);
    };
  }, []);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toggleMute(!audioTrack.enabled);
      }
    }
  }, [toggleMute]);

  // Toggle video
  const handleToggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toggleVideo(!videoTrack.enabled);
      }
    }
  }, [toggleVideo]);

  // Toggle screen share
  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Stop screen sharing, revert to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const oldStream = localStreamRef.current;
      if (oldStream) {
        oldStream.getTracks().forEach(track => track.stop());
      }
      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsScreenSharing(false);
      screenShareStopped();
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: { cursor: 'always' },
          audio: true
        });

        // Handle user stopping share via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          handleToggleScreenShare();
        };

        const oldStream = localStreamRef.current;
        if (oldStream) {
          oldStream.getTracks().forEach(track => track.stop());
        }
        
        setLocalStream(screenStream);
        localStreamRef.current = screenStream;
        setIsScreenSharing(true);
        screenShareStarted();
      } catch (error) {
        console.error('Screen share error:', error);
      }
    }
  }, [isScreenSharing, screenShareStarted, screenShareStopped]);

  // Toggle chat
  const handleToggleChat = useCallback(() => {
    setIsChatOpen(!isChatOpen);
    if (isParticipantsOpen) setIsParticipantsOpen(false);
  }, [isChatOpen, isParticipantsOpen]);

  // Toggle participants
  const handleToggleParticipants = useCallback(() => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (isChatOpen) setIsChatOpen(false);
  }, [isParticipantsOpen, isChatOpen]);

  // End meeting
  const handleEndMeeting = useCallback(() => {
    if (room?.host?._id === user?._id) {
      endMeeting();
    }
    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    destroyPeer();
    navigate('/dashboard');
  }, [room, user, endMeeting, destroyPeer, navigate]);

  // Copy room code
  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomCode]);

  // Handle send message
  const handleSendMessage = useCallback((message) => {
    sendMessage(message);
  }, [sendMessage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zoom-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zoom-blue mx-auto mb-4"></div>
          <p>Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zoom-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-xl font-bold mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zoom-dark flex flex-col">
      {/* Header */}
      <div className="bg-zoom-darker border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-zoom-blue" />
          <div>
            <h1 className="font-semibold">{room?.title || 'Meeting'}</h1>
            <p className="text-xs text-gray-400">Code: {roomCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">
            {remoteUsers.length + 1} participant{remoteUsers.length > 0 ? 's' : ''}
          </span>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1">
          <VideoGrid
            localStream={localStream}
            remoteStreams={remoteStreams}
            remoteUsers={remoteUsers}
          />
        </div>

        {/* Side Panel - Chat or Participants */}
        {(isChatOpen || isParticipantsOpen) && (
          <div className="w-80">
            {isChatOpen && (
              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                onClose={handleToggleChat}
              />
            )}
            {isParticipantsOpen && (
              <ParticipantList
                participants={remoteUsers}
                hostId={room?.host?._id}
                onClose={handleToggleParticipants}
              />
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <RoomControls
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleScreenShare={handleToggleScreenShare}
        onToggleChat={handleToggleChat}
        onToggleParticipants={handleToggleParticipants}
        onEndMeeting={handleEndMeeting}
        onCopyCode={handleCopyCode}
        participantCount={remoteUsers.length + 1}
      />
    </div>
  );
};

export default VideoRoom;

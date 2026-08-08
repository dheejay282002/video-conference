import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usePeer } from '../../hooks/usePeer';
import { useSocket } from '../../hooks/useSocket';
import { roomAPI } from '../../services/api';
import VideoGrid from './VideoGrid';
import RoomControls from './RoomControls';
import Chat from './Chat';
import ParticipantList from './ParticipantList';
import { ArrowLeft, Loader2 } from 'lucide-react';

const VideoRoom = ({ roomCode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef([]);

  const { peerId, peer, isPeerReady, initializePeer, callPeer, destroyPeer } = usePeer(roomCode, user?._id);
  const { isConnected, remoteUsers, messages, sendMessage, toggleMute, toggleVideo, screenShareStarted, screenShareStopped, endMeeting } = useSocket(roomCode, user?._id, user?.displayName, user?.avatar);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await roomAPI.getRoom(roomCode);
        setRoom(response.data);
      } catch (error) {
        setError('Failed to load room. It may have ended.');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [roomCode]);

  useEffect(() => {
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        initializePeer();
      } catch (error) {
        setError('Could not access camera/microphone. Please check permissions.');
      }
    };
    if (user) getMediaStream();
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
      destroyPeer();
    };
  }, [user]);

  useEffect(() => {
    if (!peer || !localStream) return;
    peer.on('call', (call) => {
      call.answer(localStream);
      call.on('stream', (remoteStream) => {
        const peerUserId = call.peer.split('-')[0];
        if (!remoteStreamsRef.current.some(rs => rs.userId === peerUserId)) {
          remoteStreamsRef.current = [...remoteStreamsRef.current, { userId: peerUserId, stream: remoteStream }];
          setRemoteStreams([...remoteStreamsRef.current]);
        }
      });
      call.on('close', () => {
        const peerUserId = call.peer.split('-')[0];
        remoteStreamsRef.current = remoteStreamsRef.current.filter(rs => rs.userId !== peerUserId);
        setRemoteStreams([...remoteStreamsRef.current]);
      });
    });
    return () => { peer.off('call'); };
  }, [peer, localStream]);

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
              remoteStreamsRef.current = [...remoteStreamsRef.current, { userId: remoteUser.userId, stream: remoteStream }];
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

  const handleToggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const oldStream = localStreamRef.current;
      if (oldStream) oldStream.getTracks().forEach(track => track.stop());
      setLocalStream(stream);
      localStreamRef.current = stream;
      setIsScreenSharing(false);
      screenShareStopped();
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: true });
        screenStream.getVideoTracks()[0].onended = () => handleToggleScreenShare();
        const oldStream = localStreamRef.current;
        if (oldStream) oldStream.getTracks().forEach(track => track.stop());
        setLocalStream(screenStream);
        localStreamRef.current = screenStream;
        setIsScreenSharing(true);
        screenShareStarted();
      } catch (error) { console.error('Screen share error:', error); }
    }
  }, [isScreenSharing, screenShareStarted, screenShareStopped]);

  const handleToggleChat = useCallback(() => {
    setIsChatOpen(!isChatOpen);
    if (isParticipantsOpen) setIsParticipantsOpen(false);
  }, [isChatOpen, isParticipantsOpen]);

  const handleToggleParticipants = useCallback(() => {
    setIsParticipantsOpen(!isParticipantsOpen);
    if (isChatOpen) setIsChatOpen(false);
  }, [isParticipantsOpen, isChatOpen]);

  const handleEndMeeting = useCallback(() => {
    if (room?.host?._id === user?._id) endMeeting();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    destroyPeer();
    navigate('/dashboard');
  }, [room, user, endMeeting, destroyPeer, navigate]);

  const handleCopyCode = useCallback(() => { navigator.clipboard.writeText(roomCode); }, [roomCode]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: '#6366f1' }} />
          <p style={{ color: '#71717a' }}>Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <span style={{ fontSize: '24px', color: '#ef4444' }}>!</span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Connection Error</h2>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: '#09090b' }}>
      {/* Header */}
      <div
        style={{
          height: '56px',
          borderBottom: '1px solid rgba(31,31,35,0.6)',
          background: 'rgba(9,9,11,0.8)',
          backdropFilter: 'blur(24px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        <div className="flex items-center gap-3">
          <Link to="/dashboard" style={{ padding: '8px', borderRadius: '12px', background: 'transparent', border: 'none', cursor: 'pointer' }} className="hover:bg-white/5">
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#71717a' }} />
          </Link>
          <div style={{ width: '1px', height: '20px', background: '#27272a' }} />
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '14px', lineHeight: '1.2' }}>{room?.title || 'Meeting'}</h1>
            <p style={{ fontSize: '12px', color: '#71717a', fontFamily: 'monospace' }}>{roomCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#71717a' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontWeight: 500 }}>{remoteUsers.length + 1} online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} remoteUsers={remoteUsers} />
        </div>

        {(isChatOpen || isParticipantsOpen) && (
          <div style={{ width: '320px', flexShrink: 0 }}>
            {isChatOpen && <Chat messages={messages} onSendMessage={sendMessage} onClose={handleToggleChat} />}
            {isParticipantsOpen && <ParticipantList participants={remoteUsers} hostId={room?.host?._id} onClose={handleToggleParticipants} />}
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

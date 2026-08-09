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
import Toast from './Toast';
import { ArrowLeft, Loader2, Mic, MicOff, Video, VideoOff, PhoneOff, Check, X } from 'lucide-react';

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
  const connectingRef = useRef(new Set());
  const peerInstanceRef = useRef(null);

  const { peerId, isPeerReady, initializePeer, callPeer, destroyPeer } = usePeer(roomCode, user?._id);
  const {
    isConnected, remoteUsers, messages, toasts, lobbyState, lobbyRequests,
    isKicked, isEnded,
    sendMessage, toggleMute, toggleVideo, screenShareStarted, screenShareStopped,
    endMeeting, acceptJoiner, rejectJoiner, kickUser, dismissToast
  } = useSocket(roomCode, user?._id, user?.displayName, user?.avatar);

  const tryCallPeer = useCallback((remoteUserId, stream) => {
    const remotePeerId = `${remoteUserId}-${roomCode}`;
    const call = callPeer(remotePeerId, stream);
    if (!call) {
      connectingRef.current.delete(remoteUserId);
      return;
    }
    connectingRef.current.add(remoteUserId);

    call.on('stream', (remoteStream) => {
      console.log('Got stream from:', remoteUserId);
      connectingRef.current.delete(remoteUserId);
      if (!remoteStreamsRef.current.some(rs => rs.userId === remoteUserId)) {
        remoteStreamsRef.current = [...remoteStreamsRef.current, { userId: remoteUserId, stream: remoteStream }];
        setRemoteStreams([...remoteStreamsRef.current]);
      }
    });

    call.on('close', () => {
      connectingRef.current.delete(remoteUserId);
      remoteStreamsRef.current = remoteStreamsRef.current.filter(rs => rs.userId !== remoteUserId);
      setRemoteStreams([...remoteStreamsRef.current]);
    });

    call.on('error', (err) => {
      console.error('Call failed to', remoteUserId, err.message);
      connectingRef.current.delete(remoteUserId);
      // Retry after delay
      setTimeout(() => {
        if (localStreamRef.current && remoteUsers.some(u => u.userId === remoteUserId)) {
          console.log('Retrying call to:', remoteUserId);
          tryCallPeer(remoteUserId, localStreamRef.current);
        }
      }, 2000);
    });
  }, [roomCode, callPeer, remoteUsers]);

  // Fetch room data
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

  // Get media stream + init peer (only once)
  useEffect(() => {
    if (!user) return;
    if (localStreamRef.current) return;
    const getMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        localStreamRef.current = stream;
        initializePeer();
      } catch (error) {
        console.error('Media error:', error);
        setError('Could not access camera/microphone. Please check permissions.');
      }
    };
    getMediaStream();
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      destroyPeer();
      connectingRef.current.clear();
      remoteStreamsRef.current = [];
    };
  }, [user]);

  // Handle incoming calls
  useEffect(() => {
    if (!isPeerReady || !localStream) return;
    const peer = peerInstanceRef.current || (peerId ? { on: () => {}, off: () => {} } : null);
    if (!peer) return;
  }, [isPeerReady, localStream, peerId]);

  // Call new remote users when they join
  useEffect(() => {
    if (!isPeerReady || !localStream || !remoteUsers.length) return;
    remoteUsers.forEach((remoteUser) => {
      if (remoteUser.userId === user?._id) return;
      if (connectingRef.current.has(remoteUser.userId)) return;
      if (remoteStreamsRef.current.some(rs => rs.userId === remoteUser.userId)) return;
      tryCallPeer(remoteUser.userId, localStream);
    });
  }, [remoteUsers, isPeerReady, localStream, user?._id, tryCallPeer]);

  // Periodic retry - try to call users we haven't connected to yet
  useEffect(() => {
    if (!isPeerReady || !localStream || !remoteUsers.length) return;
    const interval = setInterval(() => {
      remoteUsers.forEach((remoteUser) => {
        if (remoteUser.userId === user?._id) return;
        if (connectingRef.current.has(remoteUser.userId)) return;
        if (remoteStreamsRef.current.some(rs => rs.userId === remoteUser.userId)) return;
        console.log('Retry interval: calling', remoteUser.userName);
        tryCallPeer(remoteUser.userId, localStream);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isPeerReady, localStream, remoteUsers, user?._id, tryCallPeer]);

  // Remove streams for disconnected users
  useEffect(() => {
    const activeIds = new Set(remoteUsers.map(u => u.userId));
    const before = remoteStreamsRef.current.length;
    remoteStreamsRef.current = remoteStreamsRef.current.filter(rs => activeIds.has(rs.userId));
    if (remoteStreamsRef.current.length !== before) {
      setRemoteStreams([...remoteStreamsRef.current]);
    }
    connectingRef.current.forEach(id => {
      if (!activeIds.has(id)) connectingRef.current.delete(id);
    });
  }, [remoteUsers]);

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

  const handleEndMeeting = useCallback(() => {
    if (room?.host?._id === user?._id) endMeeting();
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    destroyPeer();
    navigate('/dashboard');
  }, [room, user, endMeeting, destroyPeer, navigate]);

  const handleLeave = useCallback(() => {
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => track.stop());
    destroyPeer();
    navigate('/dashboard');
  }, [destroyPeer, navigate]);

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
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', borderRadius: '12px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (isKicked) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <PhoneOff style={{ width: '32px', height: '32px', color: '#ef4444' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Removed from Meeting</h2>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>The host has removed you from this meeting.</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', borderRadius: '12px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-center" style={{ maxWidth: '400px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <PhoneOff style={{ width: '32px', height: '32px', color: '#f59e0b' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>Meeting Ended</h2>
          <p style={{ color: '#71717a', marginBottom: '24px' }}>The host has ended this meeting.</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '12px 24px', borderRadius: '12px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  // LOBBY - Waiting for host
  if (lobbyState === 'waiting') {
    return (
      <div className="h-screen flex flex-col" style={{ background: '#09090b' }}>
        <Toast toasts={toasts} onDismiss={dismissToast} />
        <div style={{ height: '56px', borderBottom: '1px solid rgba(31,31,35,0.6)', display: 'flex', alignItems: 'center', padding: '0 16px', flexShrink: 0 }}>
          <div className="flex items-center gap-3">
            <Link to="/dashboard" style={{ padding: '8px', borderRadius: '12px' }} className="hover:bg-white/5">
              <ArrowLeft style={{ width: '16px', height: '16px', color: '#71717a' }} />
            </Link>
            <div style={{ width: '1px', height: '20px', background: '#27272a' }} />
            <div>
              <h1 style={{ fontWeight: 600, fontSize: '14px' }}>{room?.title || 'Meeting'}</h1>
              <p style={{ fontSize: '12px', color: '#71717a', fontFamily: 'monospace' }}>{roomCode}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center" style={{ maxWidth: '480px', padding: '0 24px' }}>
            <div style={{ width: '320px', height: '240px', borderRadius: '20px', background: '#18181b', margin: '0 auto 32px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(31,31,35,0.6)' }}>
              {localStream && !isVideoOff ? (
                <video ref={(el) => { if (el) el.srcObject = localStream; }} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
              ) : user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>
                    {user?.displayName?.charAt(0)}
                  </div>
                </div>
              )}
              <div style={{ position: 'absolute', bottom: '12px', left: '12px' }}>
                <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', fontSize: '12px', color: '#d4d4d8', fontWeight: 500 }}>You</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#f59e0b' }} />
              <p style={{ color: '#d4d4d8', fontSize: '16px', fontWeight: 500 }}>Waiting for host to let you in...</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
              <button onClick={handleToggleMute} style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: isMuted ? 'rgba(239,68,68,0.15)' : '#18181b', color: isMuted ? '#ef4444' : '#fff' }}>
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <button onClick={handleToggleVideo} style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: isVideoOff ? 'rgba(239,68,68,0.15)' : '#18181b', color: isVideoOff ? '#ef4444' : '#fff' }}>
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
              </button>
              <button onClick={handleLeave} style={{ width: '52px', height: '52px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff' }}>
                <PhoneOff className="w-5 h-5" />
              </button>
            </div>
            <p style={{ color: '#52525b', fontSize: '13px' }}>You can turn on/off your camera and mic while waiting.</p>
          </div>
        </div>
      </div>
    );
  }

  const isHost = lobbyState === 'host' || room?.host?._id === user?._id;

  return (
    <div className="h-screen flex flex-col" style={{ background: '#09090b' }}>
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Lobby Request Overlay */}
      {isHost && lobbyRequests.length > 0 && (
        <div style={{ position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '8px', width: '380px' }}>
          {lobbyRequests.map((req) => (
            <div key={req.userId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', backdropFilter: 'blur(24px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff', flexShrink: 0 }}>
                {req.userAvatar ? <img src={req.userAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : req.userName?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>{req.userName}</p>
                <p style={{ fontSize: '11px', color: '#a1a1aa' }}>wants to join</p>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => acceptJoiner(req.userId)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check style={{ width: '16px', height: '16px', color: '#22c55e' }} />
                </button>
                <button onClick={() => rejectJoiner(req.userId)} style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header */}
      <div style={{ height: '56px', borderBottom: '1px solid rgba(31,31,35,0.6)', background: 'rgba(9,9,11,0.8)', backdropFilter: 'blur(24px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" style={{ padding: '8px', borderRadius: '12px' }} className="hover:bg-white/5">
            <ArrowLeft style={{ width: '16px', height: '16px', color: '#71717a' }} />
          </Link>
          <div style={{ width: '1px', height: '20px', background: '#27272a' }} />
          <div>
            <h1 style={{ fontWeight: 600, fontSize: '14px' }}>{room?.title || 'Meeting'}</h1>
            <p style={{ fontSize: '12px', color: '#71717a', fontFamily: 'monospace' }}>{roomCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isHost && (
            <div style={{ padding: '4px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '11px', color: '#f59e0b', fontWeight: 600 }}>HOST</div>
          )}
          <div className="flex items-center gap-1.5" style={{ fontSize: '12px', color: '#71717a' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isConnected ? '#22c55e' : '#ef4444' }} />
            <span style={{ fontWeight: 500 }}>{remoteUsers.length + 1} online</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1">
          <VideoGrid localStream={localStream} remoteStreams={remoteStreams} remoteUsers={remoteUsers} localUser={user} />
        </div>

        {(isChatOpen || isParticipantsOpen) && (
          <div style={{ width: '320px', flexShrink: 0 }}>
            {isChatOpen && <Chat messages={messages} onSendMessage={sendMessage} onClose={() => setIsChatOpen(false)} />}
            {isParticipantsOpen && <ParticipantList participants={remoteUsers} hostId={room?.host?._id} onClose={() => setIsParticipantsOpen(false)} onKickUser={kickUser} />}
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
        onToggleChat={() => { setIsChatOpen(!isChatOpen); if (isParticipantsOpen) setIsParticipantsOpen(false); }}
        onToggleParticipants={() => { setIsParticipantsOpen(!isParticipantsOpen); if (isChatOpen) setIsChatOpen(false); }}
        onEndMeeting={isHost ? handleEndMeeting : handleLeave}
        onCopyCode={handleCopyCode}
        participantCount={remoteUsers.length + 1}
        isHost={isHost}
      />
    </div>
  );
};

export default VideoRoom;

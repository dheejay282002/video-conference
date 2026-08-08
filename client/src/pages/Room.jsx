import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWebRTC } from '../../hooks/useWebRTC';
import { useSocket } from '../../context/SocketContext';
import ChatPanel from './ChatPanel';
import { SkeletonRoom } from '../UI/Skeleton';
import { Video, VideoOff, Mic, MicOff, Phone, MessageSquare, Copy, Check, ArrowLeft, Users, ScreenShare, ScreenShareOff } from 'lucide-react';

const Room = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocket();
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [roomInfo, setRoomInfo] = useState(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  const { localStream, remoteStreams, isMuted, isVideoOff, toggleAudio, toggleVideo, isConnected, error } = useWebRTC(roomCode, socket, user);

  useEffect(() => {
    if (localStream && localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (socket) {
      socket.emit('get-room-info', roomCode);
      socket.on('room-info', (info) => { setRoomInfo(info); setParticipantCount(info.participants?.length || 0); });
      socket.on('user-count', (count) => setParticipantCount(count));
      return () => { socket.off('room-info'); socket.off('user-count'); };
    }
  }, [socket, roomCode]);

  useEffect(() => {
    const handleNewMessage = () => { if (!showChat) setUnreadMessages((prev) => prev + 1); };
    if (socket) socket.on('chat-message', handleNewMessage);
    return () => { if (socket) socket.off('chat-message', handleNewMessage); };
  }, [socket, showChat]);

  useEffect(() => { if (showChat) setUnreadMessages(0); }, [showChat]);

  if (authLoading) return <SkeletonRoom />;
  if (!user) return (
    <div className="h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <p className="text-xl text-surface-600 mb-4">Please sign in to join the room</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    </div>
  );
  if (error) return (
    <div className="h-screen bg-surface-0 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mx-auto mb-4">
          <Video className="w-8 h-8 text-danger" />
        </div>
        <p className="text-xl font-semibold mb-2">Connection Error</p>
        <p className="text-surface-500 mb-6">{error}</p>
        <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
      </div>
    </div>
  );

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) { screenStreamRef.current.getTracks().forEach((track) => track.stop()); screenStreamRef.current = null; }
      if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;
        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenStream.getVideoTracks()[0].onended = () => { if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream; setIsScreenSharing(false); };
        setIsScreenSharing(true);
      } catch (err) { console.error('Screen share error:', err); }
    }
  };

  return (
    <div className="h-screen bg-surface-0 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 border-b border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-surface-100 rounded-xl transition-all duration-200">
            <ArrowLeft className="w-4 h-4 text-surface-600" />
          </Link>
          <div className="h-5 w-px bg-surface-200" />
          <div>
            <h1 className="text-sm font-semibold leading-tight">{roomInfo?.title || 'Video Conference'}</h1>
            <p className="text-xs text-surface-500 font-mono">{roomCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="font-medium">{participantCount} online</span>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="flex items-center gap-1.5 text-xs font-medium text-surface-500 hover:text-surface-800 transition-colors"
          >
            {copied ? <><Check className="w-3.5 h-3.5 text-success" /><span className="text-success">Copied</span></> : <><Copy className="w-3.5 h-3.5" />Copy code</>}
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-3">
          <div className="grid h-full gap-3" style={{ gridTemplateColumns: remoteStreams.length > 0 ? `repeat(auto-fit, minmax(380px, 1fr))` : '1fr' }}>
            {/* Local Video */}
            <div className="relative bg-surface-100 rounded-2xl overflow-hidden border border-surface-200/60 group">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute bottom-3 left-3 bg-surface-0/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-surface-200/40">
                <span className="text-xs font-semibold">{user?.displayName}</span>
                <span className="text-[10px] text-surface-500">(You)</span>
                {isMuted ? <MicOff className="w-3 h-3 text-danger" /> : <Mic className="w-3 h-3 text-success" />}
              </div>
              {isVideoOff && (
                <div className="absolute inset-0 bg-surface-100 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-surface-200 flex items-center justify-center">
                    <span className="text-3xl font-bold text-surface-500">{user?.displayName?.charAt(0)}</span>
                  </div>
                </div>
              )}
            </div>
            {remoteStreams.map(({ stream, userId, displayName }, index) => (
              <RemoteVideo key={index} stream={stream} displayName={displayName || `Participant ${index + 1}`} />
            ))}
          </div>
        </div>

        {showChat && (
          <div className="w-80 border-l border-surface-200/60 flex-shrink-0">
            <ChatPanel roomCode={roomCode} />
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="h-20 border-t border-surface-200/60 bg-surface-0/80 backdrop-blur-2xl flex items-center justify-center gap-3 flex-shrink-0">
        <button onClick={toggleAudio} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isMuted ? 'bg-danger hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200'}`}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleVideo} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isVideoOff ? 'bg-danger hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200'}`}>
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button onClick={handleToggleScreenShare} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${isScreenSharing ? 'bg-brand-600 hover:bg-brand-500 shadow-glow' : 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200'}`}>
          {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
        </button>
        <button onClick={() => setShowChat(!showChat)} className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 relative ${showChat ? 'bg-brand-600 hover:bg-brand-500 shadow-glow' : 'bg-surface-100 hover:bg-surface-200 text-surface-700 border border-surface-200'}`}>
          <MessageSquare className="w-5 h-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger rounded-full text-[10px] font-bold flex items-center justify-center text-white animate-scale-in">
              {unreadMessages > 9 ? '9+' : unreadMessages}
            </span>
          )}
        </button>
        <div className="w-px h-8 bg-surface-200 mx-1" />
        <button onClick={() => navigate('/dashboard')} className="w-14 h-12 bg-danger hover:bg-red-600 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <Phone className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const RemoteVideo = ({ stream, displayName }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);
  return (
    <div className="relative bg-surface-100 rounded-2xl overflow-hidden border border-surface-200/60 group">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
      <div className="absolute bottom-3 left-3 bg-surface-0/80 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-2 border border-surface-200/40">
        <span className="text-xs font-semibold">{displayName}</span>
      </div>
    </div>
  );
};

export default Room;

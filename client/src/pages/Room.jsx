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
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
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

  useEffect(() => {
    if (showChat) setUnreadMessages(0);
  }, [showChat]);

  if (authLoading) return <SkeletonRoom />;
  if (!user) return <div className="h-screen bg-zoom-dark flex items-center justify-center"><p className="text-xl">Please <Link to="/login" className="text-zoom-blue hover:underline">login</Link> to join the room.</p></div>;
  if (error) return <div className="h-screen bg-zoom-dark flex items-center justify-center"><div className="text-center"><p className="text-xl text-red-400 mb-4">{error}</p><Link to="/dashboard" className="btn-primary">Back to Dashboard</Link></div></div>;

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
    <div className="h-screen bg-zoom-dark flex flex-col">
      <div className="bg-zoom-darker border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="p-2 hover:bg-gray-700 rounded-lg transition-all"><ArrowLeft className="w-5 h-5" /></Link>
          <div><h1 className="font-semibold">{roomInfo?.title || 'Video Conference'}</h1><p className="text-sm text-gray-400">Code: {roomCode}</p></div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1"><Users className="w-4 h-4" />{participantCount} participant{participantCount !== 1 ? 's' : ''}</div>
          <button onClick={() => { navigator.clipboard.writeText(roomCode); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1 hover:text-white transition-all">
            {copied ? <><Check className="w-4 h-4 text-green-400" /><span className="text-green-400">Copied!</span></> : <><Copy className="w-4 h-4" />Copy Code</>}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <div className="grid h-full gap-2 p-2" style={{ gridTemplateColumns: remoteStreams.length > 0 ? `repeat(auto-fit, minmax(400px, 1fr))` : '1fr' }}>
            <div className="relative bg-zoom-darker rounded-xl overflow-hidden">
              <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="font-medium">{user?.displayName} (You)</span>
                {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-green-400" />}
              </div>
            </div>
            {remoteStreams.map(({ stream, userId, displayName }, index) => (
              <RemoteVideo key={index} stream={stream} displayName={displayName || `Participant ${index + 1}`} userId={userId} />
            ))}
          </div>
        </div>

        {showChat && (
          <div className="w-80 border-l border-gray-700">
            <ChatPanel roomCode={roomCode} />
          </div>
        )}
      </div>

      <div className="bg-zoom-darker border-t border-gray-700 px-4 py-3 flex items-center justify-center gap-3">
        <button onClick={toggleAudio} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleVideo} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
        </button>
        <button onClick={handleToggleScreenShare} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isScreenSharing ? 'bg-zoom-blue hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
          {isScreenSharing ? <ScreenShareOff className="w-5 h-5" /> : <ScreenShare className="w-5 h-5" />}
        </button>
        <button onClick={() => setShowChat(!showChat)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative ${showChat ? 'bg-zoom-blue' : 'bg-gray-700 hover:bg-gray-600'}`}>
          <MessageSquare className="w-5 h-5" />
          {unreadMessages > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center">{unreadMessages}</span>}
        </button>
        <button onClick={() => navigate('/dashboard')} className="w-16 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all ml-4">
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
    <div className="relative bg-zoom-darker rounded-xl overflow-hidden">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
      <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1.5 rounded-lg font-medium">{displayName}</div>
    </div>
  );
};

export default Room;

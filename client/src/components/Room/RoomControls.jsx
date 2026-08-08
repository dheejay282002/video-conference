import React from 'react';
import { Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, MessageSquare, Users, PhoneOff, Copy, Check } from 'lucide-react';

const RoomControls = ({
  isMuted, isVideoOff, isScreenSharing, isChatOpen, isParticipantsOpen,
  onToggleMute, onToggleVideo, onToggleScreenShare, onToggleChat,
  onToggleParticipants, onEndMeeting, onCopyCode, participantCount
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getControlStyle = (isActive, isDanger) => ({
    width: '48px',
    height: '48px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: isDanger ? 'none' : isActive ? 'none' : '1px solid #27272a',
    background: isDanger
      ? '#ef4444'
      : isActive
        ? '#4f46e5'
        : '#18181b',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: isDanger
      ? '0 0 20px rgba(239,68,68,0.2)'
      : isActive
        ? '0 0 20px rgba(99,102,241,0.15)'
        : 'none',
  });

  return (
    <div
      style={{
        height: '80px',
        borderTop: '1px solid rgba(31,31,35,0.6)',
        background: 'rgba(9,9,11,0.8)',
        backdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        flexShrink: 0,
      }}
    >
      {/* Mic */}
      <button onClick={onToggleMute} style={getControlStyle(!isMuted && !isMuted, false)} title={isMuted ? 'Unmute' : 'Mute'}>
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Camera */}
      <button onClick={onToggleVideo} style={getControlStyle(!isVideoOff, false)} title={isVideoOff ? 'Start Video' : 'Stop Video'}>
        {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </button>

      {/* Screen Share */}
      <button onClick={onToggleScreenShare} style={getControlStyle(isScreenSharing, false)} title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}>
        {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
      </button>

      {/* Chat */}
      <button onClick={onToggleChat} style={getControlStyle(isChatOpen, false)} title="Chat">
        <MessageSquare className="w-5 h-5" />
      </button>

      {/* Participants */}
      <button onClick={onToggleParticipants} style={getControlStyle(isParticipantsOpen, false)} title="Participants">
        <Users className="w-5 h-5" />
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '32px', background: '#27272a', margin: '0 4px' }} />

      {/* Copy Code */}
      <button onClick={handleCopy} style={{ ...getControlStyle(false, false), width: 'auto', padding: '0 16px', gap: '6px', fontSize: '13px', fontWeight: 500 }}>
        {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#22c55e' }} /> : <Copy className="w-3.5 h-3.5" />}
        <span style={{ whiteSpace: 'nowrap' }}>{copied ? 'Copied' : `${participantCount} online`}</span>
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '32px', background: '#27272a', margin: '0 4px' }} />

      {/* End Call */}
      <button onClick={onEndMeeting} style={{ ...getControlStyle(false, true), width: '56px' }} title="Leave Meeting">
        <PhoneOff className="w-5 h-5" />
      </button>
    </div>
  );
};

export default RoomControls;

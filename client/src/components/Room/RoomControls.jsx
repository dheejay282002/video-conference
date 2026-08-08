import React, { useState } from 'react';
import { 
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff, 
  MessageSquare, Users, PhoneOff, Copy, MoreVertical,
  Hand, Settings
} from 'lucide-react';

const RoomControls = ({
  isMuted,
  isVideoOff,
  isScreenSharing,
  isChatOpen,
  isParticipantsOpen,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleChat,
  onToggleParticipants,
  onEndMeeting,
  onCopyCode,
  participantCount
}) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-zoom-darker border-t border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Meeting Info */}
        <div className="flex items-center gap-4">
          <button
            onClick={onCopyCode}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            title="Copy meeting code"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Code</span>
          </button>
          <div className="hidden md:flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span>{participantCount}</span>
          </div>
        </div>

        {/* Center: Main Controls */}
        <div className="flex items-center gap-2">
          {/* Microphone */}
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-full transition-all ${
              isMuted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Camera */}
          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-full transition-all ${
              isVideoOff 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </button>

          {/* Screen Share */}
          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-full transition-all ${
              isScreenSharing 
                ? 'bg-zoom-blue hover:bg-zoom-blue-hover' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          >
            {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
          </button>

          {/* End Call */}
          <button
            onClick={onEndMeeting}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 transition-all ml-4"
            title="Leave Meeting"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        {/* Right: Chat, Participants, More */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleChat}
            className={`p-3 rounded-full transition-all relative ${
              isChatOpen 
                ? 'bg-zoom-blue hover:bg-zoom-blue-hover' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleParticipants}
            className={`p-3 rounded-full transition-all ${
              isParticipantsOpen 
                ? 'bg-zoom-blue hover:bg-zoom-blue-hover' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
            title="Participants"
          >
            <Users className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-all"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showMore && (
              <div className="absolute bottom-16 right-0 bg-zoom-darker border border-gray-700 rounded-xl py-2 w-48 shadow-xl">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-700 flex items-center gap-3">
                  <Hand className="w-5 h-5" />
                  Raise Hand
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomControls;

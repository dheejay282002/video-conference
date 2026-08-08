import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ParticipantList = ({ participants, hostId, onClose }) => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-zoom-darker border-l border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h3 className="font-semibold">Participants ({participants.length + 1})</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto">
        {/* Local User (You) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zoom-blue rounded-full flex items-center justify-center font-bold">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full" />
              ) : (
                user?.displayName?.charAt(0)
              )}
            </div>
            <div>
              <p className="font-medium">{user?.displayName} (You)</p>
              {hostId === user?._id && (
                <p className="text-xs text-yellow-500 flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Host
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Remote Participants */}
        {participants.map((participant) => (
          <div
            key={participant.userId}
            className="flex items-center justify-between p-4 border-b border-gray-700/50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center font-bold">
                {participant.userAvatar ? (
                  <img src={participant.userAvatar} alt="" className="w-full h-full rounded-full" />
                ) : (
                  participant.userName?.charAt(0)
                )}
              </div>
              <div>
                <p className="font-medium">{participant.userName}</p>
                {hostId === participant.userId && (
                  <p className="text-xs text-yellow-500 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Host
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {participant.isMuted ? (
                <MicOff className="w-4 h-4 text-red-400" />
              ) : (
                <Mic className="w-4 h-4 text-green-400" />
              )}
              {participant.isVideoOff ? (
                <VideoOff className="w-4 h-4 text-red-400" />
              ) : (
                <Video className="w-4 h-4 text-green-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;

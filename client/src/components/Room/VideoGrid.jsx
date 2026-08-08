import React from 'react';
import VideoPlayer from './VideoPlayer';

const VideoGrid = ({ localStream, remoteStreams, remoteUsers }) => {
  const totalParticipants = 1 + remoteStreams.length;

  const getGridClass = () => {
    if (totalParticipants === 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-3';
    if (totalParticipants <= 9) return 'grid-cols-3';
    return 'grid-cols-4';
  };

  return (
    <div className={`grid ${getGridClass()} gap-2 p-2 h-full`}>
      {/* Local Video */}
      <VideoPlayer
        stream={localStream}
        userName="You"
        isMuted={true}
        isLocal={true}
        isVideoOff={!localStream}
      />

      {/* Remote Videos */}
      {remoteStreams.map((item) => {
        const user = remoteUsers.find(u => u.userId === item.userId);
        return (
          <VideoPlayer
            key={item.userId}
            stream={item.stream}
            userName={user?.userName || 'Participant'}
            isMuted={user?.isMuted || false}
            isLocal={false}
            isVideoOff={user?.isVideoOff || false}
          />
        );
      })}
    </div>
  );
};

export default VideoGrid;

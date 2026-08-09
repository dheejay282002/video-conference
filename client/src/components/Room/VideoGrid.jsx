import React from 'react';
import VideoPlayer from './VideoPlayer';

const VideoGrid = ({ localStream, remoteStreams, remoteUsers, localUser }) => {
  const totalParticipants = 1 + remoteStreams.length;

  const getGridStyle = () => {
    if (totalParticipants === 1) return { gridTemplateColumns: '1fr', gridTemplateRows: '1fr' };
    if (totalParticipants === 2) return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: '1fr' };
    if (totalParticipants <= 4) return { gridTemplateColumns: 'repeat(2, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
    if (totalParticipants <= 6) return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(2, 1fr)' };
    return { gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' };
  };

  return (
    <div className="grid h-full gap-3 p-3" style={getGridStyle()}>
      <VideoPlayer
        stream={localStream}
        userName="You"
        isMuted={true}
        isLocal={true}
        isVideoOff={!localStream}
        userAvatar={localUser?.avatar}
      />

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
            userAvatar={user?.userAvatar}
          />
        );
      })}
    </div>
  );
};

export default VideoGrid;

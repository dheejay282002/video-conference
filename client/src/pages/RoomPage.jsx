import React from 'react';
import { useParams } from 'react-router-dom';
import VideoRoom from '../components/Room/VideoRoom';

const RoomPage = () => {
  const { roomCode } = useParams();
  
  return <VideoRoom roomCode={roomCode} />;
};

export default RoomPage;

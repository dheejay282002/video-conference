import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    
    if (roomCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await roomAPI.joinRoom(roomCode);
      navigate(`/room/${roomCode}`);
    } catch (error) {
      if (error.response?.status === 404) {
        setError('Meeting not found. Check the code and try again.');
      } else {
        setError('Failed to join meeting. Please try again.');
      }
      console.error('Join room error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-4">
      <input
        type="text"
        placeholder="Enter meeting code"
        value={roomCode}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, '').slice(0, 6);
          setRoomCode(value);
        }}
        className="input-field text-center text-2xl tracking-widest font-mono"
        maxLength={6}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading || roomCode.length !== 6}
        className="btn-primary w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Joining...
          </>
        ) : (
          'Join Meeting'
        )}
      </button>
    </form>
  );
};

export default JoinRoom;

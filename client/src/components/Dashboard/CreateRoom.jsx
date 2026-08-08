import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const CreateRoom = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await roomAPI.createRoom(title || 'My Meeting');
      const roomCode = response.data.roomCode;
      navigate(`/room/${roomCode}`);
    } catch (error) {
      setError('Failed to create meeting. Please try again.');
      console.error('Create room error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <input
        type="text"
        placeholder="Meeting title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input-field"
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Creating...
          </>
        ) : (
          'New Meeting'
        )}
      </button>
    </form>
  );
};

export default CreateRoom;

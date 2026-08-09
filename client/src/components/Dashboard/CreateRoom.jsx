import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomAPI } from '../../services/api';
import { Loader2 } from 'lucide-react';

const CreateRoom = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const response = await roomAPI.createRoom(title.trim());
      navigate(`/room/${response.data.roomCode}`);
    } catch (error) {
      console.error('Error creating room:', error);
      alert('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Meeting title"
        className="input-field"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating...
          </>
        ) : (
          'Start Meeting'
        )}
      </button>
    </form>
  );
};

export default CreateRoom;

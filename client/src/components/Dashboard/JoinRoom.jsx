import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const JoinRoom = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      navigate(`/room/${code.trim()}`);
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleJoin} className="space-y-3">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter meeting code"
        className="input-field font-mono"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-success hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,197,94,0.15)] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
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

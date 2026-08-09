import React from 'react';
import { X, Mic, MicOff, Video, VideoOff, Crown, UserMinus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ParticipantList = ({ participants, hostId, onClose, onKickUser }) => {
  const { user } = useAuth();
  const isHost = hostId === user?._id;

  const listStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid rgba(31,31,35,0.4)',
  };

  const avatarStyle = (bg) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: bg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 0,
  });

  return (
    <div className="flex flex-col h-full" style={{ background: '#09090b', borderLeft: '1px solid rgba(31,31,35,0.6)' }}>
      <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(31,31,35,0.6)' }}>
        <h3 className="font-semibold" style={{ fontSize: '14px' }}>Participants ({participants.length + 1})</h3>
        <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px', background: 'transparent', border: 'none', cursor: 'pointer' }} className="hover:bg-white/5">
          <X style={{ width: '18px', height: '18px', color: '#71717a' }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div style={listStyle}>
          <div className="flex items-center gap-3">
            <div style={avatarStyle('linear-gradient(135deg, #4f46e5, #6366f1)')}>
              {user?.avatar ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.displayName?.charAt(0)
              )}
            </div>
            <div>
              <p style={{ fontWeight: 500, fontSize: '14px' }}>{user?.displayName} <span style={{ color: '#71717a', fontSize: '12px' }}>(You)</span></p>
              {isHost && (
                <p style={{ fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Crown style={{ width: '12px', height: '12px' }} /> Host
                </p>
              )}
            </div>
          </div>
        </div>

        {participants.map((p) => (
          <div key={p.userId} style={listStyle}>
            <div className="flex items-center gap-3">
              <div style={avatarStyle('#18181b')}>
                {p.userAvatar ? (
                  <img src={p.userAvatar} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  p.userName?.charAt(0)
                )}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>{p.userName}</p>
                {hostId === p.userId && (
                  <p style={{ fontSize: '12px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    <Crown style={{ width: '12px', height: '12px' }} /> Host
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {p.isMuted ? <MicOff style={{ width: '14px', height: '14px', color: '#ef4444' }} /> : <Mic style={{ width: '14px', height: '14px', color: '#22c55e' }} />}
              {p.isVideoOff ? <VideoOff style={{ width: '14px', height: '14px', color: '#ef4444' }} /> : <Video style={{ width: '14px', height: '14px', color: '#22c55e' }} />}
              {isHost && hostId !== p.userId && (
                <button
                  onClick={() => onKickUser(p.userId)}
                  title={`Remove ${p.userName}`}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: '4px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                >
                  <UserMinus style={{ width: '13px', height: '13px', color: '#ef4444' }} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantList;

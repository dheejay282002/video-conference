import React, { useEffect, useRef } from 'react';
import { MicOff } from 'lucide-react';

const VideoPlayer = ({ stream, userName, isMuted, isLocal, isVideoOff, userAvatar }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0f0f12', border: '1px solid rgba(31,31,35,0.6)', aspectRatio: '16/9' }}>
      {isVideoOff || !stream ? (
        <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#18181b' }}>
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(99,102,241,0.3)',
              }}
            />
          ) : (
            <div
              style={{
                width: '100px',
                height: '100px',
                background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              {userName?.charAt(0) || '?'}
            </div>
          )}
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
          style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }}
        />
      )}

      {/* Name badge */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(9,9,11,0.8)',
          backdropFilter: 'blur(12px)',
          padding: '6px 12px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid rgba(31,31,35,0.4)',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#f4f4f5' }}>
          {isLocal ? 'You' : userName}
        </span>
        {isMuted && (
          <MicOff style={{ width: '12px', height: '12px', color: '#ef4444' }} />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

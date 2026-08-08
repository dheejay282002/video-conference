import React, { useEffect, useRef } from 'react';

const VideoPlayer = ({ stream, userName, isMuted, isLocal, isVideoOff }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative bg-zoom-darker rounded-xl overflow-hidden aspect-video">
      {isVideoOff ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <div className="w-20 h-20 bg-zoom-blue rounded-full flex items-center justify-center text-2xl font-bold">
            {userName?.charAt(0) || '?'}
          </div>
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
      <div className="absolute bottom-2 left-2 bg-black/60 px-3 py-1 rounded-lg text-sm flex items-center gap-2">
        <span>{isLocal ? 'You' : userName}</span>
        {isMuted && (
          <span className="text-red-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99zM4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>
            </svg>
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;

import React from 'react';
import { Video } from 'lucide-react';

const Loading = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-zoom-dark flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Video className="w-12 h-12 text-zoom-blue animate-pulse" />
          <span className="text-3xl font-bold">VideoConf</span>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zoom-blue mx-auto mb-4"></div>
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
};

export default Loading;

import React from 'react';
import { X, MessageSquare, UserPlus, AlertTriangle, Info, CheckCircle } from 'lucide-react';

const Toast = ({ toasts, onDismiss }) => {
  if (!toasts.length) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle style={{ width: '16px', height: '16px', color: '#22c55e' }} />;
      case 'error': return <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
      case 'lobby': return <UserPlus style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'message': return <MessageSquare style={{ width: '16px', height: '16px', color: '#6366f1' }} />;
      default: return <Info style={{ width: '16px', height: '16px', color: '#6366f1' }} />;
    }
  };

  const getBg = (type) => {
    switch (type) {
      case 'success': return 'rgba(34,197,94,0.1)';
      case 'error': return 'rgba(239,68,68,0.1)';
      case 'lobby': return 'rgba(245,158,11,0.1)';
      case 'message': return 'rgba(99,102,241,0.1)';
      default: return 'rgba(99,102,241,0.1)';
    }
  };

  const getBorder = (type) => {
    switch (type) {
      case 'success': return '1px solid rgba(34,197,94,0.3)';
      case 'error': return '1px solid rgba(239,68,68,0.3)';
      case 'lobby': return '1px solid rgba(245,158,11,0.3)';
      case 'message': return '1px solid rgba(99,102,241,0.3)';
      default: return '1px solid rgba(99,102,241,0.3)';
    }
  };

  return (
    <div style={{ position: 'fixed', top: '72px', right: '16px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '360px' }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            borderRadius: '12px',
            background: getBg(toast.type),
            border: getBorder(toast.type),
            backdropFilter: 'blur(24px)',
            animation: 'slideInRight 0.3s ease-out',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{ flexShrink: 0 }}>{getIcon(toast.type)}</div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#e4e4e7', flex: 1, lineHeight: '1.4' }}>{toast.message}</p>
          <button
            onClick={() => onDismiss(toast.id)}
            style={{ padding: '4px', background: 'transparent', border: 'none', cursor: 'pointer', flexShrink: 0 }}
          >
            <X style={{ width: '12px', height: '12px', color: '#71717a' }} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;

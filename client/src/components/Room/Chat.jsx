import React, { useRef, useEffect, useState } from 'react';
import { Send, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Chat = ({ messages, onSendMessage, onClose }) => {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage({
      sender: user.displayName,
      senderId: user._id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    });
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col" style={{ background: '#09090b', borderLeft: '1px solid rgba(31,31,35,0.6)' }}>
      <div className="h-14 flex items-center justify-between px-4" style={{ borderBottom: '1px solid rgba(31,31,35,0.6)' }}>
        <h3 className="text-sm font-semibold">Chat</h3>
        {onClose && (
          <button onClick={onClose} style={{ padding: '6px', borderRadius: '8px' }} className="hover:bg-white/5">
            <X className="w-4 h-4" style={{ color: '#71717a' }} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p style={{ color: '#52525b' }} className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.senderId === user?._id ? 'items-end' : 'items-start'}`}>
            <span style={{ fontSize: '10px', color: '#71717a' }} className="font-medium px-1">{msg.sender}</span>
            <div
              style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: msg.senderId === user?._id ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: '14px',
                lineHeight: '1.5',
                background: msg.senderId === user?._id ? '#4f46e5' : '#18181b',
                color: msg.senderId === user?._id ? '#fff' : '#d4d4d8',
                border: msg.senderId === user?._id ? 'none' : '1px solid rgba(31,31,35,0.6)',
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-3" style={{ borderTop: '1px solid rgba(31,31,35,0.6)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-field"
            style={{ flex: 1, padding: '10px 16px', fontSize: '14px' }}
          />
          <button
            type="submit"
            style={{
              width: '40px',
              height: '40px',
              background: '#4f46e5',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              flexShrink: 0,
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;

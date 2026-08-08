import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Send, X } from 'lucide-react';

const ChatPanel = ({ roomCode, onClose }) => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    socket.emit('join-room', roomCode);
    socket.on('chat-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => { socket.off('chat-message'); };
  }, [socket, roomCode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const message = {
      sender: user.displayName,
      senderId: user._id,
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };
    socket.emit('chat-message', { roomCode, message });
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-surface-200/60 flex-shrink-0">
        <h3 className="text-sm font-semibold">Chat</h3>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-surface-100 rounded-lg transition-all">
            <X className="w-4 h-4 text-surface-500" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-surface-400 text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col gap-1 ${msg.senderId === user?._id ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] font-medium text-surface-400 px-1">{msg.sender}</span>
            <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
              msg.senderId === user?._id
                ? 'bg-brand-600 text-white rounded-br-md'
                : 'bg-surface-100 text-surface-800 rounded-bl-md border border-surface-200/60'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-surface-200/60 flex-shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface-50 border border-surface-200 text-surface-900 rounded-xl px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 placeholder:text-surface-400"
          />
          <button type="submit" className="w-10 h-10 bg-brand-600 hover:bg-brand-500 rounded-xl flex items-center justify-center transition-all text-white shadow-sm">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatPanel;

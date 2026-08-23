import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import type { InRoomChatMessage } from '../../types';

interface InRoomChatPanelProps {
  isOpen: boolean;
  messages: InRoomChatMessage[];
  currentUserId?: string;
  onClose: () => void;
  onSendMessage: (content: string) => void;
}

export const InRoomChatPanel: React.FC<InRoomChatPanelProps> = ({
  isOpen,
  messages,
  currentUserId,
  onClose,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  if (!isOpen) return null;

  return (
    <aside className="w-80 md:w-96 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800/90 flex flex-col h-full z-20 shadow-2xl transition-all duration-300">
      {/* Header */}
      <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-100 font-semibold text-sm">
          <MessageSquare className="w-4 h-4 text-purple-400" />
          <span>Trò chuyện trong phòng</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-4">
            <span className="text-3xl mb-2">💬</span>
            <p>Chưa có tin nhắn nào.</p>
            <p className="mt-1">Gửi tin nhắn để trao đổi cùng nhau!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div
                key={msg.id || index}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {!isMe && (
                  <span className="text-[11px] font-medium text-slate-400 mb-1 px-1">
                    {msg.senderName || 'Người học'}
                  </span>
                )}
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs md:text-sm break-words shadow-sm ${
                    isMe
                      ? 'bg-purple-600 text-white rounded-br-none'
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1">
                  {msg.sentAt
                    ? new Date(msg.sentAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
};

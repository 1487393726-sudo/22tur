'use client';

import React, { useState } from 'react';
import { LiveChat, ChatMessage } from '@/lib/user-portal/help-types';

interface LiveChatWidgetProps {
  chat?: LiveChat;
  onSendMessage?: (message: string) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export function LiveChatWidget({ chat, onSendMessage, onClose, isOpen = true }: LiveChatWidgetProps) {
  const [message, setMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message);
      setMessage('');
    }
  };

  const statusLabel = {
    waiting: '等待中...',
    active: '在线',
    closed: '已关闭',
  };

  const statusColor = {
    waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    closed: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  };

  if (!chat) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-4 text-center">
        <p className="text-gray-600 dark:text-gray-400">暂无在线客服</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">在线客服</h3>
          <span className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${statusColor[chat.status]}`}>
            {statusLabel[chat.status]}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            <p>开始对话</p>
          </div>
        ) : (
          chat.messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  msg.senderType === 'user'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-gray-300'
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      {chat.status !== 'closed' && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入消息..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-gray-300 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 text-white rounded-lg transition text-sm"
          >
            发送
          </button>
        </div>
      )}
    </div>
  );
}

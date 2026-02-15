'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isSent: boolean;
}

interface MessageThreadProps {
  messages: Message[];
  currentUserId?: string;
  recipientName: string;
  recipientAvatar?: string;
  isLoading?: boolean;
  onLoadMore?: () => void;
}

export function MessageThread({
  messages,
  currentUserId = 'me',
  recipientName,
  recipientAvatar,
  isLoading = false,
  onLoadMore,
}: MessageThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // 今天，显示时间
      return date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      // 昨天
      return '昨天 ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays < 7) {
      // 一周内，显示星期
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return weekdays[date.getDay()] + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else {
      // 更早，显示日期
      return date.toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
      }) + ' ' + date.toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 按日期分组消息
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateKey = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  // 自动滚动到底部
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      {isLoading && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(messageGroups).map(([date, groupMessages]) => (
          <div key={date}>
            {/* 日期分隔符 */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-white/10 rounded-full px-3 py-1">
                <span className="text-xs text-white/60">{date}</span>
              </div>
            </div>

            {/* 该日期的消息 */}
            <div className="space-y-4">
              {groupMessages.map((message, index) => {
                const isSent = message.senderId === currentUserId || message.isSent;
                const showAvatar = 
                  index === 0 || 
                  groupMessages[index - 1].senderId !== message.senderId;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`flex gap-2 max-w-[70%] ${
                        isSent ? 'flex-row-reverse' : 'flex-row'
                      }`}
                    >
                      {/* 头像 */}
                      {!isSent && showAvatar ? (
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={recipientAvatar} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                            {getInitials(recipientName)}
                          </AvatarFallback>
                        </Avatar>
                      ) : !isSent ? (
                        <div className="w-8 flex-shrink-0" />
                      ) : null}

                      {/* 消息气泡 */}
                      <div>
                        <div
                          className={`rounded-2xl px-4 py-2 ${
                            isSent
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <div
                          className={`flex items-center gap-1 mt-1 ${
                            isSent ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <p className="text-xs text-white/40">
                            {formatMessageTime(message.timestamp)}
                          </p>
                          {isSent && (
                            <span className="text-xs text-white/40">
                              {message.isRead ? '已读' : '已送达'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {messages.length === 0 && !isLoading && (
        <div className="flex items-center justify-center h-full">
          <p className="text-white/40 text-sm">暂无消息，开始聊天吧</p>
        </div>
      )}

      {/* 滚动锚点 */}
      <div ref={bottomRef} />
    </ScrollArea>
  );
}

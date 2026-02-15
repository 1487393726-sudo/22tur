'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isSent: boolean;
}

interface UseMessagesOptions {
  conversationId?: string;
  enabled?: boolean;
  refreshInterval?: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取消息失败');
  }
  return response.json();
};

export function useMessages({
  conversationId,
  enabled = true,
  refreshInterval = 5000, // 默认5秒刷新
}: UseMessagesOptions = {}) {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  // 使用 SWR 获取消息
  const { data, error, isLoading, mutate } = useSWR(
    enabled && conversationId ? `/api/messages?conversationId=${conversationId}` : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  // 更新本地消息
  useEffect(() => {
    if (data?.messages) {
      setLocalMessages(data.messages);
    }
  }, [data]);

  // 发送消息
  const sendMessage = async (content: string, attachments?: any[]) => {
    if (!conversationId) return;

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      senderName: '我',
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      isSent: true,
    };

    // 乐观更新
    setLocalMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          content,
          attachments,
        }),
      });

      if (!response.ok) {
        throw new Error('发送消息失败');
      }

      const result = await response.json();

      // 更新消息ID
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === optimisticMessage.id ? { ...msg, id: result.message.id } : msg
        )
      );

      // 重新验证数据
      mutate();

      return result.message;
    } catch (error) {
      // 发送失败，移除乐观更新的消息
      setLocalMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      throw error;
    }
  };

  // 标记消息已读
  const markAsRead = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('标记已读失败');
      }

      // 更新本地状态
      setLocalMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, isRead: true } : msg))
      );

      // 重新验证数据
      mutate();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 标记所有消息已读
  const markAllAsRead = async () => {
    if (!conversationId) return;

    try {
      const response = await fetch(`/api/messages/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ conversationId }),
      });

      if (!response.ok) {
        throw new Error('标记已读失败');
      }

      // 更新本地状态
      setLocalMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));

      // 重新验证数据
      mutate();
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  return {
    messages: localMessages,
    isLoading,
    error,
    sendMessage,
    markAsRead,
    markAllAsRead,
    refresh: mutate,
  };
}

'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';

interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface UseConversationsOptions {
  enabled?: boolean;
  refreshInterval?: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('获取会话列表失败');
  }
  return response.json();
};

export function useConversations({
  enabled = true,
  refreshInterval = 10000, // 默认10秒刷新
}: UseConversationsOptions = {}) {
  const [localConversations, setLocalConversations] = useState<Conversation[]>([]);

  // 使用 SWR 获取会话列表
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? '/api/messages/conversations' : null,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  // 更新本地会话
  useEffect(() => {
    if (data?.conversations) {
      setLocalConversations(data.conversations);
    }
  }, [data]);

  // 更新会话（发送消息后）
  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setLocalConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, ...updates }
          : conv
      )
    );
  };

  // 标记会话已读
  const markConversationAsRead = (conversationId: string) => {
    setLocalConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  // 获取总未读数
  const totalUnreadCount = localConversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );

  return {
    conversations: localConversations,
    isLoading,
    error,
    totalUnreadCount,
    updateConversation,
    markConversationAsRead,
    refresh: mutate,
  };
}

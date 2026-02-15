import useSWR from 'swr';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  unreadCount: number;
}

const fetcher = async (url: string): Promise<NotificationsResponse> => {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('获取通知失败');
  }
  
  return response.json();
};

export function useNotifications(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<NotificationsResponse>(
    `/api/notifications?limit=${limit}&page=1`,
    fetcher,
    {
      refreshInterval: 30000, // 每30秒自动刷新
      revalidateOnFocus: true, // 窗口获得焦点时重新验证
      revalidateOnReconnect: true, // 网络重连时重新验证
      dedupingInterval: 5000, // 5秒内的重复请求会被去重
    }
  );

  return {
    notifications: data?.notifications || [],
    unreadCount: data?.unreadCount || 0,
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate, // 用于手动刷新数据
  };
}

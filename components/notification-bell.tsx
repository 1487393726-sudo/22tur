'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, Calendar, AlertTriangle, Info, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';
import { useNotificationSound } from '@/hooks/use-notification-sound';

export function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const previousUnreadCount = useRef(0);

  // 使用 SWR 获取通知数据
  const { notifications, unreadCount, isLoading, mutate } = useNotifications(10);

  // 使用通知音效
  const { play: playSound } = useNotificationSound();

  // 监听未读数量变化，播放音效
  useEffect(() => {
    // 只在未读数量增加时播放音效
    if (previousUnreadCount.current > 0 && unreadCount > previousUnreadCount.current) {
      playSound();
    }
    previousUnreadCount.current = unreadCount;
  }, [unreadCount, playSound]);

  // 标记通知为已读并跳转
  const handleNotificationClick = async (notification: any) => {
    // 如果未读，标记为已读
    if (!notification.isRead) {
      try {
        await fetch(`/api/notifications/${notification.id}/read`, {
          method: 'PUT',
        });

        // 使用 mutate 更新缓存数据
        mutate();
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }

    // 关闭下拉菜单
    setIsOpen(false);

    // 跳转到相关页面
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    } else {
      router.push('/notifications');
    }
  };

  // 查看全部通知
  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  // 获取通知图标
  const getNotificationIcon = (type: string) => {
    const icons = {
      EVENT: Calendar,
      TASK: CheckCircle,
      INFO: Info,
      WARNING: AlertTriangle,
      REMINDER: Bell,
      SUCCESS: CheckCircle,
      ERROR: AlertTriangle,
      REPORT: MessageSquare,
    };

    const Icon = icons[type as keyof typeof icons] || Bell;
    return Icon;
  };

  // 获取通知图标颜色
  const getIconColor = (type: string, priority: string) => {
    if (priority === 'HIGH' || priority === 'URGENT') {
      return 'text-red-500';
    }

    const colors = {
      EVENT: 'text-blue-500',
      TASK: 'text-green-500',
      INFO: 'text-blue-500',
      WARNING: 'text-orange-500',
      REMINDER: 'text-white500',
      SUCCESS: 'text-green-500',
      ERROR: 'text-red-500',
      REPORT: 'text-white500',
    };

    return colors[type as keyof typeof colors] || 'text-gray-500';
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays}天前`;
    } else if (diffHours > 0) {
      return `${diffHours}小时前`;
    } else if (diffMins > 0) {
      return `${diffMins}分钟前`;
    } else {
      return '刚刚';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-white/10"
        >
          <Bell className="h-5 w-5 text-white" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 bg-gray-900 border-white/20"
      >
        <DropdownMenuLabel className="text-white flex items-center justify-between">
          <span>通知</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-red-500/20 text-red-400">
              {unreadCount} 条未读
            </Badge>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="bg-white/10" />

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-white/60 text-sm">加载中...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-white/20 mb-2" />
              <p className="text-white/60 text-sm">暂无通知</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const iconColor = getIconColor(notification.type, notification.priority);

                return (
                  <DropdownMenuItem
                    key={notification.id}
                    className={cn(
                      'flex items-start gap-3 p-3 cursor-pointer',
                      'hover:bg-white/10 focus:bg-white/10',
                      !notification.isRead && 'bg-white/5'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={cn('mt-0.5', iconColor)}>
                      <Icon className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm font-medium truncate',
                            notification.isRead ? 'text-white/70' : 'text-white'
                          )}
                        >
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-white/60 line-clamp-2 mt-1">
                        {notification.message}
                      </p>

                      <p className="text-xs text-white/40 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem
              className="text-center justify-center text-blue-400 hover:text-blue-300 hover:bg-white/10 cursor-pointer"
              onClick={handleViewAll}
            >
              查看全部通知
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Bell,
  CreditCard,
  CheckCircle,
  Mail,
  Send
} from 'lucide-react';

interface ExpiringSubscription {
  id: string;
  status: string;
  planType: string;
  amount: number;
  endDate: string;
  daysRemaining: number;
  autoRenew: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    userType: string;
  };
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    type: string;
    imageUrl?: string;
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  userId: string;
  userEmail: string;
  userName: string;
  serviceName: string;
  daysRemaining: number;
}

export default function SubscriptionRenewal() {
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<ExpiringSubscription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);
  const [daysFilter, setDaysFilter] = useState('7');
  const [activeTab, setActiveTab] = useState('expiring');

  useEffect(() => {
    fetchExpiringSubscriptions();
    fetchNotifications();
  }, [daysFilter]);

  const fetchExpiringSubscriptions = async () => {
    try {
      const response = await fetch(`/api/subscription/renew?days=${daysFilter}`);
      if (response.ok) {
        const data = await response.json();
        // 确保返回的是数组
        setExpiringSubscriptions(Array.isArray(data) ? data : []);
      } else {
        setExpiringSubscriptions([]);
      }
    } catch (error) {
      console.error('获取到期订阅失败:', error);
      setExpiringSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/subscription/notifications');
      if (response.ok) {
        const data = await response.json();
        // 确保返回的是数组
        setNotifications(Array.isArray(data) ? data : []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('获取通知列表失败:', error);
      setNotifications([]);
    }
  };

  const handleRenewal = async (subscriptionId: string, userId: string, planType: string) => {
    try {
      const response = await fetch('/api/subscription/renew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          userId,
          planType
        }),
      });

      if (response.ok) {
        fetchExpiringSubscriptions();
        fetchNotifications();
        // 显示成功消息
        alert('续费成功！');
      } else {
        const error = await response.json();
        alert(`续费失败: ${error.error}`);
      }
    } catch (error) {
      console.error('续费失败:', error);
      alert('续费失败，请重试');
    }
  };

  const sendReminders = async () => {
    try {
      setSendingReminders(true);
      const response = await fetch('/api/subscription/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'EXPIRY_REMINDER',
          days: parseInt(daysFilter),
          manualTrigger: true
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`成功发送 ${result.count} 条提醒通知！`);
        fetchNotifications();
      } else {
        const error = await response.json();
        alert(`发送提醒失败: ${error.error}`);
      }
    } catch (error) {
      console.error('发送提醒失败:', error);
      alert('发送提醒失败，请重试');
    } finally {
      setSendingReminders(false);
    }
  };

  const getUrgencyLevel = (daysRemaining: number) => {
    if (daysRemaining <= 0) return { level: 'critical', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' };
    if (daysRemaining <= 3) return { level: 'high', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' };
    if (daysRemaining <= 7) return { level: 'medium', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' };
    return { level: 'low', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPlanTypeLabel = (planType: string) => {
    return planType === 'MONTHLY' ? '月付' : '年付';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 快速统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">即将到期</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {expiringSubscriptions.filter(s => s.daysRemaining > 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已经过期</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {expiringSubscriptions.filter(s => s.daysRemaining <= 0).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">自动续费</CardTitle>
            <RefreshCw className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {expiringSubscriptions.filter(s => s.autoRenew).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已发送通知</CardTitle>
            <Bell className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {notifications.filter(n => n.type === 'REMINDER').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 控制面板 */}
      <Card>
        <CardHeader>
          <div className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>订阅管理</CardTitle>
              <CardDescription>管理即将到期的订阅和发送提醒通知</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={daysFilter} onValueChange={setDaysFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3天内到期</SelectItem>
                  <SelectItem value="7">7天内到期</SelectItem>
                  <SelectItem value="14">14天内到期</SelectItem>
                  <SelectItem value="30">30天内到期</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={sendReminders} 
                disabled={sendingReminders}
              >
                {sendingReminders ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    发送中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    发送提醒
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expiring">即将到期的订阅</TabsTrigger>
              <TabsTrigger value="notifications">通知记录</TabsTrigger>
            </TabsList>

            <TabsContent value="expiring" className="mt-4">
              {expiringSubscriptions.length > 0 ? (
                <div className="space-y-4">
                  {expiringSubscriptions.map((subscription) => {
                    const urgency = getUrgencyLevel(subscription.daysRemaining);
                    const isExpired = subscription.daysRemaining <= 0;
                    
                    return (
                      <div 
                        key={subscription.id} 
                        className={`border rounded-lg p-6 ${urgency.bg} ${urgency.border}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-semibold">{subscription.service.title}</h3>
                              <Badge className={getStatusColor(subscription.status)}>
                                {isExpired ? '已过期' : subscription.status}
                              </Badge>
                              <Badge variant="outline">
                                {getPlanTypeLabel(subscription.planType)}
                              </Badge>
                              {subscription.autoRenew && (
                                <Badge variant="secondary">
                                  <RefreshCw className="h-3 w-3 mr-1" />
                                  自动续费
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <span className="text-sm text-gray-500">用户信息:</span>
                                <div className="font-medium">
                                  {subscription.user.firstName} {subscription.user.lastName} ({subscription.user.username})
                                </div>
                                <div className="text-sm text-gray-600">{subscription.user.email}</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">到期时间:</span>
                                <div className={`font-medium ${urgency.color}`}>
                                  {new Date(subscription.endDate).toLocaleDateString()}
                                  {isExpired ? ' (已过期)' : ` (剩余 ${subscription.daysRemaining} 天)`}
                                </div>
                                <div className="text-sm text-gray-600">
                                  订阅金额: ¥{subscription.amount}
                                </div>
                              </div>
                            </div>
                            
                            {isExpired && (
                              <Alert className="mb-4 border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                  该订阅已过期，请立即处理续费事宜。
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                          
                          <div className="text-right ml-6">
                            <div className="text-2xl font-bold mb-2">¥{subscription.amount}</div>
                            <div className="text-sm text-gray-500 mb-4">
                              {getPlanTypeLabel(subscription.planType)}
                            </div>
                            <div className="space-y-2">
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleRenewal(
                                  subscription.id, 
                                  subscription.user.id, 
                                  subscription.planType
                                )}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                续费
                              </Button>
                              <Button variant="outline" size="sm" className="w-full">
                                <Mail className="h-4 w-4 mr-2" />
                                发送邮件
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">没有即将到期的订阅</h3>
                  <p className="text-gray-500">在选定的时间范围内没有即将到期的订阅</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="notifications" className="mt-4">
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold">{notification.title}</h4>
                            <Badge variant="outline">{notification.type}</Badge>
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">发送给:</span>
                              <div className="font-medium">{notification.userName}</div>
                              <div className="text-gray-600">{notification.userEmail}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">服务:</span>
                              <div className="font-medium">{notification.serviceName}</div>
                              <div className="text-gray-600">剩余 {notification.daysRemaining} 天</div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Button variant="outline" size="sm">
                            <Mail className="h-4 w-4 mr-2" />
                            重新发送
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知记录</h3>
                  <p className="text-gray-500">还没有发送任何提醒通知</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
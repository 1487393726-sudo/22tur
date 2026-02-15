'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  CreditCard, 
  TrendingUp,
  RefreshCw,
  Package,
  Gift
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: 'SERVICE' | 'INVESTMENT';
  imageUrl?: string;
  features?: string[];
  duration?: string;
  deliveryTime?: string;
}

interface Subscription {
  id: string;
  status: string;
  planType: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  lastPaymentAt: string;
  nextPaymentAt: string;
  service: Service;
  daysRemaining?: number;
  progress?: number;
}

interface Purchase {
  id: string;
  status: string;
  purchaseDate: string;
  completedAt?: string;
  amount: number;
  paymentMethod?: string;
  service: Service;
  notes?: string;
}

interface Investment {
  id: string;
  status: string;
  amount: number;
  returnRate?: number;
  expectedReturn?: number;
  investmentDate: string;
  maturityDate?: string;
  completedAt?: string;
  service: Service;
  currentValue?: number;
  profit?: number;
}

interface UserServiceViewProps {
  userId: string;
}

export default function UserServiceView({ userId }: UserServiceViewProps) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscriptions');

  useEffect(() => {
    if (userId) {
      fetchUserServices();
    }
  }, [userId]);

  const fetchUserServices = async () => {
    try {
      setLoading(true);
      
      const [subscriptionsRes, purchasesRes, servicesRes] = await Promise.all([
        fetch(`/api/subscription/subscriptions?userId=${userId}`),
        fetch(`/api/subscription/purchase?userId=${userId}`),
        fetch('/api/subscription/services?status=ACTIVE')
      ]);

      if (subscriptionsRes.ok && purchasesRes.ok && servicesRes.ok) {
        const subscriptionsData = await subscriptionsRes.json();
        const purchasesData = await purchasesRes.json();
        const servicesData = await servicesRes.json();

        // 确保数据是数组
        const subscriptionsArray = Array.isArray(subscriptionsData) ? subscriptionsData : [];
        const purchasesArray = Array.isArray(purchasesData) ? purchasesData : [];
        const servicesArray = Array.isArray(servicesData) ? servicesData : [];

        // 处理订阅数据，计算剩余天数和进度
        const processedSubscriptions = subscriptionsArray.map((sub: any) => {
          const now = new Date();
          const endDate = new Date(sub.endDate);
          const startDate = new Date(sub.startDate);
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const progress = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));

          return {
            ...sub,
            daysRemaining: Math.max(0, daysRemaining),
            progress
          };
        });

        // 处理购买数据
        const processedPurchases = purchasesArray.filter((purchase: any) => 
          purchase.service?.type === 'SERVICE'
        );

        // 处理投资数据
        const processedInvestments = purchasesArray.filter((purchase: any) => 
          purchase.service?.type === 'INVESTMENT'
        ).map((inv: any) => {
          // 模拟计算当前价值和收益
          const currentValue = inv.amount * 1.05; // 假设5%的收益率
          const profit = currentValue - inv.amount;

          return {
            ...inv,
            currentValue,
            profit
          };
        });

        setSubscriptions(processedSubscriptions);
        setPurchases(processedPurchases);
        setInvestments(processedInvestments);
        setAvailableServices(servicesData);
      }
    } catch (error) {
      console.error('获取用户服务失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      PROCESSING: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: '活跃',
      EXPIRED: '已过期',
      CANCELLED: '已取消',
      PENDING: '待处理',
      COMPLETED: '已完成',
      PROCESSING: '处理中'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPlanTypeLabel = (planType: string) => {
    return planType === 'MONTHLY' ? '月付' : '年付';
  };

  const isExpiringSoon = (daysRemaining: number | undefined) => {
    return daysRemaining !== undefined && daysRemaining > 0 && daysRemaining <= 7;
  };

  const getUrgencyAlert = (subscription: Subscription) => {
    if (subscription.status !== 'ACTIVE') return null;
    const daysRemaining = subscription.daysRemaining ?? 0;
    if (daysRemaining <= 0) {
      return (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            您的 <strong>{subscription.service.title}</strong> 已于 {new Date(subscription.endDate).toLocaleDateString()} 过期。
            请立即续费以继续使用服务。
          </AlertDescription>
        </Alert>
      );
    }
    if (isExpiringSoon(daysRemaining)) {
      return (
        <Alert className="mb-4 border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            您的 <strong>{subscription.service.title}</strong> 将在 {daysRemaining} 天后过期。
            {subscription.autoRenew ? ' 系统将自动续费。' : ' 请及时续费。'}
          </AlertDescription>
        </Alert>
      );
    }
    return null;
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
            <CardTitle className="text-sm font-medium">活跃订阅</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">服务购买</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{purchases.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">投资项目</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总支出</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{[
                ...subscriptions.filter(s => s.status === 'ACTIVE'),
                ...purchases,
                ...investments
              ].reduce((sum, item) => sum + (item.amount || 0), 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 紧急提醒 */}
      {subscriptions
        .filter(s => s.status === 'ACTIVE')
        .some(s => (s.daysRemaining ?? 0) <= 7 || (s.daysRemaining ?? 0) <= 0) && (
        <div className="space-y-2">
          {subscriptions
            .filter(s => s.status === 'ACTIVE')
            .map(getUrgencyAlert)}
        </div>
      )}

      {/* 服务详情 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="subscriptions">订阅服务</TabsTrigger>
          <TabsTrigger value="purchases">购买记录</TabsTrigger>
          <TabsTrigger value="investments">投资项目</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>订阅服务</CardTitle>
              <CardDescription>您当前订阅的按月或按年付费服务</CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{subscription.service.title}</h3>
                            <Badge className={getStatusColor(subscription.status)}>
                              {getStatusLabel(subscription.status)}
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
                          
                          <p className="text-gray-600 mb-3">{subscription.service.description}</p>
                          
                          {subscription.service.features && (
                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-2">服务特性:</h4>
                              <div className="flex flex-wrap gap-2">
                                {subscription.service.features.map((feature, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {feature}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">开始时间:</span>
                              <div className="font-medium">
                                {new Date(subscription.startDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">结束时间:</span>
                              <div className="font-medium">
                                {new Date(subscription.endDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">剩余天数:</span>
                              <div className={`font-medium ${(subscription.daysRemaining ?? 0) <= 7 ? 'text-red-600' : ''}`}>
                                {(subscription.daysRemaining ?? 0) > 0 ? `${subscription.daysRemaining} 天` : '已过期'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">下次付款:</span>
                              <div className="font-medium">
                                ¥{subscription.amount} - {new Date(subscription.nextPaymentAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {subscription.status === 'ACTIVE' && (
                            <div className="mt-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-500">订阅进度</span>
                                <span className="text-sm font-medium">{subscription.progress?.toFixed(1)}%</span>
                              </div>
                              <Progress value={subscription.progress || 0} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold mb-2">¥{subscription.amount}</div>
                          <div className="text-sm text-gray-500 mb-4">
                            {getPlanTypeLabel(subscription.planType)}
                          </div>
                          <div className="space-y-2">
                            {subscription.status === 'ACTIVE' && (subscription.daysRemaining ?? 0) <= 7 && (
                              <Button size="sm" className="w-full">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                立即续费
                              </Button>
                            )}
                            <Button variant="outline" size="sm" className="w-full">
                              查看详情
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订阅服务</h3>
                  <p className="text-gray-500 mb-4">您还没有订阅任何服务</p>
                  <Button>浏览服务</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>购买记录</CardTitle>
              <CardDescription>您购买的一次性服务和产品</CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length > 0 ? (
                <div className="space-y-4">
                  {purchases.map((purchase) => (
                    <div key={purchase.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{purchase.service.title}</h3>
                            <Badge className={getStatusColor(purchase.status)}>
                              {getStatusLabel(purchase.status)}
                            </Badge>
                            <Badge variant="outline">{purchase.service.category}</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{purchase.service.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">购买时间:</span>
                              <div className="font-medium">
                                {new Date(purchase.purchaseDate).toLocaleDateString()}
                              </div>
                            </div>
                            {purchase.completedAt && (
                              <div>
                                <span className="text-gray-500">完成时间:</span>
                                <div className="font-medium">
                                  {new Date(purchase.completedAt).toLocaleDateString()}
                                </div>
                              </div>
                            )}
                            {purchase.paymentMethod && (
                              <div>
                                <span className="text-gray-500">支付方式:</span>
                                <div className="font-medium">{purchase.paymentMethod}</div>
                              </div>
                            )}
                          </div>
                          
                          {purchase.notes && (
                            <div className="mt-3">
                              <span className="text-gray-500 text-sm">备注:</span>
                              <p className="text-sm mt-1">{purchase.notes}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-2xl font-bold mb-2">¥{purchase.amount}</div>
                          <div className="text-sm text-gray-500 mb-4">
                            一次性购买
                          </div>
                          <Button variant="outline" size="sm">
                            查看详情
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无购买记录</h3>
                  <p className="text-gray-500 mb-4">您还没有购买任何服务或产品</p>
                  <Button>浏览服务</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investments" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>投资项目</CardTitle>
              <CardDescription>您的投资产品和收益情况</CardDescription>
            </CardHeader>
            <CardContent>
              {investments.length > 0 ? (
                <div className="space-y-4">
                  {investments.map((investment) => (
                    <div key={investment.id} className="border rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{investment.service.title}</h3>
                            <Badge className={getStatusColor(investment.status)}>
                              {getStatusLabel(investment.status)}
                            </Badge>
                            <Badge variant="outline">投资产品</Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{investment.service.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">投资金额:</span>
                              <div className="font-medium">¥{investment.amount}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">当前价值:</span>
                              <div className="font-medium text-green-600">
                                ¥{investment.currentValue?.toFixed(2)}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">预期收益:</span>
                              <div className="font-medium">
                                {investment.expectedReturn ? `¥${investment.expectedReturn}` : 'N/A'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500">投资时间:</span>
                              <div className="font-medium">
                                {new Date(investment.investmentDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {investment.maturityDate && (
                            <div className="mt-3">
                              <span className="text-gray-500 text-sm">到期时间:</span>
                              <div className="font-medium">
                                {new Date(investment.maturityDate).toLocaleDateString()}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right ml-6">
                          <div className="text-lg font-bold mb-2 text-green-600">
                            +¥{investment.profit?.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 mb-4">
                            收益率: {((investment.profit || 0) / investment.amount * 100).toFixed(2)}%
                          </div>
                          <Button variant="outline" size="sm">
                            查看详情
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无投资项目</h3>
                  <p className="text-gray-500 mb-4">您还没有进行任何投资</p>
                  <Button>浏览投资产品</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
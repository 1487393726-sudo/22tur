'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Calendar, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  planName: string;
  planType: string;
  status: string;
  startDate: string;
  endDate: string;
  amount: number;
  autoRenew: boolean;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: string;
  date: string;
  dueDate: string;
}

export default function BillingTab() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscription');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      const [subRes, paymentRes, invoiceRes] = await Promise.all([
        fetch('/api/billing/subscription'),
        fetch('/api/billing/payment-methods'),
        fetch('/api/billing/invoices'),
      ]);

      if (subRes.ok) {
        const data = await subRes.json();
        setSubscription(data);
      }

      if (paymentRes.ok) {
        const data = await paymentRes.json();
        setPaymentMethods(data);
      }

      if (invoiceRes.ok) {
        const data = await invoiceRes.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Failed to fetch billing data:', error);
      toast.error('加载账单信息失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgradePlan = () => {
    toast.info('跳转到升级页面');
    // TODO: 实现升级逻辑
  };

  const handleAddPaymentMethod = () => {
    toast.info('打开添加支付方式对话框');
    // TODO: 实现添加支付方式逻辑
  };

  const handleSetDefaultPayment = async (methodId: string) => {
    try {
      const response = await fetch(`/api/billing/payment-methods/${methodId}/default`, {
        method: 'PUT',
      });

      if (response.ok) {
        toast.success('已设置为默认支付方式');
        fetchBillingData();
      }
    } catch (error) {
      toast.error('设置失败');
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/billing/payment-methods/${methodId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('支付方式已删除');
        fetchBillingData();
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-white/70">
        加载中...
      </div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 bg-white/10">
        <TabsTrigger 
          value="subscription"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
        >
          <Calendar className="w-4 h-4 mr-2" />
          当前套餐
        </TabsTrigger>
        <TabsTrigger 
          value="payment"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
        >
          <CreditCard className="w-4 h-4 mr-2" />
          支付方式
        </TabsTrigger>
        <TabsTrigger 
          value="invoices"
          className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          账单历史
        </TabsTrigger>
      </TabsList>

      {/* 当前套餐 */}
      <TabsContent value="subscription" className="space-y-4">
        {subscription ? (
          <>
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">当前套餐</CardTitle>
                <CardDescription className="text-white/70">
                  您的订阅信息和续费详情
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 套餐信息 */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {subscription.planName}
                        </h3>
                        <Badge 
                          variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}
                          className="mb-4"
                        >
                          {subscription.status === 'ACTIVE' ? '活跃' : '已取消'}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-white">
                          ¥{subscription.amount}
                        </div>
                        <div className="text-sm text-white/70">每月</div>
                      </div>
                    </div>
                    <div className="space-y-3 text-sm text-white/70">
                      <div className="flex justify-between">
                        <span>开始日期:</span>
                        <span className="text-white">
                          {new Date(subscription.startDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>到期日期:</span>
                        <span className="text-white">
                          {new Date(subscription.endDate).toLocaleDateString('zh-CN')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>自动续费:</span>
                        <span className="text-white">
                          {subscription.autoRenew ? '已启用' : '已禁用'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 套餐周期 */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">套餐周期</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-white/70 mb-2">下次计费日期</div>
                        <div className="text-2xl font-bold text-white">
                          {new Date(subscription.endDate).toLocaleDateString('zh-CN')}
                        </div>
                      </div>
                      <div className="pt-4 border-t border-white/10">
                        <div className="text-sm text-white/70 mb-3">
                          {subscription.status === 'ACTIVE' 
                            ? '您的套餐将在到期日期自动续费'
                            : '您的套餐已取消，将在到期日期停止服务'
                          }
                        </div>
                        <Button 
                          onClick={handleUpgradePlan}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          升级套餐
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 查看历史账单 */}
                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">账单历史</h3>
                      <p className="text-sm text-white/70">查看您的所有账单记录</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => setActiveTab('invoices')}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      查看历史账单
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="bg-white/5 border-white/10">
            <CardContent className="py-12 text-center text-white/70">
              暂无订阅信息
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* 支付方式 */}
      <TabsContent value="payment" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">支付方式</CardTitle>
            <CardDescription className="text-white/70">
              管理您的支付方式
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentMethods.length > 0 ? (
              <>
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-8 h-8 text-white400" />
                      <div>
                        <div className="text-white font-medium">
                          {method.type} •••• {method.last4}
                        </div>
                        <div className="text-sm text-white/70">
                          有效期: {method.expiryMonth}/{method.expiryYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          默认
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetDefaultPayment(method.id)}
                        disabled={method.isDefault}
                        className="text-white hover:bg-white/10"
                      >
                        设为默认
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-400 hover:bg-red-400/10"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                ))}
                <Button 
                  onClick={handleAddPaymentMethod}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  添加支付方式
                </Button>
              </>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/70 mb-4">暂无支付方式</p>
                <Button 
                  onClick={handleAddPaymentMethod}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  添加支付方式
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      {/* 账单历史 */}
      <TabsContent value="invoices" className="space-y-4">
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">账单历史</CardTitle>
            <CardDescription className="text-white/70">
              查看您的所有账单记录
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="bg-white/5 rounded-lg p-4 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="text-white font-medium mb-1">
                        {invoice.number}
                      </div>
                      <div className="text-sm text-white/70">
                        {new Date(invoice.date).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium mb-1">
                        ¥{invoice.amount}
                      </div>
                      <Badge 
                        variant={invoice.status === 'PAID' ? 'default' : 'secondary'}
                      >
                        {invoice.status === 'PAID' ? '已支付' : '待支付'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-white/70">
                暂无账单记录
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

'use client';

/**
 * Payment Records Page
 * 支付记录管理页面
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  CreditCard,
  Search,
  RefreshCw,
  Eye,
  RotateCcw,
  Download,
  Filter,
  Calendar,
} from 'lucide-react';

// 支付记录类型
interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  provider: 'alipay' | 'wechat';
  amount: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIAL_REFUNDED';
  tradeNo?: string;
  subject: string;
  createdAt: string;
  paidAt?: string;
  refundedAmount: number;
}

// 模拟数据
const mockPayments: PaymentRecord[] = [
  {
    id: 'PAY001',
    orderId: 'ORD20260111001',
    userId: 'user001',
    userName: '张三',
    provider: 'alipay',
    amount: 29900,
    status: 'PAID',
    tradeNo: '2026011122001001',
    subject: '高级会员订阅 - 年度',
    createdAt: '2026-01-11T10:30:00',
    paidAt: '2026-01-11T10:31:25',
    refundedAmount: 0,
  },
  {
    id: 'PAY002',
    orderId: 'ORD20260111002',
    userId: 'user002',
    userName: '李四',
    provider: 'wechat',
    amount: 9900,
    status: 'PENDING',
    subject: '基础会员订阅 - 月度',
    createdAt: '2026-01-11T11:15:00',
    refundedAmount: 0,
  },
  {
    id: 'PAY003',
    orderId: 'ORD20260110001',
    userId: 'user003',
    userName: '王五',
    provider: 'alipay',
    amount: 59900,
    status: 'REFUNDED',
    tradeNo: '2026011022001002',
    subject: '企业版订阅 - 年度',
    createdAt: '2026-01-10T09:00:00',
    paidAt: '2026-01-10T09:02:15',
    refundedAmount: 59900,
  },
  {
    id: 'PAY004',
    orderId: 'ORD20260110002',
    userId: 'user004',
    userName: '赵六',
    provider: 'wechat',
    amount: 19900,
    status: 'PARTIAL_REFUNDED',
    tradeNo: '4200001234567890',
    subject: '专业版订阅 - 季度',
    createdAt: '2026-01-10T14:30:00',
    paidAt: '2026-01-10T14:32:00',
    refundedAmount: 9900,
  },
  {
    id: 'PAY005',
    orderId: 'ORD20260109001',
    userId: 'user005',
    userName: '钱七',
    provider: 'alipay',
    amount: 4900,
    status: 'FAILED',
    subject: '基础会员订阅 - 月度',
    createdAt: '2026-01-09T16:45:00',
    refundedAmount: 0,
  },
];

// 状态颜色映射
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
  REFUNDED: 'bg-purple-100 text-white',
  PARTIAL_REFUNDED: 'bg-blue-100 text-blue-800',
};

// 状态文本映射
const statusText: Record<string, string> = {
  PENDING: '待支付',
  PAID: '已支付',
  FAILED: '支付失败',
  CANCELLED: '已取消',
  REFUNDED: '已退款',
  PARTIAL_REFUNDED: '部分退款',
};

// 支付方式文本
const providerText: Record<string, string> = {
  alipay: '支付宝',
  wechat: '微信支付',
};

export default function PaymentsPage() {
  const [payments] = useState<PaymentRecord[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  // 格式化金额
  const formatAmount = (amount: number) => {
    return `¥${(amount / 100).toFixed(2)}`;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN');
  };

  // 过滤支付记录
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.tradeNo?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesProvider = providerFilter === 'all' || payment.provider === providerFilter;
    return matchesSearch && matchesStatus && matchesProvider;
  });

  // 查看详情
  const viewDetail = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setShowDetailDialog(true);
  };

  // 发起退款
  const initiateRefund = (payment: PaymentRecord) => {
    setSelectedPayment(payment);
    setRefundAmount(((payment.amount - payment.refundedAmount) / 100).toFixed(2));
    setRefundReason('');
    setShowRefundDialog(true);
  };

  // 提交退款
  const submitRefund = async () => {
    // TODO: 调用退款 API
    console.log('Refund:', {
      paymentId: selectedPayment?.id,
      amount: parseFloat(refundAmount) * 100,
      reason: refundReason,
    });
    setShowRefundDialog(false);
  };

  // 导出数据
  const exportData = () => {
    // TODO: 实现导出功能
    console.log('Export payments');
  };

  // 计算统计数据
  const stats = {
    total: payments.length,
    paid: payments.filter((p) => p.status === 'PAID').length,
    pending: payments.filter((p) => p.status === 'PENDING').length,
    totalAmount: payments
      .filter((p) => p.status === 'PAID' || p.status === 'PARTIAL_REFUNDED')
      .reduce((sum, p) => sum + p.amount - p.refundedAmount, 0),
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 theme-gradient-text">
            <CreditCard className="h-6 w-6" />
            支付记录
          </h1>
          <p className="text-muted-foreground mt-1">
            查看和管理所有支付交易记录
          </p>
        </div>
        <Button variant="outline" onClick={exportData}>
          <Download className="h-4 w-4 mr-2" />
          导出数据
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>总交易数</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>已支付</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.paid}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>待支付</CardDescription>
            <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>实收金额</CardDescription>
            <CardTitle className="text-2xl">{formatAmount(stats.totalAmount)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* 筛选和搜索 */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索订单号、用户名或交易号..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="PENDING">待支付</SelectItem>
                  <SelectItem value="PAID">已支付</SelectItem>
                  <SelectItem value="FAILED">支付失败</SelectItem>
                  <SelectItem value="REFUNDED">已退款</SelectItem>
                  <SelectItem value="PARTIAL_REFUNDED">部分退款</SelectItem>
                </SelectContent>
              </Select>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="w-[140px]">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="支付方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部方式</SelectItem>
                  <SelectItem value="alipay">支付宝</SelectItem>
                  <SelectItem value="wechat">微信支付</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 支付记录表格 */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>订单号</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>商品</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono text-sm">{payment.orderId}</TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{payment.subject}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{providerText[payment.provider]}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatAmount(payment.amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[payment.status]}>
                      {statusText[payment.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => viewDetail(payment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {(payment.status === 'PAID' || payment.status === 'PARTIAL_REFUNDED') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => initiateRefund(payment)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>支付详情</DialogTitle>
            <DialogDescription>订单号: {selectedPayment?.orderId}</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">支付 ID</Label>
                  <p className="font-mono">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">交易号</Label>
                  <p className="font-mono">{selectedPayment.tradeNo || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">用户</Label>
                  <p>{selectedPayment.userName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">支付方式</Label>
                  <p>{providerText[selectedPayment.provider]}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">金额</Label>
                  <p className="font-medium">{formatAmount(selectedPayment.amount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">已退款</Label>
                  <p>{formatAmount(selectedPayment.refundedAmount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">状态</Label>
                  <Badge className={statusColors[selectedPayment.status]}>
                    {statusText[selectedPayment.status]}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">支付时间</Label>
                  <p>{selectedPayment.paidAt ? formatDate(selectedPayment.paidAt) : '-'}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">商品</Label>
                <p>{selectedPayment.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">创建时间</Label>
                <p>{formatDate(selectedPayment.createdAt)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 退款对话框 */}
      <Dialog open={showRefundDialog} onOpenChange={setShowRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>发起退款</DialogTitle>
            <DialogDescription>
              订单号: {selectedPayment?.orderId}
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>原支付金额</span>
                  <span className="font-medium">{formatAmount(selectedPayment.amount)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>已退款金额</span>
                  <span>{formatAmount(selectedPayment.refundedAmount)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1 pt-1 border-t">
                  <span>可退款金额</span>
                  <span className="font-medium text-green-600">
                    {formatAmount(selectedPayment.amount - selectedPayment.refundedAmount)}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-amount">退款金额 (元)</Label>
                <Input
                  id="refund-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={(selectedPayment.amount - selectedPayment.refundedAmount) / 100}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refund-reason">退款原因</Label>
                <Textarea
                  id="refund-reason"
                  placeholder="请输入退款原因"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRefundDialog(false)}>
              取消
            </Button>
            <Button onClick={submitRefund} disabled={!refundAmount || !refundReason}>
              确认退款
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

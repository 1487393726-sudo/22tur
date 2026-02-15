'use client';

/**
 * Admin Print Quote Detail and Submission Page
 * 管理员询价详情和报价提交页面
 * Requirements: 2.2, 2.3, 2.4
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertCircle,
  FileText,
  Download,
  ArrowLeft,
  Send,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { QUOTE_STATUS_LABELS, PRODUCT_TYPE_LABELS, QuoteStatus, ProductType } from '@/lib/printing/types';

interface PrintQuote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customer?: {
    id: string;
    username: string;
    email: string;
    phone?: string;
  };
  status: QuoteStatus;
  productType: ProductType;
  quantity: number;
  size: string;
  customWidth?: number | null;
  customHeight?: number | null;
  material?: string | null;
  finishing?: string | null;
  colorMode?: string | null;
  sides?: string | null;
  requirements?: string | null;
  deliveryAddress?: string | null;
  expectedDate?: string | null;
  unitPrice?: number | null;
  totalPrice?: number | null;
  priceBreakdown?: string | null;
  validUntil?: string | null;
  adminNote?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  quotedAt?: string | null;
  files?: Array<{
    id: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
  }>;
}

const statusColors: Record<QuoteStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  quoted: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  revised: 'bg-orange-100 text-orange-800',
  expired: 'bg-gray-100 text-gray-800',
  ordered: 'bg-purple-100 text-white',
};

export default function AdminQuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<PrintQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  // 报价表单状态
  const [unitPrice, setUnitPrice] = useState('');
  const [totalPrice, setTotalPrice] = useState('');
  const [priceBreakdown, setPriceBreakdown] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 拒绝表单状态
  const [rejectionReason, setRejectionReason] = useState('');

  // 加载询价详情
  useEffect(() => {
    loadQuote();
  }, [quoteId]);

  const loadQuote = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/print-quotes/${quoteId}`);
      if (!response.ok) throw new Error('Failed to load quote');

      const data = await response.json();
      setQuote(data);

      // 如果已报价，填充表单
      if (data.status === 'quoted' || data.status === 'accepted') {
        setUnitPrice((data.unitPrice / 100).toFixed(2));
        setTotalPrice((data.totalPrice / 100).toFixed(2));
        setValidUntil(data.validUntil?.split('T')[0] || '');
        setAdminNote(data.adminNote || '');
        if (data.priceBreakdown) {
          setPriceBreakdown(JSON.stringify(JSON.parse(data.priceBreakdown), null, 2));
        }
      }
    } catch (error) {
      console.error('Error loading quote:', error);
    } finally {
      setLoading(false);
    }
  };

  // 验证报价表单
  const validateQuoteForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!unitPrice || parseFloat(unitPrice) < 0) {
      newErrors.unitPrice = '单价必须大于等于0';
    }

    if (!totalPrice || parseFloat(totalPrice) < 0) {
      newErrors.totalPrice = '总价必须大于等于0';
    }

    if (!validUntil) {
      newErrors.validUntil = '报价有效期为必填项';
    } else {
      const validDate = new Date(validUntil);
      if (validDate <= new Date()) {
        newErrors.validUntil = '报价有效期必须是未来时间';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交报价
  const handleSubmitQuote = async () => {
    if (!validateQuoteForm()) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/print-quotes/${quoteId}/quote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unitPrice: Math.round(parseFloat(unitPrice) * 100),
          totalPrice: Math.round(parseFloat(totalPrice) * 100),
          priceBreakdown: priceBreakdown ? JSON.parse(priceBreakdown) : undefined,
          validUntil,
          adminNote,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit quote');
      }

      // 刷新数据
      await loadQuote();
      alert('报价提交成功');
    } catch (error) {
      console.error('Error submitting quote:', error);
      alert(`提交失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 拒绝询价
  const handleRejectQuote = async () => {
    if (!rejectionReason.trim()) {
      alert('拒绝原因不能为空');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/admin/print-quotes/${quoteId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject quote');
      }

      setShowRejectDialog(false);
      await loadQuote();
      alert('询价已拒绝');
    } catch (error) {
      console.error('Error rejecting quote:', error);
      alert(`拒绝失败: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 格式化日期
  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex justify-center py-12">
        <div className="text-muted-foreground">询价不存在</div>
      </div>
    );
  }

  const canSubmitQuote = quote.status === 'pending' || quote.status === 'revised';
  const canReject = quote.status === 'pending' || quote.status === 'revised';

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 返回按钮和标题 */}
      <div className="flex items-center gap-4">
        <Link href="/admin/print-quotes">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回列表
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {quote.quoteNumber}
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(quote.createdAt)}
          </p>
        </div>
      </div>

      {/* 基本信息卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-muted-foreground">客户</Label>
              <p className="font-medium">{quote.customer?.username}</p>
              <p className="text-sm text-muted-foreground">{quote.customer?.email}</p>
              {quote.customer?.phone && (
                <p className="text-sm text-muted-foreground">{quote.customer.phone}</p>
              )}
            </div>
            <div>
              <Label className="text-muted-foreground">状态</Label>
              <Badge className={statusColors[quote.status]}>
                {QUOTE_STATUS_LABELS[quote.status]}
              </Badge>
            </div>
            <div>
              <Label className="text-muted-foreground">产品类型</Label>
              <p className="font-medium">{PRODUCT_TYPE_LABELS[quote.productType]}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">数量</Label>
              <p className="font-medium">{quote.quantity}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">尺寸</Label>
              <p className="font-medium">
                {quote.size === 'custom'
                  ? `${quote.customWidth}mm × ${quote.customHeight}mm`
                  : quote.size}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">材质</Label>
              <p className="font-medium">{quote.material || '-'}</p>
            </div>
            {quote.finishing && (
              <div>
                <Label className="text-muted-foreground">工艺</Label>
                <p className="font-medium">{quote.finishing}</p>
              </div>
            )}
            {quote.deliveryAddress && (
              <div>
                <Label className="text-muted-foreground">收货地址</Label>
                <p className="font-medium">{quote.deliveryAddress}</p>
              </div>
            )}
          </div>

          {quote.requirements && (
            <div>
              <Label className="text-muted-foreground">客户备注</Label>
              <p className="font-medium whitespace-pre-wrap">{quote.requirements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 设计文件 */}
      {quote.files && quote.files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>设计文件</CardTitle>
            <CardDescription>{quote.files.length} 个文件</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quote.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-medium">{file.fileName}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(file.fileSize)} • {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 报价和拒绝表单 */}
      <Tabs defaultValue="quote" className="w-full">
        <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-2 bg-white/10 border-white/20 backdrop-blur-sm">
          <TabsTrigger value="quote" disabled={!canSubmitQuote}>
            提交报价
          </TabsTrigger>
          <TabsTrigger value="reject" disabled={!canReject}>
            拒绝询价
          </TabsTrigger>
        </TabsList>

        {/* 报价表单 */}
        <TabsContent value="quote">
          <Card>
            <CardHeader>
              <CardTitle>报价信息</CardTitle>
              <CardDescription>
                {canSubmitQuote
                  ? '填写报价信息并提交'
                  : `当前状态 (${QUOTE_STATUS_LABELS[quote.status]}) 不允许提交报价`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">单价 (元) *</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    disabled={!canSubmitQuote}
                  />
                  {errors.unitPrice && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.unitPrice}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalPrice">总价 (元) *</Label>
                  <Input
                    id="totalPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(e.target.value)}
                    disabled={!canSubmitQuote}
                  />
                  {errors.totalPrice && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.totalPrice}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">报价有效期 *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    disabled={!canSubmitQuote}
                  />
                  {errors.validUntil && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.validUntil}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priceBreakdown">价格明细 (JSON)</Label>
                <Textarea
                  id="priceBreakdown"
                  placeholder='{"材料费": 100, "加工费": 50}'
                  value={priceBreakdown}
                  onChange={(e) => setPriceBreakdown(e.target.value)}
                  disabled={!canSubmitQuote}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminNote">商家备注</Label>
                <Textarea
                  id="adminNote"
                  placeholder="输入备注信息..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={!canSubmitQuote}
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmitQuote}
                disabled={!canSubmitQuote || submitting}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? '提交中...' : '提交报价'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 拒绝表单 */}
        <TabsContent value="reject">
          <Card>
            <CardHeader>
              <CardTitle>拒绝询价</CardTitle>
              <CardDescription>
                {canReject
                  ? '输入拒绝原因'
                  : `当前状态 (${QUOTE_STATUS_LABELS[quote.status]}) 不允许拒绝`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason">拒绝原因 *</Label>
                <Textarea
                  id="rejectionReason"
                  placeholder="请输入拒绝原因..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={!canReject}
                  rows={6}
                />
              </div>

              <Button
                onClick={() => setShowRejectDialog(true)}
                disabled={!canReject || !rejectionReason.trim()}
                variant="destructive"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                确认拒绝
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 拒绝确认对话框 */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认拒绝</DialogTitle>
            <DialogDescription>
              确定要拒绝此询价吗？客户将收到通知。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium">拒绝原因：</p>
              <p className="text-sm mt-2 whitespace-pre-wrap">{rejectionReason}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectQuote}
              disabled={submitting}
            >
              {submitting ? '处理中...' : '确认拒绝'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

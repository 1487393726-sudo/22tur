'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  QUOTE_STATUS_LABELS,
  PRODUCT_TYPE_LABELS,
  PrintQuote,
} from '@/lib/printing/types';
import { AlertCircle, Download, Eye, Clock, CheckCircle, XCircle } from 'lucide-react';

/**
 * 印刷询价详情页面
 * Requirements: 1.3, 3.1, 3.2
 */
export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<PrintQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [expiryCountdown, setExpiryCountdown] = useState<string | null>(null);

  // 获取询价详情
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/print-quotes/${quoteId}`);
        if (!response.ok) {
          throw new Error('获取询价详情失败');
        }
        const data = await response.json();
        setQuote(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [quoteId]);

  // 计算报价过期倒计时
  useEffect(() => {
    if (!quote?.validUntil) return;

    const updateCountdown = () => {
      const now = new Date();
      const expiry = new Date(quote.validUntil!);
      const diff = expiry.getTime() - now.getTime();

      if (diff <= 0) {
        setExpiryCountdown('已过期');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setExpiryCountdown(`${days}天${hours}小时`);
      } else if (hours > 0) {
        setExpiryCountdown(`${hours}小时${minutes}分钟`);
      } else {
        setExpiryCountdown(`${minutes}分钟`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // 每分钟更新一次

    return () => clearInterval(interval);
  }, [quote?.validUntil]);

  // 接受报价
  const handleAcceptQuote = async () => {
    if (!quote) return;

    setIsAccepting(true);
    try {
      const response = await fetch(`/api/print-quotes/${quoteId}/accept`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '接受报价失败');
      }

      const updated = await response.json();
      setQuote(updated);
      
      // 显示成功消息后跳转到订单页面
      setTimeout(() => {
        router.push(`/print-orders/${updated.orderId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '接受报价失败');
    } finally {
      setIsAccepting(false);
    }
  };

  // 请求修改报价
  const handleReviseQuote = async () => {
    if (!quote || !revisionComment.trim()) {
      setError('请输入修改意见');
      return;
    }

    setIsRevising(true);
    try {
      const response = await fetch(`/api/print-quotes/${quoteId}/revise`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: revisionComment }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || '请求修改失败');
      }

      const updated = await response.json();
      setQuote(updated);
      setShowRevisionForm(false);
      setRevisionComment('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '请求修改失败');
    } finally {
      setIsRevising(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || '询价不存在'}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    quoted: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    revised: 'bg-orange-100 text-orange-800',
    expired: 'bg-gray-100 text-gray-800',
    ordered: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">询价详情</h1>
              <p className="text-gray-600 mt-2">询价号: {quote.quoteNumber}</p>
            </div>
            <Badge className={statusColor[quote.status]}>
              {QUOTE_STATUS_LABELS[quote.status as any]}
            </Badge>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 基本信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">产品类型</p>
                <p className="font-medium">
                  {PRODUCT_TYPE_LABELS[quote.productType as any]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">数量</p>
                <p className="font-medium">{quote.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">尺寸</p>
                <p className="font-medium">{quote.size}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">创建时间</p>
                <p className="font-medium">
                  {new Date(quote.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 规格信息 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>规格信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quote.material && (
                <div>
                  <p className="text-sm text-gray-600">材质</p>
                  <p className="font-medium">{quote.material}</p>
                </div>
              )}
              {quote.colorMode && (
                <div>
                  <p className="text-sm text-gray-600">色彩模式</p>
                  <p className="font-medium">{quote.colorMode}</p>
                </div>
              )}
              {quote.sides && (
                <div>
                  <p className="text-sm text-gray-600">印刷面数</p>
                  <p className="font-medium">
                    {quote.sides === 'single' ? '单面' : '双面'}
                  </p>
                </div>
              )}
            </div>
            {quote.requirements && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">特殊要求</p>
                <p className="text-gray-900 whitespace-pre-wrap">{quote.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 设计文件 */}
        {quote.files && quote.files.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>设计文件</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quote.files.map((file: any) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{file.fileName}</p>
                      <p className="text-sm text-gray-600">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-200 rounded">
                        <Eye className="h-4 w-4" />
                      </button>
                      <a
                        href={file.fileUrl}
                        download
                        className="p-2 hover:bg-gray-200 rounded"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 报价信息 */}
        {quote.status === 'quoted' && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">报价信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">单价</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ¥{quote.unitPrice?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">总价</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ¥{quote.totalPrice?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">有效期</p>
                  <p className="font-medium">
                    {expiryCountdown && (
                      <span className="text-red-600">{expiryCountdown}</span>
                    )}
                  </p>
                </div>
              </div>

              {quote.priceBreakdown && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">价格明细</p>
                  <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(JSON.parse(quote.priceBreakdown), null, 2)}
                  </pre>
                </div>
              )}

              {quote.adminNote && (
                <div className="mt-4 p-3 bg-white rounded border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">商家备注</p>
                  <p className="text-gray-600">{quote.adminNote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 操作按钮 */}
        {quote.status === 'quoted' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>操作</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleAcceptQuote}
                  disabled={isAccepting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isAccepting ? '接受中...' : '接受报价'}
                </Button>

                {!showRevisionForm ? (
                  <Button
                    onClick={() => setShowRevisionForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    请求修改报价
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="请输入您的修改意见..."
                      value={revisionComment}
                      onChange={(e) => setRevisionComment(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleReviseQuote}
                        disabled={isRevising || !revisionComment.trim()}
                        className="flex-1"
                      >
                        {isRevising ? '提交中...' : '提交修改请求'}
                      </Button>
                      <Button
                        onClick={() => {
                          setShowRevisionForm(false);
                          setRevisionComment('');
                        }}
                        variant="outline"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {quote.status === 'rejected' && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900">拒绝原因</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900">{quote.rejectionReason}</p>
              <Button
                onClick={() => router.push('/print-quotes')}
                className="mt-4 w-full"
              >
                返回列表
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

'use client';

/**
 * Signing Page
 * 签名页面
 */

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SignatureCanvas } from '@/components/signature/signature-canvas';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Download,
  ExternalLink,
} from 'lucide-react';
import type { SignatureData } from '@/lib/signature/types';

interface SigningPageProps {
  params: Promise<{ token: string }>;
}

interface SigningInfo {
  requestId: string;
  documentTitle: string;
  documentUrl: string;
  signerName: string;
  signerEmail: string;
  message?: string;
  expiresAt: string;
  status: string;
}

export default function SigningPage({ params }: SigningPageProps) {
  const { token } = use(params);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [signingInfo, setSigningInfo] = useState<SigningInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeclineDialog, setShowDeclineDialog] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // 加载签名信息
  useEffect(() => {
    const fetchSigningInfo = async () => {
      try {
        const response = await fetch(`/api/sign/${token}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || '加载签名信息失败');
          return;
        }

        setSigningInfo(data.data);
      } catch (err) {
        setError('网络错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchSigningInfo();
  }, [token]);

  // 提交签名
  const handleSignatureComplete = async (signatureData: SignatureData) => {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign',
          signatureData: {
            ...signatureData,
            ipAddress: '', // 由服务端获取
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '签名提交失败');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 拒绝签名
  const handleDecline = async () => {
    if (!declineReason.trim()) {
      setError('请填写拒绝原因');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/sign/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'decline',
          reason: declineReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '操作失败');
        return;
      }

      setShowDeclineDialog(false);
      setError('您已拒绝签名');
    } catch (err) {
      setError('网络错误，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  };

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">加载签名信息...</p>
        </div>
      </div>
    );
  }

  // 错误状态（无法加载）
  if (!signingInfo && error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">无法加载签名</h2>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 签名成功
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">签名成功</h2>
            <p className="text-muted-foreground mb-6">
              您已成功完成签名，感谢您的配合。
            </p>
            {signingInfo?.documentUrl && (
              <Button variant="outline" asChild>
                <a href={signingInfo.documentUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  查看文档
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 文档信息 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>{signingInfo?.documentTitle}</CardTitle>
                  <CardDescription>请仔细阅读文档后签名</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {signingInfo?.expiresAt
                  ? `${new Date(signingInfo.expiresAt).toLocaleDateString()} 到期`
                  : '待签名'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 签名者信息 */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">签名者</p>
              <p className="font-medium">{signingInfo?.signerName}</p>
              <p className="text-sm text-muted-foreground">{signingInfo?.signerEmail}</p>
            </div>

            {/* 消息 */}
            {signingInfo?.message && (
              <Alert>
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>{signingInfo.message}</AlertDescription>
              </Alert>
            )}

            {/* 文档预览链接 */}
            {signingInfo?.documentUrl && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={signingInfo.documentUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    下载文档
                  </a>
                </Button>
                <span className="text-sm text-muted-foreground">
                  请在签名前仔细阅读文档内容
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 错误提示 */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* 签名区域 */}
        <div className="flex justify-center">
          <SignatureCanvas
            onSignatureComplete={handleSignatureComplete}
            onCancel={() => setShowDeclineDialog(true)}
            disabled={submitting}
          />
        </div>

        {/* 拒绝签名对话框 */}
        <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>拒绝签名</DialogTitle>
              <DialogDescription>
                请说明您拒绝签名的原因，这将通知文档发起人。
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="请输入拒绝原因..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeclineDialog(false)}>
                取消
              </Button>
              <Button variant="destructive" onClick={handleDecline} disabled={submitting}>
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                确认拒绝
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

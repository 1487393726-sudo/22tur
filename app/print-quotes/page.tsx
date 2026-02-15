'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import QuoteForm from '@/components/print-quotes/quote-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * 印刷询价提交页面
 * Requirements: 1.1, 1.2, 1.5
 */
export default function PrintQuotesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请先登录以提交询价</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary/90"
            >
              前往登录
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/print-quotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '提交失败，请重试');
      }

      const result = await response.json();
      setSuccess(true);
      
      // 显示成功消息后跳转到列表页面
      setTimeout(() => {
        router.push(`/print-quotes/${result.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">印刷定制询价</h1>
          <p className="text-gray-600">
            上传您的设计文件，填写印刷规格，我们将为您提供专业的报价
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              询价提交成功！正在跳转到详情页面...
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>填写询价信息</CardTitle>
            <CardDescription>
              请完整填写以下信息，以便我们为您提供准确的报价
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuoteForm
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速上传</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                支持JPG、PNG、PDF、AI、PSD格式，单个文件最大50MB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">灵活规格</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                支持标准尺寸和自定义尺寸，满足各类印刷需求
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">专业报价</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                我们的专业团队将在24小时内为您提供详细报价
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

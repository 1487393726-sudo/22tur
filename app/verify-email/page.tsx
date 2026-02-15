'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      setMessage('验证链接无效，缺少验证令牌');
      return;
    }

    verifyEmail(token);
  }, [token]);

  const verifyEmail = async (token: string) => {
    try {
      setStatus('loading');
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setMessage(data.message || '邮箱验证成功！');
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || '邮箱验证失败，请重试');
      }
    } catch (error) {
      console.error('邮箱验证错误:', error);
      setStatus('error');
      setMessage('验证过程中发生错误，请稍后重试');
    }
  };

  const handleResendEmail = async () => {
    if (!token) return;

    try {
      setResending(true);
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessage('验证邮件已重新发送，请查收邮箱');
      } else {
        setMessage(data.message || '重新发送失败，请稍后重试');
      }
    } catch (error) {
      console.error('重新发送邮件错误:', error);
      setMessage('重新发送失败，请稍后重试');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4">
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && (
              <Loader2 className="h-16 w-16 text-white animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="h-16 w-16 text-green-400" />
            )}
            {(status === 'error' || status === 'invalid') && (
              <XCircle className="h-16 w-16 text-red-400" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {status === 'loading' && '正在验证邮箱...'}
            {status === 'success' && '验证成功！'}
            {status === 'error' && '验证失败'}
            {status === 'invalid' && '无效的验证链接'}
          </CardTitle>
          <CardDescription className="text-white/70 mt-2">
            {message}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="text-center space-y-4">
              <p className="text-white/80 text-sm">
                您的邮箱已成功验证，即将跳转到登录页面...
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                立即登录
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-white/80 text-sm text-center">
                验证链接可能已过期或无效
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleResendEmail}
                  disabled={resending}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      重新发送验证邮件
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  返回登录
                </Button>
              </div>
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-4">
              <p className="text-white/80 text-sm text-center">
                请检查您的邮箱，点击正确的验证链接
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                返回登录
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-4">
        <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-16 w-16 text-white animate-spin" />
              <p className="text-white/70">加载中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailPageContent />
    </Suspense>
  );
}

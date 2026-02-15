'use client';

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Mail, Loader2, CheckCircle } from 'lucide-react';

interface EmailVerificationNoticeProps {
  email: string;
  onResend?: () => void;
}

export function EmailVerificationNotice({ email, onResend }: EmailVerificationNoticeProps) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResent(true);
        setTimeout(() => setResent(false), 5000);
      }
      
      if (onResend) {
        onResend();
      }
    } catch (error) {
      console.error('重新发送验证邮件失败:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <Alert className="bg-blue-500/10 border-blue-500/20">
      <Mail className="h-4 w-4 text-blue-400" />
      <AlertTitle className="text-blue-400">验证您的邮箱</AlertTitle>
      <AlertDescription className="text-white/70 space-y-3">
        <p>
          我们已向 <span className="font-semibold text-white">{email}</span> 发送了一封验证邮件。
        </p>
        <p className="text-sm">
          请点击邮件中的链接来验证您的邮箱地址。验证链接将在 24 小时后过期。
        </p>
        {resent && (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <CheckCircle className="h-4 w-4" />
            <span>验证邮件已重新发送！</span>
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={resending || resent}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                发送中...
              </>
            ) : resent ? (
              '已发送'
            ) : (
              '重新发送'
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

'use client';

// components/auth/two-factor-verify.tsx
// 双因素认证验证组件

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Smartphone, Key, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface TwoFactorVerifyProps {
  onVerify: (code: string, method: 'totp' | 'backup' | 'sms') => Promise<boolean>;
  onCancel?: () => void;
  showSMS?: boolean;
  phoneNumber?: string;
}

export function TwoFactorVerify({
  onVerify,
  onCancel,
  showSMS = false,
  phoneNumber,
}: TwoFactorVerifyProps) {
  const t = useTranslations('auth');
  const [method, setMethod] = useState<'totp' | 'backup' | 'sms'>('totp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsSending, setSmsSending] = useState(false);
  const [smsSent, setSMSSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleVerify = async () => {
    if (!code) {
      toast.error(t('2fa.enterCode'));
      return;
    }

    setLoading(true);
    try {
      const success = await onVerify(code, method);
      if (!success) {
        toast.error(t('2fa.verificationFailed'));
      }
    } catch (error) {
      toast.error(t('2fa.verificationFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async () => {
    setSmsSending(true);
    try {
      const response = await fetch('/api/auth/2fa/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purpose: 'LOGIN' }),
      });

      if (response.ok) {
        setSMSSent(true);
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        toast.success(t('2fa.smsSent'));
      } else {
        const data = await response.json();
        toast.error(data.error || t('2fa.smsSendFailed'));
      }
    } catch (error) {
      toast.error(t('2fa.smsSendFailed'));
    } finally {
      setSmsSending(false);
    }
  };

  const getCodeMaxLength = () => {
    return method === 'backup' ? 8 : 6;
  };

  const getCodePlaceholder = () => {
    return method === 'backup' ? 'XXXXXXXX' : '000000';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{t('2fa.verifyTitle')}</CardTitle>
        <CardDescription>{t('2fa.verifyDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={method} onValueChange={(v) => setMethod(v as typeof method)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="totp" className="flex items-center gap-1">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">{t('2fa.authenticator')}</span>
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center gap-1">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">{t('2fa.backupCode')}</span>
            </TabsTrigger>
            {showSMS && (
              <TabsTrigger value="sms" className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">{t('2fa.sms')}</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="totp" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {t('2fa.totpInstructions')}
            </p>
            <div className="space-y-2">
              <Label htmlFor="totp-code">{t('2fa.code')}</Label>
              <Input
                id="totp-code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                autoComplete="one-time-code"
              />
            </div>
          </TabsContent>

          <TabsContent value="backup" className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              {t('2fa.backupInstructions')}
            </p>
            <div className="space-y-2">
              <Label htmlFor="backup-code">{t('2fa.backupCode')}</Label>
              <Input
                id="backup-code"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().slice(0, 8))
                }
                placeholder="XXXXXXXX"
                maxLength={8}
                className="text-center text-xl tracking-widest uppercase"
              />
            </div>
          </TabsContent>

          {showSMS && (
            <TabsContent value="sms" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                {t('2fa.smsInstructions', {
                  phone: phoneNumber
                    ? `****${phoneNumber.slice(-4)}`
                    : '****',
                })}
              </p>
              {!smsSent ? (
                <Button
                  onClick={handleSendSMS}
                  disabled={smsSending}
                  variant="outline"
                  className="w-full"
                >
                  {smsSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('2fa.sendSMS')}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="sms-code">{t('2fa.code')}</Label>
                  <Input
                    id="sms-code"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                    autoComplete="one-time-code"
                  />
                  <Button
                    onClick={handleSendSMS}
                    disabled={countdown > 0 || smsSending}
                    variant="link"
                    className="w-full"
                  >
                    {countdown > 0
                      ? t('2fa.resendIn', { seconds: countdown })
                      : t('2fa.resendSMS')}
                  </Button>
                </div>
              )}
            </TabsContent>
          )}
        </Tabs>

        <div className="flex gap-2 mt-6">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              {t('common.cancel')}
            </Button>
          )}
          <Button
            onClick={handleVerify}
            disabled={loading || !code || code.length < getCodeMaxLength()}
            className="flex-1"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('2fa.verify')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

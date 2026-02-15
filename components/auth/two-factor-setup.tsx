'use client';

// components/auth/two-factor-setup.tsx
// 双因素认证设置组件

import { useState } from 'react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Shield, ShieldCheck, ShieldOff, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

// 静态文本（避免 useTranslations 在静态生成时的问题）
const texts = {
  title: '双因素认证',
  description: '为您的账户添加额外的安全保护',
  statusEnabled: '已启用',
  statusDisabled: '未启用',
  enable: '启用',
  disable: '禁用',
  setupTitle: '设置双因素认证',
  setupDescription: '使用身份验证器应用扫描二维码',
  disableTitle: '禁用双因素认证',
  disableDescription: '这将降低您账户的安全性',
  disableWarning: '禁用双因素认证后，您的账户将仅依赖密码保护。',
  confirmDisable: '确认禁用',
  setupInstructions: '点击下方按钮开始设置双因素认证。您需要使用身份验证器应用（如 Google Authenticator）扫描二维码。',
  startSetup: '开始设置',
  manualEntry: '或手动输入密钥：',
  enterCode: '输入验证码',
  verify: '验证',
  backupCodesWarning: '请妥善保存这些备用码。如果您无法访问身份验证器应用，可以使用这些备用码登录。',
  done: '完成',
  setupFailed: '设置失败',
  invalidCode: '请输入6位验证码',
  enabled: '双因素认证已启用',
  verificationFailed: '验证失败',
  disabled: '双因素认证已禁用',
  disableFailed: '禁用失败',
  codeCopied: '备用码已复制',
  cancel: '取消',
};

interface TwoFactorSetupProps {
  enabled: boolean;
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFactorSetup({ enabled, onStatusChange }: TwoFactorSetupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'setup' | 'verify' | 'backup'>('setup');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('verify');
      } else {
        toast.error(data.error || texts.setupFailed);
      }
    } catch (error) {
      toast.error(texts.setupFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      toast.error(texts.invalidCode);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }),
      });
      const data = await response.json();

      if (response.ok) {
        setBackupCodes(data.backupCodes);
        setStep('backup');
        onStatusChange?.(true);
        toast.success(texts.enabled);
      } else {
        toast.error(data.error || texts.verificationFailed);
      }
    } catch (error) {
      toast.error(texts.verificationFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: '' }), // 实际实现需要密码验证
      });

      if (response.ok) {
        onStatusChange?.(false);
        toast.success(texts.disabled);
        setIsOpen(false);
      } else {
        const data = await response.json();
        toast.error(data.error || texts.disableFailed);
      }
    } catch (error) {
      toast.error(texts.disableFailed);
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success(texts.codeCopied);
  };

  const handleClose = () => {
    setIsOpen(false);
    setStep('setup');
    setQrCode('');
    setSecret('');
    setVerificationCode('');
    setBackupCodes([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {texts.title}
        </CardTitle>
        <CardDescription>{texts.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {enabled ? (
              <>
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="text-green-600">{texts.statusEnabled}</span>
              </>
            ) : (
              <>
                <ShieldOff className="h-5 w-5 text-gray-400" />
                <span className="text-gray-500">{texts.statusDisabled}</span>
              </>
            )}
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant={enabled ? 'destructive' : 'default'}>
                {enabled ? texts.disable : texts.enable}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {enabled ? texts.disableTitle : texts.setupTitle}
                </DialogTitle>
                <DialogDescription>
                  {enabled ? texts.disableDescription : texts.setupDescription}
                </DialogDescription>
              </DialogHeader>

              {enabled ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertDescription>{texts.disableWarning}</AlertDescription>
                  </Alert>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={handleClose}>
                      {texts.cancel}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDisable}
                      disabled={loading}
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {texts.confirmDisable}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {step === 'setup' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {texts.setupInstructions}
                      </p>
                      <Button onClick={handleSetup} disabled={loading} className="w-full">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {texts.startSetup}
                      </Button>
                    </div>
                  )}

                  {step === 'verify' && (
                    <div className="space-y-4">
                      {qrCode && (
                        <div className="flex justify-center">
                          <img src={qrCode} alt="QR Code" className="h-48 w-48" />
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground mb-2">
                          {texts.manualEntry}
                        </p>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {secret}
                        </code>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="code">{texts.enterCode}</Label>
                        <Input
                          id="code"
                          value={verificationCode}
                          onChange={(e) =>
                            setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                          }
                          placeholder="000000"
                          maxLength={6}
                          className="text-center text-2xl tracking-widest"
                        />
                      </div>
                      <Button
                        onClick={handleVerify}
                        disabled={loading || verificationCode.length !== 6}
                        className="w-full"
                      >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {texts.verify}
                      </Button>
                    </div>
                  )}

                  {step === 'backup' && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>{texts.backupCodesWarning}</AlertDescription>
                      </Alert>
                      <div className="grid grid-cols-2 gap-2">
                        {backupCodes.map((code, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-muted px-3 py-2 rounded"
                          >
                            <code className="text-sm">{code}</code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => copyBackupCode(code, index)}
                            >
                              {copiedIndex === index ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Button onClick={handleClose} className="w-full">
                        {texts.done}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

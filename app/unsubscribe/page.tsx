'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle2, XCircle } from 'lucide-react';

interface UnsubscribePreferences {
  emailEnabled: boolean;
  taskNotifications: boolean;
  approvalNotifications: boolean;
  messageNotifications: boolean;
  systemNotifications: boolean;
  reminderNotifications: boolean;
}

function UnsubscribePageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [preferences, setPreferences] = useState<UnsubscribePreferences>({
    emailEnabled: true,
    taskNotifications: true,
    approvalNotifications: true,
    messageNotifications: true,
    systemNotifications: true,
    reminderNotifications: true,
  });

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setError('缺少退订令牌');
      setLoading(false);
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      setVerifying(true);
      const response = await fetch(`/api/user/unsubscribe/verify?token=${token}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '验证失败');
      }

      const data = await response.json();
      setUserEmail(data.email);
      setPreferences(data.preferences);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '验证令牌失败');
      setLoading(false);
    } finally {
      setVerifying(false);
    }
  };

  const handleUnsubscribeAll = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          unsubscribeAll: true,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '退订失败');
      }

      setSuccess(true);
      toast.success('已成功退订所有邮件通知');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '退订失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/user/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          preferences,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '保存失败');
      }

      setSuccess(true);
      toast.success('邮件偏好已更新');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">正在验证...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle>验证失败</CardTitle>
            </div>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              退订链接可能已过期或无效。如需帮助，请联系系统管理员。
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <CardTitle>设置已保存</CardTitle>
            </div>
            <CardDescription>您的邮件偏好已成功更新</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              您可以随时在个人设置中修改邮件通知偏好。
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.location.href = '/'}
            >
              返回首页
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Mail className="h-6 w-6 text-purple-500" />
            <CardTitle>邮件通知设置</CardTitle>
          </div>
          <CardDescription>
            管理您的邮件通知偏好 ({userEmail})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 全局邮件开关 */}
          <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
            <Checkbox
              id="emailEnabled"
              checked={preferences.emailEnabled}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, emailEnabled: checked as boolean })
              }
            />
            <div className="flex-1">
              <Label htmlFor="emailEnabled" className="font-semibold cursor-pointer">
                启用邮件通知
              </Label>
              <p className="text-sm text-muted-foreground">
                关闭后将不再接收任何邮件通知
              </p>
            </div>
          </div>

          {/* 具体通知类型 */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">通知类型</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="taskNotifications"
                  checked={preferences.taskNotifications}
                  disabled={!preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, taskNotifications: checked as boolean })
                  }
                />
                <Label
                  htmlFor="taskNotifications"
                  className={`cursor-pointer ${!preferences.emailEnabled ? 'opacity-50' : ''}`}
                >
                  任务通知
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="approvalNotifications"
                  checked={preferences.approvalNotifications}
                  disabled={!preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, approvalNotifications: checked as boolean })
                  }
                />
                <Label
                  htmlFor="approvalNotifications"
                  className={`cursor-pointer ${!preferences.emailEnabled ? 'opacity-50' : ''}`}
                >
                  审批通知
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="messageNotifications"
                  checked={preferences.messageNotifications}
                  disabled={!preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, messageNotifications: checked as boolean })
                  }
                />
                <Label
                  htmlFor="messageNotifications"
                  className={`cursor-pointer ${!preferences.emailEnabled ? 'opacity-50' : ''}`}
                >
                  消息通知
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="systemNotifications"
                  checked={preferences.systemNotifications}
                  disabled={!preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, systemNotifications: checked as boolean })
                  }
                />
                <Label
                  htmlFor="systemNotifications"
                  className={`cursor-pointer ${!preferences.emailEnabled ? 'opacity-50' : ''}`}
                >
                  系统通知
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reminderNotifications"
                  checked={preferences.reminderNotifications}
                  disabled={!preferences.emailEnabled}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, reminderNotifications: checked as boolean })
                  }
                />
                <Label
                  htmlFor="reminderNotifications"
                  className={`cursor-pointer ${!preferences.emailEnabled ? 'opacity-50' : ''}`}
                >
                  提醒通知
                </Label>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleSavePreferences}
              disabled={saving}
              className="flex-1"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存设置
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnsubscribeAll}
              disabled={saving}
              className="flex-1"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              退订所有邮件
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            注意：重要的系统邮件（如密码重置、账户安全）将始终发送
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              <p className="text-sm text-muted-foreground">加载中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <UnsubscribePageContent />
    </Suspense>
  );
}

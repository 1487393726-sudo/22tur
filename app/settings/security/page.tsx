'use client';

// app/settings/security/page.tsx
// 安全设置页面

import { useState, useEffect } from 'react';
import { TwoFactorSetup } from '@/components/auth/two-factor-setup';
import { DeviceManager } from '@/components/auth/device-manager';
import { LinkedAccounts } from '@/components/auth/linked-accounts';
import { Skeleton } from '@/components/ui/skeleton';

export default function SecuritySettingsPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 获取用户的 2FA 状态
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/auth/2fa/status');
        if (response.ok) {
          const data = await response.json();
          setTwoFactorEnabled(data.enabled);
        }
      } catch (error) {
        console.error('Failed to fetch 2FA status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">安全设置</h1>
        <p className="text-muted-foreground mt-2">管理您的账户安全设置</p>
      </div>

      <div className="space-y-6">
        {/* 双因素认证 */}
        {loading ? (
          <div className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        ) : (
          <TwoFactorSetup
            enabled={twoFactorEnabled}
            onStatusChange={setTwoFactorEnabled}
          />
        )}

        {/* 登录设备管理 */}
        <DeviceManager />

        {/* 已关联账户 */}
        <LinkedAccounts />
      </div>
    </div>
  );
}

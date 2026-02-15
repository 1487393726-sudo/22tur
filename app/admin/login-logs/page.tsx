'use client';

// app/admin/login-logs/page.tsx
// 管理员登录日志页面

import { useTranslations } from 'next-intl';
import { LoginLogs } from '@/components/admin/login-logs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function AdminLoginLogsPage() {
  const t = useTranslations('admin');

  return (
    <div className="container py-8">
      <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <FileText className="h-6 w-6" />
            {t('loginLogs.title')}
          </CardTitle>
          <CardDescription className="text-gray-300">{t('loginLogs.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginLogs />
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

// components/auth/linked-accounts.tsx
// 已关联第三方账户管理组件

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Link2, Unlink, Check } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 静态文本
const texts = {
  title: '关联账户',
  description: '管理您的第三方登录账户',
  fetchFailed: '获取关联账户失败',
  linked: '账户已关联',
  linkFailed: '关联账户失败',
  unlinked: '账户已解除关联',
  unlinkFailed: '解除关联失败',
  connected: '已关联',
  linkedOn: '关联于',
  unlink: '解除关联',
  unlinkTitle: '解除关联',
  unlinkDescription: '解除关联后，您将无法使用该账户登录。',
  confirmUnlink: '确认解除',
  link: '关联',
  cancel: '取消',
};

interface LinkedAccount {
  provider: string;
  providerAccountId: string;
  linkedAt: string;
}

const providerInfo: Record<
  string,
  { name: string; icon: React.ReactNode; color: string }
> = {
  google: {
    name: 'Google',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: 'text-red-500',
  },
  github: {
    name: 'GitHub',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
    color: 'text-gray-900 dark:text-white',
  },
  wechat: {
    name: '微信',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348z" />
      </svg>
    ),
    color: 'text-green-500',
  },
  qq: {
    name: 'QQ',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.239 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z" />
      </svg>
    ),
    color: 'text-blue-500',
  },
};

const allProviders = ['google', 'github', 'wechat', 'qq'];

export function LinkedAccounts() {
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [linking, setLinking] = useState<string | null>(null);

  const dateLocale = zhCN;

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/auth/linked-accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.accounts || []);
      }
    } catch (error) {
      toast.error(texts.fetchFailed);
    } finally {
      setLoading(false);
    }
  };

  const linkAccount = async (provider: string) => {
    setLinking(provider);
    try {
      await signIn(provider, { redirect: false });
      // 重新获取账户列表
      await fetchAccounts();
      toast.success(texts.linked);
    } catch (error) {
      toast.error(texts.linkFailed);
    } finally {
      setLinking(null);
    }
  };

  const unlinkAccount = async (provider: string) => {
    setUnlinking(provider);
    try {
      const response = await fetch(`/api/auth/linked-accounts/${provider}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAccounts(accounts.filter((a) => a.provider !== provider));
        toast.success(texts.unlinked);
      } else {
        const data = await response.json();
        toast.error(data.error || texts.unlinkFailed);
      }
    } catch (error) {
      toast.error(texts.unlinkFailed);
    } finally {
      setUnlinking(null);
    }
  };

  const isLinked = (provider: string) => {
    return accounts.some((a) => a.provider === provider);
  };

  const getLinkedAccount = (provider: string) => {
    return accounts.find((a) => a.provider === provider);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{texts.title}</CardTitle>
          <CardDescription>{texts.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-9 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          {texts.title}
        </CardTitle>
        <CardDescription>{texts.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {allProviders.map((provider) => {
            const info = providerInfo[provider];
            const linked = isLinked(provider);
            const account = getLinkedAccount(provider);

            return (
              <div
                key={provider}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className={`flex-shrink-0 ${info.color}`}>{info.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{info.name}</span>
                    {linked && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {texts.connected}
                      </Badge>
                    )}
                  </div>
                  {linked && account && (
                    <p className="text-sm text-muted-foreground">
                      {texts.linkedOn} {format(new Date(account.linkedAt), 'PPP', {
                        locale: dateLocale,
                      })}
                    </p>
                  )}
                </div>
                {linked ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={unlinking === provider}
                      >
                        {unlinking === provider ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Unlink className="mr-2 h-4 w-4" />
                        )}
                        {texts.unlink}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {texts.unlinkTitle} {info.name}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {texts.unlinkDescription}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{texts.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => unlinkAccount(provider)}>
                          {texts.confirmUnlink}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => linkAccount(provider)}
                    disabled={linking === provider}
                  >
                    {linking === provider ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Link2 className="mr-2 h-4 w-4" />
                    )}
                    {texts.link}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

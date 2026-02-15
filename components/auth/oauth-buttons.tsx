'use client';

// components/auth/oauth-buttons.tsx
// OAuth 登录按钮组件

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface OAuthButtonsProps {
  callbackUrl?: string;
  className?: string;
  showLabels?: boolean;
}

const providers = [
  {
    id: 'google',
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
    bgColor: 'bg-white hover:bg-gray-50',
    textColor: 'text-gray-700',
    borderColor: 'border-gray-300',
  },
  {
    id: 'github',
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
    bgColor: 'bg-gray-900 hover:bg-gray-800',
    textColor: 'text-white',
    borderColor: 'border-gray-900',
  },
  {
    id: 'wechat',
    name: '微信',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.03-.406-.03zm-2.53 3.274c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z" />
      </svg>
    ),
    bgColor: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
    borderColor: 'border-green-500',
  },
  {
    id: 'qq',
    name: 'QQ',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.003 2c-2.265 0-6.29 1.364-6.29 7.325v1.195S3.55 14.96 3.55 17.474c0 .665.17 1.025.281 1.025.114 0 .902-.484 1.748-2.072 0 0-.18 2.197 1.904 3.967 0 0-1.77.495-1.77 1.182 0 .686 4.078.43 6.29.43 2.239 0 6.29.256 6.29-.43 0-.687-1.77-1.182-1.77-1.182 2.085-1.77 1.905-3.967 1.905-3.967.845 1.588 1.634 2.072 1.746 2.072.111 0 .283-.36.283-1.025 0-2.514-2.166-6.954-2.166-6.954V9.325C18.29 3.364 14.268 2 12.003 2z" />
      </svg>
    ),
    bgColor: 'bg-blue-500 hover:bg-blue-600',
    textColor: 'text-white',
    borderColor: 'border-blue-500',
  },
];

export function OAuthButtons({
  callbackUrl = '/dashboard',
  className = '',
  showLabels = true,
}: OAuthButtonsProps) {
  const t = useTranslations('auth');
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await signIn(providerId, { callbackUrl });
    } catch (error) {
      console.error('OAuth login error:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          className={`w-full ${provider.bgColor} ${provider.textColor} border ${provider.borderColor}`}
          onClick={() => handleOAuthLogin(provider.id)}
          disabled={loadingProvider !== null}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <span className="mr-2">{provider.icon}</span>
          )}
          {showLabels && (
            <span>
              {t('loginWith', { provider: provider.name })}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
}

export function OAuthButtonsCompact({
  callbackUrl = '/dashboard',
  className = '',
}: Omit<OAuthButtonsProps, 'showLabels'>) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await signIn(providerId, { callbackUrl });
    } catch (error) {
      console.error('OAuth login error:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`flex justify-center gap-4 ${className}`}>
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          size="icon"
          className={`${provider.bgColor} ${provider.textColor} border ${provider.borderColor}`}
          onClick={() => handleOAuthLogin(provider.id)}
          disabled={loadingProvider !== null}
          title={provider.name}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            provider.icon
          )}
        </Button>
      ))}
    </div>
  );
}

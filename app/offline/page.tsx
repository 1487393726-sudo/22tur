'use client';

/**
 * Offline Page
 * 离线页面
 */

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
          <WifiOff className="w-12 h-12 text-gray-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          您当前处于离线状态
        </h1>
        
        <p className="text-gray-600 mb-6">
          请检查您的网络连接后重试。部分功能在离线状态下可能无法使用。
        </p>

        <Button onClick={handleRetry} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          重新连接
        </Button>

        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left">
          <h3 className="font-medium text-gray-900 mb-2">离线可用功能：</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 查看已缓存的页面</li>
            <li>• 查看已下载的文档</li>
            <li>• 编辑草稿（将在联网后同步）</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

"use client";

/**
 * 动态 PDF 预览组件包装器
 * 
 * 使用 Next.js dynamic import 来延迟加载 react-pdf 库
 * 这可以显著减少首屏 JavaScript 包大小（约 400KB）
 * 
 * 只在用户需要预览 PDF 时才加载库
 */

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-chart';

// 动态导入 PDF 预览组件
export const DynamicPDFPreview = dynamic(
  () => import('./pdf-preview-content').then((mod) => mod.PDFPreviewContent),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-sm text-gray-500">正在加载 PDF 预览...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

/**
 * 使用示例：
 * 
 * import { DynamicPDFPreview } from '@/components/file-preview/dynamic-pdf-preview';
 * 
 * export function FileViewer({ file }) {
 *   if (file.type === 'pdf') {
 *     return <DynamicPDFPreview url={file.url} />;
 *   }
 *   // ... 其他文件类型
 * }
 */

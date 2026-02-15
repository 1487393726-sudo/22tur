"use client";

/**
 * 动态 ReactFlow 组件包装器
 * 
 * 使用 Next.js dynamic import 来延迟加载 ReactFlow 库
 * 这可以显著减少首屏 JavaScript 包大小（约 500KB）
 * 
 * ReactFlow 是一个大型库，只在工作流设计器页面需要
 */

import dynamic from 'next/dynamic';
import { LoadingSpinner } from '@/components/ui/loading-chart';
import type { ComponentType } from 'react';

// 动态导入 ReactFlow 组件
export const DynamicReactFlow = dynamic(
  () => import('reactflow').then((mod) => mod.default as any),
  {
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center space-y-4">
          <LoadingSpinner />
          <p className="text-sm text-gray-300">正在加载工作流设计器...</p>
        </div>
      </div>
    ),
    ssr: false, // ReactFlow 不支持 SSR
  }
) as ComponentType<any>;

export const DynamicBackground = dynamic(
  () => import('reactflow').then((mod) => mod.Background as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicControls = dynamic(
  () => import('reactflow').then((mod) => mod.Controls as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicMiniMap = dynamic(
  () => import('reactflow').then((mod) => mod.MiniMap as any),
  { ssr: false }
) as ComponentType<any>;

/**
 * 使用示例：
 * 
 * import { DynamicReactFlow, DynamicBackground, DynamicControls } from '@/components/workflow/dynamic-workflow-designer';
 * 
 * <DynamicReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange}>
 *   <DynamicBackground />
 *   <DynamicControls />
 * </DynamicReactFlow>
 */

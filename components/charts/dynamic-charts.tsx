"use client";

/**
 * 动态图表组件包装器
 * 
 * 使用 Next.js dynamic import 来延迟加载 Recharts 库
 * 这可以显著减少首屏 JavaScript 包大小（约 300KB）
 * 
 * 使用方法：
 * import { DynamicBarChart, DynamicLineChart } from '@/components/charts/dynamic-charts';
 * 
 * <DynamicBarChart data={data} />
 */

import dynamic from 'next/dynamic';
import { LoadingChart, LoadingSpinner } from '@/components/ui/loading-chart';
import type { ComponentType } from 'react';

// 动态导入 Recharts 组件
// ssr: false 因为图表通常不需要服务端渲染
// loading: 显示加载状态，提升用户体验

export const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart as any),
  {
    loading: () => <LoadingChart />,
    ssr: false,
  }
) as ComponentType<any>;

export const DynamicLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart as any),
  {
    loading: () => <LoadingChart />,
    ssr: false,
  }
) as ComponentType<any>;

export const DynamicPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart as any),
  {
    loading: () => <LoadingChart />,
    ssr: false,
  }
) as ComponentType<any>;

export const DynamicAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart as any),
  {
    loading: () => <LoadingChart />,
    ssr: false,
  }
) as ComponentType<any>;

export const DynamicRadarChart = dynamic(
  () => import('recharts').then((mod) => mod.RadarChart as any),
  {
    loading: () => <LoadingChart />,
    ssr: false,
  }
) as ComponentType<any>;

// 导出其他 Recharts 组件
export const DynamicBar = dynamic(
  () => import('recharts').then((mod) => mod.Bar as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicLine = dynamic(
  () => import('recharts').then((mod) => mod.Line as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicPie = dynamic(
  () => import('recharts').then((mod) => mod.Pie as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicArea = dynamic(
  () => import('recharts').then((mod) => mod.Area as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicCell = dynamic(
  () => import('recharts').then((mod) => mod.Cell as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicXAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicYAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicCartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicTooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicLegend = dynamic(
  () => import('recharts').then((mod) => mod.Legend as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer as any),
  { ssr: false }
) as ComponentType<any>;

// Radar Chart 相关组件
export const DynamicRadar = dynamic(
  () => import('recharts').then((mod) => mod.Radar as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicPolarGrid = dynamic(
  () => import('recharts').then((mod) => mod.PolarGrid as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicPolarAngleAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarAngleAxis as any),
  { ssr: false }
) as ComponentType<any>;

export const DynamicPolarRadiusAxis = dynamic(
  () => import('recharts').then((mod) => mod.PolarRadiusAxis as any),
  { ssr: false }
) as ComponentType<any>;

/**
 * 使用示例：
 * 
 * import {
 *   DynamicBarChart,
 *   DynamicBar,
 *   DynamicXAxis,
 *   DynamicYAxis,
 *   DynamicCartesianGrid,
 *   DynamicTooltip,
 *   DynamicLegend,
 *   DynamicResponsiveContainer
 * } from '@/components/charts/dynamic-charts';
 * 
 * export function MyChart({ data }) {
 *   return (
 *     <DynamicResponsiveContainer width="100%" height={300}>
 *       <DynamicBarChart data={data}>
 *         <DynamicCartesianGrid strokeDasharray="3 3" />
 *         <DynamicXAxis dataKey="name" />
 *         <DynamicYAxis />
 *         <DynamicTooltip />
 *         <DynamicLegend />
 *         <DynamicBar dataKey="value" fill="#8b5cf6" />
 *       </DynamicBarChart>
 *     </DynamicResponsiveContainer>
 *   );
 * }
 */

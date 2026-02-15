'use client';

/**
 * Progress Widget
 * 进度条组件
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ProgressConfig, WidgetProps } from './types';

interface ProgressWidgetProps extends WidgetProps<ProgressConfig> {}

export function ProgressWidget({
  config,
  loading,
  error,
}: ProgressWidgetProps) {
  const percentage = Math.min(100, Math.max(0, (config.value / config.max) * 100));

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // 圆形进度条
  const CircularProgress = () => {
    const size = config.size === 'sm' ? 80 : config.size === 'lg' ? 160 : 120;
    const strokeWidth = config.size === 'sm' ? 6 : config.size === 'lg' ? 12 : 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* 背景圆 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.trackColor || 'currentColor'}
            strokeWidth={strokeWidth}
            className="text-muted opacity-20"
          />
          {/* 进度圆 */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={config.color || 'currentColor'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-500"
          />
        </svg>
        {config.showLabel && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{percentage.toFixed(0)}%</span>
          </div>
        )}
      </div>
    );
  };

  // 线性进度条
  const LinearProgress = () => {
    const height = config.size === 'sm' ? 'h-2' : config.size === 'lg' ? 'h-6' : 'h-4';

    return (
      <div className="w-full space-y-2">
        <Progress
          value={percentage}
          className={cn(height)}
          style={{
            backgroundColor: config.trackColor,
          }}
        />
        {config.showLabel && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {config.value.toLocaleString()} / {config.max.toLocaleString()}
            </span>
            <span className="font-medium">{percentage.toFixed(1)}%</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card
      className="h-full"
      style={{
        backgroundColor: config.style?.backgroundColor,
        borderColor: config.style?.borderColor,
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className="text-sm font-medium"
          style={{ color: config.style?.titleColor }}
        >
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        {loading ? (
          config.variant === 'circular' ? (
            <Skeleton className="h-24 w-24 rounded-full" />
          ) : (
            <Skeleton className="h-4 w-full" />
          )
        ) : config.variant === 'circular' ? (
          <CircularProgress />
        ) : (
          <LinearProgress />
        )}
      </CardContent>
    </Card>
  );
}

export default ProgressWidget;

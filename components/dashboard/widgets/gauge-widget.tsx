'use client';

/**
 * Gauge Widget
 * 仪表盘组件
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { GaugeConfig, WidgetProps } from './types';

interface GaugeWidgetProps extends WidgetProps<GaugeConfig> {}

export function GaugeWidget({
  config,
  loading,
  error,
}: GaugeWidgetProps) {
  const { value, min, max, thresholds = [] } = config;
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  // 获取当前值对应的颜色
  const getColor = () => {
    if (thresholds.length === 0) return '#3b82f6';

    const sortedThresholds = [...thresholds].sort((a, b) => a.value - b.value);
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (value >= sortedThresholds[i].value) {
        return sortedThresholds[i].color;
      }
    }
    return sortedThresholds[0]?.color || '#3b82f6';
  };

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * Math.PI; // 半圆
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card
      className="h-full"
      style={{ backgroundColor: config.style?.backgroundColor }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        {loading ? (
          <Skeleton className="h-24 w-32" />
        ) : (
          <>
            <div className="relative">
              <svg
                width={size}
                height={size / 2 + 20}
                viewBox={`0 0 ${size} ${size / 2 + 20}`}
              >
                {/* 背景弧 */}
                <path
                  d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  className="text-muted opacity-20"
                />

                {/* 阈值区域 */}
                {thresholds.length > 0 && (
                  <>
                    {thresholds.map((threshold, index) => {
                      const nextThreshold = thresholds[index + 1];
                      const startPercent = ((threshold.value - min) / (max - min)) * 100;
                      const endPercent = nextThreshold
                        ? ((nextThreshold.value - min) / (max - min)) * 100
                        : 100;

                      const startAngle = Math.PI + (startPercent / 100) * Math.PI;
                      const endAngle = Math.PI + (endPercent / 100) * Math.PI;

                      const startX = size / 2 + radius * Math.cos(startAngle);
                      const startY = size / 2 + radius * Math.sin(startAngle);
                      const endX = size / 2 + radius * Math.cos(endAngle);
                      const endY = size / 2 + radius * Math.sin(endAngle);

                      const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

                      return (
                        <path
                          key={index}
                          d={`M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`}
                          fill="none"
                          stroke={threshold.color}
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          opacity={0.3}
                        />
                      );
                    })}
                  </>
                )}

                {/* 进度弧 */}
                <path
                  d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
                  fill="none"
                  stroke={getColor()}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  className="transition-all duration-500"
                />

                {/* 指针 */}
                <g transform={`rotate(${-90 + percentage * 1.8}, ${size / 2}, ${size / 2})`}>
                  <line
                    x1={size / 2}
                    y1={size / 2}
                    x2={size / 2}
                    y2={strokeWidth + 10}
                    stroke={getColor()}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={size / 2}
                    cy={size / 2}
                    r="6"
                    fill={getColor()}
                  />
                </g>

                {/* 刻度标签 */}
                <text
                  x={strokeWidth}
                  y={size / 2 + 16}
                  className="text-xs fill-muted-foreground"
                >
                  {min}
                </text>
                <text
                  x={size - strokeWidth}
                  y={size / 2 + 16}
                  textAnchor="end"
                  className="text-xs fill-muted-foreground"
                >
                  {max}
                </text>
              </svg>

              {/* 中心数值 */}
              {config.showValue && (
                <div className="absolute inset-0 flex items-end justify-center pb-2">
                  <div className="text-center">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: getColor() }}
                    >
                      {value.toLocaleString()}
                    </span>
                    {config.unit && (
                      <span className="text-sm text-muted-foreground ml-1">
                        {config.unit}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {config.description && (
              <p className="text-xs text-muted-foreground mt-2">
                {config.description}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default GaugeWidget;

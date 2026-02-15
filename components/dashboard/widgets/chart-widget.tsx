'use client';

/**
 * Chart Widget
 * 图表组件（简化版，使用 CSS 实现）
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  LineChartConfig,
  BarChartConfig,
  PieChartConfig,
  WidgetProps,
  DataPoint,
} from './types';

// 颜色调色板
const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
];

// 折线图组件
interface LineChartWidgetProps extends WidgetProps<LineChartConfig> {}

function LineChartWidget({
  config,
  loading,
  error,
}: LineChartWidgetProps) {
  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // 计算数据范围
  const allValues = config.series.flatMap(s => s.data.map(d => (d as DataPoint).value));
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);
  const range = maxValue - minValue || 1;

  // 生成 SVG 路径
  const generatePath = (data: DataPoint[], width: number, height: number) => {
    if (data.length === 0) return '';

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d.value - minValue) / range) * height;
      return `${x},${y}`;
    });

    if (config.smooth) {
      // 简单的平滑曲线
      return `M ${points.join(' L ')}`;
    }
    return `M ${points.join(' L ')}`;
  };

  return (
    <Card
      className="h-full"
      style={{ backgroundColor: config.style?.backgroundColor }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="relative h-40">
            <svg
              viewBox="0 0 300 150"
              className="w-full h-full"
              preserveAspectRatio="none"
            >
              {/* 网格线 */}
              {config.showGrid && (
                <g className="text-muted-foreground/20">
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 37.5}
                      x2="300"
                      y2={i * 37.5}
                      stroke="currentColor"
                      strokeDasharray="4"
                    />
                  ))}
                </g>
              )}

              {/* 数据线 */}
              {config.series.map((series, index) => (
                <g key={index}>
                  {config.areaFill && (
                    <path
                      d={`${generatePath(series.data as DataPoint[], 300, 150)} L 300,150 L 0,150 Z`}
                      fill={series.color || COLORS[index % COLORS.length]}
                      fillOpacity={0.1}
                    />
                  )}
                  <path
                    d={generatePath(series.data as DataPoint[], 300, 150)}
                    fill="none"
                    stroke={series.color || COLORS[index % COLORS.length]}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              ))}
            </svg>

            {/* 图例 */}
            {config.showLegend && (
              <div className="flex flex-wrap gap-4 mt-2 justify-center">
                {config.series.map((series, index) => (
                  <div key={index} className="flex items-center gap-1 text-xs">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: series.color || COLORS[index % COLORS.length],
                      }}
                    />
                    <span>{series.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 柱状图组件
interface BarChartWidgetProps extends WidgetProps<BarChartConfig> {}

function BarChartWidget({
  config,
  loading,
  error,
}: BarChartWidgetProps) {
  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // 获取所有数据点
  const allData = config.series[0]?.data as DataPoint[] || [];
  const maxValue = Math.max(...allData.map(d => d.value), 0);

  return (
    <Card
      className="h-full"
      style={{ backgroundColor: config.style?.backgroundColor }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className={cn('h-40', config.horizontal ? 'space-y-2' : 'flex items-end gap-2')}>
            {allData.map((item, index) => {
              const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
              const color = item.color || COLORS[index % COLORS.length];

              if (config.horizontal) {
                return (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-xs w-16 truncate">{item.label}</span>
                    <div className="flex-1 h-4 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium w-12 text-right">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center gap-1"
                >
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${percentage}%`,
                      backgroundColor: color,
                      minHeight: '4px',
                    }}
                  />
                  <span className="text-xs text-muted-foreground truncate max-w-full">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 饼图组件
interface PieChartWidgetProps extends WidgetProps<PieChartConfig> {}

function PieChartWidget({
  config,
  loading,
  error,
}: PieChartWidgetProps) {
  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const total = config.data.reduce((sum, d) => sum + d.value, 0);
  const size = 120;
  const radius = config.donut ? size / 2 - (config.donutWidth || 20) : size / 2;
  const innerRadius = config.donut ? size / 2 - (config.donutWidth || 20) * 2 : 0;

  // 计算扇形路径
  const getArcPath = (startAngle: number, endAngle: number, r: number, ir: number) => {
    const start = {
      x: size / 2 + r * Math.cos(startAngle),
      y: size / 2 + r * Math.sin(startAngle),
    };
    const end = {
      x: size / 2 + r * Math.cos(endAngle),
      y: size / 2 + r * Math.sin(endAngle),
    };
    const innerStart = {
      x: size / 2 + ir * Math.cos(endAngle),
      y: size / 2 + ir * Math.sin(endAngle),
    };
    const innerEnd = {
      x: size / 2 + ir * Math.cos(startAngle),
      y: size / 2 + ir * Math.sin(startAngle),
    };

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    if (ir === 0) {
      return `M ${size / 2} ${size / 2} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
    }

    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerStart.x} ${innerStart.y} A ${ir} ${ir} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} Z`;
  };

  let currentAngle = -Math.PI / 2;

  return (
    <Card
      className="h-full"
      style={{ backgroundColor: config.style?.backgroundColor }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-32 w-32 rounded-full mx-auto" />
        ) : (
          <div className="flex items-center justify-center gap-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {config.data.map((item, index) => {
                const angle = (item.value / total) * Math.PI * 2;
                const startAngle = currentAngle;
                const endAngle = currentAngle + angle;
                currentAngle = endAngle;

                return (
                  <path
                    key={index}
                    d={getArcPath(startAngle, endAngle - 0.02, radius, innerRadius)}
                    fill={item.color || COLORS[index % COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </svg>

            {config.showLegend && (
              <div className="space-y-1">
                {config.data.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: item.color || COLORS[index % COLORS.length],
                      }}
                    />
                    <span className="truncate max-w-[80px]">{item.label}</span>
                    <span className="font-medium">
                      {((item.value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export { LineChartWidget, BarChartWidget, PieChartWidget };

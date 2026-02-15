'use client';

/**
 * Number Widget
 * 数字卡片组件
 */

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { NumberConfig, WidgetProps, HighlightConfig } from './types';

interface NumberWidgetProps extends WidgetProps<NumberConfig> {}

export function NumberWidget({
  config,
  loading,
  error,
  highlight,
}: NumberWidgetProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [prevValue, setPrevValue] = useState<number | null>(null);

  // 检测数值变化并高亮
  useEffect(() => {
    if (highlight?.enabled && prevValue !== null && prevValue !== config.value) {
      const changePercent = Math.abs((config.value - prevValue) / prevValue) * 100;
      if (changePercent >= highlight.threshold) {
        setIsHighlighted(true);
        setTimeout(() => setIsHighlighted(false), highlight.duration);
      }
    }
    setPrevValue(config.value);
  }, [config.value, highlight, prevValue]);

  // 格式化数值
  const formatValue = (value: number): string => {
    const { format, decimals = 0, prefix = '', suffix = '' } = config;

    let formatted: string;
    switch (format) {
      case 'currency':
        formatted = new Intl.NumberFormat('zh-CN', {
          style: 'currency',
          currency: 'CNY',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
        break;
      case 'percent':
        formatted = new Intl.NumberFormat('zh-CN', {
          style: 'percent',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value / 100);
        break;
      default:
        if (value >= 1000000) {
          formatted = (value / 1000000).toFixed(decimals) + 'M';
        } else if (value >= 1000) {
          formatted = (value / 1000).toFixed(decimals) + 'K';
        } else {
          formatted = value.toFixed(decimals);
        }
    }

    return `${prefix}${formatted}${suffix}`;
  };

  // 获取趋势图标和颜色
  const getTrendIcon = () => {
    if (!config.trend) return null;

    const { direction, isGood } = config.trend;
    const isPositive = isGood !== undefined ? isGood : direction === 'up';

    switch (direction) {
      case 'up':
        return (
          <TrendingUp
            className={cn('h-4 w-4', isPositive ? 'text-green-500' : 'text-red-500')}
          />
        );
      case 'down':
        return (
          <TrendingDown
            className={cn('h-4 w-4', isPositive ? 'text-green-500' : 'text-red-500')}
          />
        );
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // 获取高亮样式
  const getHighlightStyle = () => {
    if (!isHighlighted || !highlight || prevValue === null) return {};

    const isUp = config.value > prevValue;
    return {
      boxShadow: `0 0 20px ${isUp ? highlight.upColor : highlight.downColor}`,
      transition: 'box-shadow 0.3s ease-in-out',
    };
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

  return (
    <Card
      className={cn('h-full transition-all', isHighlighted && 'ring-2')}
      style={{
        ...getHighlightStyle(),
        backgroundColor: config.style?.backgroundColor,
        borderColor: config.style?.borderColor,
        borderWidth: config.style?.borderWidth,
        borderRadius: config.style?.borderRadius,
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className="text-sm font-medium"
          style={{
            color: config.style?.titleColor,
            fontSize: config.style?.titleSize,
          }}
        >
          {config.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-32" />
        ) : (
          <div className="space-y-1">
            <div
              className="text-3xl font-bold"
              style={{
                color: config.style?.valueColor,
                fontSize: config.style?.valueSize,
              }}
            >
              {formatValue(config.value)}
              {config.unit && (
                <span className="text-lg font-normal text-muted-foreground ml-1">
                  {config.unit}
                </span>
              )}
            </div>
            {config.trend && (
              <div className="flex items-center gap-1 text-sm">
                {getTrendIcon()}
                <span
                  className={cn(
                    config.trend.direction === 'up'
                      ? config.trend.isGood !== false
                        ? 'text-green-500'
                        : 'text-red-500'
                      : config.trend.direction === 'down'
                      ? config.trend.isGood
                        ? 'text-green-500'
                        : 'text-red-500'
                      : 'text-gray-500'
                  )}
                >
                  {Math.abs(config.trend.value).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs 上期</span>
              </div>
            )}
            {config.description && (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NumberWidget;

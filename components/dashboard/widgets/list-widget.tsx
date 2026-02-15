'use client';

/**
 * List Widget
 * 列表组件
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ListConfig, WidgetProps } from './types';

interface ListWidgetProps extends WidgetProps<ListConfig> {}

export function ListWidget({
  config,
  loading,
  error,
}: ListWidgetProps) {
  const items = config.maxItems
    ? config.items.slice(0, config.maxItems)
    : config.items;

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
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100%-60px)]">
          {loading ? (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <ul className="divide-y">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {config.showIndex && (
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          index < 3
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {index + 1}
                      </span>
                    )}
                    {item.icon && (
                      <span
                        className="text-lg"
                        style={{ color: item.color }}
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="text-sm font-medium">{item.title}</span>
                  </div>
                  {item.value !== undefined && (
                    <span
                      className="text-sm font-bold"
                      style={{ color: item.color }}
                    >
                      {typeof item.value === 'number'
                        ? item.value.toLocaleString()
                        : item.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default ListWidget;

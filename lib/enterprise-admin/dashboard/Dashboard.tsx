'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { DashboardData, WidgetPosition } from './types';
import { KPICard } from './KPICard';
import { ChartWidget } from './ChartWidget';
import { ActivityList } from './ActivityList';
import { QuickActions } from './QuickActions';
import { GripVertical, X, RotateCcw } from 'lucide-react';

interface DashboardProps {
  data: DashboardData;
  onLayoutChange?: (layout: WidgetPosition[]) => void;
  editable?: boolean;
  className?: string;
}

interface DraggingState {
  widgetId: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

export function Dashboard({
  data,
  onLayoutChange,
  editable = true,
  className = '',
}: DashboardProps) {
  const [layout, setLayout] = useState<WidgetPosition[]>([
    // Default layout
    { widgetId: 'kpi-0', widgetType: 'kpi', x: 0, y: 0, width: 3, height: 2 },
    { widgetId: 'kpi-1', widgetType: 'kpi', x: 3, y: 0, width: 3, height: 2 },
    { widgetId: 'kpi-2', widgetType: 'kpi', x: 6, y: 0, width: 3, height: 2 },
    { widgetId: 'kpi-3', widgetType: 'kpi', x: 9, y: 0, width: 3, height: 2 },
    { widgetId: 'chart-0', widgetType: 'chart', x: 0, y: 2, width: 6, height: 4 },
    { widgetId: 'chart-1', widgetType: 'chart', x: 6, y: 2, width: 6, height: 4 },
    { widgetId: 'activity', widgetType: 'activity', x: 0, y: 6, width: 6, height: 4 },
    { widgetId: 'action', widgetType: 'action', x: 6, y: 6, width: 6, height: 4 },
  ]);

  const [dragging, setDragging] = useState<DraggingState | null>(null);
  const [hiddenWidgets, setHiddenWidgets] = useState<Set<string>>(new Set());

  // Load layout from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-layout');
    if (saved) {
      try {
        setLayout(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load dashboard layout:', err);
      }
    }
  }, []);

  // Save layout to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-layout', JSON.stringify(layout));
    onLayoutChange?.(layout);
  }, [layout, onLayoutChange]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, widgetId: string) => {
      if (!editable) return;
      e.preventDefault();

      const widget = layout.find(w => w.widgetId === widgetId);
      if (!widget) return;

      setDragging({
        widgetId,
        startX: e.clientX,
        startY: e.clientY,
        offsetX: widget.x,
        offsetY: widget.y,
      });
    },
    [layout, editable]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !editable) return;

      const deltaX = Math.round((e.clientX - dragging.startX) / 60);
      const deltaY = Math.round((e.clientY - dragging.startY) / 60);

      setLayout(prev =>
        prev.map(w =>
          w.widgetId === dragging.widgetId
            ? {
                ...w,
                x: Math.max(0, dragging.offsetX + deltaX),
                y: Math.max(0, dragging.offsetY + deltaY),
              }
            : w
        )
      );
    },
    [dragging, editable]
  );

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleRemoveWidget = useCallback((widgetId: string) => {
    setHiddenWidgets(prev => new Set([...prev, widgetId]));
  }, []);

  const handleResetLayout = useCallback(() => {
    setLayout([
      { widgetId: 'kpi-0', widgetType: 'kpi', x: 0, y: 0, width: 3, height: 2 },
      { widgetId: 'kpi-1', widgetType: 'kpi', x: 3, y: 0, width: 3, height: 2 },
      { widgetId: 'kpi-2', widgetType: 'kpi', x: 6, y: 0, width: 3, height: 2 },
      { widgetId: 'kpi-3', widgetType: 'kpi', x: 9, y: 0, width: 3, height: 2 },
      { widgetId: 'chart-0', widgetType: 'chart', x: 0, y: 2, width: 6, height: 4 },
      { widgetId: 'chart-1', widgetType: 'chart', x: 6, y: 2, width: 6, height: 4 },
      { widgetId: 'activity', widgetType: 'activity', x: 0, y: 6, width: 6, height: 4 },
      { widgetId: 'action', widgetType: 'action', x: 6, y: 6, width: 6, height: 4 },
    ]);
    setHiddenWidgets(new Set());
  }, []);

  const renderWidget = (position: WidgetPosition) => {
    if (hiddenWidgets.has(position.widgetId)) return null;

    const gridSize = 60; // pixels per grid unit
    const style = {
      gridColumn: `${position.x + 1} / span ${position.width}`,
      gridRow: `${position.y + 1} / span ${position.height}`,
    };

    let content = null;

    if (position.widgetType === 'kpi') {
      const kpiIndex = parseInt(position.widgetId.split('-')[1]);
      const kpi = data.kpis[kpiIndex];
      if (kpi) {
        content = <KPICard card={kpi} />;
      }
    } else if (position.widgetType === 'chart') {
      const chartIndex = parseInt(position.widgetId.split('-')[1]);
      const chart = data.charts[chartIndex];
      if (chart) {
        content = <ChartWidget chart={chart} />;
      }
    } else if (position.widgetType === 'activity') {
      content = <ActivityList activities={data.activities} />;
    } else if (position.widgetType === 'action') {
      content = <QuickActions actions={data.quickActions} />;
    }

    return (
      <div
        key={position.widgetId}
        style={style}
        className={`relative group ${dragging?.widgetId === position.widgetId ? 'opacity-75' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {editable && (
          <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleRemoveWidget(position.widgetId)}
              className="p-1 bg-red-900 hover:bg-red-800 rounded text-red-200 transition-colors"
              title="Remove widget"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {editable && (
          <div
            onMouseDown={e => handleMouseDown(e, position.widgetId)}
            className="absolute top-2 left-2 z-10 p-1 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 cursor-grab active:cursor-grabbing transition-colors opacity-0 group-hover:opacity-100"
            title="Drag to move"
          >
            <GripVertical size={14} />
          </div>
        )}

        <div className="h-full">{content}</div>
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        {editable && (
          <button
            onClick={handleResetLayout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <RotateCcw size={16} />
            Reset Layout
          </button>
        )}
      </div>

      {/* Edit Mode Indicator */}
      {editable && (
        <div className="mb-4 p-3 bg-blue-900 border border-blue-700 rounded text-blue-200 text-sm">
          Edit mode enabled. Drag widgets to rearrange, click the X to remove widgets.
        </div>
      )}

      {/* Grid Container */}
      <div
        className="grid gap-4 auto-rows-max"
        style={{
          gridTemplateColumns: 'repeat(12, 1fr)',
        }}
      >
        {layout.map(position => renderWidget(position))}
      </div>
    </div>
  );
}

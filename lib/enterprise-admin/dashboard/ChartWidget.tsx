'use client';

import React, { useMemo } from 'react';
import { ChartData } from './types';

interface ChartWidgetProps {
  chart: ChartData;
  className?: string;
}

/**
 * Simple chart widget that renders data visualization
 * Supports line, bar, pie, and area charts
 */
export function ChartWidget({ chart, className = '' }: ChartWidgetProps) {
  const maxValue = useMemo(() => {
    return Math.max(
      ...chart.data.datasets.flatMap(dataset => dataset.data)
    );
  }, [chart.data.datasets]);

  const renderLineChart = () => {
    const dataset = chart.data.datasets[0];
    const width = 400;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = dataset.data.map((value, index) => {
      const xRatio = dataset.data.length > 1 ? index / (dataset.data.length - 1) : 0.5;
      const x = padding + xRatio * chartWidth;
      const y = height - padding - (value / (maxValue || 1)) * chartHeight;
      return { x, y, value };
    });

    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    return (
      <svg width={width} height={height} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - padding - ratio * chartHeight;
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#495057"
              strokeDasharray="4"
              opacity="0.3"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#6c757d"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#6c757d"
          strokeWidth="2"
        />

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke={dataset.borderColor || '#3b82f6'}
          strokeWidth="2"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={`point-${i}`}
            cx={p.x}
            cy={p.y}
            r="4"
            fill={dataset.borderColor || '#3b82f6'}
          />
        ))}

        {/* Labels */}
        {chart.data.labels.map((label, i) => {
          const x = padding + (i / (chart.data.labels.length - 1)) * chartWidth;
          return (
            <text
              key={`label-${i}`}
              x={x}
              y={height - padding + 20}
              textAnchor="middle"
              fill="#9ca3af"
              fontSize="12"
            >
              {label}
            </text>
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    const dataset = chart.data.datasets[0];
    const width = 400;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const barWidth = chartWidth / dataset.data.length * 0.7;
    const barSpacing = chartWidth / dataset.data.length;

    return (
      <svg width={width} height={height} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = height - padding - ratio * chartHeight;
          return (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={y}
              x2={width - padding}
              y2={y}
              stroke="#495057"
              strokeDasharray="4"
              opacity="0.3"
            />
          );
        })}

        {/* Axes */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#6c757d"
          strokeWidth="2"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#6c757d"
          strokeWidth="2"
        />

        {/* Bars */}
        {dataset.data.map((value, i) => {
          const x = padding + i * barSpacing + (barSpacing - barWidth) / 2;
          const barHeight = (value / maxValue) * chartHeight;
          const y = height - padding - barHeight;

          return (
            <g key={`bar-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={dataset.backgroundColor || '#3b82f6'}
                opacity="0.8"
              />
              <text
                x={x + barWidth / 2}
                y={height - padding + 20}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="12"
              >
                {chart.data.labels[i]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const dataset = chart.data.datasets[0];
    const total = dataset.data.reduce((a, b) => a + b, 0);
    const size = 200;
    const radius = 80;
    const centerX = size / 2;
    const centerY = size / 2;

    let currentAngle = -Math.PI / 2;
    const slices = dataset.data.map((value, i) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;

      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);

      const largeArc = sliceAngle > Math.PI ? 1 : 0;

      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');

      const colors = [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#ec4899',
      ];

      currentAngle = endAngle;

      return (
        <path
          key={`slice-${i}`}
          d={pathData}
          fill={colors[i % colors.length]}
          opacity="0.8"
          stroke="#1f2937"
          strokeWidth="2"
        />
      );
    });

    return (
      <svg width={size} height={size} className="w-full h-auto">
        {slices}
        {/* Legend */}
        {chart.data.labels.map((label, i) => (
          <g key={`legend-${i}`}>
            <rect
              x={10}
              y={10 + i * 20}
              width={12}
              height={12}
              fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][
                i % 6
              ]}
            />
            <text x={28} y={20 + i * 20} fill="#d1d5db" fontSize="12">
              {label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const renderChart = () => {
    switch (chart.type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderLineChart(); // Area chart similar to line for now
      default:
        return null;
    }
  };

  return (
    <div className={`bg-gray-900 rounded-lg p-6 border border-gray-700 ${className}`}>
      <h3 className="text-white font-semibold mb-4">{chart.title}</h3>
      <div className="flex justify-center">
        {renderChart()}
      </div>
    </div>
  );
}

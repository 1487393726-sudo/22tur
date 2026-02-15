"use client";

import { useMemo } from "react";
import {
  DynamicBarChart as BarChart,
  DynamicBar as Bar,
  DynamicLineChart as LineChart,
  DynamicLine as Line,
  DynamicPieChart as PieChart,
  DynamicPie as Pie,
  DynamicCell as Cell,
  DynamicXAxis as XAxis,
  DynamicYAxis as YAxis,
  DynamicCartesianGrid as CartesianGrid,
  DynamicTooltip as Tooltip,
  DynamicLegend as Legend,
  DynamicResponsiveContainer as ResponsiveContainer,
} from "@/components/charts/dynamic-charts";

interface ReportChartProps {
  type: "bar" | "line" | "pie";
  data: any[];
  config: {
    xAxis?: string;
    yAxis?: string;
    groupBy?: string;
    aggregation?: string;
    chartTitle?: string;
  };
}

// 图表颜色主题
const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // green-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
];

export function ReportChart({ type, data, config }: ReportChartProps) {
  // 处理数据格式
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // 对于饼图，需要特殊处理
    if (type === "pie") {
      return data.map((item) => ({
        name: String(item[config.groupBy || "name"] || "未知"),
        value: Number(item[config.yAxis || "value"] || 0),
      }));
    }

    // 对于柱状图和折线图
    return data.map((item) => {
      const result: any = {};
      
      // X 轴数据
      if (config.xAxis) {
        result.name = String(item[config.xAxis] || "未知");
      }
      
      // Y 轴数据
      if (config.yAxis) {
        result.value = Number(item[config.yAxis] || 0);
      }
      
      return result;
    });
  }, [data, type, config]);

  // 格式化数值
  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString("zh-CN");
  };

  // 自定义 Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium text-gray-900">{payload[0].name || payload[0].payload.name}</p>
          <p className="text-sm text-gray-600 mt-1">
            {config.aggregation || "值"}: {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>暂无数据</p>
        </div>
      </div>
    );
  }

  // 渲染柱状图
  if (type === "bar") {
    return (
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar
              dataKey="value"
              fill={COLORS[0]}
              name={config.aggregation || "值"}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 渲染折线图
  if (type === "line") {
    return (
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fill: "#6b7280", fontSize: 12 }}
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} tickFormatter={formatValue} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS[0]}
              strokeWidth={2}
              name={config.aggregation || "值"}
              dot={{ fill: COLORS[0], r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 渲染饼图
  if (type === "pie") {
    // 自定义饼图标签
    const renderLabel = (entry: any) => {
      const percent = ((entry.value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1);
      return `${entry.name} (${percent}%)`;
    };

    return (
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
}

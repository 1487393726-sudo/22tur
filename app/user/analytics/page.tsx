"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  Target,
  Activity,
  PieChart,
  Calendar,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Smartphone,
  Monitor,
  MousePointer,
  Zap,
} from "lucide-react";

// 导入用户端样式
import "@/styles/user-pages.css";

interface AnalyticsData {
  id: string;
  metric: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  period: string;
}

interface TrafficSource {
  id: string;
  source: string;
  visits: number;
  percentage: number;
  color: string;
}

interface PageView {
  id: string;
  page: string;
  views: number;
  avgTime: string;
  bounceRate: string;
}

const mockAnalyticsData: AnalyticsData[] = [
  { id: "1", metric: "页面浏览量", value: "45,678", change: 12.5, trend: "up", period: "本月" },
  { id: "2", metric: "独立访客", value: "12,345", change: 8.3, trend: "up", period: "本月" },
  { id: "3", metric: "平均停留时间", value: "4:32", change: -2.1, trend: "down", period: "本月" },
  { id: "4", metric: "跳出率", value: "32.5%", change: -5.2, trend: "up", period: "本月" },
  { id: "5", metric: "转化率", value: "3.8%", change: 15.7, trend: "up", period: "本月" },
  { id: "6", metric: "新用户占比", value: "45.2%", change: 3.4, trend: "up", period: "本月" },
];

const mockTrafficSources: TrafficSource[] = [
  { id: "1", source: "直接访问", visits: 5234, percentage: 35, color: "#60a5fa" },
  { id: "2", source: "搜索引擎", visits: 4521, percentage: 30, color: "#34d399" },
  { id: "3", source: "社交媒体", visits: 2856, percentage: 19, color: "#c4b5fd" },
  { id: "4", source: "外部链接", visits: 1678, percentage: 11, color: "#fbbf24" },
  { id: "5", source: "邮件营销", visits: 756, percentage: 5, color: "#f87171" },
];

const mockPageViews: PageView[] = [
  { id: "1", page: "/首页", views: 12456, avgTime: "2:45", bounceRate: "28%" },
  { id: "2", page: "/产品列表", views: 8934, avgTime: "3:12", bounceRate: "35%" },
  { id: "3", page: "/投资项目", views: 6721, avgTime: "5:23", bounceRate: "22%" },
  { id: "4", page: "/关于我们", views: 4532, avgTime: "1:56", bounceRate: "45%" },
  { id: "5", page: "/联系方式", views: 3214, avgTime: "1:23", bounceRate: "52%" },
];

const timeRanges = ["今日", "本周", "本月", "本季度", "本年"];

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("本月");

  const stats = [
    { label: "总访问量", value: "45,678", icon: Eye, color: "blue" },
    { label: "活跃用户", value: "12,345", icon: Users, color: "green" },
    { label: "平均时长", value: "4:32", icon: Clock, color: "yellow" },
    { label: "转化率", value: "3.8%", icon: Target, color: "purple" },
  ];

  const deviceStats = [
    { device: "桌面端", percentage: 58, icon: Monitor, color: "#60a5fa" },
    { device: "移动端", percentage: 35, icon: Smartphone, color: "#34d399" },
    { device: "平板", percentage: 7, icon: Globe, color: "#c4b5fd" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="数据分析"
        description="查看您的业务数据和分析报告"
        icon={BarChart3}
        stats={stats.map(s => ({ ...s, color: `bg-${s.color}-500` }))}
        actions={
          <div className="flex gap-3">
            <button className="user-button user-button-secondary user-button-sm">
              <RefreshCw className="w-4 h-4" />
              <span>刷新数据</span>
            </button>
            <button className="user-button user-button-secondary user-button-sm">
              <Download className="w-4 h-4" />
              <span>导出报告</span>
            </button>
            <button className="user-button user-button-primary user-button-sm">
              <Activity className="w-4 h-4" />
              <span>实时监控</span>
            </button>
          </div>
        }
      />

      {/* 统计卡片 - 玻璃态风格 */}
      <div className="user-page-stats-grid">
        {stats.map((stat, index) => {
          const colorMap: Record<string, { bg: string; text: string }> = {
            blue: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
            green: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
            yellow: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
            purple: { bg: "rgba(168, 85, 247, 0.2)", text: "#c4b5fd" },
          };
          const colors = colorMap[stat.color];
          return (
            <div key={index} className="user-page-stat-card">
              <div className="user-page-stat-icon" style={{ background: colors.bg, color: colors.text }}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{stat.value}</span>
                <span className="user-page-stat-label">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 时间范围筛选 - 玻璃态风格 */}
      <div className="user-filter-buttons">
        {timeRanges.map((range) => (
          <button
            key={range}
            onClick={() => setSelectedTimeRange(range)}
            className={`user-button user-button-sm ${selectedTimeRange === range ? "user-button-primary" : "user-button-secondary"}`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 核心指标卡片 - 玻璃态风格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockAnalyticsData.map((data) => (
          <GlassMetricCard key={data.id} data={data} />
        ))}
      </div>

      {/* 图表区域 - 玻璃态风格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 访问趋势 */}
        <div className="user-card">
          <div className="user-card-header">
            <div className="user-card-header-icon" style={{ background: "rgba(59, 130, 246, 0.2)" }}>
              <TrendingUp className="w-5 h-5" style={{ color: "#60a5fa" }} />
            </div>
            <div>
              <h3 className="user-card-title">访问趋势</h3>
              <p className="user-card-description">过去30天的访问数据</p>
            </div>
          </div>
          <div className="user-card-content">
            <div className="h-48 flex items-center justify-center">
              <div className="text-center">
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    background: "rgba(59, 130, 246, 0.2)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <BarChart3 className="w-8 h-8" style={{ color: "#60a5fa" }} />
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}>图表组件开发中...</p>
              </div>
            </div>
          </div>
        </div>

        {/* 流量来源 */}
        <div className="user-card">
          <div className="user-card-header">
            <div className="user-card-header-icon" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
              <Globe className="w-5 h-5" style={{ color: "#34d399" }} />
            </div>
            <div>
              <h3 className="user-card-title">流量来源</h3>
              <p className="user-card-description">访客来源分布</p>
            </div>
          </div>
          <div className="user-card-content">
            <div className="space-y-4">
              {mockTrafficSources.map((source) => (
                <div key={source.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "white", fontSize: "14px" }}>{source.source}</span>
                    <div className="flex items-center gap-2">
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                        {source.visits.toLocaleString()} 次
                      </span>
                      <Badge style={{ background: source.color + "33", color: source.color, border: "none", fontSize: "11px" }}>
                        {source.percentage}%
                      </Badge>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "3px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${source.percentage}%`,
                        height: "100%",
                        background: source.color,
                        borderRadius: "3px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 设备分布 - 玻璃态风格 */}
      <div className="user-card">
        <div className="user-card-header">
          <div className="user-card-header-icon" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
            <Monitor className="w-5 h-5" style={{ color: "#c4b5fd" }} />
          </div>
          <div>
            <h3 className="user-card-title">设备分布</h3>
            <p className="user-card-description">用户访问设备类型统计</p>
          </div>
        </div>
        <div className="user-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceStats.map((device, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: device.color + "33",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <device.icon className="w-6 h-6" style={{ color: device.color }} />
                </div>
                <div className="flex-1">
                  <p style={{ color: "white", fontWeight: 500, fontSize: "14px" }}>{device.device}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{device.percentage}% 的访问</p>
                </div>
                <div
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    background: `conic-gradient(${device.color} ${device.percentage * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      background: "rgba(15, 23, 42, 0.9)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span style={{ color: device.color, fontWeight: 600, fontSize: "14px" }}>{device.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 热门页面 - 玻璃态风格 */}
      <div className="user-card">
        <div className="user-card-header">
          <div className="user-card-header-icon" style={{ background: "rgba(245, 158, 11, 0.2)" }}>
            <MousePointer className="w-5 h-5" style={{ color: "#fbbf24" }} />
          </div>
          <div>
            <h3 className="user-card-title">热门页面</h3>
            <p className="user-card-description">访问量最高的页面</p>
          </div>
        </div>
        <div className="user-card-content">
          <div className="space-y-3">
            {mockPageViews.map((page, index) => (
              <div
                key={page.id}
                className="user-list-item"
                style={{ cursor: "default" }}
              >
                <div
                  className="user-list-item-icon"
                  style={{
                    background: index === 0 ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.1)",
                    color: index === 0 ? "#fbbf24" : "rgba(255,255,255,0.5)",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{index + 1}</span>
                </div>
                <div className="user-list-item-content">
                  <div className="user-list-item-header">
                    <span className="user-list-item-title">{page.page}</span>
                    <Badge
                      style={{
                        background: "rgba(59, 130, 246, 0.2)",
                        color: "#60a5fa",
                        border: "none",
                        fontSize: "11px",
                      }}
                    >
                      {page.views.toLocaleString()} 次浏览
                    </Badge>
                  </div>
                  <div className="user-list-item-meta">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      平均停留 {page.avgTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      跳出率 {page.bounceRate}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 实时数据提示 - 玻璃态风格 */}
      <div className="user-card">
        <div className="user-empty-state">
          <div className="user-empty-state-icon" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
            <Activity className="w-10 h-10" style={{ color: "#34d399" }} />
          </div>
          <h3 className="user-empty-state-title">实时数据分析</h3>
          <p className="user-empty-state-description">
            高级数据分析功能正在开发中，即将为您提供更详细的实时数据监控和分析报告
          </p>
          <button className="user-button user-button-primary user-button-sm">
            <Zap className="w-4 h-4" />
            <span>了解更多</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 玻璃态指标卡片组件
function GlassMetricCard({ data }: { data: AnalyticsData }) {
  const isPositive = data.trend === "up" && data.change > 0;
  const isNegative = data.trend === "down" || data.change < 0;
  
  // 对于跳出率，下降是好事
  const isGood = data.metric === "跳出率" ? isNegative : isPositive;
  
  const trendColor = isGood ? "#34d399" : "#f87171";
  const TrendIcon = data.change >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="user-card" style={{ cursor: "default" }}>
      <div style={{ padding: "20px" }}>
        <div className="flex items-start justify-between mb-3">
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>{data.metric}</span>
          <Badge
            style={{
              background: isGood ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
              color: trendColor,
              border: "none",
              fontSize: "11px",
              display: "flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <TrendIcon className="w-3 h-3" />
            {Math.abs(data.change)}%
          </Badge>
        </div>
        <div className="flex items-end justify-between">
          <span style={{ color: "white", fontSize: "28px", fontWeight: 600 }}>{data.value}</span>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{data.period}</span>
        </div>
      </div>
    </div>
  );
}

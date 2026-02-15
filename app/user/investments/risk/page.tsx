"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Target,
  Eye,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Gauge,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  PieChart,
  Sparkles,
  Zap,
  Clock,
  ChevronRight,
} from "lucide-react";

interface RiskMetric {
  id: string;
  name: string;
  value: number;
  maxValue: number;
  status: "safe" | "warning" | "danger";
  trend: "up" | "down" | "stable";
  description: string;
}

interface RiskAlert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  description: string;
  asset: string;
  timestamp: string;
  isRead: boolean;
}

const riskMetrics: RiskMetric[] = [
  {
    id: "1",
    name: "整体风险评分",
    value: 65,
    maxValue: 100,
    status: "warning",
    trend: "up",
    description: "基于投资组合多样性和市场波动性计算",
  },
  {
    id: "2",
    name: "市场风险",
    value: 45,
    maxValue: 100,
    status: "safe",
    trend: "stable",
    description: "受市场整体波动影响的风险程度",
  },
  {
    id: "3",
    name: "集中度风险",
    value: 72,
    maxValue: 100,
    status: "warning",
    trend: "up",
    description: "投资过度集中于特定行业或资产的风险",
  },
  {
    id: "4",
    name: "流动性风险",
    value: 35,
    maxValue: 100,
    status: "safe",
    trend: "down",
    description: "资产变现能力和流动性状况",
  },
  {
    id: "5",
    name: "信用风险",
    value: 28,
    maxValue: 100,
    status: "safe",
    trend: "stable",
    description: "投资对象违约或信用下降的风险",
  },
  {
    id: "6",
    name: "操作风险",
    value: 85,
    maxValue: 100,
    status: "danger",
    trend: "up",
    description: "内部流程、人员或系统故障的风险",
  },
];

const riskAlerts: RiskAlert[] = [
  {
    id: "1",
    type: "critical",
    title: "高风险警告：新能源汽车电池项目",
    description: "该项目当前亏损25%，建议重新评估投资策略或考虑止损",
    asset: "新能源汽车电池",
    timestamp: "2024-01-08T10:30:00",
    isRead: false,
  },
  {
    id: "2",
    type: "warning",
    title: "集中度风险提醒",
    description: "房地产和科技行业投资占比超过60%，建议适当分散投资",
    asset: "投资组合",
    timestamp: "2024-01-07T14:20:00",
    isRead: false,
  },
  {
    id: "3",
    type: "info",
    title: "市场波动提醒",
    description: "近期科技板块波动加剧，请关注AI智能制造平台的表现",
    asset: "AI智能制造平台",
    timestamp: "2024-01-06T09:15:00",
    isRead: true,
  },
];

const getStatusConfig = (status: string) => {
  const configs = {
    safe: { label: "安全", color: "from-green-500 to-emerald-500", icon: CheckCircle, textColor: "text-green-400" },
    warning: { label: "警告", color: "from-yellow-500 to-amber-500", icon: AlertTriangle, textColor: "text-yellow-400" },
    danger: { label: "危险", color: "from-red-500 to-pink-500", icon: XCircle, textColor: "text-red-400" },
  };
  return configs[status as keyof typeof configs] || configs.safe;
};

const getAlertConfig = (type: string) => {
  const configs = {
    critical: { color: "border-red-500/50 bg-red-500/10", icon: XCircle, iconColor: "text-red-400" },
    warning: { color: "border-yellow-500/50 bg-yellow-500/10", icon: AlertTriangle, iconColor: "text-yellow-400" },
    info: { color: "border-blue-500/50 bg-blue-500/10", icon: Info, iconColor: "text-blue-400" },
  };
  return configs[type as keyof typeof configs] || configs.info;
};

export default function RiskAssessmentPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [alerts, setAlerts] = useState(riskAlerts);

  const overallRisk = Math.round(riskMetrics.reduce((sum, m) => sum + m.value, 0) / riskMetrics.length);
  const safeCount = riskMetrics.filter(m => m.status === "safe").length;
  const warningCount = riskMetrics.filter(m => m.status === "warning").length;
  const dangerCount = riskMetrics.filter(m => m.status === "danger").length;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;

  const stats = [
    { label: "整体风险评分", value: `${overallRisk}/100`, icon: Gauge, gradient: overallRisk > 70 ? "from-red-500 to-pink-500" : overallRisk > 50 ? "from-yellow-500 to-amber-500" : "from-green-500 to-emerald-500" },
    { label: "安全指标", value: `${safeCount}`, icon: CheckCircle, gradient: "from-green-500 to-emerald-500" },
    { label: "警告指标", value: `${warningCount}`, icon: AlertTriangle, gradient: "from-yellow-500 to-amber-500" },
    { label: "未读警报", value: `${unreadAlerts}`, icon: AlertCircle, gradient: "from-red-500 to-pink-500" },
  ];

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 via-orange-600/20 to-yellow-600/30" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-lg shadow-red-500/30">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-red-100 to-orange-200 bg-clip-text text-transparent">
                      风险评估
                    </h1>
                    <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      实时监控
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">全面评估和监控您的投资风险状况</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <RefreshCw className="w-4 h-4 mr-2" />
                重新评估
              </Button>
              <Button className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-red-500/30">
                <Download className="w-4 h-4 mr-2" />
                风险报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg px-6">
            <Gauge className="w-4 h-4 mr-2" />
            风险概览
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            详细指标
          </TabsTrigger>
          <TabsTrigger value="alerts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-lg px-6">
            <AlertTriangle className="w-4 h-4 mr-2" />
            风险警报
            {unreadAlerts > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadAlerts}</span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Risk Gauge */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-48 h-48">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-800" />
                <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${overallRisk > 70 ? 'from-red-500/20 to-red-600/20' : overallRisk > 50 ? 'from-yellow-500/20 to-yellow-600/20' : 'from-green-500/20 to-green-600/20'}`} />
                <div className="relative text-center">
                  <p className={`text-5xl font-bold ${overallRisk > 70 ? 'text-red-400' : overallRisk > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {overallRisk}
                  </p>
                  <p className="text-slate-400 text-sm">风险评分</p>
                </div>
              </div>
              <p className="text-slate-300 mt-4">
                {overallRisk > 70 ? '您的投资组合风险较高，建议采取措施降低风险' : 
                 overallRisk > 50 ? '您的投资组合风险适中，请持续关注' : 
                 '您的投资组合风险较低，状态良好'}
              </p>
            </div>

            {/* Risk Distribution */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-400">{safeCount}</p>
                <p className="text-sm text-slate-400">安全指标</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
                <AlertTriangle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-yellow-400">{warningCount}</p>
                <p className="text-sm text-slate-400">警告指标</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-400">{dangerCount}</p>
                <p className="text-sm text-slate-400">危险指标</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {riskMetrics.map((metric) => {
              const statusConfig = getStatusConfig(metric.status);
              const StatusIcon = statusConfig.icon;
              const percentage = (metric.value / metric.maxValue) * 100;
              
              return (
                <div key={metric.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white">{metric.name}</h3>
                      <p className="text-sm text-slate-400 mt-1">{metric.description}</p>
                    </div>
                    <Badge className={`bg-gradient-to-r ${statusConfig.color} text-white border-0`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-3xl font-bold ${statusConfig.textColor}`}>{metric.value}</span>
                      <div className="flex items-center gap-1 text-sm">
                        {metric.trend === "up" ? (
                          <ArrowUpRight className="w-4 h-4 text-red-400" />
                        ) : metric.trend === "down" ? (
                          <ArrowDownRight className="w-4 h-4 text-green-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-slate-400" />
                        )}
                        <span className="text-slate-400">
                          {metric.trend === "up" ? "上升" : metric.trend === "down" ? "下降" : "稳定"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${statusConfig.color} transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.map((alert) => {
            const alertConfig = getAlertConfig(alert.type);
            const AlertIcon = alertConfig.icon;
            
            return (
              <div 
                key={alert.id} 
                className={`bg-white/5 backdrop-blur-sm rounded-2xl border ${alertConfig.color} p-6 ${!alert.isRead ? 'ring-2 ring-white/10' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${alertConfig.color}`}>
                    <AlertIcon className={`w-6 h-6 ${alertConfig.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{alert.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                      </div>
                      {!alert.isRead && (
                        <Badge className="bg-red-500 text-white border-0">新</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span>相关资产: {alert.asset}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(alert.timestamp).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {!alert.isRead && (
                          <Button size="sm" variant="outline" onClick={() => markAsRead(alert.id)} className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                            标记已读
                          </Button>
                        )}
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
                          查看详情
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}

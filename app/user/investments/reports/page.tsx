"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Download,
  RefreshCw,
  Calendar,
  Clock,
  Eye,
  Sparkles,
  BarChart3,
  PieChart,
  TrendingUp,
  Filter,
  Search,
  Plus,
  Mail,
  Printer,
  Share2,
  ChevronRight,
  FileBarChart,
  FileSpreadsheet,
  FilePieChart,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: "monthly" | "quarterly" | "annual" | "custom";
  category: "performance" | "risk" | "allocation" | "tax";
  status: "ready" | "generating" | "scheduled";
  generatedAt?: string;
  scheduledAt?: string;
  fileSize?: string;
  pages?: number;
}

const reports: Report[] = [
  {
    id: "1",
    name: "2024年1月投资月报",
    type: "monthly",
    category: "performance",
    status: "ready",
    generatedAt: "2024-01-08T10:30:00",
    fileSize: "2.4 MB",
    pages: 12,
  },
  {
    id: "2",
    name: "2023年Q4季度报告",
    type: "quarterly",
    category: "performance",
    status: "ready",
    generatedAt: "2024-01-05T14:20:00",
    fileSize: "5.8 MB",
    pages: 28,
  },
  {
    id: "3",
    name: "2023年度投资总结",
    type: "annual",
    category: "performance",
    status: "ready",
    generatedAt: "2024-01-02T09:00:00",
    fileSize: "12.3 MB",
    pages: 56,
  },
  {
    id: "4",
    name: "风险评估报告",
    type: "custom",
    category: "risk",
    status: "generating",
  },
  {
    id: "5",
    name: "资产配置分析报告",
    type: "custom",
    category: "allocation",
    status: "scheduled",
    scheduledAt: "2024-01-15T08:00:00",
  },
  {
    id: "6",
    name: "2023年度税务报告",
    type: "annual",
    category: "tax",
    status: "ready",
    generatedAt: "2024-01-03T11:45:00",
    fileSize: "3.2 MB",
    pages: 18,
  },
];

const reportTemplates = [
  { id: "1", name: "投资绩效报告", icon: TrendingUp, description: "详细的投资收益和表现分析" },
  { id: "2", name: "风险分析报告", icon: BarChart3, description: "投资组合风险评估和预警" },
  { id: "3", name: "资产配置报告", icon: PieChart, description: "资产分布和配置优化建议" },
  { id: "4", name: "税务规划报告", icon: FileSpreadsheet, description: "投资相关税务计算和规划" },
];

const getTypeConfig = (type: string) => {
  const configs = {
    monthly: { label: "月报", color: "from-blue-500 to-cyan-500" },
    quarterly: { label: "季报", color: "from-purple-500 to-pink-500" },
    annual: { label: "年报", color: "from-amber-500 to-orange-500" },
    custom: { label: "自定义", color: "from-green-500 to-emerald-500" },
  };
  return configs[type as keyof typeof configs] || configs.custom;
};

const getCategoryConfig = (category: string) => {
  const configs = {
    performance: { label: "绩效", icon: TrendingUp, color: "text-green-400" },
    risk: { label: "风险", icon: BarChart3, color: "text-red-400" },
    allocation: { label: "配置", icon: PieChart, color: "text-blue-400" },
    tax: { label: "税务", icon: FileSpreadsheet, color: "text-amber-400" },
  };
  return configs[category as keyof typeof configs] || configs.performance;
};

const getStatusConfig = (status: string) => {
  const configs = {
    ready: { label: "已生成", icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
    generating: { label: "生成中", icon: Loader2, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    scheduled: { label: "已计划", icon: Clock, color: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  };
  return configs[status as keyof typeof configs] || configs.ready;
};

export default function InvestmentReportsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

  const readyReports = reports.filter(r => r.status === "ready").length;
  const generatingReports = reports.filter(r => r.status === "generating").length;
  const scheduledReports = reports.filter(r => r.status === "scheduled").length;

  const stats = [
    { label: "已生成报告", value: `${readyReports}`, icon: FileText, gradient: "from-green-500 to-emerald-500" },
    { label: "生成中", value: `${generatingReports}`, icon: Loader2, gradient: "from-blue-500 to-cyan-500" },
    { label: "已计划", value: `${scheduledReports}`, icon: Calendar, gradient: "from-amber-500 to-orange-500" },
    { label: "本月报告", value: "3", icon: FileBarChart, gradient: "from-purple-500 to-pink-500" },
  ];

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || report.type === selectedType;
    const matchesTab = activeTab === "all" || report.category === activeTab;
    return matchesSearch && matchesType && matchesTab;
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/30 via-blue-600/20 to-indigo-600/30" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                      投资报告
                    </h1>
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      自动生成
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">查看和下载您的投资分析报告</p>
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
                <Calendar className="w-4 h-4 mr-2" />
                计划报告
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-cyan-500/30">
                <Plus className="w-4 h-4 mr-2" />
                生成报告
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索报告..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50"
            >
              <option value="all">所有类型</option>
              <option value="monthly">月报</option>
              <option value="quarterly">季报</option>
              <option value="annual">年报</option>
              <option value="custom">自定义</option>
            </select>
            <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              更多筛选
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white rounded-lg px-6">
            <FileText className="w-4 h-4 mr-2" />
            全部报告
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg px-6">
            <TrendingUp className="w-4 h-4 mr-2" />
            绩效报告
          </TabsTrigger>
          <TabsTrigger value="risk" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-6">
            <BarChart3 className="w-4 h-4 mr-2" />
            风险报告
          </TabsTrigger>
          <TabsTrigger value="allocation" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-lg px-6">
            <PieChart className="w-4 h-4 mr-2" />
            配置报告
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReports.map((report) => {
            const typeConfig = getTypeConfig(report.type);
            const categoryConfig = getCategoryConfig(report.category);
            const statusConfig = getStatusConfig(report.status);
            const CategoryIcon = categoryConfig.icon;
            const StatusIcon = statusConfig.icon;
            
            return (
              <div key={report.id} className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:border-cyan-500/30 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${typeConfig.color}`}>
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white">{report.name}</h3>
                        <Badge className={`bg-gradient-to-r ${typeConfig.color} text-white border-0`}>
                          {typeConfig.label}
                        </Badge>
                        <Badge className={statusConfig.color}>
                          <StatusIcon className={`w-3 h-3 mr-1 ${report.status === 'generating' ? 'animate-spin' : ''}`} />
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <CategoryIcon className={`w-4 h-4 ${categoryConfig.color}`} />
                          {categoryConfig.label}报告
                        </span>
                        {report.generatedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(report.generatedAt).toLocaleString('zh-CN')}
                          </span>
                        )}
                        {report.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            计划于 {new Date(report.scheduledAt).toLocaleString('zh-CN')}
                          </span>
                        )}
                        {report.fileSize && (
                          <span>{report.fileSize}</span>
                        )}
                        {report.pages && (
                          <span>{report.pages} 页</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {report.status === "ready" && (
                      <>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                          <Eye className="w-4 h-4 mr-1" />
                          预览
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                          <Mail className="w-4 h-4 mr-1" />
                          发送
                        </Button>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                          <Printer className="w-4 h-4 mr-1" />
                          打印
                        </Button>
                        <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>
                      </>
                    )}
                    {report.status === "generating" && (
                      <Button variant="outline" size="sm" disabled className="bg-white/5 border-white/10 text-slate-400">
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        生成中...
                      </Button>
                    )}
                    {report.status === "scheduled" && (
                      <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                        <Calendar className="w-4 h-4 mr-1" />
                        修改计划
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredReports.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12 text-center">
              <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">没有找到报告</h3>
              <p className="text-slate-400 mb-6">尝试调整搜索条件或生成新报告</p>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0">
                <Plus className="w-4 h-4 mr-2" />
                生成新报告
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Report Templates */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <FilePieChart className="w-5 h-5 text-cyan-400" />
          快速生成报告
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTemplates.map((template) => {
            const TemplateIcon = template.icon;
            return (
              <div
                key={template.id}
                className="bg-white/5 rounded-xl border border-white/10 p-4 hover:border-cyan-500/30 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                    <TemplateIcon className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    {template.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-400 mb-4">{template.description}</p>
                <Button variant="outline" size="sm" className="w-full bg-white/5 border-white/10 text-slate-300 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-300">
                  生成报告
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

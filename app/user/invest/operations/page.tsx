"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/user/page-header";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  Clock,
  Eye,
  FileText,
  Building,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Briefcase,
  PieChart,
  LineChart,
  Shield,
  Bell,
  UserCheck,
  ClipboardList,
  Sparkles,
} from "lucide-react";

// 导入用户端样式
import "@/styles/user-pages.css";

// 项目阶段和类型
type ProjectPhase = "DESIGN" | "RENOVATION" | "PRE_OPENING" | "OPERATING";
type ProjectType = "PHYSICAL" | "ONLINE";
type AlertType = "loss" | "capability" | "delay" | "turnover";
type AlertSeverity = "high" | "medium" | "low";

interface InvestorProject {
  id: string;
  name: string;
  type: ProjectType;
  industry: string;
  phase: ProjectPhase;
  progress: number;
  investedAmount: number;
  currentValue: number;
  shareholding: number;
  dailyRevenue: number;
  dailyExpenses: number;
  dailyProfit: number;
  profitLoss: number;
  profitLossRate: number;
  employeeCount: number;
  lastUpdated: string;
  alerts: number;
}

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  projectId: string;
  projectName: string;
  message: string;
  createdAt: string;
}

interface SummaryStats {
  totalProjects: number;
  activeProjects: number;
  totalInvested: number;
  totalValue: number;
  totalProfitLoss: number;
  avgROI: number;
  totalEmployees: number;
  alertCount: number;
}

// 模拟投资者的项目数据
const mockProjects: InvestorProject[] = [
  {
    id: "proj-1", name: "智慧餐饮连锁店", type: "PHYSICAL", industry: "餐饮", phase: "OPERATING",
    progress: 100, investedAmount: 500000, currentValue: 680000, shareholding: 35,
    dailyRevenue: 15800, dailyExpenses: 12500, dailyProfit: 3300,
    profitLoss: 180000, profitLossRate: 36, employeeCount: 28,
    lastUpdated: "2026-01-10T10:30:00", alerts: 0,
  },
  {
    id: "proj-2", name: "在线教育平台", type: "ONLINE", industry: "教育", phase: "OPERATING",
    progress: 100, investedAmount: 300000, currentValue: 420000, shareholding: 25,
    dailyRevenue: 28500, dailyExpenses: 18200, dailyProfit: 10300,
    profitLoss: 120000, profitLossRate: 40, employeeCount: 15,
    lastUpdated: "2026-01-10T09:15:00", alerts: 1,
  },
  {
    id: "proj-3", name: "健康科技诊所", type: "PHYSICAL", industry: "医疗健康", phase: "PRE_OPENING",
    progress: 85, investedAmount: 800000, currentValue: 750000, shareholding: 45,
    dailyRevenue: 0, dailyExpenses: 5200, dailyProfit: -5200,
    profitLoss: -50000, profitLossRate: -6.25, employeeCount: 12,
    lastUpdated: "2026-01-09T16:45:00", alerts: 2,
  },
  {
    id: "proj-4", name: "新能源充电站", type: "PHYSICAL", industry: "新能源", phase: "RENOVATION",
    progress: 60, investedAmount: 1200000, currentValue: 1150000, shareholding: 55,
    dailyRevenue: 0, dailyExpenses: 8500, dailyProfit: -8500,
    profitLoss: -50000, profitLossRate: -4.17, employeeCount: 5,
    lastUpdated: "2026-01-10T08:00:00", alerts: 0,
  },
];

// 模拟预警数据
const mockAlerts: Alert[] = [
  { id: "a1", type: "loss", severity: "high", projectId: "proj-3", projectName: "健康科技诊所", message: "连续3个月亏损，亏损率-6.25%", createdAt: "2026-01-10T08:00:00" },
  { id: "a2", type: "delay", severity: "medium", projectId: "proj-4", projectName: "新能源充电站", message: "装修阶段延期2周", createdAt: "2026-01-09T14:30:00" },
  { id: "a3", type: "turnover", severity: "low", projectId: "proj-2", projectName: "在线教育平台", message: "本月员工流动率较高 (15%)", createdAt: "2026-01-08T10:00:00" },
];

const phaseConfig: Record<ProjectPhase, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  DESIGN: { label: "设计阶段", color: "text-blue-400", bgColor: "bg-blue-500/20", icon: FileText },
  RENOVATION: { label: "装修阶段", color: "text-yellow-400", bgColor: "bg-yellow-500/20", icon: Building },
  PRE_OPENING: { label: "开业准备", color: "text-purple-400", bgColor: "bg-purple-500/20", icon: Clock },
  OPERATING: { label: "正式运营", color: "text-green-400", bgColor: "bg-green-500/20", icon: Activity },
};

const typeConfig: Record<ProjectType, { label: string; icon: typeof Building }> = {
  PHYSICAL: { label: "现实版", icon: Building },
  ONLINE: { label: "网络版", icon: Globe },
};

const formatCurrency = (amount: number) => new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleString("zh-CN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

const getAlertIcon = (type: AlertType) => {
  const icons = { loss: TrendingDown, capability: ClipboardList, delay: Clock, turnover: Users };
  return icons[type] || AlertTriangle;
};

const getSeverityStyle = (severity: AlertSeverity) => {
  const styles = {
    high: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", text: "#f87171" },
    medium: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", text: "#fbbf24" },
    low: { bg: "rgba(59, 130, 246, 0.15)", border: "rgba(59, 130, 246, 0.3)", text: "#60a5fa" },
  };
  return styles[severity];
};

const getSeverityLabel = (severity: AlertSeverity) => ({ high: "高", medium: "中", low: "低" }[severity]);

export default function InvestorOperationsPage() {
  const [selectedPhase, setSelectedPhase] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [projects] = useState<InvestorProject[]>(mockProjects);
  const [alerts] = useState<Alert[]>(mockAlerts);

  const stats: SummaryStats = {
    totalProjects: projects.length,
    activeProjects: projects.filter((p) => p.phase === "OPERATING").length,
    totalInvested: projects.reduce((sum, p) => sum + p.investedAmount, 0),
    totalValue: projects.reduce((sum, p) => sum + p.currentValue, 0),
    totalProfitLoss: projects.reduce((sum, p) => sum + p.profitLoss, 0),
    avgROI: projects.reduce((sum, p) => sum + p.profitLossRate, 0) / projects.length,
    totalEmployees: projects.reduce((sum, p) => sum + p.employeeCount, 0),
    alertCount: alerts.length,
  };

  const headerStats = [
    { label: "总投资金额", value: formatCurrency(stats.totalInvested), icon: DollarSign, color: "bg-blue-500" },
    { label: "当前总价值", value: formatCurrency(stats.totalValue), icon: TrendingUp, color: "bg-green-500" },
    { label: "总盈亏", value: formatCurrency(stats.totalProfitLoss), icon: stats.totalProfitLoss >= 0 ? TrendingUp : TrendingDown, color: stats.totalProfitLoss >= 0 ? "bg-green-500" : "bg-red-500" },
    { label: "运营中项目", value: `${stats.activeProjects}/${stats.totalProjects}`, icon: Activity, color: "bg-purple-500" },
  ];

  const filteredProjects = projects.filter((project) => selectedPhase === "all" || project.phase === selectedPhase);

  return (
    <div className="space-y-6">
      <PageHeader
        title="项目运营监控"
        description="实时追踪您投资项目的运营状态、财务数据和团队表现"
        icon={BarChart3}
        stats={headerStats}
        actions={
          stats.alertCount > 0 && (
            <button className="user-button user-button-secondary user-button-sm" style={{ borderColor: "rgba(239, 68, 68, 0.5)", color: "#f87171" }}>
              <Bell className="w-4 h-4" />
              <span>{stats.alertCount} 个预警</span>
            </button>
          )
        }
      />

      {/* 主要标签页导航 - 用户端玻璃态风格 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="user-tabs">
          <TabsTrigger value="overview" className={`user-tab ${activeTab === "overview" ? "active" : ""}`}>
            <PieChart className="user-tab-icon" />
            项目概览
          </TabsTrigger>
          <TabsTrigger value="profit-loss" className={`user-tab ${activeTab === "profit-loss" ? "active" : ""}`}>
            <LineChart className="user-tab-icon" />
            盈亏分析
          </TabsTrigger>
          <TabsTrigger value="employees" className={`user-tab ${activeTab === "employees" ? "active" : ""}`}>
            <Users className="user-tab-icon" />
            员工管理
          </TabsTrigger>
          <TabsTrigger value="salary" className={`user-tab ${activeTab === "salary" ? "active" : ""}`}>
            <DollarSign className="user-tab-icon" />
            薪资透明
          </TabsTrigger>
          <TabsTrigger value="alerts" className={`user-tab ${activeTab === "alerts" ? "active" : ""}`}>
            <AlertTriangle className="user-tab-icon" />
            预警中心
            {stats.alertCount > 0 && <span className="user-tab-badge">{stats.alertCount}</span>}
          </TabsTrigger>
        </TabsList>

        {/* 项目概览标签页 */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* 统计卡片 - 玻璃态风格 */}
          <div className="user-page-stats-grid">
            <GlassStatCard icon={Briefcase} label="项目总数" value={stats.totalProjects.toString()} color="purple" />
            <GlassStatCard icon={Activity} label="运营中" value={stats.activeProjects.toString()} color="green" />
            <GlassStatCard icon={DollarSign} label="总投资" value={formatCurrency(stats.totalInvested)} color="blue" small />
            <GlassStatCard icon={TrendingUp} label="总盈亏" value={formatCurrency(stats.totalProfitLoss)} color={stats.totalProfitLoss >= 0 ? "green" : "red"} small />
            <GlassStatCard icon={BarChart3} label="平均ROI" value={`${stats.avgROI.toFixed(1)}%`} color="yellow" />
            <GlassStatCard icon={Users} label="员工总数" value={stats.totalEmployees.toString()} color="indigo" />
            <GlassStatCard icon={AlertTriangle} label="预警" value={stats.alertCount.toString()} color={stats.alertCount > 0 ? "red" : "green"} />
          </div>

          {/* 快速导航 - 玻璃态风格 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassNavCard icon={Briefcase} title="项目生命周期" description="追踪阶段和里程碑" color="blue" onClick={() => setActiveTab("overview")} />
            <GlassNavCard icon={TrendingUp} title="盈亏分析" description="财务表现分析" color="green" onClick={() => setActiveTab("profit-loss")} />
            <GlassNavCard icon={UserCheck} title="员工透明化" description="团队构成" color="purple" onClick={() => setActiveTab("employees")} />
            <GlassNavCard icon={DollarSign} title="薪资透明化" description="人力成本" color="yellow" onClick={() => setActiveTab("salary")} />
          </div>

          {/* 阶段筛选 - 玻璃态按钮 */}
          <div className="user-filter-buttons">
            <button onClick={() => setSelectedPhase("all")} className={`user-button user-button-sm ${selectedPhase === "all" ? "user-button-primary" : "user-button-secondary"}`}>
              全部项目
            </button>
            {Object.entries(phaseConfig).map(([phase, config]) => {
              const Icon = config.icon;
              return (
                <button key={phase} onClick={() => setSelectedPhase(phase)} className={`user-button user-button-sm ${selectedPhase === phase ? "user-button-primary" : "user-button-secondary"}`}>
                  <Icon className="w-4 h-4" />
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>

          {/* 项目卡片列表 - 玻璃态风格 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProjects.map((project) => (
              <GlassProjectCard key={project.id} project={project} />
            ))}
          </div>
        </TabsContent>

        {/* 盈亏分析标签页 */}
        <TabsContent value="profit-loss" className="space-y-6 mt-6">
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon">
                <LineChart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="user-card-title">盈亏趋势分析</h3>
                <p className="user-card-description">各项目财务表现对比</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div key={project.id} className="user-list-item" style={{ cursor: "default" }}>
                    <div className="user-list-item-content">
                      <div className="user-list-item-header">
                        <span className="user-list-item-title">{project.name}</span>
                        <Badge style={{ background: project.profitLoss >= 0 ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)", color: project.profitLoss >= 0 ? "#34d399" : "#f87171" }}>
                          {project.profitLoss >= 0 ? "+" : ""}{project.profitLossRate.toFixed(1)}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        <div>
                          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>投资金额</p>
                          <p style={{ color: "white", fontWeight: 600 }}>{formatCurrency(project.investedAmount)}</p>
                        </div>
                        <div>
                          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>当前价值</p>
                          <p style={{ color: "white", fontWeight: 600 }}>{formatCurrency(project.currentValue)}</p>
                        </div>
                        <div>
                          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>盈亏</p>
                          <p style={{ color: project.profitLoss >= 0 ? "#34d399" : "#f87171", fontWeight: 600 }}>
                            {project.profitLoss >= 0 ? "+" : ""}{formatCurrency(project.profitLoss)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROI 对比 */}
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="user-card-title">投资回报率对比</h3>
                <p className="user-card-description">各项目ROI可视化对比</p>
              </div>
            </div>
            <div className="user-card-content space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center gap-4">
                  <div style={{ width: "140px", color: "white", fontSize: "14px" }} className="truncate">{project.name}</div>
                  <div className="flex-1 h-6 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(Math.abs(project.profitLossRate), 100)}%`, background: project.profitLossRate >= 0 ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #ef4444, #f87171)" }} />
                  </div>
                  <div style={{ width: "70px", textAlign: "right", fontWeight: 600, color: project.profitLossRate >= 0 ? "#34d399" : "#f87171" }}>
                    {project.profitLossRate >= 0 ? "+" : ""}{project.profitLossRate.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* 员工管理标签页 */}
        <TabsContent value="employees" className="space-y-6 mt-6">
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="user-card-title">员工分布概览</h3>
                <p className="user-card-description">各项目团队规模</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="user-page-stat-card text-center" style={{ flexDirection: "column", alignItems: "center" }}>
                    <div className={`w-14 h-14 ${phaseConfig[project.phase].bgColor} rounded-full flex items-center justify-center mb-3`}>
                      <Users className={`w-7 h-7 ${phaseConfig[project.phase].color}`} />
                    </div>
                    <h4 style={{ color: "white", fontWeight: 500, marginBottom: "4px" }}>{project.name}</h4>
                    <p style={{ fontSize: "32px", fontWeight: 700, color: "white", marginBottom: "4px" }}>{project.employeeCount}</p>
                    <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>员工</p>
                    <Badge className={`mt-2 ${phaseConfig[project.phase].bgColor} ${phaseConfig[project.phase].color}`} style={{ border: "none" }}>
                      {phaseConfig[project.phase].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)" }}>
                <UserCheck className="w-5 h-5" style={{ color: "#34d399" }} />
              </div>
              <div>
                <h3 className="user-card-title">团队能力评估</h3>
                <p className="user-card-description">运营中项目团队表现</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.filter(p => p.phase === "OPERATING").map((project) => (
                  <div key={project.id} className="user-list-item" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch" }}>
                    <h4 style={{ color: "white", fontWeight: 500, marginBottom: "16px" }}>{project.name}</h4>
                    <div className="space-y-3">
                      <GlassSkillBar label="专业技能" value={85} color="blue" />
                      <GlassSkillBar label="团队协作" value={78} color="green" />
                      <GlassSkillBar label="客户服务" value={92} color="purple" />
                      <GlassSkillBar label="工作效率" value={70} color="yellow" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* 薪资透明标签页 */}
        <TabsContent value="salary" className="space-y-6 mt-6">
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.15) 100%)" }}>
                <DollarSign className="w-5 h-5" style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <h3 className="user-card-title">人力成本汇总</h3>
                <p className="user-card-description">各项目人力成本分析</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.map((project) => {
                  const avgSalary = project.phase === "OPERATING" ? Math.round(project.dailyExpenses * 0.4 * 30 / project.employeeCount) : 8000;
                  const totalLabor = avgSalary * project.employeeCount;
                  return (
                    <div key={project.id} className="user-list-item" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch" }}>
                      <h4 style={{ color: "white", fontWeight: 500, marginBottom: "12px" }}>{project.name}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>员工数</span>
                          <span style={{ color: "white" }}>{project.employeeCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>平均薪资</span>
                          <span style={{ color: "white" }}>{formatCurrency(avgSalary)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>月人力成本</span>
                          <span style={{ color: "#fbbf24", fontWeight: 600 }}>{formatCurrency(totalLabor)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.15) 100%)" }}>
                <Shield className="w-5 h-5" style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <h3 className="user-card-title">五险一金明细</h3>
                <p className="user-card-description">各项目社保公积金支出</p>
              </div>
            </div>
            <div className="user-card-content overflow-x-auto">
              <table style={{ width: "100%", fontSize: "14px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <th style={{ textAlign: "left", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>项目</th>
                    <th style={{ textAlign: "right", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>养老保险</th>
                    <th style={{ textAlign: "right", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>医疗保险</th>
                    <th style={{ textAlign: "right", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>失业保险</th>
                    <th style={{ textAlign: "right", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>工伤保险</th>
                    <th style={{ textAlign: "right", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>住房公积金</th>
                    <th style={{ textAlign: "right", color: "rgba(255,255,255,0.5)", padding: "12px 16px" }}>合计</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => {
                    const base = 8000 * project.employeeCount;
                    return (
                      <tr key={project.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ color: "white", padding: "12px 16px" }}>{project.name}</td>
                        <td style={{ textAlign: "right", color: "rgba(255,255,255,0.7)", padding: "12px 16px" }}>{formatCurrency(base * 0.16)}</td>
                        <td style={{ textAlign: "right", color: "rgba(255,255,255,0.7)", padding: "12px 16px" }}>{formatCurrency(base * 0.08)}</td>
                        <td style={{ textAlign: "right", color: "rgba(255,255,255,0.7)", padding: "12px 16px" }}>{formatCurrency(base * 0.005)}</td>
                        <td style={{ textAlign: "right", color: "rgba(255,255,255,0.7)", padding: "12px 16px" }}>{formatCurrency(base * 0.002)}</td>
                        <td style={{ textAlign: "right", color: "rgba(255,255,255,0.7)", padding: "12px 16px" }}>{formatCurrency(base * 0.12)}</td>
                        <td style={{ textAlign: "right", color: "#fbbf24", fontWeight: 600, padding: "12px 16px" }}>{formatCurrency(base * 0.347)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* 预警中心标签页 */}
        <TabsContent value="alerts" className="space-y-6 mt-6">
          {alerts.length > 0 ? (
            <div className="user-card">
              <div className="user-card-header">
                <div className="user-card-header-icon" style={{ background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)" }}>
                  <AlertTriangle className="w-5 h-5" style={{ color: "#f87171" }} />
                </div>
                <div>
                  <h3 className="user-card-title">活跃预警 ({alerts.length})</h3>
                  <p className="user-card-description">需要关注的项目问题</p>
                </div>
              </div>
              <div className="user-card-content space-y-4">
                {alerts.map((alert) => {
                  const AlertIcon = getAlertIcon(alert.type);
                  const style = getSeverityStyle(alert.severity);
                  return (
                    <div key={alert.id} className="user-list-item" style={{ background: style.bg, borderColor: style.border, cursor: "default" }}>
                      <div className="user-list-item-icon" style={{ background: style.bg, color: style.text }}>
                        <AlertIcon className="w-5 h-5" />
                      </div>
                      <div className="user-list-item-content">
                        <div className="user-list-item-header">
                          <span className="user-list-item-title">{alert.projectName}</span>
                          <Badge style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}>
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                        </div>
                        <p className="user-list-item-description" style={{ color: style.text, opacity: 0.9 }}>{alert.message}</p>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{formatDate(alert.createdAt)}</p>
                      </div>
                      <button className="user-button user-button-ghost user-button-sm">
                        <Eye className="w-4 h-4" />
                        <span>查看</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="user-card">
              <div className="user-empty-state">
                <div className="user-empty-state-icon" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
                  <Activity className="w-10 h-10" style={{ color: "#34d399" }} />
                </div>
                <h3 className="user-empty-state-title">一切正常</h3>
                <p className="user-empty-state-description">目前没有需要关注的预警信息</p>
              </div>
            </div>
          )}

          {/* 亏损分析 */}
          {projects.some(p => p.profitLoss < 0) && (
            <div className="user-card">
              <div className="user-card-header">
                <div className="user-card-header-icon">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="user-card-title">亏损项目分析</h3>
                  <p className="user-card-description">亏损原因与改进建议</p>
                </div>
              </div>
              <div className="user-card-content space-y-4">
                {projects.filter(p => p.profitLoss < 0).map((project) => (
                  <div key={project.id} className="user-list-item" style={{ cursor: "default", flexDirection: "column", alignItems: "stretch" }}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 style={{ color: "white", fontWeight: 500 }}>{project.name}</h4>
                      <Badge style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171" }}>
                        亏损 {formatCurrency(Math.abs(project.profitLoss))}
                      </Badge>
                    </div>
                    <div className="space-y-2" style={{ fontSize: "14px" }}>
                      <p style={{ color: "rgba(255,255,255,0.5)" }}>
                        <span style={{ color: "white" }}>阶段:</span> {phaseConfig[project.phase].label}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.5)" }}>
                        <span style={{ color: "white" }}>主要原因:</span> {project.phase !== "OPERATING" ? "项目尚未进入运营阶段，处于投入期" : "运营成本较高，需要优化"}
                      </p>
                      <p style={{ color: "rgba(255,255,255,0.5)" }}>
                        <span style={{ color: "white" }}>改进建议:</span> {project.phase !== "OPERATING" ? "按计划推进项目，确保按时开业" : "优化运营流程，控制成本支出"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// 玻璃态统计卡片组件
function GlassStatCard({ icon: Icon, label, value, color, small = false }: { icon: React.ComponentType<any>; label: string; value: string; color: string; small?: boolean }) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
    green: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
    red: { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
    yellow: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
    purple: { bg: "rgba(168, 85, 247, 0.2)", text: "#c4b5fd" },
    indigo: { bg: "rgba(99, 102, 241, 0.2)", text: "#a5b4fc" },
  };
  const colors = colorMap[color] || colorMap.purple;

  return (
    <div className="user-page-stat-card">
      <div className="user-page-stat-icon" style={{ background: colors.bg, color: colors.text }}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="user-page-stat-content">
        <span className="user-page-stat-value" style={{ fontSize: small ? "16px" : "24px" }}>{value}</span>
        <span className="user-page-stat-label">{label}</span>
      </div>
    </div>
  );
}

// 玻璃态导航卡片组件
function GlassNavCard({ icon: Icon, title, description, color, onClick }: { icon: React.ComponentType<any>; title: string; description: string; color: string; onClick: () => void }) {
  const colorMap: Record<string, { bg: string; text: string; hover: string }> = {
    blue: { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", hover: "rgba(59, 130, 246, 0.25)" },
    green: { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", hover: "rgba(16, 185, 129, 0.25)" },
    purple: { bg: "rgba(168, 85, 247, 0.15)", text: "#c4b5fd", hover: "rgba(168, 85, 247, 0.25)" },
    yellow: { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", hover: "rgba(245, 158, 11, 0.25)" },
  };
  const colors = colorMap[color] || colorMap.purple;

  return (
    <button onClick={onClick} className="user-list-item group" style={{ cursor: "pointer" }}>
      <div style={{ width: "48px", height: "48px", background: colors.bg, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", color: colors.text, transition: "all 0.3s ease", flexShrink: 0 }}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="user-list-item-content">
        <h3 style={{ color: "white", fontWeight: 500, marginBottom: "4px" }}>{title}</h3>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>{description}</p>
      </div>
      <Sparkles className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
    </button>
  );
}

// 玻璃态项目卡片组件
function GlassProjectCard({ project }: { project: InvestorProject }) {
  const PhaseIcon = phaseConfig[project.phase].icon;
  const TypeIcon = typeConfig[project.type].icon;
  const returnAmount = project.currentValue - project.investedAmount;
  const returnPercentage = (returnAmount / project.investedAmount) * 100;
  const isPositive = returnAmount >= 0;

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div style={{ width: "44px", height: "44px", background: phaseConfig[project.phase].bgColor, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <PhaseIcon className={`w-5 h-5 ${phaseConfig[project.phase].color}`} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 className="user-card-title">{project.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
              <TypeIcon className="w-3 h-3" />
              {typeConfig[project.type].label}
            </Badge>
            <Badge style={{ background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontSize: "11px" }}>{project.industry}</Badge>
            <Badge className={`${phaseConfig[project.phase].bgColor} ${phaseConfig[project.phase].color}`} style={{ fontSize: "11px" }}>{phaseConfig[project.phase].label}</Badge>
          </div>
        </div>
        {project.alerts > 0 && (
          <Badge style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171", display: "flex", alignItems: "center", gap: "4px" }}>
            <AlertTriangle className="w-3 h-3" />
            {project.alerts}
          </Badge>
        )}
      </div>
      <div className="user-card-content space-y-4">
        {/* 进度条 */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span style={{ color: "rgba(255,255,255,0.5)" }}>项目进度</span>
            <span style={{ color: "white" }}>{project.progress}%</span>
          </div>
          <div style={{ width: "100%", height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "4px", background: `linear-gradient(90deg, ${phaseConfig[project.phase].color.replace("text-", "").replace("-400", "")}, ${phaseConfig[project.phase].color.replace("text-", "").replace("-400", "-300")})`, width: `${project.progress}%`, transition: "width 0.5s ease" }} className={phaseConfig[project.phase].bgColor.replace("/20", "")} />
          </div>
        </div>

        {/* 投资信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "4px" }}>投资金额</p>
            <p style={{ color: "white", fontWeight: 600 }}>{formatCurrency(project.investedAmount)}</p>
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "4px" }}>当前价值</p>
            <p style={{ color: "white", fontWeight: 600 }}>{formatCurrency(project.currentValue)}</p>
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "4px" }}>持股比例</p>
            <p style={{ color: "white", fontWeight: 600 }}>{project.shareholding}%</p>
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "4px" }}>投资回报</p>
            <div className="flex items-center gap-1">
              {isPositive ? <ArrowUpRight className="w-4 h-4" style={{ color: "#34d399" }} /> : <ArrowDownRight className="w-4 h-4" style={{ color: "#f87171" }} />}
              <span style={{ fontWeight: 600, color: isPositive ? "#34d399" : "#f87171" }}>
                {isPositive ? "+" : ""}{returnPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* 运营数据 */}
        {project.phase === "OPERATING" && (
          <div style={{ padding: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "8px" }}>今日运营数据</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p style={{ color: "#34d399", fontWeight: 600, fontSize: "14px" }}>{formatCurrency(project.dailyRevenue)}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>收入</p>
              </div>
              <div>
                <p style={{ color: "#f87171", fontWeight: 600, fontSize: "14px" }}>{formatCurrency(project.dailyExpenses)}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>支出</p>
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: "14px", color: project.dailyProfit >= 0 ? "#34d399" : "#f87171" }}>{formatCurrency(project.dailyProfit)}</p>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>利润</p>
              </div>
            </div>
          </div>
        )}

        {/* 底部信息 */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-4" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {project.employeeCount} 人
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(project.lastUpdated)}
            </span>
          </div>
          <button className="user-button user-button-ghost user-button-sm">
            <Eye className="w-4 h-4" />
            <span>详情</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 玻璃态技能条组件
function GlassSkillBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "linear-gradient(90deg, #3b82f6, #60a5fa)",
    green: "linear-gradient(90deg, #10b981, #34d399)",
    purple: "linear-gradient(90deg, #a855f7, #c4b5fd)",
    yellow: "linear-gradient(90deg, #f59e0b, #fbbf24)",
  };

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span style={{ color: "rgba(255,255,255,0.5)" }}>{label}</span>
        <span style={{ color: "white" }}>{value}%</span>
      </div>
      <div style={{ height: "8px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", overflow: "hidden" }}>
        <div style={{ height: "100%", background: colorMap[color], borderRadius: "4px", width: `${value}%`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

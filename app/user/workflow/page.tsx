"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import {
  Workflow,
  Play,
  Pause,
  Plus,
  Settings,
  GitBranch,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  ArrowRight,
  MoreHorizontal,
  Filter,
  Search,
  Zap,
  Target,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
} from "lucide-react";

// 导入用户端样式
import "@/styles/user-pages.css";

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: "active" | "pending" | "completed" | "error";
  steps: number;
  completedSteps: number;
  assignee: string;
  createdAt: string;
  priority: "high" | "medium" | "low";
  category: string;
}

const mockWorkflows: WorkflowItem[] = [
  {
    id: "1",
    name: "项目审批流程",
    description: "新项目立项审批工作流，需要部门经理和总监审批",
    status: "active",
    steps: 5,
    completedSteps: 3,
    assignee: "张经理",
    createdAt: "2026-01-05",
    priority: "high",
    category: "项目管理",
  },
  {
    id: "2",
    name: "采购申请流程",
    description: "设备采购申请审批流程，包含预算审核和供应商选择",
    status: "pending",
    steps: 4,
    completedSteps: 1,
    assignee: "李主管",
    createdAt: "2026-01-07",
    priority: "medium",
    category: "采购管理",
  },
  {
    id: "3",
    name: "员工入职流程",
    description: "新员工入职办理流程，包含资料收集和培训安排",
    status: "completed",
    steps: 6,
    completedSteps: 6,
    assignee: "HR部门",
    createdAt: "2026-01-03",
    priority: "low",
    category: "人事管理",
  },
  {
    id: "4",
    name: "合同审批流程",
    description: "客户合同审批流程，需要法务和财务部门审核",
    status: "error",
    steps: 4,
    completedSteps: 2,
    assignee: "王律师",
    createdAt: "2026-01-08",
    priority: "high",
    category: "合同管理",
  },
  {
    id: "5",
    name: "报销审批流程",
    description: "员工费用报销审批流程",
    status: "active",
    steps: 3,
    completedSteps: 2,
    assignee: "财务部",
    createdAt: "2026-01-09",
    priority: "medium",
    category: "财务管理",
  },
];

const statusConfig: Record<string, { icon: typeof Play; bg: string; text: string; label: string }> = {
  active: { icon: Play, bg: "rgba(16, 185, 129, 0.2)", text: "#34d399", label: "进行中" },
  pending: { icon: Clock, bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24", label: "待处理" },
  completed: { icon: CheckCircle, bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa", label: "已完成" },
  error: { icon: AlertCircle, bg: "rgba(239, 68, 68, 0.2)", text: "#f87171", label: "异常" },
};

const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171", label: "高优先级" },
  medium: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24", label: "中优先级" },
  low: { bg: "rgba(107, 114, 128, 0.2)", text: "#9ca3af", label: "低优先级" },
};

const categories = ["全部", "项目管理", "采购管理", "人事管理", "合同管理", "财务管理"];
const statusFilters = ["全部", "active", "pending", "completed", "error"];

export default function WorkflowPage() {
  const [workflows] = useState<WorkflowItem[]>(mockWorkflows);
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState("全部");
  const [searchTerm, setSearchTerm] = useState("");

  const stats = [
    { label: "活跃流程", value: workflows.filter(w => w.status === "active").length.toString(), icon: Play, color: "green" },
    { label: "待处理", value: workflows.filter(w => w.status === "pending").length.toString(), icon: Clock, color: "yellow" },
    { label: "已完成", value: workflows.filter(w => w.status === "completed").length.toString(), icon: CheckCircle, color: "blue" },
    { label: "异常流程", value: workflows.filter(w => w.status === "error").length.toString(), icon: AlertCircle, color: "red" },
  ];

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesCategory = selectedCategory === "全部" || workflow.category === selectedCategory;
    const matchesStatus = selectedStatus === "全部" || workflow.status === selectedStatus;
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="工作流程"
        description="管理和监控您的工作流程"
        icon={Workflow}
        stats={stats.map(s => ({ ...s, color: `bg-${s.color}-500` }))}
        actions={
          <div className="flex gap-3">
            <button className="user-button user-button-secondary user-button-sm">
              <Settings className="w-4 h-4" />
              <span>流程模板</span>
            </button>
            <button className="user-button user-button-primary user-button-sm">
              <Plus className="w-4 h-4" />
              <span>创建流程</span>
            </button>
          </div>
        }
      />

      {/* 统计卡片 - 玻璃态风格 */}
      <div className="user-page-stats-grid">
        {stats.map((stat, index) => {
          const colorMap: Record<string, { bg: string; text: string }> = {
            green: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
            yellow: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
            blue: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
            red: { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
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

      {/* 搜索和筛选栏 - 玻璃态风格 */}
      <div className="user-search-filter-bar">
        <div className="user-search-input-wrapper">
          <Search className="user-search-icon" />
          <input
            type="text"
            placeholder="搜索流程..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="user-search-input"
          />
        </div>
        <div className="user-filter-buttons">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`user-button user-button-sm ${selectedCategory === category ? "user-button-primary" : "user-button-secondary"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 状态筛选 - 玻璃态风格 */}
      <div className="user-filter-buttons">
        {statusFilters.map((status) => {
          const config = status === "全部" ? null : statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`user-button user-button-sm ${selectedStatus === status ? "user-button-primary" : "user-button-secondary"}`}
            >
              {config && <config.icon className="w-4 h-4" />}
              <span>{status === "全部" ? "全部状态" : config?.label}</span>
            </button>
          );
        })}
      </div>

      {/* 流程列表 - 玻璃态风格 */}
      <div className="space-y-4">
        {filteredWorkflows.map((workflow) => (
          <GlassWorkflowCard key={workflow.id} workflow={workflow} />
        ))}
      </div>

      {/* 空状态 */}
      {filteredWorkflows.length === 0 && (
        <div className="user-card">
          <div className="user-empty-state">
            <div className="user-empty-state-icon" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
              <Workflow className="w-10 h-10" style={{ color: "#c4b5fd" }} />
            </div>
            <h3 className="user-empty-state-title">没有找到匹配的流程</h3>
            <p className="user-empty-state-description">
              尝试调整筛选条件或创建新的工作流程
            </p>
            <button className="user-button user-button-primary user-button-sm">
              <Plus className="w-4 h-4" />
              <span>创建流程</span>
            </button>
          </div>
        </div>
      )}

      {/* 流程模板推荐 - 玻璃态风格 */}
      <div className="user-card">
        <div className="user-card-header">
          <div className="user-card-header-icon" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
            <Zap className="w-5 h-5" style={{ color: "#c4b5fd" }} />
          </div>
          <div>
            <h3 className="user-card-title">推荐流程模板</h3>
            <p className="user-card-description">快速创建常用工作流程</p>
          </div>
        </div>
        <div className="user-card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: "请假审批", icon: Clock, color: "#60a5fa", steps: 3 },
              { name: "报销流程", icon: Target, color: "#34d399", steps: 4 },
              { name: "项目立项", icon: GitBranch, color: "#c4b5fd", steps: 5 },
            ].map((template, index) => (
              <button
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl transition-all text-left"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: template.color + "33",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <template.icon className="w-6 h-6" style={{ color: template.color }} />
                </div>
                <div className="flex-1">
                  <p style={{ color: "white", fontWeight: 500, fontSize: "14px" }}>{template.name}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{template.steps} 个步骤</p>
                </div>
                <ArrowRight className="w-5 h-5" style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 玻璃态工作流卡片组件
function GlassWorkflowCard({ workflow }: { workflow: WorkflowItem }) {
  const status = statusConfig[workflow.status];
  const priority = priorityConfig[workflow.priority];
  const progress = Math.round((workflow.completedSteps / workflow.steps) * 100);

  return (
    <div className="user-card" style={{ cursor: "default" }}>
      <div style={{ padding: "20px" }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 style={{ color: "white", fontWeight: 600, fontSize: "16px" }}>{workflow.name}</h3>
              <Badge style={{ background: status.bg, color: status.text, border: "none", fontSize: "11px" }}>
                {status.label}
              </Badge>
              <Badge style={{ background: priority.bg, color: priority.text, border: "none", fontSize: "11px" }}>
                {priority.label}
              </Badge>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px", marginBottom: "12px" }}>
              {workflow.description}
            </p>
            <div className="flex items-center gap-4" style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)" }}>
              <span className="flex items-center gap-1">
                <GitBranch className="w-4 h-4" />
                {workflow.completedSteps}/{workflow.steps} 步骤
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {workflow.assignee}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(workflow.createdAt).toLocaleDateString("zh-CN")}
              </span>
              <Badge
                style={{
                  background: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontSize: "11px",
                }}
              >
                {workflow.category}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {workflow.status === "active" && (
              <button className="user-button user-button-secondary user-button-sm">
                <Pause className="w-4 h-4" />
              </button>
            )}
            {workflow.status === "pending" && (
              <button className="user-button user-button-primary user-button-sm">
                <Play className="w-4 h-4" />
              </button>
            )}
            {workflow.status === "error" && (
              <button className="user-button user-button-secondary user-button-sm" style={{ color: "#f87171" }}>
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            <button className="user-button user-button-ghost user-button-sm">
              <Eye className="w-4 h-4" />
            </button>
            <button className="user-button user-button-ghost user-button-sm">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>进度</span>
            <span style={{ color: status.text, fontSize: "12px", fontWeight: 500 }}>{progress}%</span>
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
                width: `${progress}%`,
                height: "100%",
                background: status.text,
                borderRadius: "3px",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center gap-2 mt-4">
          {Array.from({ length: workflow.steps }).map((_, index) => {
            const isCompleted = index < workflow.completedSteps;
            const isCurrent = index === workflow.completedSteps;
            return (
              <div key={index} className="flex items-center">
                <div
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    background: isCompleted ? status.bg : isCurrent ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                    border: isCurrent ? `2px solid ${status.text}` : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3" style={{ color: status.text }} />
                  ) : (
                    <span style={{ color: isCurrent ? status.text : "rgba(255,255,255,0.3)", fontSize: "10px", fontWeight: 600 }}>
                      {index + 1}
                    </span>
                  )}
                </div>
                {index < workflow.steps - 1 && (
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      background: isCompleted ? status.text : "rgba(255,255,255,0.1)",
                      margin: "0 2px",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

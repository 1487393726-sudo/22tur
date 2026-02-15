"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "paused" | "planning";
  priority: "high" | "medium" | "low";
  progress: number;
  dueDate: string;
  teamMembers: number;
  tasksCompleted: number;
  totalTasks: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "企业网站重构",
    description: "重新设计和开发公司官方网站，提升用户体验",
    status: "active",
    priority: "high",
    progress: 75,
    dueDate: "2024-02-15",
    teamMembers: 5,
    tasksCompleted: 12,
    totalTasks: 16,
  },
  {
    id: "2",
    name: "移动应用开发",
    description: "开发iOS和Android移动应用",
    status: "active",
    priority: "medium",
    progress: 45,
    dueDate: "2024-03-20",
    teamMembers: 3,
    tasksCompleted: 8,
    totalTasks: 18,
  },
  {
    id: "3",
    name: "数据分析平台",
    description: "构建内部数据分析和报告平台",
    status: "planning",
    priority: "low",
    progress: 10,
    dueDate: "2024-04-30",
    teamMembers: 2,
    tasksCompleted: 2,
    totalTasks: 20,
  },
];

const statusConfig = {
  active: { label: "进行中", color: "bg-green-500", icon: CheckCircle },
  completed: { label: "已完成", color: "bg-blue-500", icon: CheckCircle },
  paused: { label: "暂停", color: "bg-yellow-500", icon: AlertCircle },
  planning: { label: "规划中", color: "bg-gray-500", icon: Clock },
};

const priorityConfig = {
  high: { label: "高", color: "bg-red-500" },
  medium: { label: "中", color: "bg-yellow-500" },
  low: { label: "低", color: "bg-green-500" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="purple-gradient-hero rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold purple-gradient-title">项目管理</h1>
            <p className="purple-gradient-subtitle">管理和跟踪您的所有项目</p>
          </div>
          <Button className="purple-gradient-button">
            <Plus className="w-4 h-4 mr-2" />
            新建项目
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="purple-gradient-card p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="purple-gradient-input w-full pl-10 pr-4 py-2"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="purple-gradient-input px-4 py-2"
          >
            <option value="all">所有状态</option>
            <option value="active">进行中</option>
            <option value="completed">已完成</option>
            <option value="paused">暂停</option>
            <option value="planning">规划中</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const StatusIcon = statusConfig[project.status].icon;
          return (
            <div key={project.id} className="purple-gradient-card hover:transform hover:scale-105 transition-all duration-300">
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="purple-gradient-text text-lg font-semibold mb-2">
                      {project.name}
                    </h3>
                    <p className="purple-gradient-subtitle text-sm line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center justify-between">
                  <Badge className={`${statusConfig[project.status].color} text-white`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig[project.status].label}
                  </Badge>
                  <Badge className={`${priorityConfig[project.priority].color} text-white`}>
                    {priorityConfig[project.priority].label}优先级
                  </Badge>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="purple-gradient-text text-sm">进度</span>
                    <span className="purple-gradient-text text-sm">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="purple-gradient-text font-semibold">{project.tasksCompleted}/{project.totalTasks}</div>
                    <div className="purple-gradient-subtitle text-xs">任务</div>
                  </div>
                  <div>
                    <div className="purple-gradient-text font-semibold">{project.teamMembers}</div>
                    <div className="purple-gradient-subtitle text-xs">成员</div>
                  </div>
                  <div>
                    <div className="purple-gradient-text font-semibold">
                      {new Date(project.dueDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                    </div>
                    <div className="purple-gradient-subtitle text-xs">截止</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                    查看详情
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
                    编辑
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="purple-gradient-card">
          <div className="text-center py-12">
            <div className="purple-gradient-subtitle mb-4">
              <Calendar className="w-12 h-12 mx-auto mb-4" />
              <p>没有找到匹配的项目</p>
            </div>
            <Button variant="outline" className="purple-gradient-button">
              清除筛选条件
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
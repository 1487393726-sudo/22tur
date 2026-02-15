"use client";

import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Clock,
  MessageSquare,
  Bell,
  TrendingUp,
  Users,
  Target,
  Calendar,
  BarChart3,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  ShoppingCart,
  Video,
  Search,
  Briefcase,
} from "lucide-react";
import "@/styles/user-pages.css";

const stats = [
  {
    label: "活跃项目",
    value: "12",
    icon: FileText,
    trend: "+2.5%",
    trendUp: true,
  },
  {
    label: "完成任务",
    value: "48",
    icon: Target,
    trend: "+12%",
    trendUp: true,
  },
  {
    label: "工作时长",
    value: "156h",
    icon: Clock,
    trend: "+8%",
    trendUp: true,
  },
  {
    label: "团队成员",
    value: "8",
    icon: Users,
    trend: "+1",
    trendUp: true,
  },
];

const quickActions = [
  {
    title: "项目管理",
    description: "查看和管理您的项目",
    icon: FileText,
    href: "/user/projects",
    badge: "3",
    badgeType: "count",
  },
  {
    title: "任务管理",
    description: "管理您的待办任务",
    icon: CheckSquare,
    href: "/user/tasks",
    badge: "12",
    badgeType: "count",
  },
  {
    title: "浏览市场",
    description: "发现优质服务和产品",
    icon: Search,
    href: "/user/browse",
    badge: "NEW",
    badgeType: "new",
  },
  {
    title: "直播设备市场",
    description: "专业直播设备采购",
    icon: Video,
    href: "/user/livestream-market",
    badge: "HOT",
    badgeType: "hot",
  },
  {
    title: "投资管理",
    description: "管理您的投资组合",
    icon: TrendingUp,
    href: "/user/investments",
    badge: "PRO",
    badgeType: "pro",
  },
  {
    title: "专业服务",
    description: "获取专业服务支持",
    icon: Briefcase,
    href: "/user/services",
    badge: "NEW",
    badgeType: "new",
  },
];

const recentActivities = [
  { action: "完成任务", item: "网站设计优化", time: "2小时前", icon: CheckSquare },
  { action: "创建项目", item: "移动应用开发", time: "4小时前", icon: FileText },
  { action: "更新文档", item: "API接口文档", time: "6小时前", icon: FileText },
  { action: "发送消息", item: "项目进度汇报", time: "8小时前", icon: MessageSquare },
];

const todaySchedule = [
  { time: "09:00", event: "团队晨会", type: "会议" },
  { time: "11:00", event: "客户需求讨论", type: "电话" },
  { time: "14:00", event: "项目评审", type: "会议" },
  { time: "16:00", event: "代码审查", type: "开发" },
];

export default function UserDashboard() {
  const { data: session } = useSession();

  const getBadgeClass = (type: string) => {
    switch (type) {
      case "new": return "user-page-badge-new";
      case "hot": return "user-page-badge-hot";
      case "pro": return "user-page-badge-pro";
      default: return "bg-purple-500/30 text-purple-200";
    }
  };

  return (
    <div className="user-page-container">
      {/* Hero 区域 */}
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-header">
            <div className="user-page-hero-icon">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div className="user-page-hero-title-section">
              <div className="user-page-hero-title-row">
                <h1 className="user-page-hero-title">
                  欢迎回来, {session?.user?.name || "用户"}!
                </h1>
                <Sparkles className="user-page-sparkle" />
              </div>
              <p className="user-page-hero-description">
                今天是 {new Date().toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="user-page-stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="user-page-stat-card">
                <div className="user-page-stat-icon">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="user-page-stat-content">
                  <span className="user-page-stat-value">{stat.value}</span>
                  <span className="user-page-stat-label">{stat.label}</span>
                </div>
                <span className={`user-page-stat-trend ${stat.trendUp ? "up" : "down"}`}>
                  {stat.trend}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="user-page-content">
        {/* 快速操作 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">快速操作</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <div className="user-card group cursor-pointer">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl group-hover:from-purple-500/30 group-hover:to-indigo-500/30 transition-all">
                        <action.icon className="w-6 h-6 text-purple-300" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{action.title}</h3>
                          {action.badge && (
                            <span className={`user-page-badge ${getBadgeClass(action.badgeType || "count")}`}>
                              {action.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60">{action.description}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 活动和日程 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近活动 */}
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="user-card-title">最近活动</h3>
                <p className="user-card-description">您的最新操作记录</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-lg">
                      <activity.icon className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-white">{activity.action}</p>
                      <p className="text-sm text-white/50">{activity.item}</p>
                    </div>
                    <span className="text-sm text-white/40">{activity.time}</span>
                  </div>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-purple-300 hover:text-white hover:bg-purple-500/20">
                <Link href="/user/analytics">
                  查看全部活动
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>

          {/* 今日日程 */}
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="user-card-title">今日日程</h3>
                <p className="user-card-description">您今天的安排</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="space-y-4">
                {todaySchedule.map((schedule, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors">
                    <div className="w-16 text-center">
                      <span className="text-lg font-mono font-semibold text-purple-300">{schedule.time}</span>
                    </div>
                    <div className="w-1 h-10 bg-gradient-to-b from-purple-500 to-indigo-500 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-white">{schedule.event}</p>
                      <Badge variant="outline" className="mt-1 border-white/20 text-white/60 text-xs">
                        {schedule.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button asChild variant="ghost" className="w-full mt-4 text-purple-300 hover:text-white hover:bg-purple-500/20">
                <Link href="/user/schedule">
                  查看完整日程
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 通知提醒 */}
        <div className="mt-6">
          <div className="user-card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
                    <Bell className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">您有 3 条未读通知</h3>
                    <p className="text-sm text-white/60">包括 1 条重要消息需要处理</p>
                  </div>
                </div>
                <Button asChild className="user-button user-button-primary user-button-md">
                  <Link href="/user/notifications">
                    查看通知
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

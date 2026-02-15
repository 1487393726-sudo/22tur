"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Users,
  MapPin,
  Video,
  Phone,
  Presentation,
  Coffee,
  Bell,
  Check,
  X,
  MoreHorizontal,
  Filter,
  Search,
} from "lucide-react";

// 导入用户端样式
import "@/styles/user-pages.css";

interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "meeting" | "call" | "presentation" | "break" | "reminder";
  location: string;
  attendees: number;
  status: "confirmed" | "pending" | "cancelled";
  description?: string;
}

const mockEvents: ScheduleEvent[] = [
  {
    id: "1",
    title: "项目进度会议",
    date: "2026-01-10",
    startTime: "09:00",
    endTime: "10:30",
    type: "meeting",
    location: "会议室A",
    attendees: 5,
    status: "confirmed",
    description: "讨论Q1项目进度和下一步计划",
  },
  {
    id: "2",
    title: "客户需求讨论",
    date: "2026-01-10",
    startTime: "14:00",
    endTime: "15:00",
    type: "call",
    location: "线上会议",
    attendees: 3,
    status: "confirmed",
    description: "与客户讨论新功能需求",
  },
  {
    id: "3",
    title: "产品演示",
    date: "2026-01-10",
    startTime: "16:30",
    endTime: "17:30",
    type: "presentation",
    location: "展示厅",
    attendees: 8,
    status: "pending",
    description: "向投资方展示产品最新进展",
  },
  {
    id: "4",
    title: "团队下午茶",
    date: "2026-01-10",
    startTime: "15:30",
    endTime: "16:00",
    type: "break",
    location: "休息区",
    attendees: 12,
    status: "confirmed",
  },
  {
    id: "5",
    title: "提交周报提醒",
    date: "2026-01-10",
    startTime: "17:00",
    endTime: "17:00",
    type: "reminder",
    location: "",
    attendees: 0,
    status: "pending",
  },
  {
    id: "6",
    title: "设计评审会议",
    date: "2026-01-11",
    startTime: "10:00",
    endTime: "11:30",
    type: "meeting",
    location: "会议室B",
    attendees: 6,
    status: "confirmed",
  },
  {
    id: "7",
    title: "技术分享会",
    date: "2026-01-12",
    startTime: "14:00",
    endTime: "16:00",
    type: "presentation",
    location: "大会议室",
    attendees: 20,
    status: "confirmed",
  },
];

const typeConfig: Record<string, { icon: typeof Calendar; bg: string; text: string; label: string }> = {
  meeting: { icon: Users, bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa", label: "会议" },
  call: { icon: Phone, bg: "rgba(16, 185, 129, 0.2)", text: "#34d399", label: "电话" },
  presentation: { icon: Presentation, bg: "rgba(168, 85, 247, 0.2)", text: "#c4b5fd", label: "演示" },
  break: { icon: Coffee, bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24", label: "休息" },
  reminder: { icon: Bell, bg: "rgba(239, 68, 68, 0.2)", text: "#f87171", label: "提醒" },
};

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399", label: "已确认" },
  pending: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24", label: "待确认" },
  cancelled: { bg: "rgba(239, 68, 68, 0.2)", text: "#f87171", label: "已取消" },
};

const weekDays = ["日", "一", "二", "三", "四", "五", "六"];

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  const stats = [
    { label: "今日事件", value: "5", icon: CalendarDays, color: "blue" },
    { label: "本周会议", value: "12", icon: Users, color: "green" },
    { label: "待确认", value: "3", icon: Clock, color: "yellow" },
    { label: "外出安排", value: "2", icon: MapPin, color: "purple" },
  ];

  const todayStr = "2026-01-10";
  const todayEvents = mockEvents.filter(e => e.date === todayStr);
  const upcomingEvents = mockEvents.filter(e => e.date > todayStr).slice(0, 3);

  // 生成当前周的日期
  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  return (
    <div className="space-y-6">
      <PageHeader
        title="日程安排"
        description="管理您的日程和会议安排"
        icon={Calendar}
        stats={stats.map(s => ({ ...s, color: `bg-${s.color}-500` }))}
        actions={
          <div className="flex gap-3">
            <button className="user-button user-button-secondary user-button-sm">
              <Filter className="w-4 h-4" />
              <span>筛选</span>
            </button>
            <button className="user-button user-button-primary user-button-sm">
              <Plus className="w-4 h-4" />
              <span>新建事件</span>
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

      {/* 视图切换 - 玻璃态风格 */}
      <div className="user-filter-buttons">
        <button
          onClick={() => setViewMode("day")}
          className={`user-button user-button-sm ${viewMode === "day" ? "user-button-primary" : "user-button-secondary"}`}
        >
          日视图
        </button>
        <button
          onClick={() => setViewMode("week")}
          className={`user-button user-button-sm ${viewMode === "week" ? "user-button-primary" : "user-button-secondary"}`}
        >
          周视图
        </button>
        <button
          onClick={() => setViewMode("month")}
          className={`user-button user-button-sm ${viewMode === "month" ? "user-button-primary" : "user-button-secondary"}`}
        >
          月视图
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 日历视图 - 玻璃态风格 */}
        <div className="lg:col-span-2">
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "rgba(59, 130, 246, 0.2)" }}>
                <Calendar className="w-5 h-5" style={{ color: "#60a5fa" }} />
              </div>
              <div className="flex-1">
                <h3 className="user-card-title">2026年1月</h3>
                <p className="user-card-description">第2周</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="user-button user-button-ghost user-button-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="user-button user-button-secondary user-button-sm">
                  今天
                </button>
                <button className="user-button user-button-ghost user-button-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="user-card-content">
              {/* 周视图头部 */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDates.map((date, index) => {
                  const isToday = date.toISOString().split("T")[0] === todayStr;
                  const dateStr = date.toISOString().split("T")[0];
                  const hasEvents = mockEvents.some(e => e.date === dateStr);
                  return (
                    <div
                      key={index}
                      className="text-center p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: isToday ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.03)",
                        border: isToday ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "4px" }}>
                        周{weekDays[index]}
                      </p>
                      <p style={{ color: isToday ? "#60a5fa" : "white", fontWeight: 600, fontSize: "18px" }}>
                        {date.getDate()}
                      </p>
                      {hasEvents && (
                        <div
                          style={{
                            width: "6px",
                            height: "6px",
                            background: "#60a5fa",
                            borderRadius: "50%",
                            margin: "4px auto 0",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 时间线视图 */}
              <div className="space-y-3 mt-6">
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px", marginBottom: "12px" }}>
                  今日日程 · {todayEvents.length} 个事件
                </p>
                {todayEvents.map((event) => (
                  <GlassEventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 侧边栏 - 玻璃态风格 */}
        <div className="space-y-6">
          {/* 快速添加 */}
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "rgba(16, 185, 129, 0.2)" }}>
                <Plus className="w-5 h-5" style={{ color: "#34d399" }} />
              </div>
              <div>
                <h3 className="user-card-title">快速添加</h3>
                <p className="user-card-description">创建新的日程事件</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(typeConfig).map(([key, config]) => (
                  <button
                    key={key}
                    className="flex items-center gap-2 p-3 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        background: config.bg,
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <config.icon className="w-4 h-4" style={{ color: config.text }} />
                    </div>
                    <span style={{ color: "white", fontSize: "13px" }}>{config.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 即将到来 */}
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
                <Clock className="w-5 h-5" style={{ color: "#c4b5fd" }} />
              </div>
              <div>
                <h3 className="user-card-title">即将到来</h3>
                <p className="user-card-description">未来几天的安排</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const config = typeConfig[event.type];
                  return (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-xl"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          background: config.bg,
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <config.icon className="w-4 h-4" style={{ color: config.text }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: "white", fontSize: "13px", fontWeight: 500 }}>{event.title}</p>
                        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                          {new Date(event.date).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })} · {event.startTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 日程统计 */}
          <div className="user-card">
            <div className="user-card-header">
              <div className="user-card-header-icon" style={{ background: "rgba(245, 158, 11, 0.2)" }}>
                <CalendarDays className="w-5 h-5" style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <h3 className="user-card-title">本周统计</h3>
                <p className="user-card-description">日程类型分布</p>
              </div>
            </div>
            <div className="user-card-content">
              <div className="space-y-3">
                {Object.entries(typeConfig).map(([key, config]) => {
                  const count = mockEvents.filter(e => e.type === key).length;
                  const percentage = Math.round((count / mockEvents.length) * 100);
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <config.icon className="w-4 h-4" style={{ color: config.text }} />
                          <span style={{ color: "white", fontSize: "13px" }}>{config.label}</span>
                        </div>
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{count} 个</span>
                      </div>
                      <div
                        style={{
                          height: "4px",
                          background: "rgba(255,255,255,0.1)",
                          borderRadius: "2px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background: config.text,
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 玻璃态事件卡片组件
function GlassEventCard({ event }: { event: ScheduleEvent }) {
  const config = typeConfig[event.type];
  const status = statusConfig[event.status];

  return (
    <div
      className="user-list-item"
      style={{ cursor: "pointer" }}
    >
      <div
        className="user-list-item-icon"
        style={{ background: config.bg, color: config.text }}
      >
        <config.icon className="w-5 h-5" />
      </div>
      <div className="user-list-item-content">
        <div className="user-list-item-header">
          <div className="flex items-center gap-2">
            <span className="user-list-item-title">{event.title}</span>
            <Badge style={{ background: status.bg, color: status.text, border: "none", fontSize: "10px" }}>
              {status.label}
            </Badge>
          </div>
          <span style={{ color: config.text, fontSize: "13px", fontWeight: 500 }}>
            {event.startTime} - {event.endTime}
          </span>
        </div>
        {event.description && (
          <p className="user-list-item-description">{event.description}</p>
        )}
        <div className="user-list-item-meta">
          {event.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {event.location}
            </span>
          )}
          {event.attendees > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.attendees} 人参与
            </span>
          )}
          <Badge style={{ background: config.bg, color: config.text, border: "none", fontSize: "10px" }}>
            {config.label}
          </Badge>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="user-button user-button-ghost user-button-sm">
          <Check className="w-4 h-4" />
        </button>
        <button className="user-button user-button-ghost user-button-sm">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

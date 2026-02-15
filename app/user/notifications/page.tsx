"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import {
  Bell,
  Check,
  X,
  Filter,
  Settings,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
  Calendar,
  FileText,
  MessageSquare,
  Clock,
  Sparkles,
  Eye,
  Trash2,
  BellOff,
} from "lucide-react";

// 导入用户端样式
import "@/styles/user-pages.css";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: "system" | "project" | "message" | "reminder" | "security";
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "项目截止日期提醒",
    message: "项目「企业网站重构」将在3天后截止，请及时完成相关任务。",
    type: "warning",
    category: "reminder",
    timestamp: "2026-01-10T10:30:00",
    isRead: false,
    actionUrl: "/user/projects/1",
    actionText: "查看项目",
  },
  {
    id: "2",
    title: "新消息通知",
    message: "张三向您发送了一条新消息：关于项目进度更新。",
    type: "info",
    category: "message",
    timestamp: "2026-01-10T09:15:00",
    isRead: false,
    actionUrl: "/user/messages",
    actionText: "查看消息",
  },
  {
    id: "3",
    title: "任务完成",
    message: "您的任务「设计稿审核」已成功完成。",
    type: "success",
    category: "project",
    timestamp: "2026-01-09T16:45:00",
    isRead: true,
    actionUrl: "/user/tasks",
    actionText: "查看任务",
  },
  {
    id: "4",
    title: "系统维护通知",
    message: "系统将于今晚23:00-01:00进行维护，期间可能无法访问。",
    type: "info",
    category: "system",
    timestamp: "2026-01-09T14:20:00",
    isRead: true,
  },
  {
    id: "5",
    title: "安全警告",
    message: "检测到异常登录尝试，请检查您的账户安全。",
    type: "error",
    category: "security",
    timestamp: "2026-01-08T11:30:00",
    isRead: false,
    actionUrl: "/user/settings/security",
    actionText: "检查安全",
  },
  {
    id: "6",
    title: "投资收益更新",
    message: "您投资的「智慧餐饮连锁店」项目本月收益已结算，请查看详情。",
    type: "success",
    category: "project",
    timestamp: "2026-01-08T09:00:00",
    isRead: false,
    actionUrl: "/user/invest/operations",
    actionText: "查看收益",
  },
];

const typeConfig: Record<string, { icon: typeof Info; bg: string; text: string; border: string }> = {
  info: { icon: Info, bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" },
  success: { icon: CheckCircle, bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" },
  warning: { icon: AlertTriangle, bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" },
  error: { icon: AlertCircle, bg: "rgba(239, 68, 68, 0.15)", text: "#f87171", border: "rgba(239, 68, 68, 0.3)" },
};

const categoryConfig: Record<string, { label: string; icon: typeof Settings; bg: string; text: string }> = {
  system: { label: "系统", icon: Settings, bg: "rgba(107, 114, 128, 0.2)", text: "#9ca3af" },
  project: { label: "项目", icon: FileText, bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
  message: { label: "消息", icon: MessageSquare, bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
  reminder: { label: "提醒", icon: Clock, bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
  security: { label: "安全", icon: AlertCircle, bg: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
};

const categories = ["all", "system", "project", "message", "reminder", "security"];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const stats = [
    { label: "未读通知", value: notifications.filter(n => !n.isRead).length.toString(), icon: Bell, color: "red" },
    { label: "今日通知", value: notifications.filter(n => new Date(n.timestamp).toDateString() === new Date().toDateString()).length.toString(), icon: Calendar, color: "blue" },
    { label: "重要通知", value: notifications.filter(n => n.type === "error" || n.type === "warning").length.toString(), icon: AlertTriangle, color: "yellow" },
    { label: "系统通知", value: notifications.filter(n => n.category === "system").length.toString(), icon: Settings, color: "purple" },
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesCategory = selectedCategory === "all" || notification.category === selectedCategory;
    const matchesReadStatus = !showUnreadOnly || !notification.isRead;
    return matchesCategory && matchesReadStatus;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    if (diffInHours < 1) return "刚刚";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}小时前`;
    return date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="通知中心"
        description="管理您的所有系统通知和提醒"
        icon={Bell}
        badge={notifications.filter(n => !n.isRead).length.toString()}
        stats={stats.map(s => ({ ...s, color: `bg-${s.color}-500` }))}
        actions={
          <div className="flex gap-3">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`user-button user-button-sm ${showUnreadOnly ? "user-button-primary" : "user-button-secondary"}`}
            >
              <Filter className="w-4 h-4" />
              <span>{showUnreadOnly ? "显示全部" : "仅未读"}</span>
            </button>
            <button onClick={markAllAsRead} className="user-button user-button-secondary user-button-sm">
              <Check className="w-4 h-4" />
              <span>全部已读</span>
            </button>
            <button className="user-button user-button-primary user-button-sm">
              <Settings className="w-4 h-4" />
              <span>通知设置</span>
            </button>
          </div>
        }
      />

      {/* 统计卡片 - 紫色渐变风格 */}
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
          </div>
        ))}
      </div>

      {/* 分类筛选 - 玻璃态风格 */}
      <div className="user-filter-buttons">
        <button
          onClick={() => setSelectedCategory("all")}
          className={`user-button user-button-sm ${selectedCategory === "all" ? "user-button-primary" : "user-button-secondary"}`}
        >
          全部通知
        </button>
        {categories.slice(1).map((category) => {
          const config = categoryConfig[category];
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`user-button user-button-sm ${selectedCategory === category ? "user-button-primary" : "user-button-secondary"}`}
            >
              <config.icon className="w-4 h-4" />
              <span>{config.label}</span>
            </button>
          );
        })}
      </div>

      {/* 通知列表 - 玻璃态风格 */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <GlassNotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            formatTime={formatTime}
          />
        ))}
      </div>

      {/* 空状态 */}
      {filteredNotifications.length === 0 && (
        <div className="user-card">
          <div className="user-empty-state">
            <div className="user-empty-state-icon" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
              <BellOff className="w-10 h-10" style={{ color: "#c4b5fd" }} />
            </div>
            <h3 className="user-empty-state-title">没有通知</h3>
            <p className="user-empty-state-description">
              {showUnreadOnly ? "没有未读通知" : "暂时没有任何通知"}
            </p>
            {showUnreadOnly && (
              <button onClick={() => setShowUnreadOnly(false)} className="user-button user-button-secondary user-button-sm">
                显示全部通知
              </button>
            )}
          </div>
        </div>
      )}

      {/* 通知偏好设置 - 玻璃态风格 */}
      <div className="user-card">
        <div className="user-card-header">
          <div className="user-card-header-icon" style={{ background: "rgba(168, 85, 247, 0.2)" }}>
            <Settings className="w-5 h-5" style={{ color: "#c4b5fd" }} />
          </div>
          <div>
            <h3 className="user-card-title">通知偏好设置</h3>
            <p className="user-card-description">自定义您的通知接收方式</p>
          </div>
        </div>
        <div className="user-card-content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryConfig).map(([key, config]) => (
              <div
                key={key}
                className="flex items-center justify-between p-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      background: config.bg,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <config.icon className="w-4 h-4" style={{ color: config.text }} />
                  </div>
                  <span style={{ color: "white", fontSize: "14px" }}>{config.label}通知</span>
                </div>
                <button className="user-button user-button-outline user-button-sm">
                  启用
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 玻璃态通知卡片组件
function GlassNotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  formatTime,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatTime: (timestamp: string) => string;
}) {
  const typeConf = typeConfig[notification.type];
  const categoryConf = categoryConfig[notification.category];
  const TypeIcon = typeConf.icon;
  const CategoryIcon = categoryConf.icon;

  return (
    <div
      className="user-list-item"
      style={{
        cursor: "default",
        background: notification.isRead ? "rgba(255,255,255,0.03)" : typeConf.bg,
        borderColor: notification.isRead ? "rgba(255,255,255,0.08)" : typeConf.border,
        borderLeftWidth: notification.isRead ? "1px" : "4px",
      }}
    >
      <div
        className="user-list-item-icon"
        style={{ background: typeConf.bg, color: typeConf.text }}
      >
        <TypeIcon className="w-5 h-5" />
      </div>
      <div className="user-list-item-content">
        <div className="user-list-item-header">
          <div className="flex items-center gap-2">
            <span
              className="user-list-item-title"
              style={{ color: notification.isRead ? "rgba(255,255,255,0.7)" : "white" }}
            >
              {notification.title}
            </span>
            <Badge style={{ background: categoryConf.bg, color: categoryConf.text, border: "none", fontSize: "10px", display: "flex", alignItems: "center", gap: "4px" }}>
              <CategoryIcon className="w-3 h-3" />
              {categoryConf.label}
            </Badge>
            {!notification.isRead && (
              <div style={{ width: "8px", height: "8px", background: "#60a5fa", borderRadius: "50%" }} />
            )}
          </div>
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
            {formatTime(notification.timestamp)}
          </span>
        </div>
        <p
          className="user-list-item-description"
          style={{ color: notification.isRead ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.6)" }}
        >
          {notification.message}
        </p>
        <div className="flex items-center justify-between mt-3">
          <div className="flex gap-2">
            {notification.actionUrl && (
              <button className="user-button user-button-secondary user-button-sm" style={{ fontSize: "12px" }}>
                <Eye className="w-3 h-3" />
                <span>{notification.actionText || "查看详情"}</span>
              </button>
            )}
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="user-button user-button-ghost user-button-sm"
                style={{ fontSize: "12px" }}
              >
                <Check className="w-3 h-3" />
                <span>标记已读</span>
              </button>
            )}
          </div>
          <button
            onClick={() => onDelete(notification.id)}
            className="user-button user-button-ghost user-button-sm"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

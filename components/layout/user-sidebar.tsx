"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Clock,
  MessageSquare,
  Bell,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Calendar,
  FolderOpen,
  Workflow,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Video,
  Search,
  Award,
  Briefcase,
  Sparkles,
  User,
  TrendingUp,
  Rocket,
  Crown,
} from "lucide-react";

// 导入自定义CSS
import "@/styles/user-sidebar.css";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeType?: "new" | "hot" | "pro" | "count";
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: "仪表板",
    href: "/user",
    icon: LayoutDashboard,
  },
  {
    title: "项目管理",
    href: "/user/projects",
    icon: FileText,
    badge: "3",
    badgeType: "count",
  },
  {
    title: "任务管理",
    href: "/user/tasks",
    icon: CheckSquare,
    badge: "12",
    badgeType: "count",
  },
  {
    title: "时间跟踪",
    href: "/user/time-tracking",
    icon: Clock,
  },
  {
    title: "文档管理",
    href: "/user/documents",
    icon: FolderOpen,
  },
  {
    title: "浏览市场",
    href: "/user/browse",
    icon: Search,
    badge: "NEW",
    badgeType: "new",
  },
  {
    title: "直播设备市场",
    href: "/user/livestream-market",
    icon: Video,
    badge: "HOT",
    badgeType: "hot",
  },
  {
    title: "作品集服务",
    href: "/user/portfolio",
    icon: Award,
    badge: "NEW",
    badgeType: "new",
  },
  {
    title: "专业服务",
    href: "/user/services",
    icon: Briefcase,
    badge: "NEW",
    badgeType: "new",
  },
  {
    title: "投资入口",
    href: "#",
    icon: TrendingUp,
    badge: "HOT",
    badgeType: "hot",
    children: [
      {
        title: "投资机会",
        href: "/user/invest",
        icon: Rocket,
        badge: "NEW",
        badgeType: "new",
      },
      {
        title: "成为投资者",
        href: "/user/invest/apply",
        icon: Crown,
        badge: "PRO",
        badgeType: "pro",
      },
      {
        title: "项目运营监控",
        href: "/user/invest/operations",
        icon: BarChart3,
        badge: "NEW",
        badgeType: "new",
      },
    ],
  },
  {
    title: "沟通协作",
    href: "#",
    icon: MessageSquare,
    children: [
      {
        title: "消息中心",
        href: "/user/messages",
        icon: MessageSquare,
        badge: "5",
        badgeType: "count",
      },
      {
        title: "通知中心",
        href: "/user/notifications",
        icon: Bell,
        badge: "2",
        badgeType: "count",
      },
    ],
  },
  {
    title: "商务管理",
    href: "#",
    icon: ShoppingCart,
    children: [
      {
        title: "购买记录",
        href: "/user/purchases",
        icon: ShoppingCart,
      },
      {
        title: "发票管理",
        href: "/user/invoices",
        icon: CreditCard,
      },
      {
        title: "支付管理",
        href: "/user/payments",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "数据分析",
    href: "/user/analytics",
    icon: BarChart3,
  },
  {
    title: "日程安排",
    href: "/user/schedule",
    icon: Calendar,
  },
  {
    title: "工作流程",
    href: "/user/workflow",
    icon: Workflow,
  },
  {
    title: "客户支持",
    href: "/user/support",
    icon: HelpCircle,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const getBadgeClass = (badgeType?: string) => {
    switch (badgeType) {
      case "new":
        return "user-sidebar-badge-new";
      case "hot":
        return "user-sidebar-badge-hot";
      case "pro":
        return "user-sidebar-badge-pro";
      case "count":
        return "user-sidebar-badge-count";
      default:
        return "user-sidebar-badge-count";
    }
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.title} className="user-sidebar-item-wrapper">
        <div
          className={cn(
            "user-sidebar-nav-item",
            level > 0 && "user-sidebar-nav-item-child",
            isActive && "active"
          )}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.title)}
              className="user-sidebar-nav-button"
            >
              <div className="user-sidebar-nav-icon-wrapper">
                <item.icon className="user-sidebar-nav-icon" />
              </div>
              <span className="user-sidebar-nav-text">{item.title}</span>
              {item.badge && (
                <span className={cn("user-sidebar-badge", getBadgeClass(item.badgeType))}>
                  {item.badge}
                </span>
              )}
              <div className="user-sidebar-chevron">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </button>
          ) : (
            <Link href={item.href} className="user-sidebar-nav-link">
              <div className="user-sidebar-nav-icon-wrapper">
                <item.icon className="user-sidebar-nav-icon" />
              </div>
              <span className="user-sidebar-nav-text">{item.title}</span>
              {item.badge && (
                <span className={cn("user-sidebar-badge", getBadgeClass(item.badgeType))}>
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="user-sidebar-children">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="user-sidebar">
      {/* 顶部Logo区域 */}
      <div className="user-sidebar-header">
        <div className="user-sidebar-logo">
          <div className="user-sidebar-logo-icon">
            <User className="w-5 h-5" />
          </div>
          <span className="user-sidebar-logo-text">用户中心</span>
          <Sparkles className="user-sidebar-sparkle" />
        </div>
      </div>

      {/* 导航区域 */}
      <div className="user-sidebar-nav-container">
        <nav className="user-sidebar-nav">
          {navigation.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* 底部信息 */}
      <div className="user-sidebar-footer">
        <div className="user-sidebar-footer-content">
          <div className="user-sidebar-version">
            <Sparkles className="w-3 h-3" />
            <span>用户中心 v2.0</span>
          </div>
          <p className="user-sidebar-copyright">© 2026 Nuwax</p>
        </div>
      </div>
    </aside>
  );
}

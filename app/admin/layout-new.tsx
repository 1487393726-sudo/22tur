"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UserCheck,
  UserCog,
  Package,
  CreditCard,
  FolderKanban,
  Handshake,
  DollarSign,
  CheckSquare,
  FileText,
  FileSignature,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  Store,
  FileCode,
  PenTool,
  Edit3,
  Home,
  Plug,
  ScrollText,
  ShieldAlert,
  Image,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RequireAuth } from "@/components/auth/require-auth";
import { AdminLocaleProvider, useAdminLocale } from "@/components/admin/admin-locale-provider";
import { AdminLanguageSwitcher } from "@/components/admin/admin-language-switcher";

// 导航配置 - 使用翻译键
const navigationConfig = [
  { key: "dashboard", href: "/admin", icon: LayoutDashboard },
  { key: "users", href: "/admin/users", icon: UserCheck },
  { key: "homepage", href: "/admin/homepage", icon: Home },
  { key: "content", href: "/admin/content", icon: PenTool },
  { key: "editor", href: "/admin/editor", icon: Edit3 },
  { key: "marketplace", href: "/admin/marketplace", icon: Store },
  { key: "productImages", href: "/admin/products/images", icon: Image },
  { key: "templates", href: "/admin/templates", icon: FileCode },
  { key: "invoices", href: "/admin/invoices", icon: Receipt },
  { key: "services", href: "/admin/services", icon: Package },
  { key: "orders", href: "/admin/orders", icon: ShoppingCart },
  { key: "contracts", href: "/admin/contracts", icon: FileSignature },
  { key: "hr", href: "/admin/hr", icon: UserCog },
  { key: "subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { key: "employees", href: "/admin/employees", icon: Users },
  { key: "projects", href: "/admin/projects", icon: FolderKanban },
  { key: "clients", href: "/admin/clients", icon: Handshake },
  { key: "finance", href: "/admin/finance", icon: DollarSign },
  { key: "tasks", href: "/admin/tasks", icon: CheckSquare },
  { key: "documents", href: "/admin/documents", icon: FileText },
  { key: "packages", href: "/admin/packages", icon: Package },
  { key: "apiManagement", href: "/admin/api-management", icon: Plug },
  { key: "loginLogs", href: "/admin/login-logs", icon: ScrollText },
  { key: "securityEvents", href: "/admin/security-events", icon: ShieldAlert },
  { key: "analytics", href: "/admin/analytics", icon: BarChart3 },
  { key: "settings", href: "/admin/settings", icon: Settings },
];

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("admin");
  const { isRTL } = useAdminLocale();

  // 从 localStorage 读取简洁模式设置
  useEffect(() => {
    const saved = localStorage.getItem("admin-compact-mode");
    if (saved) {
      setCompactMode(JSON.parse(saved));
    }
  }, []);

  // 保存简洁模式设置
  const toggleCompactMode = () => {
    const newMode = !compactMode;
    setCompactMode(newMode);
    localStorage.setItem("admin-compact-mode", JSON.stringify(newMode));
  };

  // 获取导航项的翻译名称
  const getNavName = (key: string) => {
    return t(`sidebar.${key}`);
  };

  // 获取当前页面标题
  const getCurrentPageTitle = () => {
    const currentNav = navigationConfig.find((item) => item.href === pathname);
    if (currentNav) {
      return getNavName(currentNav.key);
    }
    return t("title");
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-gradient-to-br from-[#4c1d95] via-[#9333ea] to-[#701a75]",
        isRTL && "rtl"
      )}
      data-oid="8o3l1fv"
    >
      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
        data-oid="kx-z-ge"
      >
        <div
          className="fixed inset-0 bg-primary-950/80"
          onClick={() => setSidebarOpen(false)}
          data-oid="bs4bny1"
        />

        <div
          className={cn(
            "fixed top-0 h-full w-64 bg-primary-900/90 backdrop-blur-lg border-white/10 flex flex-col",
            isRTL ? "right-0 border-l" : "left-0 border-r"
          )}
          data-oid="jw.kdr2"
        >
          <div
            className="flex h-16 items-center justify-between px-6"
            data-oid="cs7msqz"
          >
            <h2 className="text-xl font-bold text-white" data-oid="c9v302g">
              {t("title")}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/10"
              data-oid="ffaqqcw"
            >
              <X className="h-4 w-4" data-oid="vnl7ccz" />
            </Button>
          </div>
          
          {/* 移动端菜单 - 添加 ScrollArea */}
          <ScrollArea className="flex-1">
            <nav className="space-y-1 px-3 py-4" data-oid="q-gf9xp">
              {navigationConfig.map((item) => {
                const isActive = pathname === item.href;
                const name = getNavName(item.key);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium transition-colors rounded-lg",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    )}
                    onClick={() => setSidebarOpen(false)}
                    data-oid="k-e2e55"
                  >
                    <item.icon
                      className={cn("h-5 w-5", isRTL ? "ml-3" : "mr-3")}
                      data-oid="q.esg-j"
                    />
                    {name}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:block transition-all duration-300",
          isRTL ? "lg:right-0" : "lg:left-0",
          compactMode ? "lg:w-20" : "lg:w-64"
        )}
        data-oid="1ke0n56"
      >
        <div
          className={cn(
            "flex h-full flex-col bg-primary-900/90 backdrop-blur-lg border-white/10",
            isRTL ? "border-l" : "border-r"
          )}
          data-oid="u7gq3jg"
        >
          <div className="flex h-16 items-center justify-between px-6" data-oid="mvxrkzk">
            {!compactMode && (
              <h2 className="text-xl font-bold text-white" data-oid="navqxa.">
                {t("title")}
              </h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleCompactMode}
              className="text-white hover:bg-white/10 ml-auto"
              title={compactMode ? "展开菜单" : "简洁模式"}
            >
              {compactMode ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* 桌面端菜单 - 支持滑动 */}
          <ScrollArea className="flex-1" data-oid="1k7:54q">
            <nav className="space-y-1 px-3 py-4" data-oid="lk6f745">
              {navigationConfig.map((item) => {
                const isActive = pathname === item.href;
                const name = getNavName(item.key);
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white",
                      compactMode && "justify-center"
                    )}
                    title={compactMode ? name : undefined}
                    data-oid="a3e4326"
                  >
                    <item.icon
                      className={cn("h-5 w-5", !compactMode && (isRTL ? "ml-3" : "mr-3"))}
                      data-oid="4azcncn"
                    />
                    {!compactMode && <span>{name}</span>}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </div>
      </div>

      {/* Main content */}
      <div className={isRTL ? "lg:pr-64" : "lg:pl-64"} data-oid="6n8.xx4">
        <style>{`
          @media (min-width: 1024px) {
            .lg\\:pl-64 {
              padding-left: ${compactMode ? "5rem" : "16rem"};
            }
            .lg\\:pr-64 {
              padding-right: ${compactMode ? "5rem" : "16rem"};
            }
          }
        `}</style>
        
        {/* Top header */}
        <div
          className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-white/10 bg-primary-900/50 backdrop-blur-md px-4 shadow-sm lg:px-8"
          data-oid="_ftqu-d"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-white hover:bg-white/10"
            data-oid="gal5osy"
          >
            <Menu className="h-5 w-5" data-oid="rbs1j2b" />
          </Button>

          <div
            className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6"
            data-oid="e-6-pgf"
          >
            <div className="flex flex-1 items-center" data-oid="wxnu6ul">
              <h1
                className="text-lg font-semibold text-white"
                data-oid="6sd66-h"
              >
                {getCurrentPageTitle()}
              </h1>
            </div>
            {/* 语言切换器 */}
            <div className="flex items-center">
              <AdminLanguageSwitcher />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6" data-oid="u8n:4v3">
          <div className="px-4 sm:px-6 lg:px-8" data-oid="brfihaw">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth adminOnly data-oid="6q8_pgi">
      <AdminLocaleProvider>
        <AdminLayoutContent data-oid="rh4m7r6">{children}</AdminLayoutContent>
      </AdminLocaleProvider>
    </RequireAuth>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";
import {
  Home,
  ShoppingBag,
  Briefcase,
  MessagesSquare,
  FileArchive,
  Settings,
  ShoppingCart,
  FileText,
  FolderKanban,
  Calendar,
  Menu,
  X,
  Package,
  Zap,
  Factory,
  ClipboardList,
  TrendingUp,
  Shield,
  Target,
  PieChart,
  Wallet,
  LineChart,
  Building2,
  Sparkles,
} from "lucide-react";
import { GradientStyleToggle } from "@/components/ui/gradient-style-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "@/styles/dashboard-sidebar.css";

const mainNavItems = [
  { href: "/dashboard", labelKey: "overview", icon: Home },
  { href: "/dashboard/orders", labelKey: "myOrders", icon: Briefcase },
  { href: "/dashboard/market", labelKey: "market", icon: ShoppingBag },
  { href: "/dashboard/support", labelKey: "support", icon: MessagesSquare },
  { href: "/dashboard/files", labelKey: "files", icon: FileArchive },
];

const clientServiceItems = [
  { href: "/client/orders", labelKey: "serviceOrders", icon: Briefcase },
  { href: "/client/projects", labelKey: "projectProgress", icon: FolderKanban },
  { href: "/client/contracts", labelKey: "myContracts", icon: FileText },
  { href: "/dashboard/create-product", labelKey: "createProduct", icon: Package },
  { href: "/dashboard/custom-orders", labelKey: "customOrders", icon: Zap },
  { href: "/dashboard/factory-orders", labelKey: "factoryOrders", icon: Factory },
  { href: "/dashboard/project-requirements", labelKey: "projectRequirements", icon: ClipboardList },
  { href: "/client/cart", labelKey: "cart", icon: ShoppingCart },
  { href: "/appointments", labelKey: "appointments", icon: Calendar },
];

const investmentItems = [
  { href: "/dashboard/investment", labelKey: "investmentOverview", icon: TrendingUp },
  { href: "/dashboard/investment/portfolio", labelKey: "investmentPortfolio", icon: PieChart },
  { href: "/dashboard/investment/risk", labelKey: "riskAssessment", icon: Shield },
  { href: "/dashboard/investment/returns", labelKey: "returnsAnalysis", icon: LineChart },
  { href: "/dashboard/investment/strategy", labelKey: "investmentStrategy", icon: Target },
  { href: "/dashboard/investment/reports", labelKey: "investmentReports", icon: FileText },
  { href: "/dashboard/investment/wallet", labelKey: "investmentWallet", icon: Wallet },
  { href: "/investment-opportunities", labelKey: "investmentOpportunities", icon: Building2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hasInvestments, setHasInvestments] = useState<boolean | null>(null);
  const [isCheckingInvestment, setIsCheckingInvestment] = useState(true);
  const [investmentDialogOpen, setInvestmentDialogOpen] = useState(false);
  const { t, isRTL } = useDashboardTranslations();

  useEffect(() => {
    const checkInvestmentStatus = async () => {
      try {
        setIsCheckingInvestment(true);
        console.log("[Sidebar] 开始检查投资状态...");
        
        const response = await fetch("/api/user/investment-status", {
          credentials: 'include', // 确保发送 cookies
        });

        console.log("[Sidebar] API 响应状态:", response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Investment status API error:", response.status, response.statusText, errorData);
          // 如果 API 返回错误，默认设置为 false（未解锁）
          setHasInvestments(false);
          setIsCheckingInvestment(false);
          return;
        }

        const data = await response.json();
        console.log("[Sidebar] Investment status API response:", data);
        console.log("[Sidebar] hasInvestments:", data?.hasInvestments, "totalAmount:", data?.totalAmount);
        
        // 确保正确设置投资状态
        const hasInvest = Boolean(data?.hasInvestments);
        console.log("[Sidebar] 设置 hasInvestments 为:", hasInvest);
        setHasInvestments(hasInvest);
      } catch (error) {
        console.error("[Sidebar] Failed to check investment status:", error);
        // 发生错误时，默认设置为 false（未解锁）
        setHasInvestments(false);
      } finally {
        setIsCheckingInvestment(false);
        console.log("[Sidebar] 投资状态检查完成, hasInvestments:", hasInvestments);
      }
    };

    checkInvestmentStatus();
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleInvestmentNavClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    console.log("[Sidebar] 点击投资菜单:", href);
    console.log("[Sidebar] hasInvestments:", hasInvestments, "isCheckingInvestment:", isCheckingInvestment);
    
    // 如果还在检查中，允许正常跳转（避免在检查期间弹出窗口）
    if (isCheckingInvestment) {
      console.log("[Sidebar] 正在检查投资状态，允许跳转");
      closeSidebar();
      return;
    }

    // 只有在明确知道用户没有投资时（hasInvestments === false），才拦截跳转并弹出窗口
    if (hasInvestments === false) {
      console.log("[Sidebar] 用户未解锁，弹出提示窗口");
      event.preventDefault();
      setInvestmentDialogOpen(true);
      closeSidebar();
      return;
    }

    // 已经有投资（hasInvestments === true）或状态未知（hasInvestments === null）时，正常跳转
    console.log("[Sidebar] 用户已解锁或状态未知，允许跳转");
    closeSidebar();
  };

  const handleViewInvestments = () => {
    setInvestmentDialogOpen(false);
    router.push("/investments");
  };

  return (
    <>
      <Button variant="ghost" size="icon" className={cn("fixed top-4 z-50 md:hidden bg-gradient-to-r from-purple-600 to-indigo-600 text-white", isRTL ? "right-4" : "left-4")} onClick={toggleSidebar}>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {isOpen && <div className="dashboard-sidebar-overlay fixed inset-0 z-40 md:hidden" onClick={closeSidebar} />}

      <aside className={cn("dashboard-sidebar fixed inset-y-0 z-40 flex flex-col w-64 p-4 transition-transform duration-300 md:relative md:translate-x-0", isRTL ? "right-0" : "left-0", isOpen ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full")} dir={isRTL ? "rtl" : "ltr"}>
        <div className="flex items-center mb-6 px-2 gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="dashboard-sidebar-brand font-bold text-lg">{t("sidebar.clientCenter", "客户中心")}</span>
              <span className="text-xs text-white/50">{t("sidebar.investorExclusive", "投资者专属")}</span>
            </div>
          </Link>
          <Sparkles className="w-4 h-4 text-yellow-400 ml-auto animate-pulse" />
        </div>

        <nav className="dashboard-sidebar-nav flex-1 space-y-1 overflow-y-auto">
          {mainNavItems.map((item) => (
            <Link key={item.labelKey} href={item.href} onClick={closeSidebar} className={cn("dashboard-sidebar-nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium", isActive(item.href) && "active")}>
              <item.icon className="dashboard-sidebar-nav-icon h-5 w-5 mr-3" />
              {t(`sidebar.${item.labelKey}`)}
            </Link>
          ))}

          <div className="dashboard-sidebar-divider my-4 border-t border-white/10" />
          <p className="dashboard-sidebar-section-title px-3 text-xs font-semibold uppercase tracking-wider mb-2 text-white/60">{t("sidebar.clientService")}</p>

          {clientServiceItems.map((item) => (
            <Link key={item.labelKey} href={item.href} onClick={closeSidebar} className={cn("dashboard-sidebar-nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium", isActive(item.href) && "active")}>
              <item.icon className="dashboard-sidebar-nav-icon h-5 w-5 mr-3" />
              {t(`sidebar.${item.labelKey}`)}
            </Link>
          ))}

          <div className="dashboard-sidebar-divider my-4 border-t border-white/10" />
          <p className="dashboard-sidebar-section-title px-3 text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-white/60">{t("sidebar.investment")}</span>
            <span className="px-1.5 py-0.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-[10px] font-bold rounded">PRO</span>
          </p>

          {investmentItems.map((item) => (
            <Link
              key={item.labelKey}
              href={item.href}
              onClick={(event) => handleInvestmentNavClick(event, item.href)}
              className={cn("dashboard-sidebar-nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium", isActive(item.href) && "active")}
            >
              <item.icon className="dashboard-sidebar-nav-icon h-5 w-5 mr-3" />
              {t(`sidebar.${item.labelKey}`)}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <div className="flex items-center justify-between px-3 py-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/50">{t("sidebar.colorStyle")}</span>
            <GradientStyleToggle />
          </div>
          <Link href="/dashboard/settings" onClick={closeSidebar} className={cn("dashboard-sidebar-nav-item flex items-center px-3 py-2.5 rounded-xl text-sm font-medium", pathname.startsWith("/dashboard/settings") && "active")}>
            <Settings className="dashboard-sidebar-nav-icon h-5 w-5 mr-3" />
            {t("sidebar.settings")}
          </Link>
          <div className="mt-4 px-3 py-2 text-center">
            <p className="text-xs text-white/40">{t("sidebar.version", "客户中心 v2.0")}</p>
            <p className="text-xs text-white/30">{t("sidebar.copyright", "© 2026 Nuwax")}</p>
          </div>
        </div>
      </aside>

      {/* 未投资时，点击投资菜单弹出的窗口 */}
      <Dialog open={investmentDialogOpen} onOpenChange={setInvestmentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("sidebar.unlockInvestment", "解锁投资功能")}</DialogTitle>
            <DialogDescription>
              {t("sidebar.unlockInvestmentDesc", "您当前还没有任何投资记录。完成一笔投资后，即可解锁「投资组合」「风险评估」「收益分析」等投资者专属页面。")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvestmentDialogOpen(false)}>
              {t("sidebar.notNow", "暂不投资")}
            </Button>
            <Button onClick={handleViewInvestments}>
              {t("sidebar.viewInvestments", "查看投资项目")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

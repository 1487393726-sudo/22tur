"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, LogOut } from 'lucide-react';
import { Input } from "../ui/input";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

// 动态导入 NotificationBell 以避免 hydration mismatch
const NotificationBell = dynamic(
  () => import("@/components/notification-bell").then((mod) => mod.NotificationBell),
  { 
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" className="relative hover:bg-white/10">
        <Bell className="h-5 w-5 text-white" />
      </Button>
    )
  }
);

export function Header() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { t } = useDashboardTranslations();

  useEffect(() => {
    setMounted(true);
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({ redirect: true, callbackUrl: '/login' });
      toast.success(t("header.logoutSuccess", "已退出登录"));
    } catch (error) {
      console.error('退出登录错误:', error);
      toast.error(t("header.logoutError", "退出登录出错"));
      setIsLoggingOut(false);
    }
  };

  const userInitials = user 
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() 
    : 'NU';

  return (
    <header className="flex items-center justify-between h-16 bg-black/10 backdrop-blur-xl border-b border-white/10 px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile menu button can be added here */}
         <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("header.searchPlaceholder", "搜索订单、文件...")}
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background/50 border-border focus:border-primary/40 text-foreground placeholder:text-muted-foreground"
            />
          </div>
      </div>
      <div className="flex items-center gap-4">
        {mounted && <NotificationBell />}
        {mounted ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={user?.avatar} alt={user?.username} />
                <AvatarFallback className="bg-primary text-primary-foreground">{userInitials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-sm border-border">
            <DropdownMenuLabel className="flex flex-col">
              <span>{user?.firstName} {user?.lastName}</span>
              <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings?tab=profile" className="cursor-pointer hover:bg-accent">
                {t("header.profile", "个人资料")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings?tab=billing" className="cursor-pointer hover:bg-accent">
                {t("header.billing", "账单")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer hover:bg-accent">
                {t("header.settings", "设置")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-destructive cursor-pointer hover:bg-destructive/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isLoggingOut ? t("header.loggingOut", "退出中...") : t("header.logout", "退出登录")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        ) : (
          <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent">
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarFallback className="bg-primary text-primary-foreground">NU</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </div>
    </header>
  );
}

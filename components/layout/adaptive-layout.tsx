"use client";

import { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { Loader2 } from "lucide-react";

interface AdaptiveLayoutProps {
  children: ReactNode;
  /** 公开页面内容（未登录时显示） */
  publicContent?: ReactNode;
  /** 是否显示加载状态 */
  showLoading?: boolean;
}

/**
 * 自适应布局组件
 * 
 * 根据用户登录状态自动切换布局：
 * - 未登录：使用 Navbar + Footer 的公开页面布局
 * - 已登录：使用 Sidebar + Header 的 Dashboard 布局
 */
export function AdaptiveLayout({ 
  children, 
  publicContent,
  showLoading = true 
}: AdaptiveLayoutProps) {
  const { data: session, status } = useSession();

  // 加载中状态
  if (status === "loading" && showLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // 已登录：使用 Dashboard 布局
  if (session) {
    return (
      <div className="flex h-screen bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    );
  }

  // 未登录：使用公开页面布局
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {publicContent || children}
      <Footer />
    </div>
  );
}

export default AdaptiveLayout;

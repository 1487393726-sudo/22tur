"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, Briefcase, User, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { defaultBottomNavItems, getLocalizedText } from "@/lib/navigation/config";
import type { MobileBottomNavProps } from "@/types/navigation";

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Grid3X3,
  Briefcase,
  User,
  MoreHorizontal,
};

export function MobileBottomNav({ className }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { language } = useLanguage();

  // 检查是否匹配当前路由
  const isActive = (pattern?: string, href?: string) => {
    if (pattern) {
      return new RegExp(pattern).test(pathname);
    }
    if (href === "/") return pathname === "/";
    return href ? pathname.startsWith(href) : false;
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 lg:hidden",
        "bg-background/95 backdrop-blur-xl border-t border-border",
        "safe-area-inset-bottom",
        className
      )}
    >
      <div className="flex items-center justify-around h-16">
        {defaultBottomNavItems.map((item) => {
          const Icon = iconMap[item.icon] || Home;
          const label = getLocalizedText(item.label, item.labelEn, item.labelUg, language);
          const active = isActive(item.activePattern, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-6 mb-1",
                  active && "after:absolute after:inset-x-2 after:-bottom-1 after:h-0.5 after:bg-primary after:rounded-full"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    active && "scale-110"
                  )}
                />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

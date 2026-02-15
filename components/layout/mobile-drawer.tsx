"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronRight,
  User,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Settings,
  Palette,
  Layout,
  Image,
  Globe,
  Smartphone,
  Server,
  Video,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Shield,
  MessageSquare,
  BookOpen,
  HelpCircle,
  CreditCard,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import { defaultNavigationConfig, getLocalizedText } from "@/lib/navigation/config";
import type { MobileDrawerProps, NavMenuItem, NavMenuGroup } from "@/types/navigation";

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Palette,
  Layout,
  Image,
  Globe,
  Smartphone,
  Server,
  Video,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Shield,
  MessageSquare,
  BookOpen,
  HelpCircle,
  CreditCard,
  Users,
};

function MobileMenuGroup({
  group,
  onClose,
}: {
  group: NavMenuGroup;
  onClose: () => void;
}) {
  const { language } = useLanguage();
  const title = getLocalizedText(group.title, group.titleEn, group.titleUg, language);

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-4 py-2">
        {title}
      </h4>
      {group.items.map((item) => {
        const Icon = item.icon ? iconMap[item.icon] : null;
        const label = getLocalizedText(item.label, item.labelEn, item.labelUg, language);

        return (
          <Link
            key={item.id}
            href={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors"
          >
            {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
            <span>{label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function MobileMenuItem({
  item,
  onClose,
}: {
  item: NavMenuItem;
  onClose: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();
  const pathname = usePathname();

  const label = getLocalizedText(item.label, item.labelEn, item.labelUg, language);
  const isActive = item.href ? pathname === item.href || pathname.startsWith(item.href + "/") : false;

  if (item.type === "mega-menu" && item.children) {
    return (
      <div className="border-b border-border">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center justify-between w-full px-4 py-4 text-base font-medium transition-colors",
            isExpanded ? "text-primary bg-accent/30" : "text-foreground hover:bg-accent/30"
          )}
        >
          <span>{label}</span>
          <ChevronDown
            className={cn(
              "w-5 h-5 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden bg-muted/30"
            >
              <div className="py-2 space-y-4">
                {item.children.map((group) => (
                  <MobileMenuGroup key={group.id} group={group} onClose={onClose} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <Link
      href={item.href || "/"}
      onClick={onClose}
      className={cn(
        "flex items-center justify-between px-4 py-4 text-base font-medium border-b border-border transition-colors",
        isActive ? "text-primary bg-accent/30" : "text-foreground hover:bg-accent/30"
      )}
    >
      <span>{label}</span>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </Link>
  );
}

export function MobileDrawer({ isOpen, menuItems, onClose }: MobileDrawerProps) {
  const { data: session } = useSession();
  const { language } = useLanguage();
  const { auth } = defaultNavigationConfig;

  // 禁止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-background z-50 lg:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                CREATIVE
              </span>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <MobileMenuItem key={item.id} item={item} onClose={onClose} />
              ))}
            </div>

            {/* Auth Section */}
            <div className="border-t border-border p-4 space-y-3">
              {session ? (
                <>
                  <div className="flex items-center gap-3 px-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {session.user?.name || "用户"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/user"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {language === "en" ? "Dashboard" : "用户中心"}
                  </Link>
                  <Link
                    href="/user/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    {language === "en" ? "Settings" : "设置"}
                  </Link>
                  {(session.user as any)?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      {language === "en" ? "Admin Panel" : "管理后台"}
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href={auth.loginLink}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {getLocalizedText(auth.loginText, auth.loginTextEn, auth.loginTextUg, language)}
                  </Link>
                  <Link
                    href={auth.registerLink}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    {getLocalizedText(auth.registerText, auth.registerTextEn, auth.registerTextUg, language)}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

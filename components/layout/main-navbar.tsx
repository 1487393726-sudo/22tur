"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, User, LogIn, Settings, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useLanguage } from "@/lib/i18n/context";
import { MegaMenu } from "./mega-menu";
import { MobileDrawer } from "./mobile-drawer";
import {
  defaultNavigationConfig,
  filterMenuByAuth,
  getLocalizedText,
} from "@/lib/navigation/config";
import type { NavMenuItem } from "@/types/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function MainNavbar({ className }: { className?: string }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { language } = useLanguage();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMegaMenu, setOpenMegaMenu] = useState<string | null>(null);
  
  const megaMenuTriggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 路由变化时关闭菜单
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMegaMenu(null);
  }, [pathname]);

  // 根据用户状态过滤菜单
  const isAuthenticated = !!session;
  const userRoles = (session?.user as any)?.role ? [(session?.user as any).role] : [];
  const filteredMenuItems = filterMenuByAuth(
    defaultNavigationConfig.menuItems,
    isAuthenticated,
    userRoles
  );

  const { logo, auth } = defaultNavigationConfig;

  // 检查链接是否激活
  const isLinkActive = (href?: string) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // 渲染菜单项
  const renderMenuItem = (item: NavMenuItem) => {
    const label = getLocalizedText(item.label, item.labelEn, item.labelUg, language);
    const isActive = isLinkActive(item.href);

    if (item.type === "mega-menu" && item.children) {
      const isOpen = openMegaMenu === item.id;
      
      return (
        <div key={item.id} className="relative">
          <button
            ref={(el) => { megaMenuTriggerRefs.current[item.id] = el; }}
            onClick={() => setOpenMegaMenu(isOpen ? null : item.id)}
            onMouseEnter={() => setOpenMegaMenu(item.id)}
            className={cn(
              "flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
              isOpen
                ? "text-primary bg-accent/50"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
            )}
          >
            {label}
            <ChevronDown
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                isOpen && "rotate-180"
              )}
            />
          </button>
          <MegaMenu
            isOpen={isOpen}
            groups={item.children}
            onClose={() => setOpenMegaMenu(null)}
            triggerRef={{ current: megaMenuTriggerRefs.current[item.id] as HTMLElement | null }}
          />
        </div>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href || "/"}
        className={cn(
          "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
          isActive
            ? "text-primary bg-accent/50"
            : "text-muted-foreground hover:text-foreground hover:bg-accent/30"
        )}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-transparent",
          className
        )}
        onMouseLeave={() => setOpenMegaMenu(null)}
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center flex-shrink-0">
              {logo.url ? (
                <Image
                  src={logo.url}
                  alt={getLocalizedText(logo.alt, logo.altEn, language)}
                  width={120}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                />
              ) : (
                <span className="text-xl md:text-2xl font-bold text-primary">
                  CREATIVE
                </span>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {filteredMenuItems.map(renderMenuItem)}
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Auth Buttons */}
              {session ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-[100px] truncate">
                        {session.user?.name || "用户"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/user" className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        {language === "en" ? "Dashboard" : "用户中心"}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/user/settings" className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {language === "en" ? "Settings" : "设置"}
                      </Link>
                    </DropdownMenuItem>
                    {(session.user as any)?.role === "ADMIN" && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="flex items-center gap-2">
                            <Settings className="w-4 h-4" />
                            {language === "en" ? "Admin" : "管理后台"}
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href={auth.loginLink}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    {getLocalizedText(auth.loginText, auth.loginTextEn, auth.loginTextUg, language)}
                  </Link>
                  <Link
                    href={auth.registerLink}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    {getLocalizedText(auth.registerText, auth.registerTextEn, auth.registerTextUg, language)}
                  </Link>
                </div>
              )}

              {/* Theme & Language */}
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-border">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-foreground hover:bg-accent/50 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        menuItems={filteredMenuItems}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}

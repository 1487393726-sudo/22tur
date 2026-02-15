"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationConfig, websiteConfig } from "@/lib/website/config";
import { WebsiteColorStyleToggle } from "@/components/website/WebsiteColorStyleToggle";

/**
 * Navigation Bar Component
 * 
 * Displays the main navigation bar with:
 * - Logo/brand name
 * - Main menu links (Home, Services, Cases, About, Blog, Contact)
 * - Active state indication for current page
 * - Mobile hamburger menu for responsive design
 * - Brand color #1E3A5F
 * 
 * Responsive breakpoints:
 * - Mobile: < 768px (hamburger menu)
 * - Tablet: 768px - 1024px (optimized layout)
 * - Desktop: > 1024px (full menu)
 * 
 * Requirements: 15.1, 15.2, 15.3, 15.4, 15.5
 */
export function Navigation() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Monitor scroll position for sticky header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Check if a link is active
  const isLinkActive = (href: string): boolean => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  // Get menu items from config
  const menuItems = navigationConfig.mainMenu;

  return (
    <>
      {/* Navigation Bar */}
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 nav",
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-md"
            : "bg-white/80 backdrop-blur-sm"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo / Brand Name */}
            <Link
              href="/"
              className="flex items-center flex-shrink-0 gap-2"
              aria-label="Home"
            >
              {websiteConfig.logo ? (
                <Image
                  src={websiteConfig.logo}
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                />
              ) : null}
              <span
                className="text-lg md:text-xl font-bold text-primary"
                style={{ color: "var(--color-primary-500)" }}
              >
                {websiteConfig.siteName}
              </span>
            </Link>

            {/* Desktop Navigation Menu + 官网颜色风格切换 */}
            <div className="hidden md:flex items-center gap-2">
              {menuItems.map((item) => {
                const isActive = isLinkActive(item.href);
                return (
                  <div
                    key={item.href}
                    {...(isActive && { "aria-current": "page" })}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 nav-item",
                        isActive ? "nav-item active" : "nav-item",
                      )}
                    >
                      {item.label}
                    </Link>
                  </div>
                );
              })}

              {/* 官网颜色风格切换器 */}
              <div className="ml-2 pl-2 border-l border-border-light/60 flex items-center">
                <WebsiteColorStyleToggle />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X size={24} />
              ) : (
                <Menu size={24} />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white border-b border-gray-200 shadow-lg"
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="px-4 py-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = isLinkActive(item.href);
              return (
                <div
                  key={item.href}
                  {...(isActive && { "aria-current": "page" })}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "block px-4 py-2 rounded-md text-base font-medium transition-all duration-200 nav-item",
                      isActive
                        ? "nav-item active"
                        : "nav-item"
                    )}
                  >
                    {item.label}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden under fixed navbar */}
      <div className="h-16 md:h-20" />
    </>
  );
}

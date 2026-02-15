"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
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
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import type { MegaMenuProps, NavMenuGroup, NavMenuLink } from "@/types/navigation";

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

function MenuLink({ item, onClose }: { item: NavMenuLink; onClose: () => void }) {
  const { language } = useLanguage();
  const Icon = item.icon ? iconMap[item.icon] : null;
  
  // 支持三种语言
  let label = item.label;
  let description = item.description;
  
  if (language === "en" && item.labelEn) {
    label = item.labelEn;
    description = item.descriptionEn || item.description;
  } else if (language === "ug" && item.labelUg) {
    label = item.labelUg;
    description = item.descriptionUg || item.description;
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "group flex items-start gap-3 p-3 rounded-lg",
        "hover:bg-accent/50 transition-colors duration-200"
      )}
    >
      {Icon && (
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
            {label}
          </span>
          <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}

function MenuGroup({ group, onClose }: { group: NavMenuGroup; onClose: () => void }) {
  const { language } = useLanguage();
  
  // 支持三种语言
  let title = group.title;
  if (language === "en" && group.titleEn) {
    title = group.titleEn;
  } else if (language === "ug" && group.titleUg) {
    title = group.titleUg;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">
        {title}
      </h3>
      <div className="space-y-1">
        {group.items.map((item) => (
          <MenuLink key={item.id} item={item} onClose={onClose} />
        ))}
      </div>
    </div>
  );
}

export function MegaMenu({ isOpen, groups, onClose, triggerRef }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(target)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // ESC 键关闭
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "absolute top-full left-0 right-0 mt-2",
            "bg-background/95 backdrop-blur-xl",
            "border border-border rounded-xl shadow-xl",
            "z-50"
          )}
        >
          <div className="container mx-auto px-6 py-6">
            <div
              className={cn(
                "grid gap-8",
                groups.length <= 2 && "grid-cols-2",
                groups.length === 3 && "grid-cols-3",
                groups.length === 4 && "grid-cols-4",
                groups.length >= 5 && "grid-cols-5"
              )}
            >
              {groups.map((group) => (
                <MenuGroup key={group.id} group={group} onClose={onClose} />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

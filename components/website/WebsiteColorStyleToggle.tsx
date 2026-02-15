"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { applyWebsiteColorStyle, type WebsiteColorStyleId } from "@/lib/website/color-style-runtime";

const WEBSITE_COLOR_STYLE_KEY = "website-color-style";

const websiteStyleOptions: {
  id: WebsiteColorStyleId;
  name: string;
  nameEn: string;
  description: string;
}[] = [
  {
    id: "website-default",
    name: "默认官网风格",
    nameEn: "Default",
    description: "当前这套深蓝 + 青绿配色",
  },
  {
    id: "bw-light",
    name: "黑白极简 · 浅色",
    nameEn: "Black & White Light",
    description: "白底 + 深灰文字，极简干净",
  },
  {
    id: "bw-dark",
    name: "黑白极简 · 深色",
    nameEn: "Black & White Dark",
    description: "深色背景 + 浅色文字，夜间风格",
  },
];

export function WebsiteColorStyleToggle() {
  const [current, setCurrent] = React.useState<WebsiteColorStyleId>("website-default");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // 只在官网路由下生效
    const root = document.documentElement;
    const routeType = root.getAttribute("data-route-type");
    if (routeType && routeType !== "website") return;

    const saved = (localStorage.getItem(WEBSITE_COLOR_STYLE_KEY) ||
      "website-default") as WebsiteColorStyleId;

    setCurrent(saved);
    applyWebsiteColorStyle(saved);
  }, []);

  const handleChange = (id: WebsiteColorStyleId) => {
    setCurrent(id);
    applyWebsiteColorStyle(id);
    localStorage.setItem(WEBSITE_COLOR_STYLE_KEY, id);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Palette className="h-5 w-5" />
        <span className="sr-only">切换官网颜色风格</span>
      </Button>
    );
  }

  const currentMeta = websiteStyleOptions.find((s) => s.id === current);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">切换官网颜色风格</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-sm font-medium">
          官网颜色风格 / Website Style
        </DropdownMenuLabel>
        {currentMeta && (
          <p className="px-2 pb-2 text-xs text-muted-foreground">
            当前：{currentMeta.name} ({currentMeta.nameEn})
          </p>
        )}
        <DropdownMenuSeparator />

        {websiteStyleOptions.map((style) => (
          <DropdownMenuItem
            key={style.id}
            onClick={() => handleChange(style.id)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full border border-border/40 bg-gradient-to-br from-[var(--color-primary-500)] to-[var(--color-secondary-500)]" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{style.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {style.nameEn} · {style.description}
              </div>
            </div>
            {current === style.id && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


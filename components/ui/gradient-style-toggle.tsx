"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// 渐变风格配置
const gradientStyles = [
  {
    id: "purple",
    name: "紫色梦幻",
    nameEn: "Purple Dream",
    preview: "linear-gradient(135deg, #1e1b4b 0%, #8b5cf6 100%)",
    cssVars: {
      "--gradient-from": "#0f0f23",
      "--gradient-via-1": "#1a1a2e", 
      "--gradient-via-2": "#16213e",
      "--gradient-via-3": "#1e3a8a",
      "--gradient-via-4": "#3730a3",
      "--gradient-via-5": "#6366f1",
      "--gradient-via-6": "#8b5cf6",
      "--gradient-to": "#a855f7"
    }
  },
  {
    id: "blue",
    name: "海洋蓝调",
    nameEn: "Ocean Blue",
    preview: "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)",
    cssVars: {
      "--gradient-from": "#0c1445",
      "--gradient-via-1": "#1e293b",
      "--gradient-via-2": "#0f172a",
      "--gradient-via-3": "#0c4a6e",
      "--gradient-via-4": "#0369a1",
      "--gradient-via-5": "#0284c7",
      "--gradient-via-6": "#0ea5e9",
      "--gradient-to": "#38bdf8"
    }
  },
  {
    id: "green",
    name: "翡翠森林",
    nameEn: "Emerald Forest",
    preview: "linear-gradient(135deg, #064e3b 0%, #10b981 100%)",
    cssVars: {
      "--gradient-from": "#0f1419",
      "--gradient-via-1": "#1c2e26",
      "--gradient-via-2": "#064e3b",
      "--gradient-via-3": "#065f46",
      "--gradient-via-4": "#047857",
      "--gradient-via-5": "#059669",
      "--gradient-via-6": "#10b981",
      "--gradient-to": "#34d399"
    }
  },
  {
    id: "orange",
    name: "日落橙光",
    nameEn: "Sunset Orange",
    preview: "linear-gradient(135deg, #9a3412 0%, #f97316 100%)",
    cssVars: {
      "--gradient-from": "#1c1917",
      "--gradient-via-1": "#292524",
      "--gradient-via-2": "#451a03",
      "--gradient-via-3": "#9a3412",
      "--gradient-via-4": "#c2410c",
      "--gradient-via-5": "#ea580c",
      "--gradient-via-6": "#f97316",
      "--gradient-to": "#fb923c"
    }
  },
  {
    id: "pink",
    name: "樱花粉红",
    nameEn: "Cherry Blossom",
    preview: "linear-gradient(135deg, #831843 0%, #ec4899 100%)",
    cssVars: {
      "--gradient-from": "#1f1726",
      "--gradient-via-1": "#2d1b3d",
      "--gradient-via-2": "#4c1d95",
      "--gradient-via-3": "#831843",
      "--gradient-via-4": "#be185d",
      "--gradient-via-5": "#db2777",
      "--gradient-via-6": "#ec4899",
      "--gradient-to": "#f472b6"
    }
  },
  {
    id: "dark",
    name: "深邃黑夜",
    nameEn: "Deep Night",
    preview: "linear-gradient(135deg, #000000 0%, #374151 100%)",
    cssVars: {
      "--gradient-from": "#000000",
      "--gradient-via-1": "#111827",
      "--gradient-via-2": "#1f2937",
      "--gradient-via-3": "#374151",
      "--gradient-via-4": "#4b5563",
      "--gradient-via-5": "#6b7280",
      "--gradient-via-6": "#9ca3af",
      "--gradient-to": "#d1d5db"
    }
  },
  {
    id: "light",
    name: "纯净白光",
    nameEn: "Pure Light",
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    cssVars: {
      "--gradient-from": "#ffffff",
      "--gradient-via-1": "#f8fafc",
      "--gradient-via-2": "#f1f5f9",
      "--gradient-via-3": "#e2e8f0",
      "--gradient-via-4": "#cbd5e1",
      "--gradient-via-5": "#94a3b8",
      "--gradient-via-6": "#64748b",
      "--gradient-to": "#475569"
    }
  },
  {
    id: "rainbow",
    name: "彩虹幻彩",
    nameEn: "Rainbow Fantasy",
    preview: "linear-gradient(135deg, #ef4444 0%, #f97316 14%, #eab308 28%, #22c55e 42%, #06b6d4 57%, #3b82f6 71%, #8b5cf6 85%, #ec4899 100%)",
    cssVars: {
      "--gradient-from": "#1f1726",
      "--gradient-via-1": "#ef4444",
      "--gradient-via-2": "#f97316",
      "--gradient-via-3": "#eab308",
      "--gradient-via-4": "#22c55e",
      "--gradient-via-5": "#06b6d4",
      "--gradient-via-6": "#3b82f6",
      "--gradient-to": "#8b5cf6"
    }
  }
];

export function GradientStyleToggle() {
  const [currentStyle, setCurrentStyle] = React.useState("blue");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // 从 localStorage 读取保存的风格，没有的话默认使用蓝色风格
    const savedStyle = localStorage.getItem("gradient-style");
    const initialStyle =
      savedStyle && gradientStyles.find((s) => s.id === savedStyle)
        ? savedStyle
        : "blue";

    setCurrentStyle(initialStyle);
    applyGradientStyle(initialStyle);
  }, []);

  const applyGradientStyle = (styleId: string) => {
    const style = gradientStyles.find((s) => s.id === styleId);
    if (!style) return;

    const root = document.documentElement;
    const vars = style.cssVars;

    // 1) 应用渐变相关 CSS 变量（给需要用到变量的样式预留）
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // 2) 更新所有使用 purple-gradient-page 的大背景块（3D 高级渐变）
    const gradientPages = document.querySelectorAll(".purple-gradient-page");
    gradientPages.forEach((page) => {
      if (styleId === "light") {
        (page as HTMLElement).style.background = `linear-gradient(135deg, 
          ${vars["--gradient-from"]} 0%, 
          ${vars["--gradient-via-1"]} 15%, 
          ${vars["--gradient-via-2"]} 30%, 
          ${vars["--gradient-via-3"]} 45%, 
          ${vars["--gradient-via-4"]} 60%, 
          ${vars["--gradient-via-5"]} 75%, 
          ${vars["--gradient-via-6"]} 90%, 
          ${vars["--gradient-to"]} 100%
        ) radial-gradient(circle at 10% 0%, rgba(255,255,255,0.12) 0, transparent 55%)`;
      } else if (styleId === "rainbow") {
        (page as HTMLElement).style.background = `${style.preview}, radial-gradient(circle at 10% 0%, rgba(255,255,255,0.12) 0, transparent 55%)`;
      } else {
        (page as HTMLElement).style.background = `linear-gradient(135deg, 
          ${vars["--gradient-from"]} 0%, 
          ${vars["--gradient-via-1"]} 15%, 
          ${vars["--gradient-via-2"]} 30%, 
          ${vars["--gradient-via-3"]} 45%, 
          ${vars["--gradient-via-4"]} 60%, 
          ${vars["--gradient-via-5"]} 75%, 
          ${vars["--gradient-via-6"]} 90%, 
          ${vars["--gradient-to"]} 100%
        ), radial-gradient(circle at 10% 0%, rgba(255,255,255,0.12) 0, transparent 55%)`;
        (page as HTMLElement).style.backgroundBlendMode = "screen, normal";
        (page as HTMLElement).style.boxShadow = "0 30px 80px rgba(15,23,42,0.9)";
      }
      (page as HTMLElement).style.color = "#e5e7eb";
    });

    // 3) 组件级别：卡片 / 按钮 / 标题 / 文本颜色风格
    const cards = document.querySelectorAll(".purple-gradient-card");
    cards.forEach((card) => {
      const el = card as HTMLElement;
      el.style.background = `linear-gradient(145deg, ${vars["--gradient-via-2"]}, ${vars["--gradient-via-4"]})`;
      el.style.borderColor = `${vars["--gradient-via-3"]}`;
      el.style.boxShadow = "0 18px 40px rgba(15,23,42,0.8)";
    });

    const buttons = document.querySelectorAll(".purple-gradient-button");
    buttons.forEach((btn) => {
      const el = btn as HTMLElement;
      el.style.background = `linear-gradient(135deg, ${vars["--gradient-via-4"]}, ${vars["--gradient-to"]})`;
      el.style.color = "#0b1120";
      el.style.borderColor = `${vars["--gradient-via-5"]}`;
      el.style.boxShadow = "0 10px 25px rgba(15,23,42,0.7)";
    });

    const outlineButtons = document.querySelectorAll(
      ".purple-gradient-button-outline",
    );
    outlineButtons.forEach((btn) => {
      const el = btn as HTMLElement;
      el.style.background = "transparent";
      el.style.color = vars["--gradient-via-5"];
      el.style.borderColor = `${vars["--gradient-via-4"]}`;
    });

    const titles = document.querySelectorAll(".purple-gradient-title");
    titles.forEach((t) => {
      const el = t as HTMLElement;
      el.style.backgroundImage = `linear-gradient(135deg, ${vars["--gradient-via-5"]}, ${vars["--gradient-to"]})`;
      // @ts-expect-error: vendor property on HTMLElement.style
      el.style.WebkitBackgroundClip = "text";
      // @ts-expect-error: vendor property on HTMLElement.style
      el.style.WebkitTextFillColor = "transparent";
      el.style.color = "transparent";
    });

    const texts = document.querySelectorAll(".purple-gradient-text");
    texts.forEach((t) => {
      const el = t as HTMLElement;
      el.style.color = "#cbd5f5";
    });

    // 4) 保存到 localStorage，保证刷新后还保持当前组件风格
    localStorage.setItem("gradient-style", styleId);
  };

  const handleStyleChange = (styleId: string) => {
    setCurrentStyle(styleId);
    applyGradientStyle(styleId);
  };

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Palette className="h-5 w-5" />
        <span className="sr-only">切换渐变风格</span>
      </Button>
    );
  }

  const currentStyleData = gradientStyles.find(s => s.id === currentStyle);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Palette className="h-5 w-5" />
          <span className="sr-only">切换渐变风格</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-sm font-medium">
          渐变风格 / Gradient Style
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {gradientStyles.map((style) => (
          <DropdownMenuItem
            key={style.id}
            onClick={() => handleStyleChange(style.id)}
            className="flex items-center gap-3 p-3 cursor-pointer"
          >
            {/* 颜色预览 */}
            <div 
              className="w-6 h-6 rounded-full border-2 border-white/20 flex-shrink-0"
              style={{ background: style.preview }}
            />
            
            {/* 名称 */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">
                {style.name}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {style.nameEn}
              </div>
            </div>
            
            {/* 选中状态 */}
            {currentStyle === style.id && (
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
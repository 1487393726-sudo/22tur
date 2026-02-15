"use client";

import { cn } from "@/lib/utils";

interface ServiceCategory {
  id: string;
  name: string;
  nameEn: string;
  slug: string;
  icon?: string;
}

interface ServiceCategoryNavProps {
  categories: ServiceCategory[];
  activeCategory: string;
  onCategoryChange: (slug: string) => void;
  isDashboard?: boolean;
}

const iconMap: Record<string, string> = {
  Palette: "🎨",
  Code: "💻",
  Package: "📦",
  Users: "👥",
};

export function ServiceCategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  isDashboard = false,
}: ServiceCategoryNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
      <button
        onClick={() => onCategoryChange("all")}
        className={cn(
          "px-6 py-2 rounded-lg transition-all font-medium",
          isDashboard
            ? activeCategory === "all"
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
            : activeCategory === "all"
            ? "bg-primary text-white shadow-lg shadow-primary/30"
            : "glass-card text-muted-foreground hover:text-foreground hover:scale-105"
        )}
      >
        全部服务
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onCategoryChange(category.slug)}
          className={cn(
            "px-6 py-2 rounded-lg transition-all font-medium flex items-center gap-2",
            isDashboard
              ? activeCategory === category.slug
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
              : activeCategory === category.slug
              ? "bg-primary text-white shadow-lg shadow-primary/30"
              : "glass-card text-muted-foreground hover:text-foreground hover:scale-105"
          )}
        >
          {category.icon && iconMap[category.icon] && (
            <span>{iconMap[category.icon]}</span>
          )}
          {category.name}
        </button>
      ))}
    </div>
  );
}

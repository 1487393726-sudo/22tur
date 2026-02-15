'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Lightbulb, Monitor, Camera, Mic, AudioLines, Grip, Package } from 'lucide-react';
import type { EquipmentCategory } from '@/types/marketplace';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Lightbulb,
  Monitor,
  Camera,
  Mic,
  AudioLines,
  Grip,
  Package,
};

interface CategoryNavProps {
  selectedCategory?: string;
  onCategoryChange: (category: string | undefined) => void;
}

export function CategoryNav({ selectedCategory, onCategoryChange }: CategoryNavProps) {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/marketplace/categories')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onCategoryChange(undefined)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
          !selectedCategory
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted hover:bg-muted/80'
        )}
      >
        <Package className="h-4 w-4" />
        全部
      </button>
      {categories.map((category) => {
        const Icon = iconMap[category.icon || 'Package'] || Package;
        return (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === category.slug
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            )}
          >
            <Icon className="h-4 w-4" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
}

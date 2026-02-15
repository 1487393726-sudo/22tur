'use client';

import { cn } from '@/lib/utils';
import { User, Briefcase, Building2 } from 'lucide-react';
import type { UserSegment } from '@/types/marketplace';

interface SegmentTabsProps {
  selectedSegment?: UserSegment;
  onSegmentChange: (segment: UserSegment | undefined) => void;
}

const segments: { value: UserSegment | undefined; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { value: undefined, label: '全部', icon: User, description: '查看所有设备' },
  { value: 'PERSONAL', label: '个人用户', icon: User, description: '适合个人直播入门' },
  { value: 'PROFESSIONAL', label: '行业用户', icon: Briefcase, description: '专业直播解决方案' },
  { value: 'ENTERPRISE', label: '企业用户', icon: Building2, description: '企业级直播间配置' },
];

export function SegmentTabs({ selectedSegment, onSegmentChange }: SegmentTabsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {segments.map((segment) => {
        const Icon = segment.icon;
        const isSelected = selectedSegment === segment.value;
        return (
          <button
            key={segment.value || 'all'}
            onClick={() => onSegmentChange(segment.value)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all',
              isSelected
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-border hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
            <div className="text-left">
              <div className="font-medium">{segment.label}</div>
              <div className="text-xs text-muted-foreground">{segment.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

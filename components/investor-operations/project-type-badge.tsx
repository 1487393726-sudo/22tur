'use client';

/**
 * 项目类型标识组件
 * Project Type Badge Component
 * 
 * 展示项目类型和行业类型的标识
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Building2, 
  Globe, 
  Factory, 
  ShoppingBag, 
  Briefcase, 
  Cpu, 
  GraduationCap, 
  Heart,
  HelpCircle
} from 'lucide-react';
import { ProjectType, IndustryType, ProjectPhase } from '@/types/investor-operations-monitoring';

// 项目类型配置
const projectTypeConfig: Record<ProjectType, { label: string; icon: React.ReactNode; color: string }> = {
  [ProjectType.PHYSICAL]: {
    label: '现实版',
    icon: <Building2 className="h-3 w-3" />,
    color: 'bg-blue-600 hover:bg-blue-700'
  },
  [ProjectType.ONLINE]: {
    label: '网络专业版',
    icon: <Globe className="h-3 w-3" />,
    color: 'bg-green-600 hover:bg-green-700'
  }
};

// 行业类型配置
const industryTypeConfig: Record<IndustryType, { label: string; icon: React.ReactNode; color: string }> = {
  [IndustryType.CATERING]: {
    label: '餐饮',
    icon: <Factory className="h-3 w-3" />,
    color: 'bg-orange-600 hover:bg-orange-700'
  },
  [IndustryType.RETAIL]: {
    label: '零售',
    icon: <ShoppingBag className="h-3 w-3" />,
    color: 'bg-pink-600 hover:bg-pink-700'
  },
  [IndustryType.SERVICE]: {
    label: '服务',
    icon: <Briefcase className="h-3 w-3" />,
    color: 'bg-indigo-600 hover:bg-indigo-700'
  },
  [IndustryType.TECHNOLOGY]: {
    label: '科技',
    icon: <Cpu className="h-3 w-3" />,
    color: 'bg-cyan-600 hover:bg-cyan-700'
  },
  [IndustryType.EDUCATION]: {
    label: '教育',
    icon: <GraduationCap className="h-3 w-3" />,
    color: 'bg-yellow-600 hover:bg-yellow-700'
  },
  [IndustryType.HEALTHCARE]: {
    label: '医疗健康',
    icon: <Heart className="h-3 w-3" />,
    color: 'bg-red-600 hover:bg-red-700'
  },
  [IndustryType.OTHER]: {
    label: '其他',
    icon: <HelpCircle className="h-3 w-3" />,
    color: 'bg-gray-600 hover:bg-gray-700'
  }
};

// 项目阶段配置
const phaseConfig: Record<ProjectPhase, { label: string; color: string }> = {
  [ProjectPhase.DESIGN]: {
    label: '设计阶段',
    color: 'bg-purple-600 hover:bg-purple-700'
  },
  [ProjectPhase.RENOVATION]: {
    label: '装修阶段',
    color: 'bg-amber-600 hover:bg-amber-700'
  },
  [ProjectPhase.PRE_OPENING]: {
    label: '开业准备',
    color: 'bg-teal-600 hover:bg-teal-700'
  },
  [ProjectPhase.OPERATING]: {
    label: '正式运营',
    color: 'bg-emerald-600 hover:bg-emerald-700'
  }
};

interface ProjectTypeBadgeProps {
  projectType?: ProjectType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
}

export function ProjectTypeBadge({
  projectType,
  size = 'md',
  showIcon = true,
  showTooltip = true
}: ProjectTypeBadgeProps) {
  if (!projectType) {
    return (
      <Badge variant="outline" className="text-gray-400 border-gray-600">
        未设置
      </Badge>
    );
  }

  const config = projectTypeConfig[projectType];
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const badge = (
    <Badge className={`${config.color} ${sizeClasses[size]} flex items-center gap-1`}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>项目类型: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

interface IndustryTypeBadgeProps {
  industryType?: IndustryType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showTooltip?: boolean;
}

export function IndustryTypeBadge({
  industryType,
  size = 'md',
  showIcon = true,
  showTooltip = true
}: IndustryTypeBadgeProps) {
  if (!industryType) {
    return (
      <Badge variant="outline" className="text-gray-400 border-gray-600">
        未设置
      </Badge>
    );
  }

  const config = industryTypeConfig[industryType];
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const badge = (
    <Badge className={`${config.color} ${sizeClasses[size]} flex items-center gap-1`}>
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>行业类型: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

interface PhaseBadgeProps {
  phase?: ProjectPhase;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function PhaseBadge({
  phase,
  size = 'md',
  showTooltip = true
}: PhaseBadgeProps) {
  if (!phase) {
    return (
      <Badge variant="outline" className="text-gray-400 border-gray-600">
        未设置
      </Badge>
    );
  }

  const config = phaseConfig[phase];
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const badge = (
    <Badge className={`${config.color} ${sizeClasses[size]}`}>
      {config.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badge}</TooltipTrigger>
          <TooltipContent>
            <p>当前阶段: {config.label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}

interface ProjectBadgesProps {
  projectType?: ProjectType;
  industryType?: IndustryType;
  phase?: ProjectPhase;
  size?: 'sm' | 'md' | 'lg';
  showIcons?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export function ProjectBadges({
  projectType,
  industryType,
  phase,
  size = 'sm',
  showIcons = true,
  layout = 'horizontal'
}: ProjectBadgesProps) {
  const containerClass = layout === 'horizontal' 
    ? 'flex flex-wrap items-center gap-2' 
    : 'flex flex-col gap-1';

  return (
    <div className={containerClass}>
      {projectType && (
        <ProjectTypeBadge 
          projectType={projectType} 
          size={size} 
          showIcon={showIcons} 
        />
      )}
      {industryType && (
        <IndustryTypeBadge 
          industryType={industryType} 
          size={size} 
          showIcon={showIcons} 
        />
      )}
      {phase && (
        <PhaseBadge 
          phase={phase} 
          size={size} 
        />
      )}
    </div>
  );
}

export default ProjectBadges;

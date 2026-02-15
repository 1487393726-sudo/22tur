'use client';

/**
 * 项目类型筛选组件
 * Project Type Filter Component
 * 
 * 提供项目类型、行业类型和阶段的筛选功能
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, Building2, Globe, Factory, ShoppingBag, Briefcase, Cpu, GraduationCap, Heart } from 'lucide-react';
import { ProjectType, IndustryType, ProjectPhase } from '@/types/investor-operations-monitoring';

// 项目类型中文名称
const projectTypeNames: Record<ProjectType, string> = {
  [ProjectType.PHYSICAL]: '现实版',
  [ProjectType.ONLINE]: '网络专业版'
};

// 行业类型中文名称
const industryTypeNames: Record<IndustryType, string> = {
  [IndustryType.CATERING]: '餐饮',
  [IndustryType.RETAIL]: '零售',
  [IndustryType.SERVICE]: '服务',
  [IndustryType.TECHNOLOGY]: '科技',
  [IndustryType.EDUCATION]: '教育',
  [IndustryType.HEALTHCARE]: '医疗健康',
  [IndustryType.OTHER]: '其他'
};

// 项目阶段中文名称
const phaseNames: Record<ProjectPhase, string> = {
  [ProjectPhase.DESIGN]: '设计阶段',
  [ProjectPhase.RENOVATION]: '装修阶段',
  [ProjectPhase.PRE_OPENING]: '开业准备',
  [ProjectPhase.OPERATING]: '正式运营'
};

// 行业图标
const industryIcons: Record<IndustryType, React.ReactNode> = {
  [IndustryType.CATERING]: <Factory className="h-4 w-4" />,
  [IndustryType.RETAIL]: <ShoppingBag className="h-4 w-4" />,
  [IndustryType.SERVICE]: <Briefcase className="h-4 w-4" />,
  [IndustryType.TECHNOLOGY]: <Cpu className="h-4 w-4" />,
  [IndustryType.EDUCATION]: <GraduationCap className="h-4 w-4" />,
  [IndustryType.HEALTHCARE]: <Heart className="h-4 w-4" />,
  [IndustryType.OTHER]: <Building2 className="h-4 w-4" />
};

export interface FilterParams {
  projectType?: ProjectType;
  industryType?: IndustryType;
  currentPhase?: ProjectPhase;
  searchTerm?: string;
  minInvestment?: number;
  maxInvestment?: number;
}

interface ProjectTypeFilterProps {
  onFilterChange: (params: FilterParams) => void;
  initialFilters?: FilterParams;
  showInvestmentRange?: boolean;
  compact?: boolean;
}

export function ProjectTypeFilter({
  onFilterChange,
  initialFilters = {},
  showInvestmentRange = true,
  compact = false
}: ProjectTypeFilterProps) {
  const [filters, setFilters] = useState<FilterParams>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(!compact);

  const handleFilterChange = useCallback((key: keyof FilterParams, value: unknown) => {
    const newFilters = {
      ...filters,
      [key]: value === 'all' ? undefined : value
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  }, [filters, onFilterChange]);

  const clearFilters = useCallback(() => {
    const emptyFilters: FilterParams = {};
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  }, [onFilterChange]);

  const activeFilterCount = Object.values(filters).filter(v => v !== undefined && v !== '').length;

  return (
    <Card className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border-purple-500/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-white400" />
            项目筛选
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-purple-600 text-white">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-white300 hover:text-white"
              >
                <X className="h-4 w-4 mr-1" />
                清除
              </Button>
            )}
            {compact && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white300 hover:text-white"
              >
                {isExpanded ? '收起' : '展开'}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索项目名称或描述..."
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value || undefined)}
              className="pl-10 bg-gray-800/50 border-purple-500/30 focus:border-purple-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 项目类型 */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">项目类型</Label>
              <Select
                value={filters.projectType || 'all'}
                onValueChange={(value) => handleFilterChange('projectType', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-purple-500/30">
                  <SelectValue placeholder="全部类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  {Object.entries(projectTypeNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {value === ProjectType.PHYSICAL ? (
                          <Building2 className="h-4 w-4" />
                        ) : (
                          <Globe className="h-4 w-4" />
                        )}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 行业类型 */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">行业类型</Label>
              <Select
                value={filters.industryType || 'all'}
                onValueChange={(value) => handleFilterChange('industryType', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-purple-500/30">
                  <SelectValue placeholder="全部行业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部行业</SelectItem>
                  {Object.entries(industryTypeNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        {industryIcons[value as IndustryType]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 项目阶段 */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-300">项目阶段</Label>
              <Select
                value={filters.currentPhase || 'all'}
                onValueChange={(value) => handleFilterChange('currentPhase', value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-purple-500/30">
                  <SelectValue placeholder="全部阶段" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部阶段</SelectItem>
                  {Object.entries(phaseNames).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 投资金额范围 */}
          {showInvestmentRange && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">最低投资额</Label>
                <Input
                  type="number"
                  placeholder="最低金额"
                  value={filters.minInvestment || ''}
                  onChange={(e) => handleFilterChange(
                    'minInvestment',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  className="bg-gray-800/50 border-purple-500/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">最高投资额</Label>
                <Input
                  type="number"
                  placeholder="最高金额"
                  value={filters.maxInvestment || ''}
                  onChange={(e) => handleFilterChange(
                    'maxInvestment',
                    e.target.value ? parseFloat(e.target.value) : undefined
                  )}
                  className="bg-gray-800/50 border-purple-500/30"
                />
              </div>
            </div>
          )}

          {/* 快速筛选标签 */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-sm text-gray-400">快速筛选:</span>
            {Object.entries(industryTypeNames).slice(0, 4).map(([value, label]) => (
              <Badge
                key={value}
                variant={filters.industryType === value ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  filters.industryType === value
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'border-purple-500/50 hover:bg-purple-900/30'
                }`}
                onClick={() => handleFilterChange(
                  'industryType',
                  filters.industryType === value ? undefined : value
                )}
              >
                {industryIcons[value as IndustryType]}
                <span className="ml-1">{label}</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

export default ProjectTypeFilter;

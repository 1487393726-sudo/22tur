'use client';

/**
 * 访问拒绝页面组件
 * Access Denied Page Component
 * 
 * 显示权限不足时的友好提示和数据可见性说明
 * 需求: 8.2
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Home,
  HelpCircle,
  Info
} from 'lucide-react';
import { AccessLevel, DataVisibility } from '@/types/investor-operations-monitoring';

/**
 * 组件属性
 */
interface AccessDeniedPageProps {
  // 错误消息
  message?: string;
  // 项目 ID
  projectId?: string;
  // 项目名称
  projectName?: string;
  // 当前访问级别
  currentAccessLevel?: AccessLevel;
  // 所需访问级别
  requiredAccessLevel?: AccessLevel;
  // 数据可见性配置
  visibility?: DataVisibility;
  // 是否显示返回按钮
  showBackButton?: boolean;
  // 是否显示首页按钮
  showHomeButton?: boolean;
  // 自定义返回路径
  backPath?: string;
  // 自定义首页路径
  homePath?: string;
  // 联系支持链接
  supportLink?: string;
}

/**
 * 访问级别显示名称
 */
const ACCESS_LEVEL_NAMES: Record<AccessLevel, string> = {
  [AccessLevel.BASIC]: '基础',
  [AccessLevel.STANDARD]: '标准',
  [AccessLevel.FULL]: '完整'
};

/**
 * 访问级别颜色
 */
const ACCESS_LEVEL_COLORS: Record<AccessLevel, string> = {
  [AccessLevel.BASIC]: 'bg-gray-500',
  [AccessLevel.STANDARD]: 'bg-blue-500',
  [AccessLevel.FULL]: 'bg-purple-500'
};

/**
 * 访问拒绝页面组件
 */
export function AccessDeniedPage({
  message = '您没有访问此内容的权限',
  projectId,
  projectName,
  currentAccessLevel,
  requiredAccessLevel,
  visibility,
  showBackButton = true,
  showHomeButton = true,
  backPath,
  homePath = '/investor-portal',
  supportLink = '/support'
}: AccessDeniedPageProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backPath) {
      router.push(backPath);
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    router.push(homePath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* 主卡片 */}
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <ShieldAlert className="w-10 h-10 text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              访问受限
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 错误消息 */}
            <div className="text-center">
              <p className="text-white/80 text-lg">{message}</p>
              {projectName && (
                <p className="text-white/60 mt-2">
                  项目: <span className="text-white">{projectName}</span>
                  {projectId && (
                    <span className="text-white/40 text-sm ml-2">
                      ({projectId.slice(0, 8)}...)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* 访问级别信息 */}
            {(currentAccessLevel || requiredAccessLevel) && (
              <div className="bg-white/5 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-white/80">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">访问级别信息</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {currentAccessLevel && (
                    <div className="space-y-1">
                      <p className="text-white/60 text-sm">您的访问级别</p>
                      <Badge className={`${ACCESS_LEVEL_COLORS[currentAccessLevel]} text-white`}>
                        {ACCESS_LEVEL_NAMES[currentAccessLevel]}
                      </Badge>
                    </div>
                  )}
                  {requiredAccessLevel && (
                    <div className="space-y-1">
                      <p className="text-white/60 text-sm">所需访问级别</p>
                      <Badge className={`${ACCESS_LEVEL_COLORS[requiredAccessLevel]} text-white`}>
                        {ACCESS_LEVEL_NAMES[requiredAccessLevel]}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 数据可见性说明 */}
            {visibility && (
              <DataVisibilityInfo visibility={visibility} />
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                  onClick={handleBack}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回上一页
                </Button>
              )}
              {showHomeButton && (
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleHome}
                >
                  <Home className="w-4 h-4 mr-2" />
                  返回投资者门户
                </Button>
              )}
            </div>

            {/* 帮助链接 */}
            <div className="text-center pt-2">
              <a
                href={supportLink}
                className="inline-flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                需要帮助？联系客服
              </a>
            </div>
          </CardContent>
        </Card>

        {/* 权限说明卡片 */}
        <Card className="bg-white/5 backdrop-blur-lg border-white/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-white/70 space-y-2">
                <p className="font-medium text-white/90">关于访问权限</p>
                <p>
                  您的数据访问权限与您在项目中的持股比例相关。
                  持股比例越高，可查看的数据越详细。
                </p>
                <ul className="list-disc list-inside space-y-1 text-white/60">
                  <li>基础级别 (持股 &lt; 10%): 可查看项目概要和盈亏汇总</li>
                  <li>标准级别 (持股 10-30%): 可查看运营数据和员工列表</li>
                  <li>完整级别 (持股 ≥ 30%): 可查看所有详细数据包括薪资</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/**
 * 数据可见性信息组件
 */
function DataVisibilityInfo({ visibility }: { visibility: DataVisibility }) {
  const items = [
    {
      label: '财务数据',
      allowed: visibility.canViewFinancials,
      icon: visibility.canViewFinancials ? Eye : EyeOff
    },
    {
      label: '员工详情',
      allowed: visibility.canViewEmployeeDetails,
      icon: visibility.canViewEmployeeDetails ? Eye : EyeOff
    },
    {
      label: '薪资详情',
      allowed: visibility.canViewSalaryDetails,
      icon: visibility.canViewSalaryDetails ? Eye : EyeOff
    },
    {
      label: '能力评估',
      allowed: visibility.canViewAssessments,
      icon: visibility.canViewAssessments ? Eye : EyeOff
    }
  ];

  return (
    <div className="bg-white/5 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-white/80">
        <Eye className="w-4 h-4" />
        <span className="font-medium">您的数据可见性</span>
        <Badge variant="outline" className="ml-auto text-white/60 border-white/20">
          {visibility.detailLevel === 'FULL' ? '完整' : 
           visibility.detailLevel === 'DETAILED' ? '详细' : '概要'}
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 p-2 rounded ${
              item.allowed ? 'bg-green-500/10' : 'bg-red-500/10'
            }`}
          >
            <item.icon
              className={`w-4 h-4 ${
                item.allowed ? 'text-green-400' : 'text-red-400'
              }`}
            />
            <span
              className={`text-sm ${
                item.allowed ? 'text-green-300' : 'text-red-300'
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 简化版访问拒绝提示
 */
export function AccessDeniedBanner({
  message = '您没有查看此内容的权限',
  onRequestAccess
}: {
  message?: string;
  onRequestAccess?: () => void;
}) {
  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-300 font-medium">{message}</p>
          <p className="text-red-300/60 text-sm mt-1">
            如需查看更多数据，请联系管理员提升访问权限
          </p>
        </div>
        {onRequestAccess && (
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            onClick={onRequestAccess}
          >
            申请权限
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * 数据遮罩组件
 * 用于在没有权限时遮盖敏感数据
 */
export function DataMask({
  children,
  hasAccess,
  message = '需要更高权限查看'
}: {
  children: React.ReactNode;
  hasAccess: boolean;
  message?: string;
}) {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded">
        <div className="text-center p-4">
          <Lock className="w-8 h-8 text-white/60 mx-auto mb-2" />
          <p className="text-white/80 text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default AccessDeniedPage;

'use client';

/**
 * 投资权限门控组件
 * Investment Required Gate Component
 * 
 * 检查用户是否有投资，无投资时显示友好引导页面
 * 引导用户前往投资机会页面进行投资
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n/context';
import { useInvestmentStatus } from '@/hooks/use-investment-status';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  TrendingUp,
  Shield,
  ArrowRight,
  Loader2,
  Lock,
  Unlock,
  Target,
  DollarSign,
  BarChart3,
  Users,
  X,
  CheckCircle
} from 'lucide-react';

interface InvestmentRequiredGateProps {
  children: React.ReactNode;
  /** 自定义标题 */
  title?: string;
  /** 自定义描述 */
  description?: string;
  /** 是否显示项目计划弹窗按钮 */
  showProjectPlans?: boolean;
}

/**
 * 投资项目计划数据
 */
const projectPlans = [
  {
    id: 1,
    name: { zh: '电商平台', en: 'E-Commerce Platform' },
    description: { 
      zh: '构建集成支付功能的综合在线购物平台',
      en: 'Build a comprehensive online shopping platform with payment integration'
    },
    minInvestment: 500000,
    expectedReturn: 25,
    duration: 24,
    highlights: { zh: ['高增长潜力', '成熟技术'], en: ['High Growth', 'Mature Tech'] }
  },
  {
    id: 2,
    name: { zh: '教育平台', en: 'Education Platform' },
    description: {
      zh: '提供互动课程和认证的在线学习平台',
      en: 'Online learning platform with interactive courses and certifications'
    },
    minInvestment: 300000,
    expectedReturn: 20,
    duration: 18,
    highlights: { zh: ['刚性需求', '政策支持'], en: ['Rigid Demand', 'Policy Support'] }
  },
  {
    id: 3,
    name: { zh: '医疗服务', en: 'Healthcare Services' },
    description: {
      zh: '连接患者与医疗专业人士的远程医疗平台',
      en: 'Telemedicine platform connecting patients with healthcare professionals'
    },
    minInvestment: 800000,
    expectedReturn: 30,
    duration: 36,
    highlights: { zh: ['人口老龄化', '技术创新'], en: ['Aging Population', 'Tech Innovation'] }
  },
  {
    id: 4,
    name: { zh: '智能零售', en: 'Smart Retail' },
    description: {
      zh: '为连锁店提供的人工智能零售管理系统',
      en: 'AI-powered retail management system for chain stores'
    },
    minInvestment: 600000,
    expectedReturn: 22,
    duration: 20,
    highlights: { zh: ['产业升级', '效率提升'], en: ['Industrial Upgrade', 'Efficiency Boost'] }
  }
];

export function InvestmentRequiredGate({ 
  children, 
  title,
  description,
  showProjectPlans = true 
}: InvestmentRequiredGateProps) {
  const { locale } = useLanguage();
  const { hasInvestments, isLoading, error } = useInvestmentStatus();
  const [showPlanModal, setShowPlanModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // 加载中状态
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {locale === 'en' ? 'Checking investment status...' : '正在检查投资状态...'}
          </p>
        </div>
      </div>
    );
  }

  // 有投资 - 显示正常内容
  if (hasInvestments) {
    return <>{children}</>;
  }

  // 无投资 - 显示引导页面
  return (
    <div className="min-h-[60vh] py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* 主卡片 */}
        <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-500/30 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            {/* 图标和标题 */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {title || (locale === 'en' ? 'Investment Required' : '需要投资才能访问')}
              </h1>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                {description || (locale === 'en' 
                  ? 'This area is exclusively for investors. Start your investment journey to unlock full access to the investor portal.'
                  : '此区域仅对投资者开放。开始您的投资之旅，解锁投资者门户的完整访问权限。'
                )}
              </p>
            </div>

            {/* 解锁步骤 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/5 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {locale === 'en' ? '1. Choose Project' : '1. 选择项目'}
                </h3>
                <p className="text-white/60 text-sm">
                  {locale === 'en' 
                    ? 'Browse investment opportunities and select a project'
                    : '浏览投资机会，选择感兴趣的项目'
                  }
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {locale === 'en' ? '2. Make Investment' : '2. 完成投资'}
                </h3>
                <p className="text-white/60 text-sm">
                  {locale === 'en' 
                    ? 'Complete your investment with secure payment'
                    : '通过安全支付完成您的投资'
                  }
                </p>
              </div>

              <div className="bg-white/5 rounded-lg p-6 text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Unlock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">
                  {locale === 'en' ? '3. Unlock Access' : '3. 解锁权限'}
                </h3>
                <p className="text-white/60 text-sm">
                  {locale === 'en' 
                    ? 'Get full access to investor portal features'
                    : '获得投资者门户的完整访问权限'
                  }
                </p>
              </div>
            </div>

            {/* 投资者权益 */}
            <div className="bg-white/5 rounded-lg p-6 mb-8">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                {locale === 'en' ? 'Investor Benefits' : '投资者权益'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{locale === 'en' ? 'Portfolio Tracking' : '投资组合追踪'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{locale === 'en' ? 'Operations Monitoring' : '运营监控'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{locale === 'en' ? 'Financial Reports' : '财务报告'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-sm">{locale === 'en' ? 'Priority Support' : '优先支持'}</span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/investment-opportunities"
                className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <TrendingUp className="w-5 h-5" />
                {locale === 'en' ? 'Explore Investment Opportunities' : '探索投资机会'}
                <ArrowRight className="w-4 h-4" />
              </Link>
              
              {showProjectPlans && (
                <button
                  onClick={() => setShowPlanModal(true)}
                  className="bg-white/10 text-white px-8 py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2 font-medium border border-white/20"
                >
                  <Briefcase className="w-5 h-5" />
                  {locale === 'en' ? 'View Project Plans' : '查看项目计划'}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <BarChart3 className="w-6 h-6 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">15+</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'en' ? 'Active Projects' : '活跃项目'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-500">18.5%</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'en' ? 'Avg. Return' : '平均回报'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <Users className="w-6 h-6 text-white mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">500+</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'en' ? 'Investors' : '投资者'}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 text-center">
            <DollarSign className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">¥5亿+</p>
            <p className="text-muted-foreground text-sm">
              {locale === 'en' ? 'Total Invested' : '总投资额'}
            </p>
          </div>
        </div>

        {/* 项目计划弹窗 */}
        {showPlanModal && (
          <ProjectPlanModal 
            locale={locale}
            plans={projectPlans}
            formatCurrency={formatCurrency}
            onClose={() => setShowPlanModal(false)}
          />
        )}
      </div>
    </div>
  );
}

/**
 * 项目计划弹窗组件
 */
function ProjectPlanModal({ 
  locale, 
  plans,
  formatCurrency,
  onClose 
}: { 
  locale: string;
  plans: typeof projectPlans;
  formatCurrency: (amount: number) => string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* 头部 */}
        <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {locale === 'en' ? 'Investment Project Plans' : '投资项目计划'}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {locale === 'en' 
                ? 'Choose a project to start your investment journey'
                : '选择一个项目开始您的投资之旅'
              }
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-2 hover:bg-muted rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 项目列表 */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(85vh-180px)]">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className="bg-muted/50 hover:bg-muted rounded-lg p-5 transition-colors border border-border"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    {locale === 'en' ? plan.name.en : plan.name.zh}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {locale === 'en' ? plan.description.en : plan.description.zh}
                  </p>
                </div>
                <Badge className="bg-green-500/20 text-green-600 border-green-500/30">
                  {locale === 'en' ? 'Available' : '可投资'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {locale === 'en' ? 'Min Investment' : '最低投资'}
                  </p>
                  <p className="font-semibold text-foreground">{formatCurrency(plan.minInvestment)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {locale === 'en' ? 'Expected Return' : '预期回报'}
                  </p>
                  <p className="font-semibold text-green-600">+{plan.expectedReturn}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {locale === 'en' ? 'Duration' : '投资期限'}
                  </p>
                  <p className="font-semibold text-foreground">
                    {plan.duration} {locale === 'en' ? 'months' : '个月'}
                  </p>
                </div>
                <div className="flex items-end">
                  <Link
                    href={`/investment-opportunities?plan=${plan.id}`}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium w-full text-center"
                    onClick={onClose}
                  >
                    {locale === 'en' ? 'Invest Now' : '立即投资'}
                  </Link>
                </div>
              </div>

              {/* 亮点标签 */}
              <div className="flex gap-2">
                {(locale === 'en' ? plan.highlights.en : plan.highlights.zh).map((highlight, idx) => (
                  <span 
                    key={idx}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                  >
                    {highlight}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 底部 */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {locale === 'en' 
              ? 'More projects available on the opportunities page'
              : '更多项目请访问投资机会页面'
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="bg-muted text-foreground px-6 py-2 rounded-lg hover:bg-muted/80 transition-colors"
            >
              {locale === 'en' ? 'Close' : '关闭'}
            </button>
            <Link
              href="/investment-opportunities"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
              onClick={onClose}
            >
              {locale === 'en' ? 'View All' : '查看全部'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvestmentRequiredGate;

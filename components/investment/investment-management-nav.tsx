"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { 
  TrendingUp, 
  PieChart, 
  Calculator,
  Shield,
  FileText,
  Users,
  DollarSign,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Bell,
  HelpCircle,
  Activity,
  Briefcase,
  UserCheck,
  AlertTriangle,
  ClipboardList
} from "lucide-react";

interface NavigationItem {
  key: string;
  labelEn: string;
  labelZh: string;
  icon: React.ComponentType<any>;
  href: string;
  description?: string;
  badge?: number;
  children?: NavigationItem[];
  permissions?: string[];
}

interface InvestmentManagementNavProps {
  userRole?: 'investor' | 'advisor' | 'admin';
  className?: string;
  onNavigate?: (path: string) => void;
}

export function InvestmentManagementNav({ 
  userRole = 'investor', 
  className = '',
  onNavigate 
}: InvestmentManagementNavProps) {
  const { locale } = useLanguage();
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['operations', 'portfolio']);
  const [notifications, setNotifications] = useState(3);

  // Navigation structure based on user role
  const navigationItems: NavigationItem[] = [
    {
      key: 'operations',
      labelEn: 'Operations Monitoring',
      labelZh: '项目运营监控',
      icon: Activity,
      href: '/investor-portal/operations',
      description: 'Monitor project operations and performance',
      children: [
        {
          key: 'operations-overview',
          labelEn: 'Operations Overview',
          labelZh: '运营概览',
          icon: BarChart3,
          href: '/investor-portal/operations'
        },
        {
          key: 'lifecycle',
          labelEn: 'Project Lifecycle',
          labelZh: '项目生命周期',
          icon: Briefcase,
          href: '/investor-portal/operations/lifecycle'
        },
        {
          key: 'profit-loss',
          labelEn: 'Profit & Loss',
          labelZh: '盈亏分析',
          icon: TrendingUp,
          href: '/investor-portal/operations/profit-loss'
        },
        {
          key: 'employees',
          labelEn: 'Employee Transparency',
          labelZh: '员工透明化',
          icon: UserCheck,
          href: '/investor-portal/operations/employees'
        },
        {
          key: 'salary',
          labelEn: 'Salary Transparency',
          labelZh: '薪资透明化',
          icon: DollarSign,
          href: '/investor-portal/operations/salary'
        },
        {
          key: 'assessments',
          labelEn: 'Team Assessments',
          labelZh: '能力评估',
          icon: ClipboardList,
          href: '/investor-portal/operations/assessments'
        },
        {
          key: 'loss-analysis',
          labelEn: 'Loss Analysis',
          labelZh: '亏损分析',
          icon: AlertTriangle,
          href: '/investor-portal/operations/loss-analysis'
        }
      ]
    },
    {
      key: 'portfolio',
      labelEn: 'Portfolio Management',
      labelZh: '投资组合管理',
      icon: PieChart,
      href: '/investor-portal/portfolio',
      description: 'View and manage your investment portfolio',
      children: [
        {
          key: 'overview',
          labelEn: 'Portfolio Overview',
          labelZh: '组合概览',
          icon: BarChart3,
          href: '/investor-portal/portfolio/overview'
        },
        {
          key: 'analysis',
          labelEn: 'Portfolio Analysis',
          labelZh: '组合分析',
          icon: TrendingUp,
          href: '/investor-portal/portfolio/analysis'
        },
        {
          key: 'performance',
          labelEn: 'Performance Tracking',
          labelZh: '表现跟踪',
          icon: BarChart3,
          href: '/investor-portal/portfolio/performance'
        }
      ]
    },
    {
      key: 'applications',
      labelEn: 'Investment Applications',
      labelZh: '投资申请',
      icon: FileText,
      href: '/investor-portal/applications',
      description: 'Submit and track investment applications',
      badge: notifications,
      children: [
        {
          key: 'new-application',
          labelEn: 'New Application',
          labelZh: '新申请',
          icon: FileText,
          href: '/investor-portal/applications/new'
        },
        {
          key: 'pending',
          labelEn: 'Pending Applications',
          labelZh: '待审批申请',
          icon: FileText,
          href: '/investor-portal/applications/pending',
          badge: notifications
        },
        {
          key: 'history',
          labelEn: 'Application History',
          labelZh: '申请历史',
          icon: FileText,
          href: '/investor-portal/applications/history'
        }
      ]
    },
    {
      key: 'returns',
      labelEn: 'Return Analysis',
      labelZh: '收益分析',
      icon: Calculator,
      href: '/investor-portal/returns',
      description: 'Calculate and analyze investment returns',
      children: [
        {
          key: 'calculator',
          labelEn: 'Return Calculator',
          labelZh: '收益计算器',
          icon: Calculator,
          href: '/investor-portal/returns/calculator'
        },
        {
          key: 'historical',
          labelEn: 'Historical Returns',
          labelZh: '历史收益',
          icon: TrendingUp,
          href: '/investor-portal/returns/historical'
        }
      ]
    },
    {
      key: 'risk',
      labelEn: 'Risk Management',
      labelZh: '风险管理',
      icon: Shield,
      href: '/investor-portal/risk',
      description: 'Monitor and assess investment risks',
      children: [
        {
          key: 'assessment',
          labelEn: 'Risk Assessment',
          labelZh: '风险评估',
          icon: Shield,
          href: '/investor-portal/risk/assessment'
        },
        {
          key: 'monitoring',
          labelEn: 'Risk Monitoring',
          labelZh: '风险监控',
          icon: Bell,
          href: '/investor-portal/risk/monitoring'
        }
      ]
    },
    {
      key: 'reports',
      labelEn: 'Reports',
      labelZh: '报告',
      icon: FileText,
      href: '/investor-portal/reports',
      description: 'Generate and download investment reports',
      children: [
        {
          key: 'generate',
          labelEn: 'Generate Report',
          labelZh: '生成报告',
          icon: FileText,
          href: '/investor-portal/reports/generate'
        },
        {
          key: 'history',
          labelEn: 'Report History',
          labelZh: '报告历史',
          icon: FileText,
          href: '/investor-portal/reports/history'
        }
      ]
    },
    {
      key: 'cash-flow',
      labelEn: 'Cash Flow Management',
      labelZh: '资金流转管理',
      icon: DollarSign,
      href: '/investor-portal/cash-flow',
      description: 'Monitor cash flows and transfers',
      permissions: ['cash_flow_view'],
      children: [
        {
          key: 'monitoring',
          labelEn: 'Cash Flow Monitoring',
          labelZh: '资金流转监控',
          icon: DollarSign,
          href: '/investor-portal/cash-flow/monitoring'
        },
        {
          key: 'transfer',
          labelEn: 'Fund Transfer',
          labelZh: '资金调拨',
          icon: DollarSign,
          href: '/investor-portal/cash-flow/transfer',
          permissions: ['cash_flow_transfer']
        }
      ]
    }
  ];

  // Add advisor-specific items
  if (userRole === 'advisor') {
    navigationItems.push({
      key: 'clients',
      labelEn: 'Client Management',
      labelZh: '客户管理',
      icon: Users,
      href: '/investor-portal/advisor/clients',
      description: 'Manage client portfolios and strategies',
      children: [
        {
          key: 'client-list',
          labelEn: 'Client List',
          labelZh: '客户列表',
          icon: Users,
          href: '/investor-portal/advisor/clients'
        },
        {
          key: 'strategies',
          labelEn: 'Investment Strategies',
          labelZh: '投资策略',
          icon: TrendingUp,
          href: '/investor-portal/advisor/strategies'
        }
      ]
    });
  }

  // Add admin-specific items
  if (userRole === 'admin') {
    navigationItems.push({
      key: 'admin',
      labelEn: 'System Administration',
      labelZh: '系统管理',
      icon: Settings,
      href: '/investor-portal/admin',
      description: 'System administration and monitoring',
      children: [
        {
          key: 'audit',
          labelEn: 'Audit Logs',
          labelZh: '审计日志',
          icon: FileText,
          href: '/investor-portal/admin/audit'
        },
        {
          key: 'performance',
          labelEn: 'System Performance',
          labelZh: '系统性能',
          icon: BarChart3,
          href: '/investor-portal/admin/performance'
        }
      ]
    });
  }

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionKey) 
        ? prev.filter(key => key !== sectionKey)
        : [...prev, sectionKey]
    );
  };

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    }
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const hasPermission = (permissions?: string[]) => {
    // Simplified permission check - in real implementation, check against user permissions
    return !permissions || permissions.length === 0 || userRole === 'admin';
  };

  const getLabel = (item: NavigationItem) => {
    return locale === 'en' ? item.labelEn : item.labelZh;
  };

  return (
    <nav className={`investment-management-nav ${className}`}>
      <div className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white mb-2">
          {locale === 'en' ? 'Investment Management' : '投资管理'}
        </h2>
        <p className="text-sm text-white/70">
          {locale === 'en' ? 'Comprehensive investment tools' : '全面的投资管理工具'}
        </p>
      </div>

      <div className="p-4">
        {/* Quick Actions */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-white/80 mb-3">
            {locale === 'en' ? 'Quick Actions' : '快速操作'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <Link 
              href="/investor-portal/operations"
              className="p-3 bg-green-600/20 hover:bg-green-600/30 rounded-lg transition-colors text-center"
              onClick={() => handleNavigation('/investor-portal/operations')}
            >
              <Activity className="w-4 h-4 mx-auto mb-1 text-green-400" />
              <span className="text-xs text-white">
                {locale === 'en' ? 'Operations' : '运营监控'}
              </span>
            </Link>
            <Link 
              href="/investor-portal/portfolio/overview"
              className="p-3 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg transition-colors text-center"
              onClick={() => handleNavigation('/investor-portal/portfolio/overview')}
            >
              <PieChart className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <span className="text-xs text-white">
                {locale === 'en' ? 'Portfolio' : '投资组合'}
              </span>
            </Link>
            <Link 
              href="/investor-portal/applications/new"
              className="p-3 bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors text-center"
              onClick={() => handleNavigation('/investor-portal/applications/new')}
            >
              <FileText className="w-4 h-4 mx-auto mb-1 text-white400" />
              <span className="text-xs text-white">
                {locale === 'en' ? 'New Application' : '新申请'}
              </span>
            </Link>
            <Link 
              href="/investor-portal/operations/profit-loss"
              className="p-3 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors text-center"
              onClick={() => handleNavigation('/investor-portal/operations/profit-loss')}
            >
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-yellow-400" />
              <span className="text-xs text-white">
                {locale === 'en' ? 'Profit/Loss' : '盈亏分析'}
              </span>
            </Link>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-2">
          {navigationItems.map((item) => {
            if (!hasPermission(item.permissions)) return null;

            const isExpanded = expandedSections.includes(item.key);
            const hasChildren = item.children && item.children.length > 0;
            const itemIsActive = isActive(item.href);

            return (
              <div key={item.key} className="space-y-1">
                <div className="flex items-center">
                  <Link
                    href={item.href}
                    className={`flex-1 flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      itemIsActive 
                        ? 'bg-purple-600/30 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }`}
                    onClick={() => handleNavigation(item.href)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{getLabel(item)}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                  {hasChildren && (
                    <button
                      onClick={() => toggleSection(item.key)}
                      className="p-2 text-white/60 hover:text-white transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>

                {/* Children */}
                {hasChildren && isExpanded && (
                  <div className="ml-8 space-y-1">
                    {item.children!.map((child) => {
                      if (!hasPermission(child.permissions)) return null;

                      const childIsActive = isActive(child.href);
                      
                      return (
                        <Link
                          key={child.key}
                          href={child.href}
                          className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                            childIsActive 
                              ? 'bg-purple-600/20 text-white' 
                              : 'text-white/70 hover:bg-white/5 hover:text-white'
                          }`}
                          onClick={() => handleNavigation(child.href)}
                        >
                          <child.icon className="w-4 h-4" />
                          <span className="text-sm">{getLabel(child)}</span>
                          {child.badge && child.badge > 0 && (
                            <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            href="/investor-portal/help"
            className="flex items-center gap-3 p-3 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
            onClick={() => handleNavigation('/investor-portal/help')}
          >
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">
              {locale === 'en' ? 'Help & Support' : '帮助与支持'}
            </span>
          </Link>
        </div>
      </div>

      <style jsx>{`
        .investment-management-nav {
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </nav>
  );
}
"use client";

import React from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Shield, 
  FileText, 
  Users, 
  DollarSign, 
  Settings, 
  Home, 
  Briefcase, 
  Target, 
  Globe, 
  MessageSquare, 
  Calendar, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Bell, 
  Search,
  Building,
  Cpu,
  Brain,
  LineChart,
  Zap,
  HelpCircle,
  BookOpen,
  Palette,
  Languages,
  UserCheck,
  Handshake,
  Lightbulb,
  Rocket,
  Award,
  Camera,
  Headphones,
  Wrench,
  Database,
  Monitor,
  Smartphone,
  Code,
  Layers,
  GitBranch,
  Cloud,
  Lock,
  Eye,
  BarChart,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface NavigationItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  status?: 'active' | 'beta' | 'coming-soon';
  featured?: boolean;
}

const navigationItems: NavigationItem[] = [
  // 1. 官方网站系统
  {
    title: '官方网站',
    description: '公司官网和服务展示，面向公众的营销页面',
    href: '/',
    icon: Globe,
    category: '官方网站',
    status: 'active',
    featured: true
  },
  {
    title: '服务展示',
    description: '公司核心服务和解决方案展示',
    href: '/services',
    icon: Wrench,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '设计服务',
    description: '专业设计服务和创意解决方案',
    href: '/design-services',
    icon: Palette,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '咨询服务',
    description: '专业咨询和战略规划服务',
    href: '/consultation',
    icon: Lightbulb,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '案例研究',
    description: '成功案例和项目展示',
    href: '/case-studies',
    icon: Award,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '研究中心',
    description: '行业研究和市场分析',
    href: '/research',
    icon: BookOpen,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '资源中心',
    description: '知识库和学习资源',
    href: '/resources',
    icon: Database,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '合作伙伴',
    description: '合作伙伴展示和管理',
    href: '/partners',
    icon: Handshake,
    category: '官方网站',
    status: 'active'
  },
  {
    title: '帮助中心',
    description: '用户帮助和支持文档',
    href: '/help',
    icon: HelpCircle,
    category: '官方网站',
    status: 'active'
  },

  // 2. Nuwax 用户端系统
  {
    title: 'Nuwax 用户中心',
    description: '紫色渐变设计的个人用户系统，管理个人信息、项目、投资等',
    href: '/user',
    icon: Users,
    category: 'Nuwax 用户端',
    status: 'active',
    featured: true
  },
  {
    title: '用户项目',
    description: '管理个人项目和任务',
    href: '/user/projects',
    icon: Briefcase,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户消息',
    description: '查看和管理消息通知',
    href: '/user/messages',
    icon: MessageSquare,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户文档',
    description: '个人文档管理中心',
    href: '/user/documents',
    icon: FileText,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户设置',
    description: '个人账户设置和偏好配置',
    href: '/user/settings',
    icon: Settings,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户支付',
    description: '支付方式管理和交易记录',
    href: '/user/payments',
    icon: CreditCard,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户发票',
    description: '发票管理和开具',
    href: '/user/invoices',
    icon: FileText,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户工作流',
    description: '个人工作流程管理',
    href: '/user/workflow',
    icon: GitBranch,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户日程',
    description: '个人日程安排和时间管理',
    href: '/user/schedule',
    icon: Calendar,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户分析',
    description: '个人数据分析和统计',
    href: '/user/analytics',
    icon: BarChart,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户通知',
    description: '通知设置和消息管理',
    href: '/user/notifications',
    icon: Bell,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户购买',
    description: '购买记录和订单管理',
    href: '/user/purchases',
    icon: ShoppingCart,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '用户市场',
    description: '个人市场和交易平台',
    href: '/user/marketplace',
    icon: Building,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '直播市场',
    description: '直播电商和产品展示平台',
    href: '/user/livestream-market',
    icon: Camera,
    category: 'Nuwax 用户端',
    status: 'active'
  },
  {
    title: '投资管理',
    description: '完整的投资管理平台，包含投资组合分析、风险评估、策略优化等功能',
    href: '/user/investments',
    icon: TrendingUp,
    category: 'Nuwax 用户端',
    status: 'active',
    featured: true
  },

  // 3. 企业管理系统
  {
    title: '企业管理中心',
    description: '企业内部管理功能，订单、预约等管理',
    href: '/dashboard',
    icon: Monitor,
    category: '企业管理',
    status: 'active',
    featured: true
  },
  {
    title: '工厂订单',
    description: '工厂订单管理系统',
    href: '/dashboard/factory-orders',
    icon: Package,
    category: '企业管理',
    status: 'active'
  },
  {
    title: '定制订单',
    description: '定制产品订单管理',
    href: '/dashboard/custom-orders',
    icon: Target,
    category: '企业管理',
    status: 'active'
  },
  {
    title: '预约系统',
    description: '在线预约和时间安排',
    href: '/appointments',
    icon: Calendar,
    category: '企业管理',
    status: 'active'
  },
  {
    title: '客户购物车',
    description: '客户购物车和订单处理',
    href: '/client/cart',
    icon: ShoppingCart,
    category: '企业管理',
    status: 'active'
  },
  {
    title: 'AI 助手',
    description: '智能AI助手和自动化服务',
    href: '/ai-assistant',
    icon: Brain,
    category: '企业管理',
    status: 'active',
    featured: true
  },
  {
    title: '功能演示',
    description: '系统功能演示和测试',
    href: '/demo',
    icon: Eye,
    category: '企业管理',
    status: 'beta'
  },

  // 4. 投资项目系统 (已整合到用户端)
  {
    title: '投资机会',
    description: '按行业分类的投资机会展示，包含详细的项目信息和投资分析',
    href: '/investment-opportunities',
    icon: TrendingUp,
    category: '投资项目',
    status: 'active'
  },
  {
    title: '品牌一致性服务',
    description: '企业品牌一致性管理和优化服务',
    href: '/brand-consistency',
    icon: Palette,
    category: '投资项目',
    status: 'active'
  },
];

const categories = Array.from(new Set(navigationItems.map(item => item.category)));

export default function NavigationPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = navigationItems.filter(item => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredItems = navigationItems.filter(item => item.featured);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'beta':
        return 'bg-yellow-100 text-yellow-800';
      case 'coming-soon':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return '可用';
      case 'beta':
        return '测试版';
      case 'coming-soon':
        return '即将推出';
      default:
        return '活跃';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                系统导航中心
              </h1>
              <p className="text-gray-600 mt-2">
                探索4个核心系统 - 官方网站、Nuwax用户端、企业管理、投资项目
              </p>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索功能..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent w-full lg:w-80"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Items */}
        {!searchTerm && !selectedCategory && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              精选功能
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100 hover:border-purple-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 group-hover:from-purple-500/10 group-hover:to-blue-500/10 transition-all duration-300" />
                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg text-white group-hover:scale-110 transition-transform duration-300">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                        <span>了解更多</span>
                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
              }`}
            >
              全部分类
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg group-hover:from-purple-200 group-hover:to-blue-200 transition-colors">
                      <Icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {item.category}
                    </span>
                    <svg className="w-4 h-4 text-purple-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">未找到匹配的功能</h3>
            <p className="text-gray-600">
              尝试调整搜索条件或选择不同的分类
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-16 bg-white rounded-xl shadow-lg p-8 border border-purple-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
            4个核心系统
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <Globe className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">官方网站</span>
            </Link>
            <Link
              href="/user"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <Users className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">Nuwax用户端</span>
            </Link>
            <Link
              href="/dashboard"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <Monitor className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">企业管理</span>
            </Link>
            <Link
              href="/user/investments"
              className="flex flex-col items-center p-4 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <TrendingUp className="w-8 h-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium text-gray-700">投资管理</span>
            </Link>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-purple-600">4</div>
            <div className="text-sm text-gray-600">核心系统</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-green-600">
              {navigationItems.filter(item => item.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">可用功能</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-sm text-gray-600">功能分类</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
            <div className="text-2xl font-bold text-yellow-600">{featuredItems.length}</div>
            <div className="text-sm text-gray-600">精选功能</div>
          </div>
        </div>
      </div>
    </div>
  );
}
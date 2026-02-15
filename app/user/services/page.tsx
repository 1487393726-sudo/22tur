"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  Code,
  Palette,
  Smartphone,
  Megaphone,
  Cloud,
  Shield,
  Cpu,
  Search,
  Filter,
  Star,
  Heart,
  Eye,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  Bookmark,
  LayoutGrid,
  Layers,
  Users,
  CheckCircle,
  Zap,
  Award,
  Target,
  MessageCircle,
  Calendar,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  Package,
} from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  serviceCount: number;
  featured: boolean;
  tags: string[];
  trending?: boolean;
}

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  priceUnit: string;
  rating: number;
  reviews: number;
  completedProjects: number;
  deliveryTime: string;
  features: string[];
  isHot?: boolean;
  isNew?: boolean;
  discount?: number;
}

const categories: ServiceCategory[] = [
  {
    id: "design",
    name: "设计服务",
    description: "专业设计团队，创造视觉奇迹",
    icon: Palette,
    gradient: "from-purple-500 to-violet-500",
    serviceCount: 24,
    featured: true,
    tags: ["UI设计", "品牌设计", "平面设计", "动效设计"],
    trending: true,
  },
  {
    id: "development",
    name: "开发服务",
    description: "定制开发解决方案，技术驱动创新",
    icon: Code,
    gradient: "from-blue-500 to-cyan-500",
    serviceCount: 32,
    featured: true,
    tags: ["网站开发", "APP开发", "小程序", "系统集成"],
    trending: true,
  },
  {
    id: "mobile",
    name: "移动应用",
    description: "移动端解决方案，触达更多用户",
    icon: Smartphone,
    gradient: "from-green-500 to-emerald-500",
    serviceCount: 18,
    featured: true,
    tags: ["iOS", "Android", "跨平台", "原生开发"],
  },
  {
    id: "marketing",
    name: "营销推广",
    description: "数字营销策略，提升品牌影响力",
    icon: Megaphone,
    gradient: "from-orange-500 to-amber-500",
    serviceCount: 21,
    featured: false,
    tags: ["SEO", "SEM", "社媒营销", "内容营销"],
  },
  {
    id: "consulting",
    name: "咨询服务",
    description: "专业咨询顾问，助力业务增长",
    icon: Briefcase,
    gradient: "from-indigo-500 to-purple-500",
    serviceCount: 15,
    featured: false,
    tags: ["战略咨询", "技术咨询", "运营咨询", "投资咨询"],
  },
  {
    id: "cloud",
    name: "云服务",
    description: "企业级云解决方案，安全可靠",
    icon: Cloud,
    gradient: "from-sky-500 to-blue-500",
    serviceCount: 12,
    featured: false,
    tags: ["云存储", "云计算", "CDN", "安全防护"],
  },
  {
    id: "security",
    name: "安全服务",
    description: "全方位安全防护，保障业务安全",
    icon: Shield,
    gradient: "from-red-500 to-pink-500",
    serviceCount: 9,
    featured: false,
    tags: ["渗透测试", "安全审计", "数据加密", "合规咨询"],
  },
  {
    id: "ai",
    name: "AI服务",
    description: "智能AI解决方案，提升效率",
    icon: Cpu,
    gradient: "from-fuchsia-500 to-pink-500",
    serviceCount: 14,
    featured: true,
    tags: ["AI开发", "机器学习", "数据分析", "智能客服"],
    trending: true,
  },
];

const services: Service[] = [
  {
    id: "1",
    title: "企业品牌VI设计",
    description: "从LOGO到完整VI体系，打造独特品牌形象，包含品牌策略、视觉识别系统设计",
    category: "design",
    price: 8999,
    priceUnit: "起",
    rating: 4.9,
    reviews: 156,
    completedProjects: 234,
    deliveryTime: "7-15天",
    features: ["LOGO设计", "VI手册", "品牌策略", "应用设计"],
    isHot: true,
  },
  {
    id: "2",
    title: "响应式网站开发",
    description: "专业网站开发服务，响应式设计，SEO优化，后台管理系统一站式解决",
    category: "development",
    price: 15999,
    priceUnit: "起",
    rating: 4.8,
    reviews: 203,
    completedProjects: 456,
    deliveryTime: "15-30天",
    features: ["响应式设计", "SEO优化", "后台管理", "数据统计"],
    isHot: true,
    isNew: true,
  },
  {
    id: "3",
    title: "移动APP定制开发",
    description: "iOS/Android双端开发，原生体验，快速上线，支持后期维护升级",
    category: "mobile",
    price: 29999,
    priceUnit: "起",
    rating: 4.7,
    reviews: 89,
    completedProjects: 123,
    deliveryTime: "30-60天",
    features: ["双端开发", "原生体验", "后期维护", "版本迭代"],
  },
  {
    id: "4",
    title: "数字营销全案",
    description: "整合营销策略，包含SEO、SEM、社媒运营、内容营销等全方位服务",
    category: "marketing",
    price: 5999,
    priceUnit: "/月",
    rating: 4.6,
    reviews: 78,
    completedProjects: 167,
    deliveryTime: "持续服务",
    features: ["SEO优化", "广告投放", "社媒运营", "数据分析"],
    discount: 20,
  },
  {
    id: "5",
    title: "企业战略咨询",
    description: "资深顾问团队，提供企业战略规划、业务优化、数字化转型咨询服务",
    category: "consulting",
    price: 3000,
    priceUnit: "/小时",
    rating: 4.9,
    reviews: 45,
    completedProjects: 89,
    deliveryTime: "按需预约",
    features: ["战略规划", "业务诊断", "方案设计", "落地辅导"],
  },
  {
    id: "6",
    title: "云服务器部署",
    description: "企业级云服务器配置、部署、运维，支持多云架构，7x24小时监控",
    category: "cloud",
    price: 2999,
    priceUnit: "/月",
    rating: 4.8,
    reviews: 112,
    completedProjects: 345,
    deliveryTime: "1-3天",
    features: ["服务器配置", "安全加固", "性能优化", "24h监控"],
  },
  {
    id: "7",
    title: "安全渗透测试",
    description: "专业安全团队，全面检测系统漏洞，提供详细报告和修复建议",
    category: "security",
    price: 9999,
    priceUnit: "起",
    rating: 4.9,
    reviews: 34,
    completedProjects: 78,
    deliveryTime: "5-10天",
    features: ["漏洞扫描", "渗透测试", "安全报告", "修复建议"],
    isNew: true,
  },
  {
    id: "8",
    title: "AI智能客服系统",
    description: "基于大语言模型的智能客服解决方案，支持多渠道接入，7x24小时服务",
    category: "ai",
    price: 4999,
    priceUnit: "/月",
    rating: 4.7,
    reviews: 67,
    completedProjects: 134,
    deliveryTime: "7-14天",
    features: ["智能问答", "多渠道接入", "数据分析", "人工转接"],
    isHot: true,
    isNew: true,
  },
];

const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

export default function UserServicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const stats = [
    { label: "服务项目", value: "145", icon: Package, gradient: "from-blue-500 to-cyan-500" },
    { label: "服务分类", value: "8", icon: LayoutGrid, gradient: "from-purple-500 to-pink-500" },
    { label: "用户好评", value: "4.8", icon: Star, gradient: "from-amber-500 to-orange-500" },
    { label: "完成项目", value: "1,626", icon: CheckCircle, gradient: "from-green-500 to-emerald-500" },
  ];

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/30 via-blue-600/20 to-pink-600/30" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-5" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg shadow-purple-500/30">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-blue-200 bg-clip-text text-transparent">
                      专业服务
                    </h1>
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      精选推荐
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mt-1">发现优质专业服务 · 助力业务增长</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                      <stat.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Bookmark className="w-4 h-4 mr-2" />
                收藏夹 ({favorites.length})
              </Button>
              <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-purple-500/30">
                <MessageCircle className="w-4 h-4 mr-2" />
                咨询顾问
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="搜索服务、关键词..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-purple-400" />
            服务分类
          </h2>
          <Button variant="outline" className="bg-background border-border text-foreground hover:bg-muted">
            查看全部
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => setSelectedCategory(category.id === selectedCategory ? "all" : category.id)}
                className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  selectedCategory === category.id 
                    ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {category.trending && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 text-xs">
                      <Flame className="w-3 h-3 mr-1" />
                      热门
                    </Badge>
                  </div>
                )}
                
                <div className={`h-24 bg-gradient-to-br ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity`} />
                
                <div className="absolute top-6 left-1/2 -translate-x-1/2">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${category.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <div className="p-4 pt-8 text-center">
                  <h3 className="font-semibold text-white mb-1">{category.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{category.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-muted text-muted-foreground border-border text-xs">
                      {category.serviceCount} 项服务
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            精选服务
            {selectedCategory !== "all" && (
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 ml-2">
                {categories.find(c => c.id === selectedCategory)?.name}
              </Badge>
            )}
          </h3>
          <span className="text-sm text-muted-foreground">共 {filteredServices.length} 项服务</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => {
            const isFavorite = favorites.includes(service.id);
            const categoryInfo = categories.find(c => c.id === service.category);
            
            return (
              <div
                key={service.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
              >
                {/* Header */}
                <div className={`h-32 bg-gradient-to-br ${categoryInfo?.gradient || 'from-purple-500 to-blue-500'} opacity-20 relative`}>
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {service.discount && (
                      <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                        -{service.discount}% 优惠
                      </Badge>
                    )}
                    {service.isHot && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                        <Flame className="w-3 h-3 mr-1" />热门
                      </Badge>
                    )}
                    {service.isNew && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                        <Sparkles className="w-3 h-3 mr-1" />新上线
                      </Badge>
                    )}
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white h-8 w-8 p-0" onClick={() => toggleFavorite(service.id)}>
                      <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </Button>
                  </div>
                  
                  {/* Category Icon */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${categoryInfo?.gradient || 'from-purple-500 to-blue-500'} shadow-lg`}>
                      {categoryInfo && <categoryInfo.icon className="w-6 h-6 text-white" />}
                    </div>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5 pt-8">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-muted text-muted-foreground border-border text-xs">
                      {categoryInfo?.name}
                    </Badge>
                  </div>
                  
                  <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-purple-300 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                  
                  {/* Features */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {service.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                        {feature}
                      </span>
                    ))}
                    {service.features.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                        +{service.features.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between mb-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="text-white font-medium">{service.rating}</span>
                      <span className="text-muted-foreground">({service.reviews})</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>{service.completedProjects} 完成</span>
                    </div>
                  </div>
                  
                  {/* Delivery Time */}
                  <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>交付周期: {service.deliveryTime}</span>
                  </div>
                  
                  {/* Price & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        {formatPrice(service.price)}
                      </span>
                      <span className="text-sm text-muted-foreground ml-1">{service.priceUnit}</span>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0">
                      立即咨询
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Search className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">没有找到相关服务</h3>
            <p className="text-muted-foreground mb-4">尝试调整搜索条件或浏览其他分类</p>
            <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }} className="bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30">
              清除筛选
            </Button>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600/20 via-blue-600/10 to-pink-600/20 border border-purple-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">需要定制服务？</h3>
              <p className="text-muted-foreground">联系我们的专业顾问，获取个性化解决方案</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Mail className="w-4 h-4 mr-2" />
              发送邮件
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white border-0">
              <Phone className="w-4 h-4 mr-2" />
              预约咨询
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

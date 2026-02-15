"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Eye,
  Heart,
  Star,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Crown,
  MessageCircle,
  Download,
  Share2,
  Play,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Palette,
  Code,
  Video,
  Camera,
  Lightbulb,
  Monitor,
  Briefcase,
  Target,
  Zap,
  Gift,
  Plus,
  Filter,
  Grid3X3,
  List,
  ExternalLink,
  ThumbsUp,
  Bookmark,
  TrendingUp,
  Layers,
  Image,
  FileText,
  Settings,
} from "lucide-react";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  gallery: string[];
  category: string;
  client: string;
  completedDate: string;
  duration: string;
  views: number;
  likes: number;
  tags: string[];
  technologies: string[];
  testimonial?: {
    content: string;
    author: string;
    role: string;
    avatar: string;
  };
  featured: boolean;
  results?: {
    label: string;
    value: string;
  }[];
}

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  features: string[];
  popular: boolean;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  deliveryTime: string;
  revisions: number;
}

const portfolioItems: PortfolioItem[] = [
  {
    id: "1",
    title: "电竞主播直播间全套方案",
    description: "为知名电竞主播打造的专业直播间，包含4K摄像、专业灯光、音频系统",
    fullDescription: "这是一个为顶级电竞战队主播量身定制的直播间解决方案。我们从空间规划、设备选型、灯光布局到声学处理，提供了一站式的专业服务。",
    image: "/api/placeholder/800/500",
    gallery: ["/api/placeholder/400/300", "/api/placeholder/400/300", "/api/placeholder/400/300"],
    category: "电竞直播",
    client: "某知名电竞战队",
    completedDate: "2024-01",
    duration: "3周",
    views: 12345,
    likes: 2341,
    tags: ["电竞", "专业级", "全套方案", "4K"],
    technologies: ["4K摄像系统", "专业灯光", "声学处理", "绿幕系统"],
    testimonial: {
      content: "非常专业的团队，从设计到实施都很到位，直播效果提升了一个档次！",
      author: "张主播",
      role: "职业电竞选手",
      avatar: "/api/placeholder/60/60",
    },
    featured: true,
    results: [
      { label: "观看量提升", value: "+150%" },
      { label: "粉丝增长", value: "+80%" },
      { label: "互动率", value: "+200%" },
    ],
  },
  {
    id: "2",
    title: "美妆博主工作室设计",
    description: "专为美妆内容创作者设计的直播工作室，注重灯光和色彩还原",
    fullDescription: "针对美妆内容创作的特殊需求，我们设计了一套完整的灯光系统，确保产品色彩的精准还原。",
    image: "/api/placeholder/800/500",
    gallery: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
    category: "美妆直播",
    client: "头部美妆博主",
    completedDate: "2024-01",
    duration: "2周",
    views: 8765,
    likes: 1876,
    tags: ["美妆", "灯光设计", "色彩还原"],
    technologies: ["环形灯", "柔光箱", "色温调节", "背景系统"],
    featured: true,
    results: [
      { label: "色彩还原度", value: "99%" },
      { label: "观众满意度", value: "98%" },
    ],
  },
  {
    id: "3",
    title: "音乐直播间声学方案",
    description: "为音乐主播打造的专业声学环境，完美音质呈现",
    fullDescription: "专业的声学设计，包括吸音、隔音、混响控制等，为音乐直播提供最佳的声音环境。",
    image: "/api/placeholder/800/500",
    gallery: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
    category: "音乐直播",
    client: "独立音乐人",
    completedDate: "2023-12",
    duration: "4周",
    views: 6543,
    likes: 1234,
    tags: ["音乐", "声学设计", "专业音质"],
    technologies: ["声学面板", "低频陷阱", "扩散板", "专业监听"],
    featured: false,
    results: [
      { label: "音质评分", value: "9.5/10" },
      { label: "噪音降低", value: "-40dB" },
    ],
  },
  {
    id: "4",
    title: "企业直播间标准化方案",
    description: "为企业打造的标准化直播间，适用于产品发布、培训等场景",
    fullDescription: "针对企业直播需求，提供标准化的直播间解决方案，支持多场景切换。",
    image: "/api/placeholder/800/500",
    gallery: ["/api/placeholder/400/300"],
    category: "企业直播",
    client: "某科技公司",
    completedDate: "2023-11",
    duration: "2周",
    views: 4321,
    likes: 876,
    tags: ["企业", "标准化", "多场景"],
    technologies: ["多机位系统", "提词器", "导播台", "虚拟背景"],
    featured: false,
  },
  {
    id: "5",
    title: "教育直播教室改造",
    description: "将传统教室改造为专业直播教室，支持线上线下同步教学",
    fullDescription: "为教育机构提供的直播教室改造方案，实现线上线下教学的无缝衔接。",
    image: "/api/placeholder/800/500",
    gallery: ["/api/placeholder/400/300", "/api/placeholder/400/300"],
    category: "教育直播",
    client: "某教育机构",
    completedDate: "2023-10",
    duration: "3周",
    views: 5678,
    likes: 1023,
    tags: ["教育", "教室改造", "双师课堂"],
    technologies: ["互动白板", "高清摄像", "无线麦克风", "录播系统"],
    featured: true,
  },
];

const servicePackages: ServicePackage[] = [
  {
    id: "basic",
    name: "基础方案",
    description: "适合个人主播入门使用",
    price: 2999,
    features: [
      "设备选型咨询",
      "基础灯光布局",
      "简单声学建议",
      "安装指导视频",
      "7天售后支持",
    ],
    popular: false,
    icon: Lightbulb,
    gradient: "from-blue-500 to-cyan-500",
    deliveryTime: "3-5天",
    revisions: 1,
  },
  {
    id: "professional",
    name: "专业方案",
    description: "适合职业主播和内容创作者",
    price: 8999,
    originalPrice: 12999,
    features: [
      "全套设备选型",
      "专业灯光设计",
      "声学环境优化",
      "现场安装调试",
      "30天售后支持",
      "1次免费复检",
      "设备使用培训",
    ],
    popular: true,
    icon: Award,
    gradient: "from-purple-500 to-pink-500",
    deliveryTime: "7-14天",
    revisions: 3,
  },
  {
    id: "enterprise",
    name: "企业定制",
    description: "适合企业和机构的定制方案",
    price: 29999,
    features: [
      "全方位需求分析",
      "定制化设计方案",
      "专业声学处理",
      "多机位系统集成",
      "导播系统配置",
      "90天售后支持",
      "专属客户经理",
      "年度维护服务",
    ],
    popular: false,
    icon: Crown,
    gradient: "from-amber-500 to-orange-500",
    deliveryTime: "14-30天",
    revisions: 5,
  },
];

const categoryFilters = [
  { id: "all", name: "全部", icon: Layers },
  { id: "电竞直播", name: "电竞直播", icon: Monitor },
  { id: "美妆直播", name: "美妆直播", icon: Palette },
  { id: "音乐直播", name: "音乐直播", icon: Video },
  { id: "企业直播", name: "企业直播", icon: Briefcase },
  { id: "教育直播", name: "教育直播", icon: FileText },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState("portfolio");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [favorites, setFavorites] = useState<string[]>([]);

  const stats = [
    { label: "完成项目", value: "200+", icon: CheckCircle, gradient: "from-green-500 to-emerald-500" },
    { label: "服务客户", value: "150+", icon: Users, gradient: "from-blue-500 to-cyan-500" },
    { label: "客户好评", value: "4.9", icon: Star, gradient: "from-amber-500 to-orange-500" },
    { label: "行业经验", value: "8年", icon: Award, gradient: "from-purple-500 to-pink-500" },
  ];

  const filteredPortfolio = portfolioItems.filter(item => 
    selectedCategory === "all" || item.category === selectedCategory
  );

  const formatCount = (count: number) => count >= 10000 ? `${(count / 10000).toFixed(1)}万` : count.toLocaleString();
  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-red-600/30" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-5" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg shadow-orange-500/30">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-amber-100 to-orange-200 bg-clip-text text-transparent">
                      作品集服务
                    </h1>
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      专业团队
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">浏览精选案例 · 定制专属方案 · 打造完美直播间</p>
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
                      <p className="text-xs text-slate-400">{stat.label}</p>
                      <p className="text-lg font-bold text-white">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <MessageCircle className="w-4 h-4 mr-2" />
                在线咨询
              </Button>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/30">
                <Plus className="w-4 h-4 mr-2" />
                提交需求
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg px-6">
            <Image className="w-4 h-4 mr-2" />
            精选案例
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-6">
            <Briefcase className="w-4 h-4 mr-2" />
            服务套餐
          </TabsTrigger>
          <TabsTrigger value="process" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-lg px-6">
            <Settings className="w-4 h-4 mr-2" />
            服务流程
          </TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Category Filters */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categoryFilters.map((filter) => {
                  const IconComponent = filter.icon;
                  return (
                    <Button
                      key={filter.id}
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCategory(filter.id)}
                      className={selectedCategory === filter.id 
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0" 
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }
                    >
                      <IconComponent className="w-4 h-4 mr-1" />
                      {filter.name}
                    </Button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400'}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-white/5 border-white/10 text-slate-400'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredPortfolio.map((item) => {
              const isFavorite = favorites.includes(item.id);
              
              return (
                <div
                  key={item.id}
                  className={`group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-72 flex-shrink-0' : 'aspect-[16/10]'} overflow-hidden`}>
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {item.featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                          <Crown className="w-3 h-3 mr-1" />精选
                        </Badge>
                      </div>
                    )}
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-white/20 text-white backdrop-blur-sm mb-2">{item.category}</Badge>
                      <h4 className="text-lg font-semibold text-white line-clamp-1">{item.title}</h4>
                    </div>
                    
                    {/* Hover Actions */}
                    <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white h-8 w-8 p-0" onClick={() => toggleFavorite(item.id)}>
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white h-8 w-8 p-0">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-5 flex-1">
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{item.description}</p>
                    
                    {/* Client & Date */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Crown className="w-4 h-4 text-amber-500" />
                        {item.client}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {item.completedDate}
                      </div>
                    </div>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} className="bg-white/5 text-slate-400 border-white/10 text-xs">{tag}</Badge>
                      ))}
                    </div>
                    
                    {/* Results */}
                    {item.results && (
                      <div className="flex gap-4 mb-4 p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                        {item.results.slice(0, 2).map((result, idx) => (
                          <div key={idx} className="text-center flex-1">
                            <p className="text-lg font-bold text-amber-400">{result.value}</p>
                            <p className="text-xs text-slate-400">{result.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Stats & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />{formatCount(item.views)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />{formatCount(item.likes)}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20">
                        查看详情
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {servicePackages.map((pkg) => {
              const IconComponent = pkg.icon;
              return (
                <div
                  key={pkg.id}
                  className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    pkg.popular 
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                      : 'border-white/10 hover:border-white/20'
                  }`}
                >
                  {pkg.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-1 text-sm font-medium">
                      <Sparkles className="w-4 h-4 inline mr-1" />最受欢迎
                    </div>
                  )}
                  
                  <div className={`p-6 ${pkg.popular ? 'pt-10' : ''}`}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pkg.gradient} flex items-center justify-center mb-4`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                    <p className="text-sm text-slate-400 mb-4">{pkg.description}</p>
                    
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                        {formatPrice(pkg.price)}
                      </span>
                      {pkg.originalPrice && (
                        <span className="text-sm text-slate-500 line-through">{formatPrice(pkg.originalPrice)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />{pkg.deliveryTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Settings className="w-4 h-4" />{pkg.revisions}次修改
                      </span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button className={`w-full ${pkg.popular ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' : 'bg-white/10 hover:bg-white/20'} text-white border-0`}>
                      选择方案
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Process Tab */}
        <TabsContent value="process" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: 1, title: "需求沟通", desc: "深入了解您的需求和预算", icon: MessageCircle, color: "from-blue-500 to-cyan-500" },
              { step: 2, title: "方案设计", desc: "定制专属解决方案", icon: Palette, color: "from-purple-500 to-pink-500" },
              { step: 3, title: "实施落地", desc: "专业团队现场施工", icon: Settings, color: "from-amber-500 to-orange-500" },
              { step: 4, title: "售后支持", desc: "持续的技术支持服务", icon: CheckCircle, color: "from-green-500 to-emerald-500" },
            ].map((item) => (
              <div key={item.step} className="relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 mt-4`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
          
          {/* CTA */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-red-600/30 border border-amber-500/20 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
            <div className="relative text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">准备好开始了吗？</h3>
              <p className="text-slate-300 mb-6">我们的专业团队将根据您的需求，为您量身打造完美的直播解决方案</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 px-8">
                  <MessageCircle className="w-4 h-4 mr-2" />免费咨询
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8">
                  <Download className="w-4 h-4 mr-2" />下载案例集
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

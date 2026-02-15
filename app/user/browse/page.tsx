"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Star,
  Heart,
  Eye,
  ShoppingCart,
  Video,
  Camera,
  Mic,
  Lightbulb,
  Monitor,
  Headphones,
  Palette,
  Code,
  Smartphone,
  TrendingUp,
  Users,
  Package,
  Play,
  ArrowRight,
  Zap,
  Award,
  Target,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  Bookmark,
  Share2,
  LayoutGrid,
  Layers,
  Globe,
  Briefcase,
  Megaphone,
  PenTool,
  Box,
  Cpu,
  Database,
  Cloud,
  Shield,
  Rocket,
  Crown,
  Gift,
  Percent,
  ThumbsUp,
  MessageCircle,
} from "lucide-react";

interface BrowseCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  itemCount: number;
  featured: boolean;
  tags: string[];
  trending?: boolean;
}

interface BrowseItem {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  brand?: string;
  isLive?: boolean;
  viewerCount?: number;
  type: "product" | "service" | "template" | "course";
  featured: boolean;
  discount?: number;
  tags: string[];
  isHot?: boolean;
  isNew?: boolean;
  soldCount?: number;
}

const categories: BrowseCategory[] = [
  {
    id: "livestream-equipment",
    name: "直播设备",
    description: "专业直播设备，打造完美直播间",
    icon: Video,
    gradient: "from-red-500 to-pink-500",
    itemCount: 156,
    featured: true,
    tags: ["摄像头", "麦克风", "灯光", "声卡"],
    trending: true,
  },
  {
    id: "design-services",
    name: "设计服务",
    description: "专业设计团队，创造视觉奇迹",
    icon: Palette,
    gradient: "from-purple-500 to-violet-500",
    itemCount: 89,
    featured: true,
    tags: ["UI设计", "品牌设计", "平面设计", "动效设计"],
  },
  {
    id: "development",
    name: "开发服务",
    description: "定制开发解决方案，技术驱动创新",
    icon: Code,
    gradient: "from-blue-500 to-cyan-500",
    itemCount: 124,
    featured: true,
    tags: ["网站开发", "APP开发", "小程序", "系统集成"],
    trending: true,
  },
  {
    id: "mobile-apps",
    name: "移动应用",
    description: "移动端解决方案，触达更多用户",
    icon: Smartphone,
    gradient: "from-green-500 to-emerald-500",
    itemCount: 67,
    featured: false,
    tags: ["iOS", "Android", "跨平台", "原生开发"],
  },
  {
    id: "marketing",
    name: "营销推广",
    description: "数字营销策略，提升品牌影响力",
    icon: Megaphone,
    gradient: "from-orange-500 to-amber-500",
    itemCount: 93,
    featured: false,
    tags: ["SEO", "SEM", "社媒营销", "内容营销"],
  },
  {
    id: "consulting",
    name: "咨询服务",
    description: "专业咨询顾问，助力业务增长",
    icon: Briefcase,
    gradient: "from-indigo-500 to-purple-500",
    itemCount: 45,
    featured: false,
    tags: ["战略咨询", "技术咨询", "运营咨询", "投资咨询"],
  },
  {
    id: "cloud-services",
    name: "云服务",
    description: "企业级云解决方案，安全可靠",
    icon: Cloud,
    gradient: "from-sky-500 to-blue-500",
    itemCount: 78,
    featured: false,
    tags: ["云存储", "云计算", "CDN", "安全防护"],
  },
  {
    id: "ai-tools",
    name: "AI工具",
    description: "智能AI工具，提升工作效率",
    icon: Cpu,
    gradient: "from-fuchsia-500 to-pink-500",
    itemCount: 56,
    featured: true,
    tags: ["AI写作", "AI绘画", "AI视频", "AI助手"],
    trending: true,
  },
];

const featuredItems: BrowseItem[] = [
  {
    id: "1",
    title: "4K专业直播摄像头套装 Pro Max",
    description: "4K超高清画质，AI自动对焦，低光环境优化，完美适配各种直播场景",
    category: "livestream-equipment",
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 256,
    image: "/api/placeholder/400/300",
    brand: "StreamPro",
    type: "product",
    featured: true,
    discount: 19,
    tags: ["4K", "自动对焦", "低光增强"],
    isHot: true,
    soldCount: 2341,
  },
  {
    id: "2",
    title: "企业品牌VI设计服务",
    description: "专业品牌设计团队，从LOGO到完整VI体系，打造独特品牌形象",
    category: "design-services",
    price: 8999,
    rating: 4.9,
    reviews: 89,
    image: "/api/placeholder/400/300",
    brand: "DesignStudio",
    type: "service",
    featured: true,
    tags: ["LOGO设计", "VI体系", "品牌策略"],
    isNew: true,
    soldCount: 567,
  },
  {
    id: "3",
    title: "定制网站开发解决方案",
    description: "响应式网站开发，SEO优化，后台管理系统，一站式解决方案",
    category: "development",
    price: 15999,
    rating: 4.7,
    reviews: 124,
    image: "/api/placeholder/400/300",
    brand: "WebDev Pro",
    type: "service",
    featured: true,
    tags: ["响应式", "SEO优化", "后台管理"],
    soldCount: 234,
  },
  {
    id: "4",
    title: "RGB环形补光灯 Studio",
    description: "可调色温，RGB彩色模式，APP智能控制，直播必备神器",
    category: "livestream-equipment",
    price: 399,
    originalPrice: 499,
    rating: 4.6,
    reviews: 342,
    image: "/api/placeholder/400/300",
    brand: "LightRing",
    isLive: true,
    viewerCount: 1234,
    type: "product",
    featured: true,
    discount: 20,
    tags: ["RGB", "APP控制", "无频闪"],
    isHot: true,
    soldCount: 5678,
  },
  {
    id: "5",
    title: "AI智能写作助手年度会员",
    description: "GPT-4驱动，支持多种写作场景，提升10倍写作效率",
    category: "ai-tools",
    price: 299,
    originalPrice: 599,
    rating: 4.8,
    reviews: 1256,
    image: "/api/placeholder/400/300",
    brand: "AIWriter",
    type: "service",
    featured: true,
    discount: 50,
    tags: ["AI写作", "GPT-4", "多场景"],
    isHot: true,
    isNew: true,
    soldCount: 12345,
  },
  {
    id: "6",
    title: "移动APP定制开发",
    description: "iOS/Android双端开发，原生体验，快速上线",
    category: "mobile-apps",
    price: 29999,
    rating: 4.7,
    reviews: 67,
    image: "/api/placeholder/400/300",
    brand: "AppFactory",
    type: "service",
    featured: true,
    tags: ["iOS", "Android", "原生开发"],
    soldCount: 123,
  },
];

export default function BrowsePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);

  const stats = [
    { label: "商品总数", value: "574", icon: Package, gradient: "from-blue-500 to-cyan-500" },
    { label: "服务分类", value: "8", icon: LayoutGrid, gradient: "from-purple-500 to-pink-500" },
    { label: "用户好评", value: "4.8", icon: Star, gradient: "from-amber-500 to-orange-500" },
    { label: "在线直播", value: "12", icon: Video, gradient: "from-red-500 to-pink-500" },
  ];

  const filteredItems = featuredItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesTab = activeTab === "all" || 
                      (activeTab === "products" && item.type === "product") ||
                      (activeTab === "services" && item.type === "service");
    return matchesSearch && matchesCategory && matchesTab;
  });

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;
  const formatCount = (count: number) => count >= 10000 ? `${(count / 10000).toFixed(1)}万` : count.toLocaleString();

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-pink-600/30" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-5" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
                      浏览市场
                    </h1>
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      全新上线
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">发现优质产品与服务 · 满足您的所有需求</p>
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
                <Bookmark className="w-4 h-4 mr-2" />
                收藏夹 ({favorites.length})
              </Button>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/30">
                <ShoppingCart className="w-4 h-4 mr-2" />
                购物车
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索产品、服务、品牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400'}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-white/5 border-white/10 text-slate-400'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-blue-400" />
            服务分类
          </h2>
          <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
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
                    ? 'border-blue-500/50 shadow-lg shadow-blue-500/20' 
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
                  <p className="text-xs text-slate-400 mb-3 line-clamp-1">{category.description}</p>
                  <div className="flex items-center justify-center gap-2">
                    <Badge className="bg-white/10 text-slate-300 border-white/10 text-xs">
                      {category.itemCount} 项
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6">
            <Layers className="w-4 h-4 mr-2" />
            全部
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg px-6">
            <Package className="w-4 h-4 mr-2" />
            商品
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-6">
            <Briefcase className="w-4 h-4 mr-2" />
            服务
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {/* Featured Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 border border-amber-500/20 p-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">新用户专享优惠</h3>
                  <p className="text-slate-300">首单立减 ¥100，更多优惠等你发现</p>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                立即领取
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                精选推荐
                {selectedCategory !== "all" && (
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 ml-2">
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </Badge>
                )}
              </h3>
              <span className="text-sm text-slate-400">共 {filteredItems.length} 项</span>
            </div>
            
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredItems.map((item) => {
                const isFavorite = favorites.includes(item.id);
                const categoryInfo = categories.find(c => c.id === item.category);
                
                return (
                  <div
                    key={item.id}
                    className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    {/* Image */}
                    <div className={`relative ${viewMode === 'list' ? 'w-56 flex-shrink-0' : 'aspect-[4/3]'} overflow-hidden`}>
                      <div className={`absolute inset-0 bg-gradient-to-br ${categoryInfo?.gradient || 'from-blue-500 to-purple-500'} opacity-20`} />
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {item.discount && (
                          <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                            <Percent className="w-3 h-3 mr-1" />-{item.discount}%
                          </Badge>
                        )}
                        {item.isHot && (
                          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                            <Flame className="w-3 h-3 mr-1" />热卖
                          </Badge>
                        )}
                        {item.isNew && (
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                            <Sparkles className="w-3 h-3 mr-1" />新品
                          </Badge>
                        )}
                      </div>
                      
                      {item.isLive && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-500 text-white animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping" />直播中
                          </Badge>
                        </div>
                      )}
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white" onClick={() => toggleFavorite(item.id)}>
                            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-3">
                        {item.brand && <span className="text-xs text-slate-400 font-medium">{item.brand}</span>}
                        <Badge className={`text-xs ${item.type === 'product' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}>
                          {item.type === 'product' ? '商品' : '服务'}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm text-slate-400 line-clamp-2 mb-3 flex-grow">{item.description}</p>
                      
                      {/* Rating & Sales */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? "text-amber-400 fill-amber-400" : "text-slate-600"}`} />
                            ))}
                          </div>
                          <span className="text-xs text-slate-400">{item.rating} ({item.reviews})</span>
                        </div>
                        {item.soldCount && (
                          <span className="text-xs text-slate-500">已售 {formatCount(item.soldCount)}</span>
                        )}
                      </div>
                      
                      {/* Price & Action */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/5">
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {formatPrice(item.price || 0)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-sm text-slate-500 line-through">{formatPrice(item.originalPrice)}</span>
                          )}
                        </div>
                        <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          {item.type === 'product' ? '购买' : '咨询'}
                        </Button>
                      </div>
                      
                      {/* Live Indicator */}
                      {item.isLive && item.viewerCount && (
                        <div className="mt-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-sm text-red-300">{formatCount(item.viewerCount)}人观看</span>
                            </div>
                            <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-7">
                              <Play className="w-3 h-3 mr-1" />观看
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Search className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">没有找到相关内容</h3>
                <p className="text-slate-400 mb-4">尝试调整搜索条件或浏览其他分类</p>
                <Button variant="outline" onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }} className="bg-blue-500/20 border-blue-500/50 text-blue-300 hover:bg-blue-500/30">
                  清除筛选
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

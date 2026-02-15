"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/user/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Video,
  Mic,
  Camera,
  Monitor,
  Headphones,
  Lightbulb,
  Search,
  Filter,
  ShoppingCart,
  Heart,
  Star,
  Eye,
  TrendingUp,
  Users,
  Play,
  Pause,
  Volume2,
  Settings,
  Maximize,
  Share2,
  Download,
  Plus,
  Grid3X3,
  List,
  Package,
  Zap,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Flame,
  Crown,
  Gift,
  Percent,
  Timer,
  Bookmark,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

import "@/styles/livestream-market.css";

interface LivestreamProduct {
  id: string;
  name: string;
  category: "camera" | "microphone" | "lighting" | "streaming" | "accessories";
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  brand: string;
  isLive?: boolean;
  viewerCount?: number;
  streamerName?: string;
  description: string;
  features: string[];
  inStock: boolean;
  discount?: number;
  isHot?: boolean;
  isNew?: boolean;
  soldCount?: number;
}

interface LiveStream {
  id: string;
  title: string;
  streamerName: string;
  streamerAvatar: string;
  viewerCount: number;
  isLive: boolean;
  category: string;
  thumbnail: string;
  productId?: string;
  startTime: string;
  tags: string[];
  likes?: number;
  duration?: string;
}

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  client: string;
  completedDate: string;
  views: number;
  likes: number;
  tags: string[];
}

const mockProducts: LivestreamProduct[] = [
  {
    id: "1",
    name: "专业4K直播摄像头 Pro Max",
    category: "camera",
    price: 1299,
    originalPrice: 1599,
    rating: 4.8,
    reviews: 256,
    image: "/api/placeholder/400/300",
    brand: "StreamPro",
    description: "4K超高清画质，AI自动对焦，低光环境优化，专业级直播首选",
    features: ["4K 60fps", "AI自动对焦", "低光增强", "USB即插即用", "内置美颜"],
    inStock: true,
    discount: 19,
    isHot: true,
    soldCount: 2341,
  },
  {
    id: "2",
    name: "专业直播麦克风套装 Elite",
    category: "microphone",
    price: 899,
    rating: 4.9,
    reviews: 189,
    image: "/api/placeholder/400/300",
    brand: "AudioMax",
    description: "专业级音质，智能降噪技术，完美适配各类直播场景",
    features: ["专业降噪", "心形指向", "实时监听", "防喷罩", "一键静音"],
    inStock: true,
    isNew: true,
    soldCount: 1876,
  },
  {
    id: "3",
    name: "RGB环形补光灯 Studio",
    category: "lighting",
    price: 399,
    originalPrice: 499,
    rating: 4.7,
    reviews: 342,
    image: "/api/placeholder/400/300",
    brand: "LightRing",
    isLive: true,
    viewerCount: 1234,
    streamerName: "美妆达人小雅",
    description: "可调色温，RGB彩色模式，APP智能控制，打造专业直播间",
    features: ["RGB彩色", "可调色温", "APP控制", "无频闪", "遥控器"],
    inStock: true,
    discount: 20,
    soldCount: 5678,
  },
  {
    id: "4",
    name: "直播声卡套装 MixPro",
    category: "streaming",
    price: 599,
    rating: 4.6,
    reviews: 128,
    image: "/api/placeholder/400/300",
    brand: "SoundMix",
    description: "专业声卡，多种音效，实时调音，一键变声",
    features: ["多种音效", "实时调音", "一键变声", "降噪处理", "蓝牙连接"],
    inStock: true,
    isHot: true,
    soldCount: 987,
  },
  {
    id: "5",
    name: "监听耳机专业版 AudioPro X",
    category: "accessories",
    price: 299,
    originalPrice: 399,
    rating: 4.5,
    reviews: 89,
    image: "/api/placeholder/400/300",
    brand: "AudioPro",
    description: "专业监听耳机，精准音质还原，长时间佩戴舒适",
    features: ["专业监听", "舒适佩戴", "精准音质", "降噪设计", "可折叠"],
    inStock: true,
    discount: 25,
    soldCount: 654,
  },
  {
    id: "6",
    name: "绿幕背景布套装",
    category: "accessories",
    price: 199,
    rating: 4.4,
    reviews: 67,
    image: "/api/placeholder/400/300",
    brand: "StudioPro",
    description: "专业绿幕，支架稳固，快速搭建虚拟背景",
    features: ["抗皱材质", "便携支架", "快速安装", "多尺寸"],
    inStock: true,
    isNew: true,
    soldCount: 432,
  },
];

const mockLiveStreams: LiveStream[] = [
  {
    id: "1",
    title: "4K摄像头开箱测评 - 画质对比实测",
    streamerName: "科技评测师老王",
    streamerAvatar: "/api/placeholder/60/60",
    viewerCount: 2341,
    isLive: true,
    category: "数码评测",
    thumbnail: "/api/placeholder/480/270",
    productId: "1",
    startTime: "2024-01-08T20:00:00",
    tags: ["4K摄像头", "开箱", "评测", "对比"],
    likes: 1234,
    duration: "1:23:45",
  },
  {
    id: "2",
    title: "直播间灯光布置教程 - 从入门到专业",
    streamerName: "直播导师小李",
    streamerAvatar: "/api/placeholder/60/60",
    viewerCount: 1876,
    isLive: true,
    category: "教程分享",
    thumbnail: "/api/placeholder/480/270",
    productId: "3",
    startTime: "2024-01-08T19:30:00",
    tags: ["灯光", "布置", "教程", "新手"],
    likes: 987,
    duration: "45:30",
  },
  {
    id: "3",
    title: "音频设备选购指南 - 预算内最佳选择",
    streamerName: "音频专家阿杰",
    streamerAvatar: "/api/placeholder/60/60",
    viewerCount: 987,
    isLive: true,
    category: "选购指南",
    thumbnail: "/api/placeholder/480/270",
    productId: "2",
    startTime: "2024-01-08T21:00:00",
    tags: ["麦克风", "音频", "选购", "预算"],
    likes: 567,
    duration: "2:10:15",
  },
  {
    id: "4",
    title: "声卡调试技巧 - 让你的声音更专业",
    streamerName: "声音魔法师",
    streamerAvatar: "/api/placeholder/60/60",
    viewerCount: 654,
    isLive: true,
    category: "技术教程",
    thumbnail: "/api/placeholder/480/270",
    productId: "4",
    startTime: "2024-01-08T22:00:00",
    tags: ["声卡", "调试", "技巧"],
    likes: 345,
    duration: "1:05:20",
  },
];

const mockPortfolio: PortfolioItem[] = [
  {
    id: "1",
    title: "电竞主播直播间全套方案",
    description: "为知名电竞主播打造的专业直播间，包含4K摄像、专业灯光、音频系统",
    image: "/api/placeholder/600/400",
    category: "电竞直播",
    client: "某知名电竞战队",
    completedDate: "2024-01",
    views: 12345,
    likes: 2341,
    tags: ["电竞", "专业级", "全套方案"],
  },
  {
    id: "2",
    title: "美妆博主工作室设计",
    description: "专为美妆内容创作者设计的直播工作室，注重灯光和色彩还原",
    image: "/api/placeholder/600/400",
    category: "美妆直播",
    client: "头部美妆博主",
    completedDate: "2024-01",
    views: 8765,
    likes: 1876,
    tags: ["美妆", "灯光设计", "色彩还原"],
  },
  {
    id: "3",
    title: "音乐直播间声学方案",
    description: "为音乐主播打造的专业声学环境，完美音质呈现",
    image: "/api/placeholder/600/400",
    category: "音乐直播",
    client: "独立音乐人",
    completedDate: "2023-12",
    views: 6543,
    likes: 1234,
    tags: ["音乐", "声学设计", "专业音质"],
  },
];

const categoryConfig = {
  camera: { label: "摄像设备", icon: Camera, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-500/20" },
  microphone: { label: "音频设备", icon: Mic, color: "from-green-500 to-emerald-500", bgColor: "bg-green-500/20" },
  lighting: { label: "灯光设备", icon: Lightbulb, color: "from-yellow-500 to-orange-500", bgColor: "bg-yellow-500/20" },
  streaming: { label: "推流设备", icon: Monitor, color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/20" },
  accessories: { label: "配件周边", icon: Headphones, color: "from-orange-500 to-red-500", bgColor: "bg-orange-500/20" },
};

export default function LivestreamMarketPage() {
  const [products, setProducts] = useState<LivestreamProduct[]>(mockProducts);
  const [liveStreams, setLiveStreams] = useState<LiveStream[]>(mockLiveStreams);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(mockPortfolio);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("products");
  const [favorites, setFavorites] = useState<string[]>([]);

  const stats = [
    {
      label: "正在直播",
      value: liveStreams.filter(s => s.isLive).length.toString(),
      icon: Video,
      color: "bg-gradient-to-br from-red-500 to-pink-500",
    },
    {
      label: "在线观众",
      value: liveStreams.reduce((sum, s) => sum + s.viewerCount, 0).toLocaleString(),
      icon: Users,
      color: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      label: "热门产品",
      value: products.length.toString(),
      icon: Package,
      color: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
    {
      label: "作品案例",
      value: portfolio.length.toString(),
      icon: Award,
      color: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => `¥${price.toLocaleString()}`;

  const formatViewerCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    return count.toLocaleString();
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-fuchsia-600/30" />
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/400')] bg-cover bg-center opacity-10" />
        <div className="relative p-8 md:p-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/30">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-purple-100 to-violet-200 bg-clip-text text-transparent">
                      直播设备市场
                    </h1>
                    <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 animate-pulse">
                      <Flame className="w-3 h-3 mr-1" />
                      热门
                    </Badge>
                  </div>
                  <p className="text-slate-300 mt-1">发现专业直播设备 · 观看实时评测 · 浏览作品集服务</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-6">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
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
              <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/30">
                <Play className="w-4 h-4 mr-2" />
                开始直播
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
          <TabsTrigger value="products" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg px-6">
            <Package className="w-4 h-4 mr-2" />
            设备商城
          </TabsTrigger>
          <TabsTrigger value="live" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg px-6">
            <Video className="w-4 h-4 mr-2" />
            直播中心
            <Badge className="ml-2 bg-red-500 text-white text-xs">{liveStreams.filter(s => s.isLive).length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg px-6">
            <Award className="w-4 h-4 mr-2" />
            作品集服务
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索产品、品牌..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className={selectedCategory === "all" 
                      ? "bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0" 
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                    }
                  >
                    全部
                  </Button>
                  {Object.entries(categoryConfig).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      className={selectedCategory === key 
                        ? `bg-gradient-to-r ${config.color} text-white border-0` 
                        : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      }
                    >
                      <config.icon className="w-4 h-4 mr-1" />
                      {config.label}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' 
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                      : 'bg-white/5 border-white/10 text-slate-400'
                    }
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' 
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                      : 'bg-white/5 border-white/10 text-slate-400'
                    }
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => {
              const CategoryIcon = categoryConfig[product.category].icon;
              const isFavorite = favorites.includes(product.id);
              
              return (
                <div
                  key={product.id}
                  className={`group relative bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-violet-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10 ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  {/* Product Image */}
                  <div className={`relative ${viewMode === 'list' ? 'w-56 flex-shrink-0' : 'aspect-[4/3]'} overflow-hidden`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${categoryConfig[product.category].color} opacity-20`} />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.discount && (
                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 shadow-lg">
                          <Percent className="w-3 h-3 mr-1" />
                          -{product.discount}%
                        </Badge>
                      )}
                      {product.isHot && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
                          <Flame className="w-3 h-3 mr-1" />
                          热卖
                        </Badge>
                      )}
                      {product.isNew && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
                          <Sparkles className="w-3 h-3 mr-1" />
                          新品
                        </Badge>
                      )}
                    </div>
                    
                    {product.isLive && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-red-500 text-white animate-pulse">
                          <div className="w-2 h-2 bg-white rounded-full mr-1 animate-ping" />
                          直播中
                        </Badge>
                      </div>
                    )}
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                        </Button>
                        <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`p-1.5 rounded-lg ${categoryConfig[product.category].bgColor}`}>
                        <CategoryIcon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{product.brand}</span>
                      {!product.inStock && (
                        <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs ml-auto">
                          缺货
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="font-semibold text-white line-clamp-2 mb-2 group-hover:text-violet-300 transition-colors">
                      {product.name}
                    </h3>
                    
                    <p className="text-sm text-slate-400 line-clamp-2 mb-3 flex-grow">
                      {product.description}
                    </p>
                    
                    {/* Rating & Sales */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < Math.floor(product.rating)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>
                      {product.soldCount && (
                        <span className="text-xs text-slate-500">
                          已售 {product.soldCount > 1000 ? `${(product.soldCount/1000).toFixed(1)}k` : product.soldCount}
                        </span>
                      )}
                    </div>
                    
                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-slate-500 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0"
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        {product.inStock ? "加入购物车" : "缺货"}
                      </Button>
                    </div>
                    
                    {/* Live Indicator */}
                    {product.isLive && product.streamerName && (
                      <div className="mt-3 p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm text-red-300">{product.streamerName} 正在直播</span>
                          </div>
                          <Button size="sm" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 h-7">
                            <Play className="w-3 h-3 mr-1" />
                            观看
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Package className="w-8 h-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">没有找到相关产品</h3>
                <p className="text-slate-400 mb-4">尝试调整搜索条件或浏览其他分类</p>
                <Button 
                  variant="outline" 
                  onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }}
                  className="bg-violet-500/20 border-violet-500/50 text-violet-300 hover:bg-violet-500/30"
                >
                  清除筛选
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Live Streams Tab */}
        <TabsContent value="live" className="space-y-6">
          {/* Featured Live Stream */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/20 via-pink-500/10 to-purple-500/20 border border-red-500/20">
            <div className="absolute top-4 left-4 z-10">
              <Badge className="bg-red-500 text-white animate-pulse px-3 py-1">
                <div className="w-2 h-2 bg-white rounded-full mr-2 animate-ping" />
                精选直播
              </Badge>
            </div>
            <div className="grid lg:grid-cols-2 gap-6 p-6">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
                <img
                  src={liveStreams[0]?.thumbnail}
                  alt={liveStreams[0]?.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-red-500 text-white">
                      <Eye className="w-3 h-3 mr-1" />
                      {formatViewerCount(liveStreams[0]?.viewerCount || 0)}
                    </Badge>
                    <Badge className="bg-white/20 text-white backdrop-blur-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {liveStreams[0]?.duration}
                    </Badge>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30 text-white rounded-full w-16 h-16">
                    <Play className="w-8 h-8 ml-1" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-3">{liveStreams[0]?.title}</h2>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={liveStreams[0]?.streamerAvatar}
                    alt={liveStreams[0]?.streamerName}
                    className="w-12 h-12 rounded-full border-2 border-red-500"
                  />
                  <div>
                    <p className="font-medium text-white">{liveStreams[0]?.streamerName}</p>
                    <p className="text-sm text-slate-400">{liveStreams[0]?.category}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {liveStreams[0]?.tags.map((tag) => (
                    <Badge key={tag} className="bg-white/10 text-slate-300 border-white/20">
                      #{tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-4">
                  <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0">
                    <Play className="w-4 h-4 mr-2" />
                    立即观看
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Heart className="w-4 h-4 mr-2" />
                    关注
                  </Button>
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Live Streams Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                正在直播
              </h2>
              <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                查看全部
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {liveStreams.slice(1).map((stream) => (
                <div key={stream.id} className="group cursor-pointer">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800 mb-4">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <Badge className="bg-red-500 text-white text-xs">
                        <div className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse" />
                        直播
                      </Badge>
                    </div>
                    
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <Badge className="bg-black/50 text-white backdrop-blur-sm text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatViewerCount(stream.viewerCount)}
                      </Badge>
                      <Badge className="bg-black/50 text-white backdrop-blur-sm text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {stream.duration}
                      </Badge>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-md border-white/30 text-white rounded-full">
                        <Play className="w-6 h-6 ml-0.5" />
                      </Button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-white line-clamp-2 mb-2 group-hover:text-red-300 transition-colors">
                    {stream.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-3">
                    <img
                      src={stream.streamerAvatar}
                      alt={stream.streamerName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-slate-400">{stream.streamerName}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/5 text-slate-400 border-white/10 text-xs">
                      {stream.category}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <ThumbsUp className="w-3 h-3" />
                      {stream.likes}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Portfolio Header */}
          <div className="bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-red-500/20 rounded-2xl border border-amber-500/20 p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">作品集服务</h2>
                </div>
                <p className="text-slate-300 max-w-2xl">
                  浏览我们为客户打造的专业直播间方案，从设备选型到空间设计，提供一站式解决方案
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  咨询服务
                </Button>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                  <Plus className="w-4 h-4 mr-2" />
                  提交需求
                </Button>
              </div>
            </div>
          </div>

          {/* Service Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Camera, title: "设备选型", desc: "根据预算和需求推荐最佳设备组合", color: "from-blue-500 to-cyan-500" },
              { icon: Lightbulb, title: "空间设计", desc: "专业灯光布局和声学环境设计", color: "from-amber-500 to-orange-500" },
              { icon: Settings, title: "技术支持", desc: "设备调试、软件配置一站式服务", color: "from-purple-500 to-pink-500" },
            ].map((feature, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6 hover:border-white/20 transition-colors">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Portfolio Grid */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">精选案例</h3>
              <Button variant="outline" className="bg-white/5 border-white/10 text-slate-300 hover:bg-white/10">
                查看全部案例
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {portfolio.map((item) => (
                <div key={item.id} className="group bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <Badge className="bg-amber-500/80 text-white backdrop-blur-sm mb-2">
                        {item.category}
                      </Badge>
                      <h4 className="text-lg font-semibold text-white">{item.title}</h4>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Crown className="w-4 h-4 text-amber-500" />
                        {item.client}
                      </div>
                      <span className="text-xs text-slate-500">{item.completedDate}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag) => (
                        <Badge key={tag} className="bg-white/5 text-slate-400 border-white/10 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {item.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {item.likes.toLocaleString()}
                        </span>
                      </div>
                      <Button size="sm" variant="outline" className="bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20">
                        查看详情
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-fuchsia-600/30 border border-violet-500/20 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-3xl" />
            <div className="relative text-center max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">需要定制直播间方案？</h3>
              <p className="text-slate-300 mb-6">
                我们的专业团队将根据您的需求和预算，为您量身打造完美的直播解决方案
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 px-8">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  免费咨询
                </Button>
                <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8">
                  <Download className="w-4 h-4 mr-2" />
                  下载案例集
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Eye, 
  Heart, 
  Search, 
  Filter, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Users, 
  Star,
  Play,
  ExternalLink,
  Grid3X3,
  List,
  ChevronRight,
  Palette,
  Code,
  Video,
  Smartphone,
  Globe,
  Layers,
  Crown,
  Zap,
  TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { portfolioItems, type PortfolioItem } from "@/lib/data/portfolio";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const categories = [
  { value: "all", label: "全部", icon: Layers, color: "from-violet-500 to-purple-500" },
  { value: "branding", label: "品牌设计", icon: Palette, color: "from-pink-500 to-rose-500" },
  { value: "web", label: "网站开发", icon: Globe, color: "from-blue-500 to-cyan-500" },
  { value: "video", label: "视频制作", icon: Video, color: "from-red-500 to-orange-500" },
  { value: "ui", label: "UI设计", icon: Sparkles, color: "from-purple-500 to-pink-500" },
  { value: "app", label: "应用开发", icon: Smartphone, color: "from-green-500 to-emerald-500" },
];

const stats = [
  { label: "完成项目", value: "500+", icon: Award },
  { label: "服务客户", value: "200+", icon: Users },
  { label: "客户好评", value: "4.9", icon: Star },
  { label: "行业经验", value: "10年", icon: TrendingUp },
];

export default function PortfolioPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredItems = useMemo(() => {
    return portfolioItems.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const featuredItems = filteredItems.filter(item => item.featured);
  const regularItems = filteredItems.filter(item => !item.featured);

  const formatCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <div className="min-h-screen purple-gradient-page purple-gradient-content">
      <Navbar />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-purple-600/10 to-fuchsia-600/20" />
          <div className="absolute top-20 left-10 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl" />
          
          <div className="relative max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 px-4 py-1">
                <Sparkles className="w-4 h-4 mr-2" />
                精选作品展示
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-white via-violet-100 to-purple-200 bg-clip-text text-transparent">
                  作品集
                </span>
              </h1>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-8">
                探索我们的精选作品，了解我们如何帮助客户实现他们的愿景，创造卓越的数字体验
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <stat.icon className="w-5 h-5 text-violet-400" />
                      <span className="text-2xl md:text-3xl font-bold text-white">{stat.value}</span>
                    </div>
                    <span className="text-sm text-slate-400">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="py-8 border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                        : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Search and View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索作品..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-400">
                  共 {filteredItems.length} 个作品
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' 
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300' 
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
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
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                    }
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Projects */}
        {featuredItems.length > 0 && (
          <section className="py-12">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">精选作品</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {featuredItems.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/portfolio/${item.id}`)}
                    className="group relative bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/50 transition-all duration-500 cursor-pointer hover:shadow-2xl hover:shadow-violet-500/20"
                  >
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <Badge className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        <Crown className="w-3 h-3 mr-1" />
                        精选
                      </Badge>
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-slate-300 line-clamp-2 mb-4">{item.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {formatCount(item.views)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-4 h-4" />
                              {item.likes}
                            </span>
                          </div>
                          <Button size="sm" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-0">
                            查看详情
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Portfolio Grid */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 md:px-6">
            {filteredItems.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Search className="w-10 h-10 text-violet-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">没有找到匹配的作品</h3>
                <p className="text-slate-400 mb-6">尝试调整搜索条件或浏览其他分类</p>
                <Button 
                  onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                  className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0"
                >
                  清除筛选
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {(featuredItems.length > 0 ? regularItems : filteredItems).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/portfolio/${item.id}`)}
                    className={`group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-violet-500/30 transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-violet-500/10 ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`${viewMode === 'list' ? 'w-72 flex-shrink-0' : 'aspect-video'} overflow-hidden relative`}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.featured && (
                        <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          精选
                        </Badge>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-3 right-3">
                          <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30 text-white">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs capitalize">
                          {categories.find(c => c.value === item.category)?.label || item.category}
                        </Badge>
                      </div>
                      
                      <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-violet-300 transition-colors line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                        {item.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-white/5 text-slate-400 text-xs rounded-lg border border-white/10"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {formatCount(item.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {item.likes}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600/30 via-purple-600/20 to-fuchsia-600/30 border border-violet-500/20 p-8 md:p-12">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl" />
              <div className="relative text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  想要打造属于您的精彩作品？
                </h2>
                <p className="text-slate-300 mb-8 max-w-xl mx-auto">
                  我们的专业团队随时准备为您提供创意解决方案，让您的想法变为现实
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button 
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white border-0 px-8"
                    onClick={() => router.push('/contact')}
                  >
                    开始合�?
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 px-8"
                    onClick={() => router.push('/services')}
                  >
                    了解服务
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

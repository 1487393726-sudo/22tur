'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/user/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  GitCompare, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Video,
  Users,
  Package,
  TrendingUp,
  Filter,
  Grid3X3,
  List,
  Search,
  Star,
  Heart,
  Eye,
  Zap,
  Award,
  Target,
  Sparkles,
  Code,
  Palette,
  Smartphone,
  ArrowRight,
  Play,
  Clock,
  DollarSign
} from 'lucide-react';

interface MockProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  rating: number;
  reviews: number;
  image: string;
  category: string;
  inStock: boolean;
  type: "product" | "service" | "template";
  featured: boolean;
  discount?: number;
  tags: string[];
}

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  itemCount: number;
  featured: boolean;
}

const serviceCategories: ServiceCategory[] = [
  {
    id: "design",
    name: "设计服务",
    description: "专业设计团队，创造视觉奇迹",
    icon: Palette,
    color: "bg-purple-500",
    itemCount: 89,
    featured: true,
  },
  {
    id: "development",
    name: "开发服务", 
    description: "定制开发解决方案，技术驱动创新",
    icon: Code,
    color: "bg-blue-500",
    itemCount: 124,
    featured: true,
  },
  {
    id: "mobile",
    name: "移动应用",
    description: "移动端解决方案，触达更多用户",
    icon: Smartphone,
    color: "bg-green-500",
    itemCount: 67,
    featured: false,
  },
  {
    id: "marketing",
    name: "营销推广",
    description: "数字营销策略，提升品牌影响力",
    icon: TrendingUp,
    color: "bg-orange-500",
    itemCount: 93,
    featured: false,
  },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const mockProducts: MockProduct[] = [
    {
      id: '1',
      name: '专业4K直播摄像头',
      description: '4K超高清画质，自动对焦，低光环境优化',
      price: 1299,
      originalPrice: 1599,
      brand: 'StreamPro',
      rating: 4.8,
      reviews: 256,
      image: '/api/placeholder/300/200',
      category: 'camera',
      inStock: true,
      type: 'product',
      featured: true,
      discount: 19,
      tags: ['4K', '自动对焦', '低光增强'],
    },
    {
      id: '2',
      name: '企业品牌VI设计服务',
      description: '专业品牌设计团队，从LOGO到完整VI体系',
      price: 8999,
      brand: 'DesignStudio',
      rating: 4.9,
      reviews: 89,
      image: '/api/placeholder/300/200',
      category: 'design',
      inStock: true,
      type: 'service',
      featured: true,
      tags: ['LOGO设计', 'VI体系', '品牌策略'],
    },
    {
      id: '3',
      name: 'RGB环形补光灯',
      description: '可调色温，RGB彩色模式，APP智能控制',
      price: 399,
      originalPrice: 499,
      brand: 'LightRing',
      rating: 4.7,
      reviews: 342,
      image: '/api/placeholder/300/200',
      category: 'lighting',
      inStock: true,
      type: 'product',
      featured: true,
      discount: 20,
      tags: ['RGB', 'APP控制', '无频闪'],
    },
    {
      id: '4',
      name: '定制网站开发解决方案',
      description: '响应式网站开发，SEO优化，后台管理系统',
      price: 15999,
      brand: 'WebDev Pro',
      rating: 4.7,
      reviews: 124,
      image: '/api/placeholder/300/200',
      category: 'development',
      inStock: true,
      type: 'service',
      featured: true,
      tags: ['响应式', 'SEO优化', '后台管理'],
    },
  ];

  const stats = [
    {
      label: "商品总数",
      value: mockProducts.length.toString(),
      icon: Package,
      color: "bg-blue-500",
    },
    {
      label: "服务分类",
      value: serviceCategories.length.toString(),
      icon: Grid3X3,
      color: "bg-purple-500",
    },
    {
      label: "用户评价",
      value: "4.8",
      icon: Star,
      color: "bg-yellow-500",
    },
    {
      label: "月销量",
      value: "2.3k",
      icon: TrendingUp,
      color: "bg-green-500",
    },
  ];

  useEffect(() => {
    // 模拟加载
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    return `¥${price.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="purple-gradient-hero p-6 rounded-2xl">
        <PageHeader
          title="综合市场"
          description="发现优质产品与专业服务，一站式解决方案"
          icon={ShoppingCart}
          stats={stats}
          actions={
            <>
              <Button variant="outline" className="purple-gradient-button border-0">
                <GitCompare className="w-4 h-4 mr-2" />
                对比 (0)
              </Button>
              <Button className="purple-gradient-button">
                <Heart className="w-4 h-4 mr-2" />
                收藏夹
              </Button>
            </>
          }
        />
      </div>

      {/* 服务分类导航 */}
      <div className="purple-gradient-card p-6">
        <h2 className="purple-gradient-title text-xl font-semibold mb-4">服务分类</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {serviceCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                className="group relative bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all cursor-pointer"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      热门
                    </Badge>
                  </div>
                )}
                
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
                  <IconComponent className="w-12 h-12 text-white/70" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`p-1 rounded ${category.color}`}>
                      <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="purple-gradient-title font-semibold">{category.name}</h3>
                  </div>
                  
                  <p className="purple-gradient-text text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="purple-gradient-subtitle text-sm">
                      {category.itemCount} 个服务
                    </span>
                    <ArrowRight className="w-4 h-4 purple-gradient-text group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 搜索和筛选区域 */}
      <div className="purple-gradient-card p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索产品、服务或品牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="purple-gradient-input w-full pl-10"
            />
          </div>
          
          {/* 筛选选项 */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className={
                  selectedCategory === 'all'
                    ? 'purple-gradient-button'
                    : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                }
              >
                全部
              </Button>
              {serviceCategories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={
                    selectedCategory === category.id
                      ? 'purple-gradient-button'
                      : 'border-slate-600 text-slate-300 hover:bg-slate-800'
                  }
                >
                  <category.icon className="w-4 h-4 mr-1" />
                  {category.name}
                </Button>
              ))}
            </div>
            
            {/* 视图切换 */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'purple-gradient-button' : 'border-slate-600 text-slate-300'}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'purple-gradient-button' : 'border-slate-600 text-slate-300'}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 产品列表 */}
      <div className="purple-gradient-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="purple-gradient-title text-xl font-semibold">
            {selectedCategory === 'all' ? '全部商品' : serviceCategories.find(c => c.id === selectedCategory)?.name}
          </h2>
          <div className="flex items-center gap-2 purple-gradient-subtitle text-sm">
            <Package className="w-4 h-4" />
            <span>共 {filteredProducts.length} 件商品</span>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden hover:border-white/30 transition-all ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-video'} bg-gradient-to-br from-primary/20 to-secondary/20`}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  {product.discount && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white">
                        -{product.discount}%
                      </Badge>
                    </div>
                  )}
                  {product.featured && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        <Star className="w-3 h-3 mr-1" />
                        精选
                      </Badge>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 right-2 flex gap-2">
                      <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border-white/30">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="purple-gradient-subtitle text-xs">{product.brand}</span>
                    <Badge className="purple-gradient-badge text-xs">
                      {product.type === 'product' ? '商品' : product.type === 'service' ? '服务' : '模板'}
                    </Badge>
                    {!product.inStock && (
                      <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs">
                        缺货
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="purple-gradient-title font-medium line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  
                  <p className="purple-gradient-text text-sm line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400 fill-current"
                              : "text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="purple-gradient-subtitle text-xs">
                      {product.rating} ({product.reviews})
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="purple-gradient-title font-bold text-lg">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-slate-500 text-sm line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 标签 */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {product.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} className="purple-gradient-badge text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 purple-gradient-button"
                      disabled={!product.inStock}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {product.inStock ? (product.type === 'service' ? '立即咨询' : '加入购物车') : '缺货'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 空状态 */}
      {!loading && filteredProducts.length === 0 && (
        <div className="purple-gradient-card">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center purple-gradient-subtitle">
              <Package className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2 purple-gradient-title">暂无相关产品</p>
              <p className="text-sm mb-4">尝试调整搜索条件或浏览其他分类</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }} 
                className="purple-gradient-button"
              >
                清除筛选
              </Button>
            </div>
          </CardContent>
        </div>
      )}
    </div>
  );
}
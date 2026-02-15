'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Package,
  PackagePlus,
  Layers,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Equipment, EquipmentBundle, EquipmentCategory } from '@/types/marketplace';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState<Equipment[]>([]);
  const [bundles, setBundles] = useState<EquipmentBundle[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, bundlesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/marketplace/products'),
        fetch('/api/admin/marketplace/bundles'),
        fetch('/api/admin/marketplace/categories'),
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
      if (bundlesRes.ok) {
        const data = await bundlesRes.json();
        setBundles(data.bundles || []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('确定要删除此产品吗？')) return;
    try {
      const res = await fetch(`/api/admin/marketplace/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('产品已删除');
        loadData();
      } else {
        toast.error('删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const handleDeleteBundle = async (id: string) => {
    if (!confirm('确定要删除此套餐吗？')) return;
    try {
      const res = await fetch(`/api/admin/marketplace/bundles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('套餐已删除');
        loadData();
      } else {
        toast.error('删除失败');
      }
    } catch {
      toast.error('删除失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
      OUT_OF_STOCK: 'destructive',
    };
    const labels: Record<string, string> = {
      ACTIVE: '上架',
      INACTIVE: '下架',
      OUT_OF_STOCK: '缺货',
    };
    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">商城管理</h1>
          <p className="text-gray-400">管理直播设备产品、套餐和分类</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">产品总数</CardTitle>
            <Package className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{products.length}</div>
            <p className="text-xs text-gray-300">
              上架: {products.filter(p => p.status === 'ACTIVE').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">套餐总数</CardTitle>
            <Layers className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{bundles.length}</div>
            <p className="text-xs text-gray-300">
              上架: {bundles.filter(b => b.status === 'ACTIVE').length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">分类总数</CardTitle>
            <PackagePlus className="h-4 w-4 text-gray-300" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] bg-white/10 border-white/20 backdrop-blur-sm">
            <TabsTrigger value="products" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">产品管理</TabsTrigger>
            <TabsTrigger value="bundles" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">套餐管理</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300">分类管理</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {activeTab === 'products' && (
              <Button asChild className="bg-white/20 hover:bg-white/30 text-white">
                <Link href="/admin/marketplace/products/new">
                  <Plus className="w-4 h-4 mr-2" />
                  创建产品
                </Link>
              </Button>
            )}
            {activeTab === 'bundles' && (
              <Button asChild className="bg-white/20 hover:bg-white/30 text-white">
                <Link href="/admin/marketplace/bundles/new">
                  <Plus className="w-4 h-4 mr-2" />
                  创建套餐
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* 产品列表 */}
        <TabsContent value="products" className="mt-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-0">
              {products.length === 0 ? (
                <div className="text-center py-12 text-gray-300">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无产品</p>
                  <Button asChild className="mt-4 bg-white/20 hover:bg-white/30 text-white">
                    <Link href="/admin/marketplace/products/new">创建第一个产品</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white">产品名称</TableHead>
                      <TableHead className="text-white">分类</TableHead>
                      <TableHead className="text-white">价格</TableHead>
                      <TableHead className="text-white">库存</TableHead>
                      <TableHead className="text-white">状态</TableHead>
                      <TableHead className="text-white text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id} className="border-white/10">
                        <TableCell className="text-white font-medium">{product.name}</TableCell>
                        <TableCell className="text-gray-300">
                          {categories.find(c => c.id === product.categoryId)?.name || '-'}
                        </TableCell>
                        <TableCell className="text-white">¥{product.price.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-300">{product.stock}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/marketplace/products/${product.id}/edit`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  编辑
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/marketplace/products/${product.id}`} target="_blank">
                                  <Eye className="w-4 h-4 mr-2" />
                                  查看
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 套餐列表 */}
        <TabsContent value="bundles" className="mt-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-0">
              {bundles.length === 0 ? (
                <div className="text-center py-12 text-gray-300">
                  <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>暂无套餐</p>
                  <Button asChild className="mt-4 bg-white/20 hover:bg-white/30 text-white">
                    <Link href="/admin/marketplace/bundles/new">创建第一个套餐</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white">套餐名称</TableHead>
                      <TableHead className="text-white">目标用户</TableHead>
                      <TableHead className="text-white">价格</TableHead>
                      <TableHead className="text-white">原价</TableHead>
                      <TableHead className="text-white">状态</TableHead>
                      <TableHead className="text-white text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bundles.map((bundle) => (
                      <TableRow key={bundle.id} className="border-white/10">
                        <TableCell className="text-white font-medium">{bundle.name}</TableCell>
                        <TableCell className="text-gray-300">{bundle.targetSegment}</TableCell>
                        <TableCell className="text-white">¥{bundle.price.toFixed(2)}</TableCell>
                        <TableCell className="text-gray-400 line-through">
                          ¥{bundle.originalPrice.toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(bundle.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/marketplace/bundles/${bundle.id}/edit`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  编辑
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeleteBundle(bundle.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 分类列表 */}
        <TabsContent value="categories" className="mt-4">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">产品分类</CardTitle>
              <CardDescription className="text-gray-300">管理产品分类</CardDescription>
            </CardHeader>
            <CardContent>
              {categories.length === 0 ? (
                <div className="text-center py-8 text-gray-300">
                  <p>暂无分类</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <Card key={category.id} className="bg-white/10 border-white/20 backdrop-blur-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-white">{category.name}</h3>
                            {category.nameEn && (
                              <p className="text-sm text-gray-300">{category.nameEn}</p>
                            )}
                          </div>
                          <Button variant="ghost" size="icon" asChild className="text-gray-300 hover:text-white">
                            <Link href={`/admin/marketplace/categories/${category.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

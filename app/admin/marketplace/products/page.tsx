'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { Plus, MoreHorizontal, Search, Loader2 } from 'lucide-react';
import type { Equipment } from '@/types/marketplace';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketplace/products');
      const data = await res.json();
      setProducts(data.data || []);
    } catch (error) {
      console.error('获取产品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此产品吗？')) return;
    try {
      await fetch(`/api/admin/marketplace/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Badge className="bg-green-500">上架</Badge>;
      case 'INACTIVE': return <Badge variant="secondary">下架</Badge>;
      case 'OUT_OF_STOCK': return <Badge variant="destructive">缺货</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">产品管理</h1>
        <Button className="bg-white/20 hover:bg-white/30 text-white">
          <Plus className="h-4 w-4 mr-2" />
          添加产品
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索产品..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      ) : (
        <div className="border border-white/20 rounded-lg bg-white/10 backdrop-blur-sm">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-white">产品名称</TableHead>
                <TableHead className="text-white">品牌</TableHead>
                <TableHead className="text-white">价格</TableHead>
                <TableHead className="text-white">库存</TableHead>
                <TableHead className="text-white">状态</TableHead>
                <TableHead className="w-[80px] text-white">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="border-white/10">
                  <TableCell className="font-medium text-white">{product.name}</TableCell>
                  <TableCell className="text-gray-300">{product.brand || '-'}</TableCell>
                  <TableCell className="text-gray-300">¥{product.price}</TableCell>
                  <TableCell className="text-gray-300">{product.stock}</TableCell>
                  <TableCell>{statusBadge(product.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>编辑</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

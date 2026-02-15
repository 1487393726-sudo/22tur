'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
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
import { Plus, MoreHorizontal, Loader2 } from 'lucide-react';
import type { EquipmentCategory } from '@/types/marketplace';

interface CategoryWithCount extends EquipmentCategory {
  _count?: { equipment: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketplace/categories');
      const data = await res.json();
      setCategories(data || []);
    } catch (error) {
      console.error('获取分类失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此分类吗？')) return;
    try {
      const res = await fetch(`/api/admin/marketplace/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) {
        alert(data.message);
      } else {
        fetchCategories();
      }
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">分类管理</h1>
        <Button className="bg-white/20 hover:bg-white/30 text-white">
          <Plus className="h-4 w-4 mr-2" />
          添加分类
        </Button>
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
                <TableHead className="text-white">分类名称</TableHead>
                <TableHead className="text-white">标识</TableHead>
                <TableHead className="text-white">产品数量</TableHead>
                <TableHead className="text-white">排序</TableHead>
                <TableHead className="text-white">状态</TableHead>
                <TableHead className="w-[80px] text-white">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id} className="border-white/10">
                  <TableCell className="font-medium text-white">{category.name}</TableCell>
                  <TableCell className="text-gray-300">{category.slug}</TableCell>
                  <TableCell className="text-gray-300">{category._count?.equipment || 0}</TableCell>
                  <TableCell className="text-gray-300">{category.order}</TableCell>
                  <TableCell>
                    {category.isActive ? (
                      <Badge className="bg-green-500">启用</Badge>
                    ) : (
                      <Badge variant="secondary">禁用</Badge>
                    )}
                  </TableCell>
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
                          onClick={() => handleDelete(category.id)}
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

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
import type { EquipmentBundle } from '@/types/marketplace';

const segmentLabels: Record<string, string> = {
  PERSONAL: '个人用户',
  PROFESSIONAL: '行业用户',
  ENTERPRISE: '企业用户',
};

export default function AdminBundlesPage() {
  const [bundles, setBundles] = useState<EquipmentBundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/marketplace/bundles');
      const data = await res.json();
      setBundles(data || []);
    } catch (error) {
      console.error('获取套餐失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此套餐吗？')) return;
    try {
      await fetch(`/api/admin/marketplace/bundles/${id}`, { method: 'DELETE' });
      fetchBundles();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">套餐管理</h1>
        <Button className="bg-white/20 hover:bg-white/30 text-white">
          <Plus className="h-4 w-4 mr-2" />
          添加套餐
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
                <TableHead className="text-white">套餐名称</TableHead>
                <TableHead className="text-white">目标用户</TableHead>
                <TableHead className="text-white">套餐价</TableHead>
                <TableHead className="text-white">原价</TableHead>
                <TableHead className="text-white">节省</TableHead>
                <TableHead className="text-white">状态</TableHead>
                <TableHead className="w-[80px] text-white">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bundles.map((bundle) => (
                <TableRow key={bundle.id} className="border-white/10">
                  <TableCell className="font-medium text-white">{bundle.name}</TableCell>
                  <TableCell className="text-gray-300">{segmentLabels[bundle.targetSegment]}</TableCell>
                  <TableCell className="text-green-400 font-semibold">¥{bundle.price}</TableCell>
                  <TableCell className="text-gray-300">¥{bundle.originalPrice}</TableCell>
                  <TableCell className="text-green-400">
                    ¥{(bundle.originalPrice - bundle.price).toFixed(0)}
                  </TableCell>
                  <TableCell>
                    {bundle.status === 'ACTIVE' ? (
                      <Badge className="bg-green-500">上架</Badge>
                    ) : (
                      <Badge variant="secondary">下架</Badge>
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
                          onClick={() => handleDelete(bundle.id)}
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

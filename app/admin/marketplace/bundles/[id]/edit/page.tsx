'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BundleForm } from '@/components/editor/BundleForm';
import { NavigationGuard } from '@/components/editor/NavigationGuard';
import type { EquipmentBundle, Equipment, CreateBundleRequest, UpdateBundleRequest } from '@/types/marketplace';

export default function BundleEditPage() {
  const params = useParams();
  const router = useRouter();
  const bundleId = params.id as string;

  const [bundle, setBundle] = useState<EquipmentBundle | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadData();
  }, [bundleId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 加载设备列表
      const equipmentRes = await fetch('/api/admin/marketplace/products?status=ACTIVE');
      if (equipmentRes.ok) {
        const equipmentData = await equipmentRes.json();
        setEquipment(equipmentData.products || []);
      }

      // 加载套餐
      const bundleRes = await fetch(`/api/admin/marketplace/bundles/${bundleId}`);
      if (bundleRes.ok) {
        const bundleData = await bundleRes.json();
        setBundle(bundleData.bundle);
      } else {
        toast.error('套餐不存在');
        router.push('/admin/marketplace/bundles');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: CreateBundleRequest | UpdateBundleRequest) => {
    try {
      const response = await fetch(`/api/admin/marketplace/bundles/${bundleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('套餐已保存');
        setIsDirty(false);
        router.push('/admin/marketplace/bundles');
      } else {
        const error = await response.json();
        toast.error(error.message || '保存失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast.error('保存失败');
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (confirm('您有未保存的更改，确定要离开吗？')) {
        router.push('/admin/marketplace/bundles');
      }
    } else {
      router.push('/admin/marketplace/bundles');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!bundle) {
    return null;
  }

  return (
    <div className="space-y-6">
      <NavigationGuard isDirty={isDirty} onSave={async () => {}} onDiscard={() => {}} />

      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">编辑套餐</h1>
          <p className="text-muted-foreground">{bundle.name}</p>
        </div>
      </div>

      <BundleForm
        bundle={bundle}
        availableEquipment={equipment}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}

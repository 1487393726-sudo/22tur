'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { BundleForm } from '@/components/editor/BundleForm';
import { NavigationGuard } from '@/components/editor/NavigationGuard';
import type { Equipment, CreateBundleRequest } from '@/types/marketplace';

export default function NewBundlePage() {
  const router = useRouter();

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/marketplace/products?status=ACTIVE');
      if (response.ok) {
        const data = await response.json();
        setEquipment(data.products || []);
      }
    } catch (error) {
      console.error('加载设备失败:', error);
      toast.error('加载设备失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: CreateBundleRequest) => {
    try {
      const response = await fetch('/api/admin/marketplace/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('套餐已创建');
        setIsDirty(false);
        router.push('/admin/marketplace/bundles');
      } else {
        const error = await response.json();
        toast.error(error.message || '创建失败');
      }
    } catch (error) {
      console.error('创建失败:', error);
      toast.error('创建失败');
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

  return (
    <div className="space-y-6">
      <NavigationGuard isDirty={isDirty} onSave={async () => {}} onDiscard={() => {}} />

      {/* 页面头部 */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">创建套餐</h1>
          <p className="text-muted-foreground">添加新的设备套餐</p>
        </div>
      </div>

      <BundleForm
        availableEquipment={equipment}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/editor/ProductForm';
import { MediaManager } from '@/components/editor/MediaManager';
import { SpecificationsEditor } from '@/components/editor/SpecificationsEditor';
import { NavigationGuard } from '@/components/editor/NavigationGuard';
import { useAutoSave } from '@/hooks/use-auto-save';
import type { EquipmentCategory, CreateEquipmentRequest } from '@/types/marketplace';

export default function NewProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 表单数据
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  // 自动保存
  const { lastSaved, isSaving, saveDraft, discardDraft } = useAutoSave({
    entityType: 'equipment',
    entityId: null,
    data: { images, specifications },
    onSave: () => toast.success('草稿已自动保存'),
    onError: (error) => toast.error(`自动保存失败: ${error.message}`),
  });

  // 加载分类
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/marketplace/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
      toast.error('加载分类失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (data: CreateEquipmentRequest) => {
    try {
      const saveData = {
        ...data,
        images,
        specifications,
      };

      const response = await fetch('/api/admin/marketplace/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (response.ok) {
        toast.success('产品已创建');
        setIsDirty(false);
        await discardDraft();
        router.push('/admin/marketplace/products');
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
        router.push('/admin/marketplace/products');
      }
    } else {
      router.push('/admin/marketplace/products');
    }
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
    setIsDirty(true);
  };

  const handleSpecificationsChange = (newSpecs: Record<string, string>) => {
    setSpecifications(newSpecs);
    setIsDirty(true);
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
      <NavigationGuard isDirty={isDirty} onSave={saveDraft} onDiscard={() => {}} />

      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">创建产品</h1>
            <p className="text-muted-foreground">添加新的直播设备产品</p>
          </div>
        </div>
        {lastSaved && (
          <span className="text-sm text-muted-foreground">
            {isSaving ? '保存中...' : `上次保存: ${lastSaved.toLocaleTimeString()}`}
          </span>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="basic">基本信息</TabsTrigger>
          <TabsTrigger value="media">媒体资源</TabsTrigger>
          <TabsTrigger value="specs">产品规格</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <ProductForm
            categories={categories}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </TabsContent>

        <TabsContent value="media" className="mt-6">
          <MediaManager
            images={images}
            onImagesChange={handleImagesChange}
            maxImages={10}
          />
        </TabsContent>

        <TabsContent value="specs" className="mt-6">
          <SpecificationsEditor
            value={specifications}
            onChange={handleSpecificationsChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

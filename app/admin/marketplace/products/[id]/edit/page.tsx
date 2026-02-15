'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ProductForm } from '@/components/editor/ProductForm';
import { MediaManager } from '@/components/editor/MediaManager';
import { SpecificationsEditor } from '@/components/editor/SpecificationsEditor';
import { ProductPreviewContainer } from '@/components/editor/ProductPreview';
import { NavigationGuard, DraftRestoreDialog } from '@/components/editor/NavigationGuard';
import { useAutoSave } from '@/hooks/use-auto-save';
import type { Equipment, EquipmentCategory, CreateEquipmentRequest, UpdateEquipmentRequest } from '@/types/marketplace';

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Equipment | null>(null);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // 表单数据
  const [formData, setFormData] = useState<Partial<Equipment>>({});
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<Record<string, string>>({});

  // 自动保存
  const { lastSaved, isSaving, hasDraft, saveDraft, discardDraft, restoreDraft } = useAutoSave({
    entityType: 'equipment',
    entityId: productId,
    data: { ...formData, images, specifications },
    onSave: () => toast.success('草稿已自动保存'),
    onError: (error) => toast.error(`自动保存失败: ${error.message}`),
  });

  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // 加载产品数据
  useEffect(() => {
    loadData();
  }, [productId]);

  // 检查草稿
  useEffect(() => {
    if (!isLoading && hasDraft) {
      setShowDraftDialog(true);
    }
  }, [isLoading, hasDraft]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // 加载分类
      const categoriesRes = await fetch('/api/admin/marketplace/categories');
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      // 加载产品
      const productRes = await fetch(`/api/admin/marketplace/products/${productId}`);
      if (productRes.ok) {
        const productData = await productRes.json();
        const prod = productData.product;
        setProduct(prod);
        setFormData(prod);
        setImages(prod.images || []);
        setSpecifications(prod.specifications || {});
      } else {
        toast.error('产品不存在');
        router.push('/admin/marketplace/products');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast.error('加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreDraft = () => {
    const draft = restoreDraft();
    if (draft) {
      const draftData = draft as { images?: string[]; specifications?: Record<string, string> } & Partial<Equipment>;
      setFormData(draftData);
      setImages(draftData.images || []);
      setSpecifications(draftData.specifications || {});
      setIsDirty(true);
      toast.success('草稿已恢复');
    }
    setShowDraftDialog(false);
  };

  const handleDiscardDraft = async () => {
    await discardDraft();
    setShowDraftDialog(false);
  };

  const handleSave = async (data: CreateEquipmentRequest | UpdateEquipmentRequest) => {
    try {
      const saveData = {
        ...data,
        images,
        specifications,
      };

      const response = await fetch(`/api/admin/marketplace/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (response.ok) {
        toast.success('产品已保存');
        setIsDirty(false);
        await discardDraft();
        router.push('/admin/marketplace/products');
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

  if (!product) {
    return null;
  }

  // 预览数据
  const previewProduct: Equipment = {
    ...product,
    ...formData,
    images,
    specifications,
  } as Equipment;

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
            <h1 className="text-2xl font-bold">编辑产品</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              {isSaving ? '保存中...' : `上次保存: ${lastSaved.toLocaleTimeString()}`}
            </span>
          )}
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? '关闭预览' : '预览'}
          </Button>
        </div>
      </div>

      {showPreview ? (
        <ProductPreviewContainer product={previewProduct} onClose={() => setShowPreview(false)} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="basic">基本信息</TabsTrigger>
            <TabsTrigger value="media">媒体资源</TabsTrigger>
            <TabsTrigger value="specs">产品规格</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <ProductForm
              product={product}
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
      )}

      {/* 草稿恢复对话框 */}
      <DraftRestoreDialog
        open={showDraftDialog}
        draftTimestamp={new Date()}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
      />
    </div>
  );
}

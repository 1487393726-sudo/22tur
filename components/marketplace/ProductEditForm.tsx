'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductEditFormProps {
  product: {
    id: string;
    name: string;
    brand: string;
    model: string;
    description?: string;
    price: number;
    stock: number;
  };
  onSave?: (data: any) => Promise<void>;
  onCancel?: () => void;
}

export function ProductEditForm({
  product,
  onSave,
  onCancel,
}: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    brand: product.brand,
    model: product.model,
    description: product.description || '',
    price: product.price,
    stock: product.stock,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'stock' ? parseFloat(value) : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.brand || !formData.model) {
      setError('请填写必填项');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (onSave) {
        await onSave(formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 产品名称 */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          产品名称 <span className="text-red-400">*</span>
        </label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="输入产品名称"
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
        />
      </div>

      {/* 品牌和型号 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            品牌 <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="输入品牌"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            型号 <span className="text-red-400">*</span>
          </label>
          <Input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="输入型号"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* 价格和库存 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            价格 (¥) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="输入价格"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            库存 (件) <span className="text-red-400">*</span>
          </label>
          <Input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            placeholder="输入库存"
            className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {/* 产品描述 */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          产品描述
        </label>
        <Textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="输入产品描述"
          rows={4}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* 按钮 */}
      <div className="flex gap-2 pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 bg-white/20 hover:bg-white/30 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              保存
            </>
          )}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/10"
        >
          <X className="h-4 w-4 mr-2" />
          取消
        </Button>
      </div>
    </div>
  );
}

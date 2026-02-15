'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { productSchema, type ProductInput } from '@/lib/editor/validation';
import type { ProductFormProps } from '@/types/editor';
import type { UserSegment, PriceTier, ProductStatus } from '@/types/marketplace';

const USER_SEGMENTS: { value: UserSegment; label: string }[] = [
  { value: 'PERSONAL', label: '个人用户' },
  { value: 'PROFESSIONAL', label: '专业用户' },
  { value: 'ENTERPRISE', label: '企业用户' },
];

const PRICE_TIERS: { value: PriceTier; label: string }[] = [
  { value: 'ENTRY', label: '入门级' },
  { value: 'MID', label: '中端' },
  { value: 'HIGH', label: '高端' },
];

const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: '上架' },
  { value: 'INACTIVE', label: '下架' },
  { value: 'OUT_OF_STOCK', label: '缺货' },
];

export function ProductForm({ product, categories, onSave, onCancel }: ProductFormProps) {
  const form = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? '',
      nameEn: product?.nameEn ?? '',
      description: product?.description ?? '',
      descriptionEn: product?.descriptionEn ?? '',
      price: product?.price ?? 0,
      originalPrice: product?.originalPrice ?? undefined,
      categoryId: product?.categoryId ?? '',
      targetSegments: product?.targetSegments ?? ['PERSONAL'],
      priceTier: product?.priceTier ?? 'ENTRY',
      specifications: product?.specifications ?? {},
      images: product?.images ?? [],
      stock: product?.stock ?? 0,
      status: product?.status ?? 'ACTIVE',
      brand: product?.brand ?? '',
      model: product?.model ?? '',
      featured: product?.featured ?? false,
    },
  });

  const { isSubmitting } = form.formState;

  const handleSubmit = async (data: ProductInput) => {
    try {
      if (product?.id) {
        await onSave({ ...data, id: product.id });
      } else {
        await onSave(data);
      }
    } catch (error) {
      console.error('保存产品失败:', error);
    }
  };

  const handleSegmentToggle = (segment: UserSegment, currentSegments: UserSegment[]) => {
    if (currentSegments.includes(segment)) {
      // 至少保留一个
      if (currentSegments.length > 1) {
        return currentSegments.filter((s) => s !== segment);
      }
      return currentSegments;
    }
    return [...currentSegments, segment];
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="输入产品名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nameEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>英文名称</FormLabel>
                    <FormControl>
                      <Input placeholder="English name" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入产品描述"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descriptionEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>英文描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="English description"
                      className="min-h-[100px]"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>品牌</FormLabel>
                    <FormControl>
                      <Input placeholder="输入品牌名称" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>型号</FormLabel>
                    <FormControl>
                      <Input placeholder="输入产品型号" {...field} value={field.value ?? ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 分类和定位 */}
        <Card>
          <CardHeader>
            <CardTitle>分类和定位</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>产品分类 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetSegments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目标用户群体 *</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {USER_SEGMENTS.map((segment) => (
                      <Button
                        key={segment.value}
                        type="button"
                        variant={field.value.includes(segment.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newValue = handleSegmentToggle(segment.value, field.value);
                          field.onChange(newValue);
                        }}
                      >
                        {segment.label}
                      </Button>
                    ))}
                  </div>
                  <FormDescription>至少选择一个目标用户群体</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priceTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>价格档次 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择价格档次" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRICE_TIERS.map((tier) => (
                        <SelectItem key={tier.value} value={tier.value}>
                          {tier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 价格和库存 */}
        <Card>
          <CardHeader>
            <CardTitle>价格和库存</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>售价 (¥) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="originalPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>原价 (¥)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val ? parseFloat(val) : undefined);
                        }}
                      />
                    </FormControl>
                    <FormDescription>用于显示折扣</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>库存 *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 状态设置 */}
        <Card>
          <CardHeader>
            <CardTitle>状态设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品状态 *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择状态" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRODUCT_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">推荐产品</FormLabel>
                      <FormDescription>在首页和分类页面优先展示</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            取消
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {product?.id ? '保存修改' : '创建产品'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

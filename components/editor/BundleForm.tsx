'use client';

import { useState, useMemo } from 'react';
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, X, Plus, Minus, Package, Check, ChevronsUpDown } from 'lucide-react';
import { bundleSchema, type BundleInput } from '@/lib/editor/validation';
import type { BundleFormProps, BundleItemInput } from '@/types/editor';
import type { UserSegment, ProductStatus, Equipment } from '@/types/marketplace';
import { cn } from '@/lib/utils';

const USER_SEGMENTS: { value: UserSegment; label: string }[] = [
  { value: 'PERSONAL', label: '个人用户' },
  { value: 'PROFESSIONAL', label: '专业用户' },
  { value: 'ENTERPRISE', label: '企业用户' },
];

const PRODUCT_STATUSES: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: '上架' },
  { value: 'INACTIVE', label: '下架' },
  { value: 'OUT_OF_STOCK', label: '缺货' },
];

export function BundleForm({
  bundle,
  availableEquipment,
  onSave,
  onCancel,
}: BundleFormProps) {
  const [items, setItems] = useState<BundleItemInput[]>(
    bundle?.items?.map((item) => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
      equipment: item.equipment,
    })) ?? []
  );

  // 计算原价（各设备价格之和）
  const originalPrice = useMemo(() => {
    return items.reduce((sum, item) => {
      const equipment = item.equipment ?? availableEquipment.find((e) => e.id === item.equipmentId);
      const price = equipment?.price ?? 0;
      return sum + price * item.quantity;
    }, 0);
  }, [items, availableEquipment]);

  const form = useForm<BundleInput>({
    resolver: zodResolver(bundleSchema),
    defaultValues: {
      name: bundle?.name ?? '',
      nameEn: bundle?.nameEn ?? '',
      description: bundle?.description ?? '',
      descriptionEn: bundle?.descriptionEn ?? '',
      price: bundle?.price ?? 0,
      originalPrice: bundle?.originalPrice ?? originalPrice,
      targetSegment: bundle?.targetSegment ?? 'PERSONAL',
      images: bundle?.images ?? [],
      status: bundle?.status ?? 'ACTIVE',
      featured: bundle?.featured ?? false,
      items: items.map((item) => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
      })),
    },
  });

  const { isSubmitting } = form.formState;
  const bundlePrice = form.watch('price');

  // 计算节省金额
  const savings = originalPrice - bundlePrice;
  const savingsPercent = originalPrice > 0 ? ((savings / originalPrice) * 100).toFixed(1) : '0';

  // 更新原价
  const updateOriginalPrice = () => {
    form.setValue('originalPrice', originalPrice);
  };

  // 添加设备
  const addItem = (equipmentId: string) => {
    const equipment = availableEquipment.find((e) => e.id === equipmentId);
    if (!equipment) return;

    const existingIndex = items.findIndex((item) => item.equipmentId === equipmentId);
    if (existingIndex >= 0) {
      // 增加数量
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      // 添加新项
      setItems([...items, { equipmentId, quantity: 1, equipment }]);
    }

    // 更新表单
    form.setValue('items', [...items, { equipmentId, quantity: 1 }].map((item) => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
    })));
  };

  // 移除设备
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    form.setValue('items', newItems.map((item) => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
    })));
  };

  // 更新数量
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const newItems = [...items];
    newItems[index].quantity = quantity;
    setItems(newItems);
    form.setValue('items', newItems.map((item) => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
    })));
  };

  const handleSubmit = async (data: BundleInput) => {
    try {
      // 确保原价是最新的
      data.originalPrice = originalPrice;
      data.items = items.map((item) => ({
        equipmentId: item.equipmentId,
        quantity: item.quantity,
      }));

      if (bundle?.id) {
        await onSave({ ...data, id: bundle.id });
      } else {
        await onSave(data);
      }
    } catch (error) {
      console.error('保存套餐失败:', error);
    }
  };

  // 已选设备ID列表
  const selectedIds = items.map((item) => item.equipmentId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              套餐信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>套餐名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="输入套餐名称" {...field} />
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
                  <FormLabel>套餐描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="输入套餐描述"
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
              name="targetSegment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目标用户群体 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择目标用户" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {USER_SEGMENTS.map((segment) => (
                        <SelectItem key={segment.value} value={segment.value}>
                          {segment.label}
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

        {/* 设备选择 */}
        <Card>
          <CardHeader>
            <CardTitle>包含设备</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 设备搜索选择器 */}
            <EquipmentSelector
              equipment={availableEquipment}
              selectedIds={selectedIds}
              onSelect={addItem}
            />

            {/* 已选设备列表 */}
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item, index) => {
                  const equipment = item.equipment ?? availableEquipment.find((e) => e.id === item.equipmentId);
                  if (!equipment) return null;

                  return (
                    <div
                      key={item.equipmentId}
                      className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{equipment.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ¥{equipment.price.toFixed(2)} / 件
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(index, parseInt(e.target.value) || 1)}
                          className="w-16 text-center"
                          min={1}
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <p className="w-24 text-right font-medium">
                        ¥{(equipment.price * item.quantity).toFixed(2)}
                      </p>

                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(index)}
                        aria-label="移除"
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                请添加设备到套餐中
              </p>
            )}

            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* 价格设置 */}
        <Card>
          <CardHeader>
            <CardTitle>价格设置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <FormLabel>原价（自动计算）</FormLabel>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={originalPrice.toFixed(2)}
                    disabled
                    className="bg-muted"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={updateOriginalPrice}
                  >
                    同步
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  各设备价格 × 数量之和
                </p>
              </div>

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>套餐价 (¥) *</FormLabel>
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
                    <FormDescription>必须低于原价</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>节省金额</FormLabel>
                <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-lg font-bold text-green-600">
                    ¥{savings.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    节省 {savingsPercent}%
                  </p>
                </div>
                {savings <= 0 && (
                  <p className="text-xs text-destructive">
                    套餐价必须低于原价
                  </p>
                )}
              </div>
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
                    <FormLabel>套餐状态 *</FormLabel>
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
                      <FormLabel className="text-base">推荐套餐</FormLabel>
                      <FormDescription>在首页优先展示</FormDescription>
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
          <Button type="submit" disabled={isSubmitting || savings <= 0}>
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {bundle?.id ? '保存修改' : '创建套餐'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

// ============================================
// 设备选择器组件
// ============================================

interface EquipmentSelectorProps {
  equipment: Equipment[];
  selectedIds: string[];
  onSelect: (id: string) => void;
}

function EquipmentSelector({ equipment, selectedIds, onSelect }: EquipmentSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between">
          <span className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加设备
          </span>
          <ChevronsUpDown className="w-4 h-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="搜索设备..." />
          <CommandList>
            <CommandEmpty>未找到设备</CommandEmpty>
            <CommandGroup>
              {equipment.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => {
                      onSelect(item.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        isSelected ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        ¥{item.price.toFixed(2)}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="ml-2">
                        已添加
                      </Badge>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ============================================
// 工具函数（用于属性测试）
// ============================================

/**
 * 添加套餐项
 */
export function addBundleItem(
  items: BundleItemInput[],
  equipmentId: string,
  equipment?: Equipment
): BundleItemInput[] {
  const existingIndex = items.findIndex((item) => item.equipmentId === equipmentId);
  
  if (existingIndex >= 0) {
    const newItems = [...items];
    newItems[existingIndex].quantity += 1;
    return newItems;
  }
  
  return [...items, { equipmentId, quantity: 1, equipment }];
}

/**
 * 移除套餐项
 */
export function removeBundleItem(
  items: BundleItemInput[],
  index: number
): BundleItemInput[] {
  return items.filter((_, i) => i !== index);
}

/**
 * 计算套餐原价
 */
export function calculateBundleOriginalPrice(items: BundleItemInput[]): number {
  return items.reduce((sum, item) => {
    const price = item.equipment?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);
}

/**
 * 计算节省金额
 */
export function calculateSavings(bundlePrice: number, originalPrice: number): number {
  return Math.max(0, originalPrice - bundlePrice);
}

/**
 * 验证套餐价格
 */
export function validateBundlePrice(bundlePrice: number, originalPrice: number): boolean {
  return bundlePrice > 0 && bundlePrice < originalPrice;
}

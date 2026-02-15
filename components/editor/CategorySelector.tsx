'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { EquipmentCategory } from '@/types/marketplace';

interface CategorySelectorProps {
  categories: EquipmentCategory[];
  value: string;
  onChange: (categoryId: string) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export function CategorySelector({
  categories,
  value,
  onChange,
  disabled = false,
  error,
  label = '产品分类',
  placeholder = '选择分类',
  required = false,
}: CategorySelectorProps) {
  // 过滤出活跃的分类
  const activeCategories = categories.filter((cat) => cat.isActive);

  // 按 order 排序
  const sortedCategories = [...activeCategories].sort((a, b) => a.order - b.order);

  const handleChange = (newValue: string) => {
    // 确保状态更新
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className={error ? 'text-destructive' : ''}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Select
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
      >
        <SelectTrigger className={error ? 'border-destructive' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {sortedCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                {category.icon && <span>{category.icon}</span>}
                <span>{category.name}</span>
                {category.nameEn && (
                  <span className="text-muted-foreground text-xs">
                    ({category.nameEn})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
          {sortedCategories.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              暂无可用分类
            </div>
          )}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

// ============================================
// 分类选择工具函数（用于属性测试）
// ============================================

/**
 * 更新分类ID
 * 返回新的分类ID，确保状态更新
 */
export function updateCategoryId(
  currentCategoryId: string,
  newCategoryId: string,
  availableCategories: EquipmentCategory[]
): string {
  // 验证新分类ID是否有效
  const isValid = availableCategories.some(
    (cat) => cat.id === newCategoryId && cat.isActive
  );

  if (isValid) {
    return newCategoryId;
  }

  // 如果无效，返回当前值
  return currentCategoryId;
}

/**
 * 验证分类变更是否正确更新了表单状态
 */
export function verifyCategoryChange(
  formState: { categoryId: string },
  expectedCategoryId: string
): boolean {
  return formState.categoryId === expectedCategoryId;
}

/**
 * 获取分类名称
 */
export function getCategoryName(
  categoryId: string,
  categories: EquipmentCategory[]
): string | undefined {
  const category = categories.find((cat) => cat.id === categoryId);
  return category?.name;
}

/**
 * 检查分类是否有效
 */
export function isValidCategory(
  categoryId: string,
  categories: EquipmentCategory[]
): boolean {
  return categories.some((cat) => cat.id === categoryId && cat.isActive);
}

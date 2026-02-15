'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { validateSpecification } from '@/lib/editor/validation';

interface SpecificationsEditorProps {
  value: Record<string, string>;
  onChange: (specs: Record<string, string>) => void;
  disabled?: boolean;
}

interface EditingState {
  key: string;
  newKey: string;
  newValue: string;
}

export function SpecificationsEditor({
  value,
  onChange,
  disabled = false,
}: SpecificationsEditorProps) {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [error, setError] = useState<string | null>(null);

  const specs = Object.entries(value);

  const handleAdd = () => {
    const validation = validateSpecification(newKey, newValue);
    if (!validation.valid) {
      setError(validation.errors[0]?.message ?? '验证失败');
      return;
    }

    if (value[newKey.trim()]) {
      setError('该规格名称已存在');
      return;
    }

    onChange({
      ...value,
      [newKey.trim()]: newValue.trim(),
    });
    setNewKey('');
    setNewValue('');
    setError(null);
  };

  const handleRemove = (key: string) => {
    const newSpecs = { ...value };
    delete newSpecs[key];
    onChange(newSpecs);
  };

  const handleStartEdit = (key: string) => {
    setEditing({
      key,
      newKey: key,
      newValue: value[key],
    });
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditing(null);
    setError(null);
  };

  const handleSaveEdit = () => {
    if (!editing) return;

    const validation = validateSpecification(editing.newKey, editing.newValue);
    if (!validation.valid) {
      setError(validation.errors[0]?.message ?? '验证失败');
      return;
    }

    // 如果键名改变了，检查新键名是否已存在
    if (editing.newKey !== editing.key && value[editing.newKey.trim()]) {
      setError('该规格名称已存在');
      return;
    }

    const newSpecs = { ...value };
    
    // 如果键名改变了，删除旧键
    if (editing.newKey !== editing.key) {
      delete newSpecs[editing.key];
    }
    
    newSpecs[editing.newKey.trim()] = editing.newValue.trim();
    onChange(newSpecs);
    setEditing(null);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (action === 'add') {
        handleAdd();
      } else {
        handleSaveEdit();
      }
    } else if (e.key === 'Escape' && action === 'edit') {
      handleCancelEdit();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">产品规格</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 现有规格列表 */}
        {specs.length > 0 && (
          <div className="space-y-2">
            {specs.map(([key, val]) => (
              <div
                key={key}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
              >
                {editing?.key === key ? (
                  // 编辑模式
                  <>
                    <Input
                      value={editing.newKey}
                      onChange={(e) =>
                        setEditing({ ...editing, newKey: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDown(e, 'edit')}
                      placeholder="规格名称"
                      className="flex-1"
                      disabled={disabled}
                    />
                    <Input
                      value={editing.newValue}
                      onChange={(e) =>
                        setEditing({ ...editing, newValue: e.target.value })
                      }
                      onKeyDown={(e) => handleKeyDown(e, 'edit')}
                      placeholder="规格值"
                      className="flex-1"
                      disabled={disabled}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleSaveEdit}
                      disabled={disabled}
                      aria-label="保存"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={disabled}
                      aria-label="取消"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                ) : (
                  // 显示模式
                  <>
                    <span className="flex-1 font-medium text-sm">{key}</span>
                    <span className="flex-1 text-sm text-muted-foreground">
                      {val}
                    </span>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(key)}
                      disabled={disabled}
                      aria-label="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => handleRemove(key)}
                      disabled={disabled}
                      aria-label="删除"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {specs.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            暂无规格，请添加产品规格
          </p>
        )}

        {/* 添加新规格 */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Input
            value={newKey}
            onChange={(e) => {
              setNewKey(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => handleKeyDown(e, 'add')}
            placeholder="规格名称（如：重量）"
            className="flex-1"
            disabled={disabled}
          />
          <Input
            value={newValue}
            onChange={(e) => {
              setNewValue(e.target.value);
              setError(null);
            }}
            onKeyDown={(e) => handleKeyDown(e, 'add')}
            placeholder="规格值（如：500g）"
            className="flex-1"
            disabled={disabled}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleAdd}
            disabled={disabled || !newKey.trim() || !newValue.trim()}
            aria-label="添加规格"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================
// 规格操作工具函数（用于属性测试）
// ============================================

/**
 * 添加规格
 */
export function addSpecification(
  specs: Record<string, string>,
  key: string,
  value: string
): Record<string, string> {
  if (!key.trim() || !value.trim()) {
    return specs;
  }
  return {
    ...specs,
    [key.trim()]: value.trim(),
  };
}

/**
 * 删除规格
 */
export function removeSpecification(
  specs: Record<string, string>,
  key: string
): Record<string, string> {
  const newSpecs = { ...specs };
  delete newSpecs[key];
  return newSpecs;
}

/**
 * 更新规格
 */
export function updateSpecification(
  specs: Record<string, string>,
  oldKey: string,
  newKey: string,
  newValue: string
): Record<string, string> {
  if (!newKey.trim() || !newValue.trim()) {
    return specs;
  }

  const newSpecs = { ...specs };
  
  if (oldKey !== newKey) {
    delete newSpecs[oldKey];
  }
  
  newSpecs[newKey.trim()] = newValue.trim();
  return newSpecs;
}

/**
 * 获取规格数量
 */
export function getSpecificationCount(specs: Record<string, string>): number {
  return Object.keys(specs).length;
}

/**
 * 检查规格是否存在
 */
export function hasSpecification(specs: Record<string, string>, key: string): boolean {
  return key in specs;
}

/**
 * 获取规格值
 */
export function getSpecificationValue(
  specs: Record<string, string>,
  key: string
): string | undefined {
  return specs[key];
}

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
} from 'lucide-react';
import type { FontEditorProps, TextStyle } from '@/types/editor';
import { AVAILABLE_FONTS, DEFAULT_TEXT_STYLE } from '@/types/editor';

// ============================================
// 预设颜色
// ============================================

const DEFAULT_PRESET_COLORS = [
  '#000000', // 黑色
  '#FFFFFF', // 白色
  '#EF4444', // 红色
  '#F97316', // 橙色
  '#EAB308', // 黄色
  '#22C55E', // 绿色
  '#3B82F6', // 蓝色
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
  '#6B7280', // 灰色
];

// ============================================
// FontEditor 组件
// ============================================

export function FontEditor({
  value,
  onChange,
  presetColors = DEFAULT_PRESET_COLORS,
}: FontEditorProps) {
  const handleChange = <K extends keyof TextStyle>(key: K, newValue: TextStyle[K]) => {
    onChange({
      ...value,
      [key]: newValue,
    });
  };

  const toggleBold = () => {
    handleChange('fontWeight', value.fontWeight === 'bold' ? 'normal' : 'bold');
  };

  const toggleItalic = () => {
    handleChange('fontStyle', value.fontStyle === 'italic' ? 'normal' : 'italic');
  };

  const toggleUnderline = () => {
    handleChange('textDecoration', value.textDecoration === 'underline' ? 'none' : 'underline');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">文本样式</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 字体选择 */}
        <div className="space-y-2">
          <Label>字体</Label>
          <Select
            value={value.fontFamily}
            onValueChange={(v) => handleChange('fontFamily', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="选择字体" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABLE_FONTS.map((font) => (
                <SelectItem
                  key={font.value}
                  value={font.value}
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 字号 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>字号</Label>
            <span className="text-sm text-muted-foreground">{value.fontSize}px</span>
          </div>
          <div className="flex items-center gap-4">
            <Slider
              value={[value.fontSize]}
              onValueChange={([v]) => handleChange('fontSize', v)}
              min={8}
              max={72}
              step={1}
              className="flex-1"
            />
            <Input
              type="number"
              value={value.fontSize}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (v >= 8 && v <= 72) {
                  handleChange('fontSize', v);
                }
              }}
              className="w-20"
              min={8}
              max={72}
            />
          </div>
        </div>

        {/* 格式化按钮 */}
        <div className="space-y-2">
          <Label>格式</Label>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="icon"
              variant={value.fontWeight === 'bold' ? 'default' : 'outline'}
              onClick={toggleBold}
              aria-label="粗体"
              aria-pressed={value.fontWeight === 'bold'}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={value.fontStyle === 'italic' ? 'default' : 'outline'}
              onClick={toggleItalic}
              aria-label="斜体"
              aria-pressed={value.fontStyle === 'italic'}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={value.textDecoration === 'underline' ? 'default' : 'outline'}
              onClick={toggleUnderline}
              aria-label="下划线"
              aria-pressed={value.textDecoration === 'underline'}
            >
              <Underline className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-2" />

            <Button
              type="button"
              size="icon"
              variant={value.textAlign === 'left' ? 'default' : 'outline'}
              onClick={() => handleChange('textAlign', 'left')}
              aria-label="左对齐"
              aria-pressed={value.textAlign === 'left'}
            >
              <AlignLeft className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={value.textAlign === 'center' ? 'default' : 'outline'}
              onClick={() => handleChange('textAlign', 'center')}
              aria-label="居中对齐"
              aria-pressed={value.textAlign === 'center'}
            >
              <AlignCenter className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant={value.textAlign === 'right' ? 'default' : 'outline'}
              onClick={() => handleChange('textAlign', 'right')}
              aria-label="右对齐"
              aria-pressed={value.textAlign === 'right'}
            >
              <AlignRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 颜色选择 */}
        <div className="space-y-2">
          <Label>颜色</Label>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-10 h-10 p-0"
                  style={{ backgroundColor: value.color }}
                  aria-label="选择颜色"
                >
                  <span className="sr-only">选择颜色</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-2">
                    {presetColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`
                          w-8 h-8 rounded-md border-2 transition-all
                          ${value.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-transparent'}
                          hover:scale-110
                        `}
                        style={{ backgroundColor: color }}
                        onClick={() => handleChange('color', color)}
                        aria-label={`颜色 ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <Input
                      type="color"
                      value={value.color}
                      onChange={(e) => handleChange('color', e.target.value)}
                      className="w-full h-8 p-0 border-0"
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Input
              type="text"
              value={value.color}
              onChange={(e) => {
                const color = e.target.value;
                if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
                  handleChange('color', color);
                }
              }}
              placeholder="#000000"
              className="w-28 font-mono"
            />
          </div>
        </div>

        {/* 预览 */}
        <div className="space-y-2">
          <Label>预览</Label>
          <div
            className="p-4 border rounded-lg bg-white min-h-[60px]"
            style={{
              fontFamily: value.fontFamily,
              fontSize: `${value.fontSize}px`,
              fontWeight: value.fontWeight,
              fontStyle: value.fontStyle,
              textDecoration: value.textDecoration,
              color: value.color,
              textAlign: value.textAlign,
            }}
          >
            示例文本 Sample Text 123
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// 工具函数（用于属性测试）
// ============================================

/**
 * 应用样式属性
 */
export function applyStyleProperty<K extends keyof TextStyle>(
  style: TextStyle,
  key: K,
  value: TextStyle[K]
): TextStyle {
  return {
    ...style,
    [key]: value,
  };
}

/**
 * 切换格式化属性
 */
export function toggleFormatting(
  style: TextStyle,
  property: 'fontWeight' | 'fontStyle' | 'textDecoration'
): TextStyle {
  switch (property) {
    case 'fontWeight':
      return {
        ...style,
        fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold',
      };
    case 'fontStyle':
      return {
        ...style,
        fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic',
      };
    case 'textDecoration':
      return {
        ...style,
        textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline',
      };
  }
}

/**
 * 验证样式属性是否正确应用
 */
export function verifyStyleApplication<K extends keyof TextStyle>(
  originalStyle: TextStyle,
  newStyle: TextStyle,
  key: K,
  expectedValue: TextStyle[K]
): boolean {
  // 目标属性应该是期望值
  if (newStyle[key] !== expectedValue) {
    return false;
  }

  // 其他属性应该保持不变
  for (const k of Object.keys(originalStyle) as (keyof TextStyle)[]) {
    if (k !== key && newStyle[k] !== originalStyle[k]) {
      return false;
    }
  }

  return true;
}

/**
 * 验证格式化切换
 */
export function verifyFormattingToggle(
  originalStyle: TextStyle,
  toggledStyle: TextStyle,
  property: 'fontWeight' | 'fontStyle' | 'textDecoration'
): boolean {
  switch (property) {
    case 'fontWeight':
      return (
        (originalStyle.fontWeight === 'bold' && toggledStyle.fontWeight === 'normal') ||
        (originalStyle.fontWeight === 'normal' && toggledStyle.fontWeight === 'bold')
      );
    case 'fontStyle':
      return (
        (originalStyle.fontStyle === 'italic' && toggledStyle.fontStyle === 'normal') ||
        (originalStyle.fontStyle === 'normal' && toggledStyle.fontStyle === 'italic')
      );
    case 'textDecoration':
      return (
        (originalStyle.textDecoration === 'underline' && toggledStyle.textDecoration === 'none') ||
        (originalStyle.textDecoration === 'none' && toggledStyle.textDecoration === 'underline')
      );
  }
}

/**
 * 创建默认样式
 */
export function createDefaultStyle(): TextStyle {
  return { ...DEFAULT_TEXT_STYLE };
}

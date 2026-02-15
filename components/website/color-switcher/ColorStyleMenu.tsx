'use client';

import React, { useState, useEffect } from 'react';
import { colorStyles } from '@/lib/website/color-system';
import { Palette } from 'lucide-react';

type ColorStyle = keyof typeof colorStyles;

interface ColorStyleMenuProps {
  onStyleChange?: (style: ColorStyle) => void;
  defaultStyle?: ColorStyle;
}

export const ColorStyleMenu: React.FC<ColorStyleMenuProps> = ({
  onStyleChange,
  defaultStyle = 'website-default',
}) => {
  const [currentStyle, setCurrentStyle] = useState<ColorStyle>(defaultStyle);
  const [isOpen, setIsOpen] = useState(false);

  const styles: { id: ColorStyle; name: string; description: string }[] = [
    { id: 'website-default', name: '官网默认', description: '深蓝 + 橙色' },
    { id: 'deep-blue', name: '深蓝增强', description: '高对比度' },
    { id: 'bright-blue', name: '亮蓝活力', description: '现代感' },
    { id: 'fresh-green', name: '绿色清新', description: '生态友好' },
    { id: 'elegant-purple', name: '紫色优雅', description: '高端感' },
    { id: 'vibrant-red', name: '红色热烈', description: '吸引注意' },
    { id: 'tech-cyan', name: '青色科技', description: '科技感' },
  ];

  useEffect(() => {
    // 从 localStorage 读取保存的风格
    const saved = localStorage.getItem('website-color-style') as ColorStyle;
    if (saved && saved in colorStyles) {
      setCurrentStyle(saved);
      applyStyle(saved);
    } else {
      applyStyle(defaultStyle);
    }
  }, []);

  const applyStyle = (style: ColorStyle) => {
    const palette = colorStyles[style];
    const root = document.documentElement;

    // 应用主色调
    Object.entries(palette.primary).forEach(([key, value]) => {
      root.style.setProperty(`--color-primary-${key}`, value);
    });

    // 应用次色调
    Object.entries(palette.secondary).forEach(([key, value]) => {
      root.style.setProperty(`--color-secondary-${key}`, value);
    });

    // 应用强调色
    Object.entries(palette.accent).forEach(([key, value]) => {
      root.style.setProperty(`--color-accent-${key}`, value);
    });

    // 应用中性色
    Object.entries(palette.neutral).forEach(([key, value]) => {
      root.style.setProperty(`--color-neutral-${key}`, value);
    });

    // 应用状态色
    root.style.setProperty('--color-success', palette.success);
    root.style.setProperty('--color-warning', palette.warning);
    root.style.setProperty('--color-error', palette.error);
    root.style.setProperty('--color-info', palette.info);

    // 应用背景色
    root.style.setProperty('--color-bg-light', palette.background.light);
    root.style.setProperty('--color-bg-dark', palette.background.dark);
    root.style.setProperty('--color-bg-darker', palette.background.darker);

    // 应用文本色
    root.style.setProperty('--color-text-primary', palette.text.primary);
    root.style.setProperty('--color-text-secondary', palette.text.secondary);
    root.style.setProperty('--color-text-tertiary', palette.text.tertiary);
    root.style.setProperty('--color-text-light', palette.text.light);

    // 应用边框色
    root.style.setProperty('--color-border-light', palette.border.light);
    root.style.setProperty('--color-border-medium', palette.border.medium);
    root.style.setProperty('--color-border-dark', palette.border.dark);
  };

  const handleStyleChange = (style: ColorStyle) => {
    setCurrentStyle(style);
    applyStyle(style);
    localStorage.setItem('website-color-style', style);
    onStyleChange?.(style);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* 菜单按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-gray-100"
        title="切换颜色风格"
        aria-label="颜色风格菜单"
        aria-expanded={isOpen}
      >
        <Palette size={18} />
        <span className="hidden sm:inline">风格</span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">选择颜色风格</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => handleStyleChange(style.id)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                  currentStyle === style.id
                    ? 'bg-primary-50 border-l-4 border-primary-500'
                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                }`}
              >
                {/* 颜色预览 */}
                <div className="flex gap-1">
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: colorStyles[style.id].primary[500],
                    }}
                  />
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: colorStyles[style.id].secondary[500],
                    }}
                  />
                  <div
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: colorStyles[style.id].accent[500],
                    }}
                  />
                </div>

                {/* 风格信息 */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {style.name}
                  </div>
                  <div className="text-xs text-gray-500">{style.description}</div>
                </div>

                {/* 选中指示 */}
                {currentStyle === style.id && (
                  <div className="text-primary-500">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 点击外部关闭菜单 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ColorStyleMenu;

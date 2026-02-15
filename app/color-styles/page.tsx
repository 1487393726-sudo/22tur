'use client';

import React, { useState } from 'react';
import { colorStyles } from '@/lib/website/color-system';

type ColorStyle = keyof typeof colorStyles;

export default function ColorStylesPage() {
  const [selectedStyle, setSelectedStyle] = useState<ColorStyle>('website-default');
  const palette = colorStyles[selectedStyle];

  const styles: { id: ColorStyle; name: string; description: string }[] = [
    { id: 'website-default', name: '官网默认', description: '深蓝 + 橙色' },
    { id: 'deep-blue', name: '深蓝增强', description: '更深的蓝色系' },
    { id: 'bright-blue', name: '蓝色活力', description: '亮蓝 + 橙色' },
    { id: 'fresh-green', name: '绿色清新', description: '绿色 + 橙色' },
    { id: 'elegant-purple', name: '紫色优雅', description: '紫色 + 橙色' },
    { id: 'vibrant-red', name: '红色热烈', description: '红色 + 橙色' },
    { id: 'tech-cyan', name: '青色科技', description: '青色 + 橙色' },
    { id: 'bw-light', name: '黑白浅色', description: '极简浅色' },
    { id: 'bw-dark', name: '黑白深色', description: '极简深色' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            官网颜色风格展示
          </h1>
          <p className="text-lg text-gray-600">
            选择适合你的颜色风格，打造独特的品牌形象
          </p>
        </div>

        {/* 风格选择器 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {styles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedStyle === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: colorStyles[style.id].primary[500],
                  }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: colorStyles[style.id].secondary[500],
                  }}
                />
                <div
                  className="w-8 h-8 rounded"
                  style={{
                    backgroundColor: colorStyles[style.id].accent[500],
                  }}
                />
              </div>
              <h3 className="font-semibold text-gray-900">{style.name}</h3>
              <p className="text-sm text-gray-600">{style.description}</p>
            </button>
          ))}
        </div>

        {/* 颜色展示 */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            {styles.find((s) => s.id === selectedStyle)?.name} - 颜色详情
          </h2>

          {/* 主色调 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">主色调</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Object.entries(palette.primary).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-16 rounded mb-2 border border-gray-200"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-xs text-gray-600">{key}</span>
                  <span className="text-xs text-gray-500 block">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 次色调 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">次色调</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Object.entries(palette.secondary).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-16 rounded mb-2 border border-gray-200"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-xs text-gray-600">{key}</span>
                  <span className="text-xs text-gray-500 block">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 强调色 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">强调色</h3>
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {Object.entries(palette.accent).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div
                    className="w-full h-16 rounded mb-2 border border-gray-200"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-xs text-gray-600">{key}</span>
                  <span className="text-xs text-gray-500 block">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 状态色 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">状态色</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.success }}
                />
                <span className="text-sm font-medium text-gray-900">成功</span>
                <span className="text-xs text-gray-500 block">
                  {palette.success}
                </span>
              </div>
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.warning }}
                />
                <span className="text-sm font-medium text-gray-900">警告</span>
                <span className="text-xs text-gray-500 block">
                  {palette.warning}
                </span>
              </div>
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.error }}
                />
                <span className="text-sm font-medium text-gray-900">错误</span>
                <span className="text-xs text-gray-500 block">
                  {palette.error}
                </span>
              </div>
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.info }}
                />
                <span className="text-sm font-medium text-gray-900">信息</span>
                <span className="text-xs text-gray-500 block">
                  {palette.info}
                </span>
              </div>
            </div>
          </div>

          {/* 背景色 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">背景色</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.background.light }}
                />
                <span className="text-sm font-medium text-gray-900">浅色</span>
                <span className="text-xs text-gray-500 block">
                  {palette.background.light}
                </span>
              </div>
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.background.dark }}
                />
                <span className="text-sm font-medium text-gray-900">深色</span>
                <span className="text-xs text-gray-500 block">
                  {palette.background.dark}
                </span>
              </div>
              <div>
                <div
                  className="w-full h-20 rounded mb-2 border border-gray-200"
                  style={{ backgroundColor: palette.background.darker }}
                />
                <span className="text-sm font-medium text-gray-900">
                  更深色
                </span>
                <span className="text-xs text-gray-500 block">
                  {palette.background.darker}
                </span>
              </div>
            </div>
          </div>

          {/* 文本色 */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">文本色</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div
                className="p-4 rounded border border-gray-200"
                style={{ backgroundColor: palette.background.light }}
              >
                <p
                  style={{ color: palette.text.primary }}
                  className="font-medium mb-2"
                >
                  主文本
                </p>
                <span className="text-xs text-gray-500 block">
                  {palette.text.primary}
                </span>
              </div>
              <div
                className="p-4 rounded border border-gray-200"
                style={{ backgroundColor: palette.background.light }}
              >
                <p
                  style={{ color: palette.text.secondary }}
                  className="font-medium mb-2"
                >
                  次文本
                </p>
                <span className="text-xs text-gray-500 block">
                  {palette.text.secondary}
                </span>
              </div>
              <div
                className="p-4 rounded border border-gray-200"
                style={{ backgroundColor: palette.background.light }}
              >
                <p
                  style={{ color: palette.text.tertiary }}
                  className="font-medium mb-2"
                >
                  三级文本
                </p>
                <span className="text-xs text-gray-500 block">
                  {palette.text.tertiary}
                </span>
              </div>
              <div
                className="p-4 rounded border border-gray-200"
                style={{ backgroundColor: palette.primary[900] }}
              >
                <p
                  style={{ color: palette.text.light }}
                  className="font-medium mb-2"
                >
                  浅色文本
                </p>
                <span className="text-xs block" style={{ color: palette.text.light, opacity: 0.7 }}>
                  {palette.text.light}
                </span>
              </div>
            </div>
          </div>

          {/* 边框色 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">边框色</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-4 rounded border-2"
                style={{ borderColor: palette.border.light }}
              >
                <span className="text-sm font-medium text-gray-900 block mb-2">
                  浅色边框
                </span>
                <span className="text-xs text-gray-500 block">
                  {palette.border.light}
                </span>
              </div>
              <div
                className="p-4 rounded border-2"
                style={{ borderColor: palette.border.medium }}
              >
                <span className="text-sm font-medium text-gray-900 block mb-2">
                  中等边框
                </span>
                <span className="text-xs text-gray-500 block">
                  {palette.border.medium}
                </span>
              </div>
              <div
                className="p-4 rounded border-2"
                style={{ borderColor: palette.border.dark }}
              >
                <span className="text-sm font-medium text-gray-900 block mb-2">
                  深色边框
                </span>
                <span className="text-xs text-gray-500 block">
                  {palette.border.dark}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 组件示例 */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">组件示例</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 按钮 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">按钮</h3>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-2 rounded text-white font-medium transition-colors"
                  style={{
                    backgroundColor: palette.primary[500],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      palette.primary[600];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      palette.primary[500];
                  }}
                >
                  主按钮
                </button>
                <button
                  className="w-full px-4 py-2 rounded text-white font-medium transition-colors"
                  style={{
                    backgroundColor: palette.secondary[500],
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      palette.secondary[600];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      palette.secondary[500];
                  }}
                >
                  次按钮
                </button>
                <button
                  className="w-full px-4 py-2 rounded font-medium transition-colors"
                  style={{
                    backgroundColor: palette.background.light,
                    color: palette.primary[500],
                    border: `1px solid ${palette.primary[500]}`,
                  }}
                >
                  轮廓按钮
                </button>
              </div>
            </div>

            {/* 卡片 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">卡片</h3>
              <div
                className="p-4 rounded-lg border"
                style={{
                  backgroundColor: palette.background.light,
                  borderColor: palette.border.light,
                }}
              >
                <h4
                  className="font-semibold mb-2"
                  style={{ color: palette.text.primary }}
                >
                  卡片标题
                </h4>
                <p
                  className="text-sm"
                  style={{ color: palette.text.secondary }}
                >
                  这是一个示例卡片，展示了颜色风格的应用。
                </p>
              </div>
            </div>

            {/* 标签 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">标签</h3>
              <div className="flex flex-wrap gap-2">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: palette.primary[100],
                    color: palette.primary[700],
                  }}
                >
                  主标签
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: palette.secondary[100],
                    color: palette.secondary[700],
                  }}
                >
                  次标签
                </span>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                  }}
                >
                  成功
                </span>
              </div>
            </div>

            {/* 输入框 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                输入框
              </h3>
              <input
                type="text"
                placeholder="输入框示例"
                className="w-full px-4 py-2 rounded border"
                style={{
                  backgroundColor: palette.background.light,
                  borderColor: palette.border.light,
                  color: palette.text.primary,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

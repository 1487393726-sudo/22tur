'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Tablet, Smartphone, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductPreviewProps, ViewportType } from '@/types/editor';
import { VIEWPORT_SIZES } from '@/types/editor';
import type { Equipment } from '@/types/marketplace';

// ============================================
// ProductPreview 组件
// ============================================

export function ProductPreview({ product, viewport }: ProductPreviewProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const containerWidth = VIEWPORT_SIZES[viewport];

  const images = product.images.length > 0 ? product.images : ['/placeholder.jpg'];

  const handlePrevImage = () => {
    setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const specs = Object.entries(product.specifications || {});

  return (
    <div
      className="mx-auto bg-background border rounded-lg overflow-hidden transition-all duration-300"
      style={{ maxWidth: `${containerWidth}px` }}
    >
      <div className={`p-4 ${viewport === 'mobile' ? 'space-y-4' : 'grid grid-cols-2 gap-6'}`}>
        {/* 图片区域 */}
        <div className="space-y-4">
          {/* 主图 */}
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
            <img
              src={images[currentImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            
            {images.length > 1 && (
              <>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handlePrevImage}
                  aria-label="上一张"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleNextImage}
                  aria-label="下一张"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {/* 缩略图 */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`
                    relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors
                    ${currentImageIndex === index ? 'border-primary' : 'border-transparent hover:border-muted-foreground/50'}
                  `}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 产品信息 */}
        <div className="space-y-4">
          {/* 标题和品牌 */}
          <div>
            {product.brand && (
              <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            )}
            <h1 className={`font-bold ${viewport === 'mobile' ? 'text-xl' : 'text-2xl'}`}>
              {product.name}
            </h1>
            {product.nameEn && (
              <p className="text-muted-foreground">{product.nameEn}</p>
            )}
          </div>

          {/* 价格 */}
          <div className="flex items-baseline gap-2">
            <span className={`font-bold text-primary ${viewport === 'mobile' ? 'text-2xl' : 'text-3xl'}`}>
              ¥{product.price.toFixed(2)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-muted-foreground line-through">
                ¥{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {product.featured && (
              <Badge variant="default">推荐</Badge>
            )}
            <Badge variant="outline">{getPriceTierLabel(product.priceTier)}</Badge>
            {product.targetSegments.map((segment) => (
              <Badge key={segment} variant="secondary">
                {getSegmentLabel(segment)}
              </Badge>
            ))}
          </div>

          {/* 库存状态 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">库存:</span>
            <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
              {product.stock > 0 ? `${product.stock} 件` : '缺货'}
            </span>
          </div>

          {/* 描述 */}
          {product.description && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">产品描述</h3>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">
                {product.description}
              </p>
            </div>
          )}

          {/* 规格 */}
          {specs.length > 0 && (
            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">产品规格</h3>
              <div className="space-y-2">
                {specs.map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{key}</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className={`pt-4 ${viewport === 'mobile' ? 'space-y-2' : 'flex gap-2'}`}>
            <Button className={viewport === 'mobile' ? 'w-full' : 'flex-1'}>
              加入购物车
            </Button>
            <Button variant="outline" className={viewport === 'mobile' ? 'w-full' : 'flex-1'}>
              立即购买
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 预览容器组件（带视口切换）
// ============================================

interface ProductPreviewContainerProps {
  product: Equipment;
  onClose?: () => void;
}

export function ProductPreviewContainer({ product, onClose }: ProductPreviewContainerProps) {
  const [viewport, setViewport] = useState<ViewportType>('desktop');

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex items-center justify-between">
        <Tabs value={viewport} onValueChange={(v) => setViewport(v as ViewportType)}>
          <TabsList>
            <TabsTrigger value="desktop" className="flex items-center gap-1">
              <Monitor className="w-4 h-4" />
              桌面
            </TabsTrigger>
            <TabsTrigger value="tablet" className="flex items-center gap-1">
              <Tablet className="w-4 h-4" />
              平板
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              手机
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {onClose && (
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* 视口尺寸提示 */}
      <p className="text-sm text-muted-foreground text-center">
        预览宽度: {VIEWPORT_SIZES[viewport]}px
      </p>

      {/* 预览区域 */}
      <div className="bg-muted/50 p-4 rounded-lg overflow-auto">
        <ProductPreview product={product} viewport={viewport} />
      </div>
    </div>
  );
}

// ============================================
// 工具函数
// ============================================

function getPriceTierLabel(tier: string): string {
  const labels: Record<string, string> = {
    ENTRY: '入门级',
    MID: '中端',
    HIGH: '高端',
  };
  return labels[tier] || tier;
}

function getSegmentLabel(segment: string): string {
  const labels: Record<string, string> = {
    PERSONAL: '个人',
    PROFESSIONAL: '专业',
    ENTERPRISE: '企业',
  };
  return labels[segment] || segment;
}

// ============================================
// 属性测试工具函数
// ============================================

/**
 * 验证预览包含所有产品数据
 */
export function verifyPreviewContainsProductData(
  product: Equipment,
  renderedContent: string
): boolean {
  // 检查名称
  if (!renderedContent.includes(product.name)) {
    return false;
  }

  // 检查价格
  if (!renderedContent.includes(product.price.toString())) {
    return false;
  }

  // 检查非空规格
  for (const [key, value] of Object.entries(product.specifications || {})) {
    if (value && !renderedContent.includes(value)) {
      return false;
    }
  }

  return true;
}

/**
 * 获取视口宽度
 */
export function getViewportWidth(viewport: ViewportType): number {
  return VIEWPORT_SIZES[viewport];
}

/**
 * 验证视口尺寸应用
 */
export function verifyViewportSize(
  viewport: ViewportType,
  containerWidth: number
): boolean {
  return containerWidth === VIEWPORT_SIZES[viewport];
}

/**
 * 验证预览模式状态保持
 */
export function verifyStatePreservation<T extends object>(
  originalState: T,
  restoredState: T
): boolean {
  return JSON.stringify(originalState) === JSON.stringify(restoredState);
}

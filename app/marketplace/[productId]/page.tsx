'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageGallery } from '@/components/marketplace/ImageGallery';
import { SpecificationTable } from '@/components/marketplace/SpecificationTable';
import { CartProvider, useCart } from '@/components/marketplace/CartContext';
import { CompareProvider, useCompare } from '@/components/marketplace/CompareContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShoppingCart,
  GitCompare,
  ChevronLeft,
  Minus,
  Plus,
  Star,
  Truck,
  Shield,
  Package,
} from 'lucide-react';
import type { Equipment } from '@/types/marketplace';

const priceTierLabels: Record<string, string> = {
  ENTRY: '入门级',
  MID: '中端',
  HIGH: '高端',
};

function ProductDetailContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  
  const [product, setProduct] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const { addItem } = useCart();
  const { addItem: addToCompare, isInCompare, canAdd } = useCompare();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/marketplace/products/${productId}`);
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        setProduct(data);
      } catch {
        router.push('/marketplace');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted animate-pulse rounded-xl" />
          <div className="space-y-4">
            <div className="h-8 bg-muted animate-pulse rounded w-3/4" />
            <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
            <div className="h-10 bg-muted animate-pulse rounded w-1/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, 'EQUIPMENT', quantity);
  };

  const handleAddToCompare = () => {
    addToCompare(product);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Link href="/marketplace" className="text-xl font-bold">
              🎬 直播设备市场
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* 图片区域 */}
          <ImageGallery images={product.images} alt={product.name} />

          {/* 产品信息 */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{priceTierLabels[product.priceTier]}</Badge>
                {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
                {product.featured && <Badge className="bg-orange-500">精选</Badge>}
              </div>
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              {product.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-muted-foreground">({product.reviewCount} 评价)</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">¥{product.price}</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    ¥{product.originalPrice}
                  </span>
                  <Badge className="bg-red-500">-{discount}%</Badge>
                </>
              )}
            </div>

            <Separator />

            {/* 库存状态 */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                {product.stock > 0 ? `库存充足 (${product.stock}件)` : '暂时缺货'}
              </span>
            </div>

            {/* 数量选择 */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">数量</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                加入购物车
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleAddToCompare}
                disabled={isInCompare(product.id) || !canAdd}
              >
                <GitCompare className="h-5 w-5" />
              </Button>
            </div>

            {/* 服务保障 */}
            <div className="flex gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Truck className="h-4 w-4" />
                <span>全国包邮</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span>正品保障</span>
              </div>
            </div>

            <Separator />

            {/* 产品描述 */}
            {product.description && (
              <div>
                <h3 className="font-semibold mb-2">产品描述</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* 规格参数 */}
            <div>
              <h3 className="font-semibold mb-3">规格参数</h3>
              <SpecificationTable specifications={product.specifications} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <CartProvider>
      <CompareProvider>
        <ProductDetailContent />
      </CompareProvider>
    </CartProvider>
  );
}

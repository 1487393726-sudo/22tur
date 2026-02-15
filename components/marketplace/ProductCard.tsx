'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, GitCompare, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from './CartContext';
import { useCompare } from './CompareContext';
import type { Equipment } from '@/types/marketplace';

interface ProductCardProps {
  product: Equipment;
}

const priceTierLabels: Record<string, string> = {
  ENTRY: '入门级',
  MID: '中端',
  HIGH: '高端',
};

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { addItem: addToCompare, isInCompare, canAdd } = useCompare();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 'EQUIPMENT', 1);
  };

  const handleAddToCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCompare(product);
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  return (
    <Link href={`/marketplace/${product.id}`}>
      <div className="group bg-card rounded-xl border overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-square bg-muted">
          <Image
            src={product.images[0] || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-orange-500">精选</Badge>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500">-{discount}%</Badge>
          )}
          <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={handleAddToCompare}
              disabled={isInCompare(product.id) || !canAdd}
            >
              <GitCompare className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {priceTierLabels[product.priceTier] || product.priceTier}
            </Badge>
            {product.brand && (
              <span className="text-xs text-muted-foreground">{product.brand}</span>
            )}
          </div>
          <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs">{product.rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
            </div>
          )}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">¥{product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ¥{product.originalPrice}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            库存: {product.stock > 0 ? product.stock : '缺货'}
          </div>
        </div>
      </div>
    </Link>
  );
}

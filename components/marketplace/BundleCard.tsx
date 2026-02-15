'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Package, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from './CartContext';
import type { EquipmentBundle, BundleItem } from '@/types/marketplace';

interface BundleCardProps {
  bundle: EquipmentBundle & { items?: BundleItem[] };
}

const segmentLabels: Record<string, string> = {
  PERSONAL: '个人用户',
  PROFESSIONAL: '行业用户',
  ENTERPRISE: '企业用户',
};

export function BundleCard({ bundle }: BundleCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(bundle, 'BUNDLE', 1);
  };

  const savings = bundle.originalPrice - bundle.price;
  const savingsPercent = Math.round((savings / bundle.originalPrice) * 100);

  return (
    <Link href={`/marketplace/bundle/${bundle.id}`}>
      <div className="group bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20 overflow-hidden hover:shadow-xl hover:border-primary/40 transition-all">
        <div className="relative aspect-video bg-muted">
          <Image
            src={bundle.images[0] || '/placeholder.jpg'}
            alt={bundle.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge className="bg-primary mb-2">{segmentLabels[bundle.targetSegment]}</Badge>
            <h3 className="text-white font-bold text-lg">{bundle.name}</h3>
          </div>
          {bundle.featured && (
            <Badge className="absolute top-2 right-2 bg-orange-500">热门套餐</Badge>
          )}
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {bundle.description}
          </p>
          
          {bundle.items && bundle.items.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium mb-2 flex items-center gap-1">
                <Package className="h-3 w-3" />
                包含 {bundle.items.length} 件设备
              </div>
              <div className="space-y-1">
                {bundle.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="h-3 w-3 text-green-500" />
                    <span>{item.equipment?.name}</span>
                    {item.quantity > 1 && <span>x{item.quantity}</span>}
                  </div>
                ))}
                {bundle.items.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{bundle.items.length - 3} 件更多...
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-primary">¥{bundle.price}</span>
                <span className="text-sm text-muted-foreground line-through">
                  ¥{bundle.originalPrice}
                </span>
              </div>
              <div className="text-xs text-green-600 font-medium">
                省 ¥{savings} ({savingsPercent}% off)
              </div>
            </div>
            <Button size="sm" onClick={handleAddToCart}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              加入购物车
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

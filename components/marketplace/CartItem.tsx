'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type MarketplaceCartItem } from './CartContext';

interface CartItemProps {
  item: MarketplaceCartItem;
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const productUrl = item.productType === 'EQUIPMENT'
    ? `/marketplace/${item.productId}`
    : `/marketplace/bundle/${item.productId}`;

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      <Link href={productUrl} className="flex-shrink-0">
        <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden">
          <Image
            src={item.product.images?.[0] || '/placeholder.jpg'}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        </div>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link href={productUrl}>
          <h4 className="font-medium line-clamp-2 hover:text-primary transition-colors">
            {item.product.name}
          </h4>
        </Link>
        <div className="text-sm text-muted-foreground mt-1">
          {item.productType === 'BUNDLE' ? '套餐' : '单品'}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-primary">¥{item.product.price}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => removeItem(item.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompare } from './CompareContext';
import { useCart } from './CartContext';
import { cn } from '@/lib/utils';
import type { Equipment } from '@/types/marketplace';

export function CompareTable() {
  const { items, removeItem } = useCompare();
  const { addItem } = useCart();

  if (items.length === 0) {
    return null;
  }

  // 收集所有规格参数的键
  const allSpecKeys = new Set<string>();
  items.forEach((item) => {
    Object.keys(item.specifications || {}).forEach((key) => allSpecKeys.add(key));
  });
  const specKeys = Array.from(allSpecKeys);

  // 检查某个规格值是否与其他产品不同
  const isDifferent = (key: string, value: string) => {
    const values = items.map((item) => item.specifications?.[key] || '-');
    const uniqueValues = new Set(values);
    return uniqueValues.size > 1;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-4 text-left bg-muted/50 border-b w-40">产品</th>
            {items.map((item) => (
              <th key={item.id} className="p-4 border-b min-w-[200px]">
                <div className="relative">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                    title="移除对比"
                    aria-label="移除对比"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  <Link href={`/marketplace/${item.id}`}>
                    <div className="relative w-32 h-32 mx-auto mb-3 bg-muted rounded-lg overflow-hidden">
                      <Image
                        src={item.images[0] || '/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-sm line-clamp-2 hover:text-primary">
                      {item.name}
                    </h3>
                  </Link>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* 价格 */}
          <tr>
            <td className="p-4 bg-muted/50 border-b font-medium">价格</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b text-center">
                <span className="text-lg font-bold text-primary">¥{item.price}</span>
                {item.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through ml-2">
                    ¥{item.originalPrice}
                  </span>
                )}
              </td>
            ))}
          </tr>

          {/* 品牌 */}
          <tr>
            <td className="p-4 bg-muted/50 border-b font-medium">品牌</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b text-center">
                {item.brand || '-'}
              </td>
            ))}
          </tr>

          {/* 价格档次 */}
          <tr>
            <td className="p-4 bg-muted/50 border-b font-medium">档次</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b text-center">
                {item.priceTier === 'ENTRY' ? '入门级' : item.priceTier === 'MID' ? '中端' : '高端'}
              </td>
            ))}
          </tr>

          {/* 库存 */}
          <tr>
            <td className="p-4 bg-muted/50 border-b font-medium">库存</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 border-b text-center">
                <span className={item.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                  {item.stock > 0 ? `${item.stock} 件` : '缺货'}
                </span>
              </td>
            ))}
          </tr>

          {/* 规格参数 */}
          {specKeys.map((key) => (
            <tr key={key}>
              <td className="p-4 bg-muted/50 border-b font-medium">{key}</td>
              {items.map((item) => {
                const value = item.specifications?.[key] || '-';
                const different = isDifferent(key, value);
                return (
                  <td
                    key={item.id}
                    className={cn(
                      'p-4 border-b text-center',
                      different && 'bg-yellow-50 dark:bg-yellow-900/20'
                    )}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}

          {/* 操作 */}
          <tr>
            <td className="p-4 bg-muted/50 font-medium">操作</td>
            {items.map((item) => (
              <td key={item.id} className="p-4 text-center">
                <Button
                  size="sm"
                  onClick={() => addItem(item, 'EQUIPMENT', 1)}
                  disabled={item.stock === 0}
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  加入购物车
                </Button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

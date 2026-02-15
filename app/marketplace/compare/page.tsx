'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartProvider } from '@/components/marketplace/CartContext';
import { CompareProvider, useCompare, MAX_COMPARE_ITEMS } from '@/components/marketplace/CompareContext';
import { CompareTable } from '@/components/marketplace/CompareTable';
import { Button } from '@/components/ui/button';
import { ChevronLeft, GitCompare, Trash2 } from 'lucide-react';

function CompareContent() {
  const router = useRouter();
  const { items, itemCount, clearAll } = useCompare();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">产品对比</h1>
              <span className="text-muted-foreground">
                ({itemCount}/{MAX_COMPARE_ITEMS})
              </span>
            </div>
            {itemCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清空对比
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {items.length === 0 ? (
          <div className="text-center py-16">
            <GitCompare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">暂无对比产品</h2>
            <p className="text-muted-foreground mb-6">
              最多可添加 {MAX_COMPARE_ITEMS} 个产品进行对比
            </p>
            <Link href="/marketplace">
              <Button>去选择产品</Button>
            </Link>
          </div>
        ) : (
          <div className="bg-card rounded-xl border overflow-hidden">
            <CompareTable />
          </div>
        )}
      </main>
    </div>
  );
}

export default function ComparePage() {
  return (
    <CartProvider>
      <CompareProvider>
        <CompareContent />
      </CompareProvider>
    </CartProvider>
  );
}

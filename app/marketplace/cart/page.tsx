'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartProvider, useCart } from '@/components/marketplace/CartContext';
import { CartItemComponent } from '@/components/marketplace/CartItem';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ShoppingCart, Trash2 } from 'lucide-react';

function CartContent() {
  const router = useRouter();
  const { items, itemCount, subtotal, total, clearCart, isLoading } = useCart();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 py-4">
                <div className="w-20 h-20 bg-muted animate-pulse rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="purple-gradient-title text-xl font-bold">购物车</h1>
            <span className="text-muted-foreground">({itemCount} 件商品)</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {items.length === 0  (
            <div className="text-center py-16">
              <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="purple-gradient-title text-xl font-semibold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Add items to get started</p>
              <Link href="/marketplace">
                <Button className="purple-gradient-button">Continue Shopping</Button>
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* ?*/}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="purple-gradient-title font-semibold">Items in Cart</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={clearCart}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Clear Cart
                    </Button>
                  </div>
                  <div className="divide-y">
                    {items.map((item) => (
                      <CartItemComponent key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/*  */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-xl border p-4 sticky top-24">
                  <h2 className="purple-gradient-title font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-primary">{total.toFixed(2)}</span>
                    </div>
                  </div>
                  <Link href="/marketplace/checkout" className="block mt-6">
                    <Button className="purple-gradient-button w-full" size="lg">
                      Proceed to Checkout
                    </Button>
                  </Link>
                  <Link href="/marketplace" className="block mt-3">
                    <Button variant="outline" className="w-full">
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartProvider>
      <CartContent />
    </CartProvider>
  );
}

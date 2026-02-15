'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CartProvider, useCart } from '@/components/marketplace/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronLeft, CreditCard, Smartphone, Building2, Loader2 } from 'lucide-react';
import type { ShippingAddress } from '@/types/marketplace';

function CheckoutContent() {
  const router = useRouter();
  const { items, subtotal, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('ALIPAY');
  const [address, setAddress] = useState<ShippingAddress>({
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    address: '',
    postalCode: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.name || !address.phone || !address.address) {
      alert('');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/marketplace/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user', // 
          shippingAddress: address,
          paymentMethod,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        clearCart();
        router.push(`/marketplace/orders/${data.order.id}?success=true`);
      } else {
        alert(data.message || '');
      }
    } catch {
      alert('');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="purple-gradient-page purple-gradient-content min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="purple-gradient-title text-xl font-semibold mb-2">Your cart is empty</h2>
          <Link href="/marketplace">
            <Button className="purple-gradient-button">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="purple-gradient-title text-xl font-bold"></h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/*  */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="purple-gradient-title font-semibold mb-4"></h2>
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={address.name}
                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        placeholder="1234567890"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="province"></Label>
                      <Input
                        id="province"
                        value={address.province}
                        onChange={(e) => setAddress({ ...address, province: e.target.value })}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <Label htmlFor="city"></Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        placeholder=""
                      />
                    </div>
                    <div>
                      <Label htmlFor="district"></Label>
                      <Input
                        id="district"
                        value={address.district}
                        onChange={(e) => setAddress({ ...address, district: e.target.value })}
                        placeholder=""
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address"></Label>
                    <Input
                      id="address"
                      value={address.address}
                      onChange={(e) => setAddress({ ...address, address: e.target.value })}
                      placeholder=""
                      required
                    />
                  </div>
                </div>
              </div>

              {/*  */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="purple-gradient-title font-semibold mb-4"></h2>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value="ALIPAY" id="alipay" />
                    <Label htmlFor="alipay" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-5 w-5 text-blue-500" />
                      Alipay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg mt-2">
                    <RadioGroupItem value="WECHAT" id="wechat" />
                    <Label htmlFor="wechat" className="flex items-center gap-2 cursor-pointer">
                      <Smartphone className="h-5 w-5 text-green-500" />
                      WeChat Pay
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg mt-2">
                    <RadioGroupItem value="BANK" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="h-5 w-5" />
                      Bank Transfer
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border rounded-lg mt-2">
                    <RadioGroupItem value="CREDIT_CARD" id="card" />
                    <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="h-5 w-5" />
                      Credit Card
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/*  */}
              <div className="bg-card rounded-xl border p-6">
                <h2 className="purple-gradient-title font-semibold mb-4"> ({items.length})</h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.product.name} x {item.quantity}
                      </span>
                      <span>{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/*  */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl border p-6 sticky top-24">
                <h2 className="purple-gradient-title font-semibold mb-4"></h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">小计</span>
                    <span>¥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">优惠</span>
                    <span className="text-green-600">-¥{discount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>总计</span>
                    <span className="text-primary">¥{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button type="submit" className="purple-gradient-button w-full mt-6" size="lg" disabled={loading}>
                  {loading  (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <CheckoutContent />
    </CartProvider>
  );
}

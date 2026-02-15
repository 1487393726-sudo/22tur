"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { PageHeader } from "@/components/dashboard/page-header";
import { formatAmount } from "@/lib/dashboard-utils";
import { useDashboardTranslations } from "@/lib/i18n/use-dashboard-translations";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { t, isRTL } = useDashboardTranslations();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCheckout = () => {
    router.push("/client/checkout");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        <PageHeader title={t('cart.title')} description={t('cart.description')} icon="🛒" />
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      <PageHeader
        title={t('cart.title')}
        description={t('cart.description')}
        icon="🛒"
        actions={
          <Link href="/pricing">
            <Button variant="outline">{t('overview.browseServices')}</Button>
          </Link>
        }
      />

      {items.length === 0 ? (
        <Card className="purple-gradient-card">
          <CardContent className="flex flex-col items-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('cart.empty.title')}</h2>
            <p className="text-muted-foreground mb-6">{t('cart.empty.description')}</p>
            <Link href="/pricing">
              <Button className="bg-primary text-primary-foreground gap-2">
                {t('overview.browseServices')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.serviceName}</h3>
                      <p className="text-sm text-muted-foreground">{item.serviceNameEn}</p>
                      {item.note && (
                        <p className="text-sm text-muted-foreground mt-2">{t('cart.note')}: {item.note}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        title={t('cart.decrease')}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        title={t('cart.increase')}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{formatAmount(item.unitPrice * item.quantity)}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatAmount(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
              {t('cart.clearCart')}
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 purple-gradient-card">
              <CardHeader>
                <CardTitle>{t('cart.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('cart.itemCount')}</span>
                    <span>{items.length} {t('cart.items')}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t('cart.subtotal')}</span>
                    <span>{formatAmount(getTotal())}</span>
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>{t('cart.total')}</span>
                      <span className="text-primary">{formatAmount(getTotal())}</span>
                    </div>
                  </div>
                </div>

                <Button onClick={handleCheckout} className="bg-primary text-primary-foreground w-full" size="lg">
                  {t('cart.checkout')}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  {t('cart.checkoutNote')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

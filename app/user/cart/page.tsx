'use client';

import React, { useState } from 'react';
import { UserPortalLayout } from '@/components/user-portal/UserPortalLayout';
import { ShoppingCart } from '@/components/user-portal/ShoppingCart';
import { CheckoutForm } from '@/components/user-portal/CheckoutForm';
import { CouponManager } from '@/components/user-portal/CouponManager';
import { ShoppingCart as ShoppingCartType, Coupon, CheckoutData } from '@/lib/user-portal/shopping-types';
import { Address } from '@/lib/user-portal/order-types';

// Mock data
const mockCart: ShoppingCartType = {
  id: 'cart-1',
  userId: 'user-1',
  items: [
    {
      id: 'item-1',
      productId: 'prod-1',
      productName: '高级商务笔记本',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      quantity: 1,
      price: 299.99,
      stock: 10,
      addedAt: new Date('2024-01-20'),
    },
    {
      id: 'item-2',
      productId: 'prod-2',
      productName: '无线蓝牙耳机',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
      quantity: 2,
      price: 149.99,
      stock: 20,
      addedAt: new Date('2024-01-21'),
    },
  ],
  totalPrice: 599.97,
  discount: 0,
  finalPrice: 599.97,
  updatedAt: new Date(),
};

const mockAddresses: Address[] = [
  {
    id: 'addr-1',
    type: 'home',
    recipient: '张三',
    phone: '13800138000',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '某某街道1号',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'work',
    recipient: '张三',
    phone: '13800138001',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    detail: '某某大厦20楼',
    isDefault: false,
  },
];

const mockPaymentMethods = [
  {
    id: 'pay-1',
    type: 'card' as const,
    name: '招商银行信用卡',
    lastFour: '1234',
    isDefault: true,
  },
  {
    id: 'pay-2',
    type: 'alipay' as const,
    name: '支付宝',
    lastFour: '',
    isDefault: false,
  },
];

const mockCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    minPurchase: 100,
    maxDiscount: 100,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isUsed: false,
    description: '满100元享受20%折扣',
  },
  {
    id: 'coupon-2',
    code: 'SAVE50',
    type: 'fixed',
    value: 50,
    minPurchase: 200,
    maxDiscount: 50,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    isUsed: false,
    description: '满200元立减50元',
  },
  {
    id: 'coupon-3',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minPurchase: 50,
    maxDiscount: 20,
    expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    isUsed: false,
    description: '满50元免运费',
  },
];

type PageView = 'cart' | 'checkout' | 'coupons';

export default function CartPage() {
  const [view, setView] = useState<PageView>('cart');
  const [cart, setCart] = useState(mockCart);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      ),
      totalPrice: prev.items.reduce((sum, item) => {
        if (item.id === itemId) {
          return sum - item.price * item.quantity + item.price * quantity;
        }
        return sum + item.price * item.quantity;
      }, 0),
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => {
      const removedItem = prev.items.find((item) => item.id === itemId);
      const newItems = prev.items.filter((item) => item.id !== itemId);
      const newTotalPrice = removedItem
        ? prev.totalPrice - removedItem.price * removedItem.quantity
        : prev.totalPrice;

      return {
        ...prev,
        items: newItems,
        totalPrice: newTotalPrice,
        finalPrice: newTotalPrice - prev.discount,
      };
    });
  };

  const handleApplyCoupon = (couponCode: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const coupon = mockCoupons.find((c) => c.code === couponCode);
      if (coupon) {
        let discount = 0;
        if (coupon.type === 'percentage') {
          discount = (cart.totalPrice * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
          discount = coupon.value;
        }
        discount = Math.min(discount, coupon.maxDiscount);

        setCart((prev) => ({
          ...prev,
          couponCode: couponCode,
          discount: discount,
          finalPrice: Math.max(0, prev.totalPrice - discount),
        }));
      }
      setIsLoading(false);
    }, 500);
  };

  const handleProceedCheckout = () => {
    setView('checkout');
  };

  const handleCheckoutSubmit = (data: CheckoutData) => {
    setIsLoading(true);
    setTimeout(() => {
      console.log('Checkout data:', data);
      alert('订单已提交！订单号: ORD-' + Date.now());
      setIsLoading(false);
      setView('cart');
      setCart(mockCart);
    }, 1000);
  };

  const handleUseCoupon = (couponId: string) => {
    const coupon = mockCoupons.find((c) => c.id === couponId);
    if (coupon) {
      handleApplyCoupon(coupon.code);
    }
  };

  return (
    <UserPortalLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            购物车
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            管理您的购物车和完成结算
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'cart', label: '购物车' },
            { key: 'checkout', label: '结算' },
            { key: 'coupons', label: '优惠券' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key as PageView)}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                view === key
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {view === 'cart' && (
              <ShoppingCart
                cart={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onApplyCoupon={handleApplyCoupon}
                onProceedCheckout={handleProceedCheckout}
                isLoading={isLoading}
              />
            )}

            {view === 'checkout' && (
              <CheckoutForm
                addresses={mockAddresses}
                paymentMethods={mockPaymentMethods}
                totalAmount={cart.finalPrice}
                onSubmit={handleCheckoutSubmit}
                isLoading={isLoading}
              />
            )}

            {view === 'coupons' && (
              <CouponManager
                coupons={mockCoupons}
                onUseCoupon={handleUseCoupon}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Sidebar - Order Summary */}
          {view === 'cart' && (
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sticky top-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  订单摘要
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>商品数量:</span>
                    <span className="font-medium">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>商品总价:</span>
                    <span className="font-medium">¥{cart.totalPrice.toFixed(2)}</span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>优惠金额:</span>
                      <span className="font-medium">-¥{cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-base font-semibold text-gray-900 dark:text-white">
                    <span>应付金额:</span>
                    <span className="text-teal-600 dark:text-teal-400">
                      ¥{cart.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserPortalLayout>
  );
}

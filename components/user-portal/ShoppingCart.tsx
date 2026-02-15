'use client';

import React, { useState } from 'react';
import { CartItem, ShoppingCart as ShoppingCartType, CART_ITEM_LIMITS } from '@/lib/user-portal/shopping-types';

interface ShoppingCartProps {
  cart: ShoppingCartType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onApplyCoupon: (couponCode: string) => void;
  onProceedCheckout: () => void;
  isLoading?: boolean;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onApplyCoupon,
  onProceedCheckout,
  isLoading = false,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < CART_ITEM_LIMITS.MIN_QUANTITY) {
      onRemoveItem(itemId);
      return;
    }
    if (newQuantity > CART_ITEM_LIMITS.MAX_QUANTITY) {
      setCouponError('数量不能超过 999');
      return;
    }
    onUpdateQuantity(itemId, newQuantity);
  };

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) {
      setCouponError('请输入优惠券代码');
      return;
    }
    setCouponError('');
    onApplyCoupon(couponInput);
    setCouponInput('');
  };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">购物车为空</h3>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          继续购物，添加商品到购物车
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cart Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            购物车商品 ({cart.items.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {cart.items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onQuantityChange={(qty) => handleQuantityChange(item.id, qty)}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      </div>

      {/* Coupon Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          优惠券
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => {
              setCouponInput(e.target.value);
              setCouponError('');
            }}
            placeholder="输入优惠券代码"
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            disabled={isLoading}
          />
          <button
            onClick={handleApplyCoupon}
            disabled={isLoading}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            应用
          </button>
        </div>
        {couponError && (
          <p className="text-red-500 text-sm mt-2">{couponError}</p>
        )}
        {cart.couponCode && (
          <p className="text-green-600 dark:text-green-400 text-sm mt-2">
            ✓ 优惠券已应用: {cart.couponCode}
          </p>
        )}
      </div>

      {/* Price Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="space-y-3">
          <div className="flex justify-between text-gray-700 dark:text-gray-300">
            <span>商品总价:</span>
            <span>¥{cart.totalPrice.toFixed(2)}</span>
          </div>
          {cart.discount > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>优惠金额:</span>
              <span>-¥{cart.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
            <span>应付金额:</span>
            <span className="text-teal-600 dark:text-teal-400">¥{cart.finalPrice.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <button
        onClick={onProceedCheckout}
        disabled={isLoading || cart.items.length === 0}
        className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '处理中...' : '继续结算'}
      </button>
    </div>
  );
};

interface CartItemRowProps {
  item: CartItem;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const CartItemRow: React.FC<CartItemRowProps> = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="p-4 flex gap-4">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
        <img
          src={item.productImage}
          alt={item.productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
          {item.productName}
        </h4>
        <p className="text-teal-600 dark:text-teal-400 font-semibold mt-1">
          ¥{item.price.toFixed(2)}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          库存: {item.stock}
        </p>
      </div>

      {/* Quantity Control */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuantityChange(item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="减少数量"
        >
          −
        </button>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
          className="w-12 h-8 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          min={CART_ITEM_LIMITS.MIN_QUANTITY}
          max={CART_ITEM_LIMITS.MAX_QUANTITY}
        />
        <button
          onClick={() => onQuantityChange(item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="增加数量"
        >
          +
        </button>
      </div>

      {/* Subtotal and Remove */}
      <div className="flex flex-col items-end gap-2">
        <p className="font-semibold text-gray-900 dark:text-white">
          ¥{(item.price * item.quantity).toFixed(2)}
        </p>
        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
        >
          删除
        </button>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Coupon, COUPON_TYPES } from '@/lib/user-portal/shopping-types';

interface CouponManagerProps {
  coupons: Coupon[];
  onUseCoupon: (couponId: string) => void;
  isLoading?: boolean;
}

export const CouponManager: React.FC<CouponManagerProps> = ({
  coupons,
  onUseCoupon,
  isLoading = false,
}) => {
  const [filter, setFilter] = useState<'available' | 'used' | 'expired'>('available');

  const now = new Date();
  const availableCoupons = coupons.filter(
    (c) => !c.isUsed && c.expiryDate > now
  );
  const usedCoupons = coupons.filter((c) => c.isUsed);
  const expiredCoupons = coupons.filter(
    (c) => !c.isUsed && c.expiryDate <= now
  );

  const displayCoupons =
    filter === 'available'
      ? availableCoupons
      : filter === 'used'
        ? usedCoupons
        : expiredCoupons;

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'available', label: `可用 (${availableCoupons.length})` },
          { key: 'used', label: `已使用 (${usedCoupons.length})` },
          { key: 'expired', label: `已过期 (${expiredCoupons.length})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              filter === key
                ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Coupons List */}
      {displayCoupons.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'available' && '暂无可用优惠券'}
            {filter === 'used' && '暂无已使用优惠券'}
            {filter === 'expired' && '暂无已过期优惠券'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayCoupons.map((coupon) => (
            <CouponCard
              key={coupon.id}
              coupon={coupon}
              onUse={() => onUseCoupon(coupon.id)}
              isLoading={isLoading}
              isDisabled={filter !== 'available'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CouponCardProps {
  coupon: Coupon;
  onUse: () => void;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  onUse,
  isLoading = false,
  isDisabled = false,
}) => {
  const isExpired = coupon.expiryDate <= new Date();
  const daysLeft = Math.ceil(
    (coupon.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div
      className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
        isExpired || coupon.isUsed
          ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-teal-200 dark:border-teal-700'
      }`}
    >
      {/* Coupon Value */}
      <div
        className={`flex-shrink-0 w-16 h-16 rounded-lg flex flex-col items-center justify-center font-bold text-white ${
          isExpired || coupon.isUsed
            ? 'bg-gray-400'
            : 'bg-gradient-to-br from-teal-400 to-teal-600'
        }`}
      >
        {coupon.type === 'percentage' && (
          <>
            <span className="text-2xl">{coupon.value}</span>
            <span className="text-xs">折</span>
          </>
        )}
        {coupon.type === 'fixed' && (
          <>
            <span className="text-xs">¥</span>
            <span className="text-xl">{coupon.value}</span>
          </>
        )}
        {coupon.type === 'free_shipping' && (
          <span className="text-xs text-center">免运费</span>
        )}
      </div>

      {/* Coupon Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
          {coupon.description}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          代码: {coupon.code}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {coupon.type === 'percentage' && `满${coupon.minPurchase}元可用`}
          {coupon.type === 'fixed' && `满${coupon.minPurchase}元可用`}
          {coupon.type === 'free_shipping' && `满${coupon.minPurchase}元可用`}
        </p>
        {!isExpired && !coupon.isUsed && daysLeft <= 3 && (
          <p className="text-xs text-red-500 mt-1">
            即将过期: {daysLeft} 天
          </p>
        )}
        {isExpired && (
          <p className="text-xs text-gray-500 mt-1">已过期</p>
        )}
        {coupon.isUsed && (
          <p className="text-xs text-gray-500 mt-1">
            已使用于 {coupon.usedAt?.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Action Button */}
      {!isExpired && !coupon.isUsed && (
        <button
          onClick={onUse}
          disabled={isLoading || isDisabled}
          className="flex-shrink-0 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          使用
        </button>
      )}
    </div>
  );
};

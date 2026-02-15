'use client';

import React from 'react';
import { DashboardCard } from './DashboardCard';

interface AccountBalanceCardProps {
  account: {
    balance: number;
    points: number;
    coupons: number;
  };
}

interface BalanceStat {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  href: string;
}

export function AccountBalanceCard({ account }: AccountBalanceCardProps) {
  const stats: BalanceStat[] = [
    {
      label: 'Account Balance',
      value: account.balance.toFixed(2),
      unit: '$',
      color: 'text-teal-600 dark:text-teal-400',
      href: '/user/wallet',
    },
    {
      label: 'Points',
      value: account.points,
      color: 'text-white dark:text-white',
      href: '/user/points',
    },
    {
      label: 'Coupons',
      value: account.coupons,
      color: 'text-white dark:text-white',
      href: '/user/coupons',
    },
  ];

  return (
    <DashboardCard title="Account Balance">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-center"
          >
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>
              {stat.unit}
              {stat.value}
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {stat.label}
            </p>
          </a>
        ))}
      </div>
    </DashboardCard>
  );
}

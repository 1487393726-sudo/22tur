'use client';

import React from 'react';
import { DashboardCard } from './DashboardCard';

interface OrderOverviewCardProps {
  orders: {
    pendingPayment: number;
    pendingShipment: number;
    completed: number;
  };
}

interface OrderStat {
  label: string;
  value: number;
  color: string;
  href: string;
}

export function OrderOverviewCard({ orders }: OrderOverviewCardProps) {
  const stats: OrderStat[] = [
    {
      label: 'Pending Payment',
      value: orders.pendingPayment,
      color: 'text-orange-600 dark:text-orange-400',
      href: '/user/orders?status=pending_payment',
    },
    {
      label: 'Pending Shipment',
      value: orders.pendingShipment,
      color: 'text-blue-600 dark:text-blue-400',
      href: '/user/orders?status=pending_shipment',
    },
    {
      label: 'Completed',
      value: orders.completed,
      color: 'text-green-600 dark:text-green-400',
      href: '/user/orders?status=completed',
    },
  ];

  return (
    <DashboardCard title="Order Overview">
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <a
            key={stat.label}
            href={stat.href}
            className="p-4 rounded-lg bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-center"
          >
            <p className={`text-2xl font-bold ${stat.color} mb-1`}>
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

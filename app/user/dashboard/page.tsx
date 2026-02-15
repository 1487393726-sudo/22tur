'use client';

import React, { useState, useEffect } from 'react';
import { UserPortalLayout } from '@/components/user-portal/UserPortalLayout';
import { PersonalInfoCard } from '@/components/user-portal/PersonalInfoCard';
import { OrderOverviewCard } from '@/components/user-portal/OrderOverviewCard';
import { AccountBalanceCard } from '@/components/user-portal/AccountBalanceCard';
import { QuickActions } from '@/components/user-portal/QuickActions';

interface User {
  username: string;
  avatar?: string;
  memberLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface DashboardData {
  user: User;
  orders: {
    pendingPayment: number;
    pendingShipment: number;
    completed: number;
  };
  account: {
    balance: number;
    points: number;
    coupons: number;
  };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Mock data for demonstration
        const mockData: DashboardData = {
          user: {
            username: 'John Doe',
            avatar: undefined,
            memberLevel: 'gold',
          },
          orders: {
            pendingPayment: 2,
            pendingShipment: 1,
            completed: 15,
          },
          account: {
            balance: 250.5,
            points: 1250,
            coupons: 3,
          },
        };
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <UserPortalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
          </div>
        </div>
      </UserPortalLayout>
    );
  }

  if (error || !data) {
    return (
      <UserPortalLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">
              {error || 'Failed to load dashboard'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </UserPortalLayout>
    );
  }

  return (
    <UserPortalLayout>
      <div className="space-y-4 sm:space-y-6 md:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="px-4 sm:px-6 md:px-6 lg:px-8">
          <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm md:text-sm lg:text-base text-slate-600 dark:text-slate-400">
            Welcome to your personal dashboard
          </p>
        </div>

        {/* Personal Info */}
        <div className="px-4 sm:px-6 md:px-6 lg:px-8">
          <PersonalInfoCard user={data.user} />
        </div>

        {/* Order Overview and Account Balance */}
        <div className="px-4 sm:px-6 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-4 lg:gap-6">
            <OrderOverviewCard orders={data.orders} />
            <AccountBalanceCard account={data.account} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-6 md:px-6 lg:px-8">
          <QuickActions />
        </div>
      </div>
    </UserPortalLayout>
  );
}

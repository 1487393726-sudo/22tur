'use client';

import React from 'react';
import { DashboardCard } from './DashboardCard';

interface PersonalInfoCardProps {
  user: {
    username: string;
    avatar?: string;
    memberLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
  };
}

const memberLevelLabels: Record<string, string> = {
  bronze: 'Bronze Member',
  silver: 'Silver Member',
  gold: 'Gold Member',
  platinum: 'Platinum Member',
};

const memberLevelColors: Record<string, string> = {
  bronze: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  silver: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  gold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  platinum: 'bg-purple-100 text-white dark:bg-purple-900 dark:text-white',
};

export function PersonalInfoCard({ user }: PersonalInfoCardProps) {
  return (
    <DashboardCard title="Personal Information">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center flex-shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.username}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
              {user.username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
            Welcome back
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {user.username}
          </h2>
          <span
            className={`
              inline-block px-3 py-1 rounded-full text-sm font-medium
              ${memberLevelColors[user.memberLevel]}
            `}
          >
            {memberLevelLabels[user.memberLevel]}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
}

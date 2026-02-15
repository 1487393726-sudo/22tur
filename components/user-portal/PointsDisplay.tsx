'use client';

import React from 'react';
import { PointsBalance } from '@/lib/user-portal/points-types';

interface PointsDisplayProps {
  balance: PointsBalance;
  isLoading?: boolean;
}

export const PointsDisplay: React.FC<PointsDisplayProps> = ({
  balance,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="points-display skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  const expiringDaysLeft = balance.expiringDate
    ? Math.ceil(
        (balance.expiringDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <div className="points-display">
      <div className="points-main">
        <div className="points-value">
          <span className="label">当前积分</span>
          <span className="value">{balance.current}</span>
        </div>
        <div className="points-stats">
          <div className="stat">
            <span className="stat-label">累计积分</span>
            <span className="stat-value">{balance.total}</span>
          </div>
          {balance.expiring > 0 && (
            <div className="stat expiring">
              <span className="stat-label">即将过期</span>
              <span className="stat-value">{balance.expiring}</span>
              {expiringDaysLeft !== null && (
                <span className="expiring-date">
                  {expiringDaysLeft}天后过期
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

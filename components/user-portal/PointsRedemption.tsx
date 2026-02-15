'use client';

import React, { useState } from 'react';
import { PointsRedemption, RedemptionRecord } from '@/lib/user-portal/points-types';

interface PointsRedemptionProps {
  currentPoints: number;
  redemptions: PointsRedemption[];
  records: RedemptionRecord[];
  onRedeem: (redemptionId: string) => Promise<void>;
  isLoading?: boolean;
}

export const PointsRedemption: React.FC<PointsRedemptionProps> = ({
  currentPoints,
  redemptions,
  records,
  onRedeem,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<'available' | 'history'>(
    'available'
  );
  const [redeeming, setRedeeming] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="points-redemption skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  const handleRedeem = async (redemptionId: string) => {
    setRedeeming(redemptionId);
    try {
      await onRedeem(redemptionId);
    } finally {
      setRedeeming(null);
    }
  };

  const availableRedemptions = redemptions.filter((r) => r.stock > 0);

  return (
    <div className="points-redemption">
      <div className="redemption-header">
        <h2 className="redemption-title">积分兑换</h2>
        <div className="current-points-display">
          当前积分：<span className="points-value">{currentPoints}</span>
        </div>
      </div>

      <div className="redemption-tabs">
        <button
          className={`tab ${activeTab === 'available' ? 'active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          可兑换商品
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          兑换记录
        </button>
      </div>

      {activeTab === 'available' ? (
        <div className="redemption-grid">
          {availableRedemptions.length > 0 ? (
            availableRedemptions.map((redemption) => {
              const canRedeem = currentPoints >= redemption.pointsRequired;
              return (
                <div key={redemption.id} className="redemption-card">
                  <div className="card-image">
                    <img
                      src={redemption.image}
                      alt={redemption.productName}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23e5e7eb" width="200" height="200"/%3E%3C/svg%3E';
                      }}
                    />
                    <span className="popularity">热度 {redemption.popularity}%</span>
                  </div>
                  <div className="card-content">
                    <h3 className="product-name">{redemption.productName}</h3>
                    <p className="product-category">{redemption.category}</p>
                    <div className="card-footer">
                      <div className="points-info">
                        <span className="points-required">
                          {redemption.pointsRequired}
                        </span>
                        <span className="points-label">积分</span>
                      </div>
                      <button
                        className={`redeem-btn ${!canRedeem ? 'disabled' : ''} ${redeeming === redemption.id ? 'loading' : ''}`}
                        onClick={() => handleRedeem(redemption.id)}
                        disabled={!canRedeem || redeeming === redemption.id}
                      >
                        {redeeming === redemption.id ? '兑换中...' : '兑换'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>暂无可兑换商品</p>
            </div>
          )}
        </div>
      ) : (
        <div className="redemption-history">
          {records.length > 0 ? (
            records.map((record) => (
              <div key={record.id} className="history-item">
                <div className="history-info">
                  <h4 className="product-name">{record.productName}</h4>
                  <p className="redemption-date">
                    {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <div className="history-status">
                  <span className={`status-badge status-${record.status}`}>
                    {record.status === 'pending'
                      ? '处理中'
                      : record.status === 'completed'
                        ? '已完成'
                        : '已取消'}
                  </span>
                  <span className="points-used">-{record.pointsUsed}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>暂无兑换记录</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

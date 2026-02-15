'use client';

import React from 'react';
import { MemberInfo, MemberBenefit } from '@/lib/user-portal/points-types';

interface MemberLevelCardProps {
  memberInfo: MemberInfo;
  benefits: MemberBenefit[];
  isLoading?: boolean;
}

const levelColors: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

export const MemberLevelCard: React.FC<MemberLevelCardProps> = ({
  memberInfo,
  benefits,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="member-level-card skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  const levelColor = levelColors[memberInfo.level] || '#14B8A6';
  const progressPercent = Math.min(
    (memberInfo.upgradeProgress / 100) * 100,
    100
  );

  return (
    <div className="member-level-card">
      <div className="level-header" style={{ borderTopColor: levelColor }}>
        <div className="level-badge" style={{ backgroundColor: levelColor }}>
          <span className="level-name">{memberInfo.name}</span>
        </div>
        <p className="level-description">{memberInfo.description}</p>
      </div>

      <div className="upgrade-section">
        <div className="upgrade-info">
          <span className="current-points">{memberInfo.minPoints} 积分</span>
          <span className="next-level">
            升级需要 {memberInfo.nextLevelPoints} 积分
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progressPercent}%`,
              backgroundColor: levelColor,
            }}
          />
        </div>
        <div className="progress-text">
          {memberInfo.upgradeProgress}% 完成度
        </div>
      </div>

      <div className="benefits-section">
        <h3 className="benefits-title">会员权益</h3>
        <div className="benefits-list">
          {benefits
            .filter((b) => b.level === memberInfo.level)
            .map((benefit) => (
              <div key={benefit.id} className="benefit-item">
                <span className="benefit-icon">{benefit.icon}</span>
                <div className="benefit-content">
                  <p className="benefit-name">{benefit.title}</p>
                  <p className="benefit-desc">{benefit.description}</p>
                  {benefit.value && (
                    <span className="benefit-value">{benefit.value}</span>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

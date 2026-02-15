'use client';

import React, { useState } from 'react';
import { PointsRule } from '@/lib/user-portal/points-types';

interface PointsRulesProps {
  rules: PointsRule[];
  isLoading?: boolean;
}

export const PointsRules: React.FC<PointsRulesProps> = ({
  rules,
  isLoading = false,
}) => {
  const [activeCategory, setActiveCategory] = useState<
    'earning' | 'redemption' | 'bonus'
  >('earning');

  if (isLoading) {
    return (
      <div className="points-rules skeleton">
        <div className="skeleton-bar" />
      </div>
    );
  }

  const filteredRules = rules.filter((r) => r.category === activeCategory);

  const categoryLabels = {
    earning: '积分获取',
    redemption: '积分兑换',
    bonus: '积分奖励',
  };

  return (
    <div className="points-rules">
      <div className="rules-header">
        <h2 className="rules-title">积分规则</h2>
      </div>

      <div className="category-tabs">
        {(['earning', 'redemption', 'bonus'] as const).map((category) => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {categoryLabels[category]}
          </button>
        ))}
      </div>

      <div className="rules-list">
        {filteredRules.length > 0 ? (
          filteredRules.map((rule) => (
            <div key={rule.id} className="rule-item">
              <div className="rule-header">
                <h3 className="rule-title">{rule.title}</h3>
                <span className="rule-points">+{rule.pointsValue}</span>
              </div>
              <p className="rule-description">{rule.description}</p>
              <p className="rule-condition">条件：{rule.condition}</p>
              <div className="rule-validity">
                <span className="validity-date">
                  有效期：{rule.validFrom.toLocaleDateString('zh-CN')}
                  {rule.validTo
                    ? ` - ${rule.validTo.toLocaleDateString('zh-CN')}`
                    : ' - 长期有效'}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>暂无相关规则</p>
          </div>
        )}
      </div>
    </div>
  );
};

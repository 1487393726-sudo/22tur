'use client';

import React, { useState, useEffect } from 'react';
import { PointsDisplay } from '@/components/user-portal/PointsDisplay';
import { MemberLevelCard } from '@/components/user-portal/MemberLevelCard';
import { PointsRules } from '@/components/user-portal/PointsRules';
import { PointsRedemption } from '@/components/user-portal/PointsRedemption';
import {
  PointsBalance,
  MemberInfo,
  PointsRule,
  PointsRedemption as PointsRedemptionType,
  RedemptionRecord,
  MemberBenefit,
} from '@/lib/user-portal/points-types';

export default function PointsPage() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'rules' | 'redemption'
  >('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [pointsBalance, setPointsBalance] = useState<PointsBalance | null>(
    null
  );
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
  const [rules, setRules] = useState<PointsRule[]>([]);
  const [redemptions, setRedemptions] = useState<PointsRedemptionType[]>([]);
  const [records, setRecords] = useState<RedemptionRecord[]>([]);
  const [benefits, setBenefits] = useState<MemberBenefit[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simulate API calls
        const mockBalance: PointsBalance = {
          current: 2500,
          total: 8750,
          expiring: 150,
          expiringDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };

        const mockMemberInfo: MemberInfo = {
          level: 'gold',
          name: '黄金会员',
          description: '享受专属权益和优先服务',
          minPoints: 5000,
          maxPoints: 10000,
          benefits: ['积分加倍', '专属客服', '优先发货'],
          upgradeProgress: 75,
          nextLevelPoints: 10000,
        };

        const mockRules: PointsRule[] = [
          {
            id: '1',
            title: '购物获取积分',
            description: '每消费1元获得1积分',
            category: 'earning',
            pointsValue: 1,
            condition: '购物消费',
            validFrom: new Date('2024-01-01'),
            validTo: null,
          },
          {
            id: '2',
            title: '签到奖励',
            description: '每日签到获得10积分',
            category: 'bonus',
            pointsValue: 10,
            condition: '每日签到',
            validFrom: new Date('2024-01-01'),
            validTo: null,
          },
          {
            id: '3',
            title: '评价奖励',
            description: '商品评价获得50积分',
            category: 'bonus',
            pointsValue: 50,
            condition: '提交商品评价',
            validFrom: new Date('2024-01-01'),
            validTo: null,
          },
          {
            id: '4',
            title: '积分兑换商品',
            description: '使用积分兑换精选商品',
            category: 'redemption',
            pointsValue: 100,
            condition: '兑换商品',
            validFrom: new Date('2024-01-01'),
            validTo: null,
          },
        ];

        const mockRedemptions: PointsRedemptionType[] = [
          {
            id: 'r1',
            productId: 'p1',
            productName: '咖啡券',
            pointsRequired: 500,
            discount: 50,
            category: '饮品',
            image:
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%238B4513" width="200" height="200"/%3E%3C/svg%3E',
            stock: 100,
            popularity: 85,
          },
          {
            id: 'r2',
            productId: 'p2',
            productName: '优惠券',
            pointsRequired: 1000,
            discount: 100,
            category: '优惠',
            image:
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FF6B6B" width="200" height="200"/%3E%3C/svg%3E',
            stock: 50,
            popularity: 92,
          },
          {
            id: 'r3',
            productId: 'p3',
            productName: '会员卡',
            pointsRequired: 2000,
            discount: 200,
            category: '会员',
            image:
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23FFD700" width="200" height="200"/%3E%3C/svg%3E',
            stock: 20,
            popularity: 78,
          },
        ];

        const mockRecords: RedemptionRecord[] = [
          {
            id: 'rec1',
            redemptionId: 'r1',
            productName: '咖啡券',
            pointsUsed: 500,
            status: 'completed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          },
          {
            id: 'rec2',
            redemptionId: 'r2',
            productName: '优惠券',
            pointsUsed: 1000,
            status: 'pending',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            completedAt: null,
          },
        ];

        const mockBenefits: MemberBenefit[] = [
          {
            id: 'b1',
            title: '积分加倍',
            description: '购物积分翻倍',
            icon: '⭐',
            level: 'gold',
            value: '2x',
          },
          {
            id: 'b2',
            title: '专属客服',
            description: '24小时专属客服支持',
            icon: '💬',
            level: 'gold',
          },
          {
            id: 'b3',
            title: '优先发货',
            description: '订单优先处理',
            icon: '🚀',
            level: 'gold',
          },
          {
            id: 'b4',
            title: '生日礼物',
            description: '生日月份额外积分',
            icon: '🎁',
            level: 'platinum',
            value: '+500',
          },
        ];

        setPointsBalance(mockBalance);
        setMemberInfo(mockMemberInfo);
        setRules(mockRules);
        setRedemptions(mockRedemptions);
        setRecords(mockRecords);
        setBenefits(mockBenefits);
      } catch (error) {
        console.error('Failed to load points data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleRedeem = async (redemptionId: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update records
      const newRecord: RedemptionRecord = {
        id: `rec${Date.now()}`,
        redemptionId,
        productName:
          redemptions.find((r) => r.id === redemptionId)?.productName ||
          'Unknown',
        pointsUsed:
          redemptions.find((r) => r.id === redemptionId)?.pointsRequired || 0,
        status: 'pending',
        createdAt: new Date(),
        completedAt: null,
      };

      setRecords([newRecord, ...records]);

      // Update balance
      if (pointsBalance) {
        const pointsUsed =
          redemptions.find((r) => r.id === redemptionId)?.pointsRequired || 0;
        setPointsBalance({
          ...pointsBalance,
          current: Math.max(0, pointsBalance.current - pointsUsed),
        });
      }
    } catch (error) {
      console.error('Failed to redeem:', error);
    }
  };

  return (
    <div className="points-page">
      <div className="page-header">
        <h1>积分和会员</h1>
      </div>

      <div className="page-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          概览
        </button>
        <button
          className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          规则
        </button>
        <button
          className={`tab-btn ${activeTab === 'redemption' ? 'active' : ''}`}
          onClick={() => setActiveTab('redemption')}
        >
          兑换
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            {pointsBalance && (
              <PointsDisplay balance={pointsBalance} isLoading={isLoading} />
            )}
            {memberInfo && (
              <MemberLevelCard
                memberInfo={memberInfo}
                benefits={benefits}
                isLoading={isLoading}
              />
            )}
          </div>
        )}

        {activeTab === 'rules' && (
          <PointsRules rules={rules} isLoading={isLoading} />
        )}

        {activeTab === 'redemption' && pointsBalance && (
          <PointsRedemption
            currentPoints={pointsBalance.current}
            redemptions={redemptions}
            records={records}
            onRedeem={handleRedeem}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

// Points and Member System Types

export type MemberLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PointsBalance {
  current: number;
  total: number;
  expiring: number;
  expiringDate: Date | null;
}

export interface MemberInfo {
  level: MemberLevel;
  name: string;
  description: string;
  minPoints: number;
  maxPoints: number;
  benefits: string[];
  upgradeProgress: number; // 0-100
  nextLevelPoints: number;
}

export interface PointsRule {
  id: string;
  title: string;
  description: string;
  category: 'earning' | 'redemption' | 'bonus';
  pointsValue: number;
  condition: string;
  validFrom: Date;
  validTo: Date | null;
}

export interface PointsRedemption {
  id: string;
  productId: string;
  productName: string;
  pointsRequired: number;
  discount: number;
  category: string;
  image: string;
  stock: number;
  popularity: number; // 0-100
}

export interface RedemptionRecord {
  id: string;
  redemptionId: string;
  productName: string;
  pointsUsed: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: Date;
  completedAt: Date | null;
}

export interface PointsHistory {
  id: string;
  type: 'earn' | 'use' | 'expire' | 'adjust';
  points: number;
  reason: string;
  balance: number;
  createdAt: Date;
}

export interface MemberBenefit {
  id: string;
  title: string;
  description: string;
  icon: string;
  level: MemberLevel;
  value?: string | number;
}

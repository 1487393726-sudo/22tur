/**
 * A/B Test Types
 * A/B 测试类型定义
 */

// 测试状态
export type ABTestStatus = 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED';

// 变体类型
export interface ABTestVariant {
  id: string;
  testId: string;
  name: string;
  description?: string;
  allocation: number; // 流量分配百分比 0-100
  isControl: boolean; // 是否为对照组
  config?: Record<string, any>; // 变体配置
}

// A/B 测试
export interface ABTest {
  id: string;
  name: string;
  description?: string;
  status: ABTestStatus;
  variants: ABTestVariant[];
  targetAudience?: AudienceFilter;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// 用户分配
export interface ABTestAssignment {
  id: string;
  testId: string;
  variantId: string;
  userId: string;
  assignedAt: Date;
}

// 转化事件
export interface ABTestConversion {
  id: string;
  testId: string;
  variantId: string;
  userId: string;
  eventType: string;
  value?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// 受众过滤条件
export interface AudienceFilter {
  userIds?: string[];
  userAttributes?: Record<string, any>;
  percentage?: number; // 参与测试的用户百分比
}

// 测试结果统计
export interface ABTestResults {
  testId: string;
  testName: string;
  status: ABTestStatus;
  startDate?: Date;
  endDate?: Date;
  variants: VariantResults[];
  winner?: string; // 获胜变体 ID
  isSignificant: boolean;
  confidenceLevel: number;
}

// 变体结果
export interface VariantResults {
  variantId: string;
  variantName: string;
  isControl: boolean;
  allocation: number;
  participants: number;
  conversions: number;
  conversionRate: number;
  improvement?: number; // 相对于对照组的提升百分比
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
  pValue?: number;
}

// 创建测试参数
export interface CreateABTestParams {
  name: string;
  description?: string;
  variants: {
    name: string;
    description?: string;
    allocation: number;
    isControl?: boolean;
    config?: Record<string, any>;
  }[];
  targetAudience?: AudienceFilter;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
}

// 统计显著性计算参数
export interface SignificanceParams {
  controlConversions: number;
  controlParticipants: number;
  treatmentConversions: number;
  treatmentParticipants: number;
  confidenceLevel?: number; // 默认 0.95
}

// 统计显著性结果
export interface SignificanceResult {
  isSignificant: boolean;
  pValue: number;
  confidenceLevel: number;
  controlRate: number;
  treatmentRate: number;
  relativeImprovement: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  sampleSizeRecommendation?: number;
}

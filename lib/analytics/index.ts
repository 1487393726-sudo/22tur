/**
 * Analytics Module
 * 用户行为分析模块导出
 */

// 类型导出
export * from './types';

// 行为追踪服务
export {
  BehaviorTracker,
  getBehaviorTracker,
  resetBehaviorTracker,
} from './behavior-tracker';

// 漏斗分析服务
export {
  FunnelAnalyzer,
  getFunnelAnalyzer,
  resetFunnelAnalyzer,
} from './funnel-analyzer';

// 留存分析服务
export {
  RetentionAnalyzer,
  getRetentionAnalyzer,
  resetRetentionAnalyzer,
} from './retention-analyzer';

// 用户分群服务
export {
  SegmentService,
  getSegmentService,
  resetSegmentService,
} from './segment-service';

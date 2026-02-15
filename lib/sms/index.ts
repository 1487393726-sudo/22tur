/**
 * SMS Service Module
 * 短信服务模块导出
 */

// 类型导出
export * from './types';

// 服务导出
export {
  SMSService,
  getSMSService,
  initSMSService,
  resetSMSService,
} from './sms-service';

// 适配器导出
export { AliyunSMSAdapter, createAliyunSMSAdapter } from './providers/aliyun';
export { TencentSMSAdapter, createTencentSMSAdapter } from './providers/tencent';

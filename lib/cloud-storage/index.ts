/**
 * Cloud Storage Module
 * 云存储服务模块
 */

// 导出类型
export * from './types';

// 导出配置
export * from './config';

// 导出服务
export * from './storage-service';

// 导出适配器
export { AliyunOSSAdapter } from './providers/aliyun-oss';
export { TencentCOSAdapter } from './providers/tencent-cos';

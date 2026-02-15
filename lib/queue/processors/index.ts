/**
 * Queue Processors
 * 任务处理器导出
 */

export * from './email-processor';
export * from './sms-processor';
export * from './notification-processor';
export * from './file-processor';
export * from './report-processor';

import { QueueService } from '../queue-service';
import { emailProcessor } from './email-processor';
import { smsProcessor } from './sms-processor';
import { notificationProcessor } from './notification-processor';
import { fileProcessor } from './file-processor';
import { reportProcessor } from './report-processor';

/**
 * 注册所有处理器到队列服务
 */
export function registerAllProcessors(queueService: QueueService): void {
  queueService.registerProcessor(emailProcessor);
  queueService.registerProcessor(smsProcessor);
  queueService.registerProcessor(notificationProcessor);
  queueService.registerProcessor(fileProcessor);
  queueService.registerProcessor(reportProcessor);
  
  console.log('All queue processors registered');
}

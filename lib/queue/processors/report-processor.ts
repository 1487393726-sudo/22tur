/**
 * Report Processor
 * 报表生成处理器
 */

import {
  ProcessorRegistration,
  ReportJobData,
  Job,
} from '../types';

interface ReportResult {
  reportId: string;
  reportType: string;
  format: string;
  fileKey: string;
  fileSize: number;
  generatedAt: Date;
}

/**
 * 生成报表（模拟实现）
 */
async function generateReport(data: ReportJobData): Promise<ReportResult> {
  // 模拟报表生成延迟（报表通常需要较长时间）
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
  
  const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fileKey = `reports/${data.userId}/${data.reportType}/${reportId}.${data.format}`;
  
  return {
    reportId,
    reportType: data.reportType,
    format: data.format,
    fileKey,
    fileSize: 1024 * (50 + Math.floor(Math.random() * 200)), // 50-250KB
    generatedAt: new Date(),
  };
}

/**
 * 报表处理器
 */
export const reportProcessor: ProcessorRegistration<ReportJobData, ReportResult> = {
  name: 'generate-report',
  type: 'report',
  concurrency: 2,
  processor: async (job: Job<ReportJobData>, progress) => {
    const { data } = job;
    
    // 验证必要字段
    if (!data.reportType || !data.format || !data.userId) {
      throw new Error('Missing required report fields: reportType, format, userId');
    }

    // 验证格式
    const validFormats = ['pdf', 'excel', 'csv'];
    if (!validFormats.includes(data.format)) {
      throw new Error(`Invalid format: ${data.format}. Valid formats: ${validFormats.join(', ')}`);
    }

    progress(5);

    // 模拟报表生成步骤
    const steps = [
      { progress: 15, message: 'Fetching data...' },
      { progress: 35, message: 'Processing data...' },
      { progress: 55, message: 'Generating charts...' },
      { progress: 75, message: 'Formatting output...' },
      { progress: 90, message: 'Saving file...' },
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 100));
      progress(step.progress);
    }

    // 生成报表
    const result = await generateReport(data);

    progress(100);

    return result;
  },
};

/**
 * 创建报表任务数据
 */
export function createReportJobData(
  reportType: string,
  userId: string,
  format: ReportJobData['format'],
  parameters?: Record<string, unknown>
): ReportJobData {
  return {
    reportType,
    userId,
    format,
    parameters: parameters || {},
  };
}

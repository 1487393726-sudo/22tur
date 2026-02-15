/**
 * File Processor
 * 文件处理处理器
 */

import {
  ProcessorRegistration,
  FileProcessJobData,
  Job,
} from '../types';

interface FileProcessResult {
  inputKey: string;
  outputKey: string;
  operation: string;
  success: boolean;
  metadata?: {
    originalSize?: number;
    processedSize?: number;
    format?: string;
  };
}

/**
 * 处理文件（模拟实现）
 */
async function processFile(data: FileProcessJobData): Promise<FileProcessResult> {
  // 模拟文件处理延迟
  await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 500));
  
  const outputKey = data.outputKey || `processed/${data.fileKey}`;
  
  return {
    inputKey: data.fileKey,
    outputKey,
    operation: data.operation,
    success: true,
    metadata: {
      originalSize: 1024 * 100, // 模拟 100KB
      processedSize: 1024 * 50, // 模拟压缩后 50KB
      format: data.operation === 'convert' ? (data.options?.format as string) || 'webp' : undefined,
    },
  };
}

/**
 * 文件处理器
 */
export const fileProcessor: ProcessorRegistration<FileProcessJobData, FileProcessResult> = {
  name: 'process-file',
  type: 'file-process',
  concurrency: 3,
  processor: async (job: Job<FileProcessJobData>, progress) => {
    const { data } = job;
    
    // 验证必要字段
    if (!data.fileKey || !data.operation) {
      throw new Error('Missing required file process fields: fileKey, operation');
    }

    // 验证操作类型
    const validOperations = ['compress', 'resize', 'convert', 'thumbnail'];
    if (!validOperations.includes(data.operation)) {
      throw new Error(`Invalid operation: ${data.operation}. Valid operations: ${validOperations.join(', ')}`);
    }

    progress(10);

    // 模拟不同操作的进度
    const steps = [20, 40, 60, 80];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 50));
      progress(step);
    }

    // 处理文件
    const result = await processFile(data);

    progress(100);

    return result;
  },
};

/**
 * 创建文件处理任务数据
 */
export function createFileProcessJobData(
  fileKey: string,
  operation: FileProcessJobData['operation'],
  options?: {
    outputKey?: string;
    options?: Record<string, unknown>;
  }
): FileProcessJobData {
  return {
    fileKey,
    operation,
    outputKey: options?.outputKey,
    options: options?.options,
  };
}

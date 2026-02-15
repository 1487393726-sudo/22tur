/**
 * 支付定时任务调度器
 * 定期检查并处理过期的支付交易
 */

import * as cron from 'node-cron'
import { checkExpiredTransactions } from './payment-status-handler'

let isSchedulerRunning = false
let scheduledTask: ReturnType<typeof cron.schedule> | null = null

/**
 * 启动支付调度器
 */
export function startPaymentScheduler() {
  if (isSchedulerRunning) {
    console.log('支付调度器已在运行')
    return
  }

  // 每5分钟检查一次过期交易
  scheduledTask = cron.schedule('*/5 * * * *', async () => {
    console.log('开始检查过期支付交易...')
    try {
      const result = await checkExpiredTransactions()
      console.log('过期交易检查完成:', result)
    } catch (error) {
      console.error('检查过期交易失败:', error)
    }
  })

  isSchedulerRunning = true
  console.log('支付调度器已启动（每5分钟检查一次）')
}

/**
 * 停止支付调度器
 */
export function stopPaymentScheduler() {
  if (scheduledTask) {
    scheduledTask.stop()
    scheduledTask = null
  }
  isSchedulerRunning = false
  console.log('支付调度器已停止')
}

/**
 * 获取调度器状态
 */
export function getPaymentSchedulerStatus() {
  return {
    isRunning: isSchedulerRunning,
    schedule: '*/5 * * * *', // 每5分钟
    description: '每5分钟检查并处理过期的支付交易',
  }
}

// 在应用启动时自动启动调度器（仅在生产环境）
if (process.env.NODE_ENV === 'production') {
  startPaymentScheduler()
}

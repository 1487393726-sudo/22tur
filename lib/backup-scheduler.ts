/**
 * Backup Scheduler
 * 
 * Automatic backup scheduling using node-cron
 */

import * as cron from 'node-cron'
import { createBackup, getBackupStats } from './backup-manager'
import { prisma } from './prisma'
import { sendEmail } from './email'
import { getBackupNotificationTemplate, getBackupNotificationText } from './email-templates/backup-notification'

interface SchedulerConfig {
  enabled: boolean
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  cronExpression?: string
  compress: boolean
  includeFiles: boolean
  notifyOnSuccess: boolean
  notifyOnFailure: boolean
}

class BackupScheduler {
  private tasks: Map<string, ReturnType<typeof cron.schedule>> = new Map()
  private config: SchedulerConfig
  private isRunning: boolean = false

  constructor(config?: Partial<SchedulerConfig>) {
    this.config = {
      enabled: process.env.AUTO_BACKUP_ENABLED === 'true',
      frequency: (process.env.BACKUP_FREQUENCY as any) || 'daily',
      compress: true,
      includeFiles: false,
      notifyOnSuccess: true,
      notifyOnFailure: true,
      ...config
    }
  }

  /**
   * Start the backup scheduler
   */
  start(): void {
    if (!this.config.enabled) {
      console.log('⏸️  Backup scheduler is disabled')
      return
    }

    if (this.isRunning) {
      console.log('⚠️  Backup scheduler is already running')
      return
    }

    const cronExpression = this.config.cronExpression || this.getCronExpression(this.config.frequency)
    
    try {
      const task = cron.schedule(cronExpression, async () => {
        await this.executeBackup()
      }, {
        timezone: process.env.TZ || 'UTC'
      })

      this.tasks.set('main', task)
      this.isRunning = true

      console.log('✅ Backup scheduler started')
      console.log(`   Frequency: ${this.config.frequency}`)
      console.log(`   Cron: ${cronExpression}`)
      console.log(`   Timezone: ${process.env.TZ || 'UTC'}`)
      console.log(`   Next run: ${this.getNextRunTime(cronExpression)}`)
    } catch (error) {
      console.error('❌ Failed to start backup scheduler:', error)
      throw error
    }
  }

  /**
   * Stop the backup scheduler
   */
  stop(): void {
    this.tasks.forEach((task, name) => {
      task.stop()
      console.log(`⏹️  Stopped backup task: ${name}`)
    })
    this.tasks.clear()
    this.isRunning = false
    console.log('✅ Backup scheduler stopped')
  }

  /**
   * Execute a backup
   */
  private async executeBackup(): Promise<void> {
    const startTime = Date.now()
    console.log('🔄 Starting scheduled backup...')

    try {
      // Create backup
      const backup = await createBackup({
        compress: this.config.compress,
        includeFiles: this.config.includeFiles
      })

      const duration = Date.now() - startTime
      console.log(`✅ Backup completed in ${duration}ms`)
      console.log(`   File: ${backup.fileName}`)
      console.log(`   Size: ${backup.sizeFormatted}`)

      // Get statistics
      const stats = await getBackupStats()
      console.log(`   Total backups: ${stats.totalBackups}`)
      console.log(`   Total size: ${stats.totalSizeFormatted}`)

      // Send success notification
      if (this.config.notifyOnSuccess) {
        await this.sendNotification({
          type: 'success',
          title: 'Backup Completed Successfully',
          message: `Backup created: ${backup.fileName} (${backup.sizeFormatted})`,
          backup
        })
      }

      // Log to audit
      await this.logBackupEvent('SUCCESS', {
        fileName: backup.fileName,
        size: backup.sizeFormatted,
        duration: `${duration}ms`,
        totalBackups: stats.totalBackups
      })
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ Backup failed after ${duration}ms:`, error)

      // Send failure notification
      if (this.config.notifyOnFailure) {
        await this.sendNotification({
          type: 'failure',
          title: 'Backup Failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          error
        })
      }

      // Log to audit
      await this.logBackupEvent('FAILED', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`
      })
    }
  }

  /**
   * Send notification to administrators
   */
  private async sendNotification(data: {
    type: 'success' | 'failure'
    title: string
    message: string
    backup?: any
    error?: any
  }): Promise<void> {
    try {
      // Get all admin users with notification preferences
      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { 
          id: true, 
          email: true, 
          firstName: true, 
          lastName: true,
          notificationPreference: true
        }
      })

      // Get backup stats for email
      const stats = await getBackupStats()

      // Create notifications and send emails for each admin
      for (const admin of admins) {
        // Create system notification
        await prisma.notification.create({
          data: {
            userId: admin.id,
            title: data.title,
            message: data.message,
            type: data.type === 'success' ? 'SUCCESS' : 'ERROR',
            priority: data.type === 'failure' ? 'HIGH' : 'LOW',
            actionUrl: '/admin/backups'
          }
        })

        // Send email if enabled in preferences
        const emailEnabled = admin.notificationPreference?.emailEnabled !== false
        const reportEnabled = admin.notificationPreference?.reportEnabled !== false

        if (emailEnabled && reportEnabled) {
          try {
            const adminName = `${admin.firstName} ${admin.lastName}`.trim()
            
            await sendEmail({
              to: admin.email,
              subject: `${data.type === 'success' ? '✅' : '❌'} ${data.title}`,
              html: getBackupNotificationTemplate({
                ...data,
                stats: {
                  totalBackups: stats.totalBackups,
                  totalSizeFormatted: stats.totalSizeFormatted
                },
                adminName: adminName || undefined
              }),
              text: getBackupNotificationText({
                ...data,
                stats: {
                  totalBackups: stats.totalBackups,
                  totalSizeFormatted: stats.totalSizeFormatted
                },
                adminName: adminName || undefined
              })
            })

            console.log(`📧 Sent ${data.type} email to ${admin.email}`)
          } catch (emailError) {
            console.error(`Failed to send email to ${admin.email}:`, emailError)
            // Continue with other admins even if one fails
          }
        }
      }

      console.log(`📧 Sent ${data.type} notification to ${admins.length} admin(s)`)
    } catch (error) {
      console.error('Failed to send notification:', error)
    }
  }

  /**
   * Log backup event to audit log
   */
  private async logBackupEvent(status: 'SUCCESS' | 'FAILED', details: any): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          action: 'BACKUP_SCHEDULED',
          resource: 'backup',
          details: JSON.stringify({
            scheduled: true,
            frequency: this.config.frequency,
            ...details
          }),
          status,
          risk: status === 'FAILED' ? 'HIGH' : 'LOW'
        }
      })
    } catch (error) {
      console.error('Failed to log backup event:', error)
    }
  }

  /**
   * Get cron expression for frequency
   */
  private getCronExpression(frequency: string): string {
    switch (frequency) {
      case 'daily':
        return '0 2 * * *' // Every day at 2 AM
      case 'weekly':
        return '0 2 * * 0' // Every Sunday at 2 AM
      case 'monthly':
        return '0 2 1 * *' // First day of month at 2 AM
      default:
        return '0 2 * * *' // Default to daily
    }
  }

  /**
   * Get next run time for cron expression
   */
  private getNextRunTime(cronExpression: string): string {
    try {
      const task = cron.schedule(cronExpression, () => {})
      // This is a simplified version - in production use a proper cron parser
      return 'Next scheduled run (check logs)'
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Get scheduler status
   */
  getStatus(): {
    enabled: boolean
    running: boolean
    frequency: string
    nextRun: string | null
    config: SchedulerConfig
  } {
    return {
      enabled: this.config.enabled,
      running: this.isRunning,
      frequency: this.config.frequency,
      nextRun: this.isRunning ? this.getNextRunTime(
        this.config.cronExpression || this.getCronExpression(this.config.frequency)
      ) : null,
      config: this.config
    }
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(config: Partial<SchedulerConfig>): void {
    const wasRunning = this.isRunning
    
    if (wasRunning) {
      this.stop()
    }

    this.config = { ...this.config, ...config }

    if (wasRunning && this.config.enabled) {
      this.start()
    }

    console.log('✅ Scheduler configuration updated')
  }

  /**
   * Trigger manual backup (outside of schedule)
   */
  async triggerManualBackup(): Promise<void> {
    console.log('🔄 Triggering manual backup...')
    await this.executeBackup()
  }
}

// Singleton instance
let schedulerInstance: BackupScheduler | null = null

/**
 * Get or create scheduler instance
 */
export function getScheduler(config?: Partial<SchedulerConfig>): BackupScheduler {
  if (!schedulerInstance) {
    schedulerInstance = new BackupScheduler(config)
  }
  return schedulerInstance
}

/**
 * Initialize and start the backup scheduler
 */
export function initializeBackupScheduler(config?: Partial<SchedulerConfig>): BackupScheduler {
  const scheduler = getScheduler(config)
  
  if (scheduler.getStatus().enabled) {
    scheduler.start()
  }
  
  return scheduler
}

/**
 * Stop the backup scheduler
 */
export function stopBackupScheduler(): void {
  if (schedulerInstance) {
    schedulerInstance.stop()
  }
}

export default BackupScheduler

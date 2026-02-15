import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getScheduler } from '@/lib/backup-scheduler'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/backup-scheduler
 * Get backup scheduler status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const scheduler = getScheduler()
    const status = scheduler.getStatus()

    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to get scheduler status:', error)
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/backup-scheduler
 * Control backup scheduler (start, stop, configure)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, config } = body

    const scheduler = getScheduler()

    switch (action) {
      case 'start':
        scheduler.start()
        await logSchedulerAction(session.user.id, 'START')
        return NextResponse.json({
          success: true,
          message: 'Backup scheduler started',
          status: scheduler.getStatus()
        })

      case 'stop':
        scheduler.stop()
        await logSchedulerAction(session.user.id, 'STOP')
        return NextResponse.json({
          success: true,
          message: 'Backup scheduler stopped',
          status: scheduler.getStatus()
        })

      case 'configure':
        if (!config) {
          return NextResponse.json(
            { error: 'Configuration is required' },
            { status: 400 }
          )
        }
        scheduler.updateConfig(config)
        await logSchedulerAction(session.user.id, 'CONFIGURE', config)
        return NextResponse.json({
          success: true,
          message: 'Backup scheduler configured',
          status: scheduler.getStatus()
        })

      case 'trigger':
        await scheduler.triggerManualBackup()
        await logSchedulerAction(session.user.id, 'MANUAL_TRIGGER')
        return NextResponse.json({
          success: true,
          message: 'Manual backup triggered'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported: start, stop, configure, trigger' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Scheduler operation failed:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Scheduler operation failed' },
      { status: 500 }
    )
  }
}

/**
 * Log scheduler action to audit log
 */
async function logSchedulerAction(
  userId: string,
  action: string,
  details?: any
): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action: `BACKUP_SCHEDULER_${action}`,
        resource: 'backup_scheduler',
        details: details ? JSON.stringify(details) : null,
        status: 'SUCCESS'
      }
    })
  } catch (error) {
    console.error('Failed to log scheduler action:', error)
  }
}

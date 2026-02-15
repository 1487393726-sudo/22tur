import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getBackupStats, 
  createBackup, 
  restoreBackup,
  verifyBackup 
} from '@/lib/backup-manager'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/settings/backup
 * Get backup status and statistics
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getBackupStats()
    
    // Get auto-backup settings from environment or database
    const autoBackupEnabled = process.env.AUTO_BACKUP_ENABLED === 'true'
    const backupFrequency = process.env.BACKUP_FREQUENCY || 'daily'

    const backupStatus = {
      lastBackup: stats.newestBackup?.toISOString() || null,
      nextBackup: autoBackupEnabled ? calculateNextBackup(backupFrequency) : null,
      size: stats.totalSizeFormatted,
      totalBackups: stats.totalBackups,
      status: 'success',
      autoBackup: autoBackupEnabled,
      backupFrequency,
      stats
    }

    return NextResponse.json(backupStatus)
  } catch (error) {
    console.error('Failed to get backup status:', error)
    return NextResponse.json(
      { error: 'Failed to get backup status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/settings/backup
 * Create or restore backup
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, backupId, compress, includeFiles } = body

    if (action === 'create') {
      // Create new backup
      const backup = await createBackup({
        compress: compress !== false, // Default to true
        includeFiles: includeFiles === true
      })

      // Log the backup creation
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BACKUP_CREATE',
          resource: 'backup',
          details: JSON.stringify({
            fileName: backup.fileName,
            size: backup.sizeFormatted,
            compressed: backup.compressed,
            includesFiles: backup.includesFiles
          }),
          status: 'SUCCESS'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Backup created successfully',
        backup: {
          id: backup.id,
          fileName: backup.fileName,
          size: backup.sizeFormatted,
          createdAt: backup.createdAt.toISOString()
        }
      })
    } else if (action === 'restore') {
      // Restore from backup
      if (!backupId) {
        return NextResponse.json(
          { error: 'Backup ID is required' },
          { status: 400 }
        )
      }

      // Verify backup before restoring
      const verification = await verifyBackup(backupId)
      if (!verification.valid) {
        return NextResponse.json(
          { error: `Backup verification failed: ${verification.message}` },
          { status: 400 }
        )
      }

      const success = await restoreBackup(backupId)
      
      if (!success) {
        throw new Error('Restore operation failed')
      }

      // Log the restore operation
      await prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'BACKUP_RESTORE',
          resource: 'backup',
          details: JSON.stringify({ backupId }),
          status: 'SUCCESS',
          risk: 'HIGH'
        }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Backup restored successfully',
        restoredAt: new Date().toISOString()
      })
    } else if (action === 'verify') {
      // Verify backup integrity
      if (!backupId) {
        return NextResponse.json(
          { error: 'Backup ID is required' },
          { status: 400 }
        )
      }

      const verification = await verifyBackup(backupId)
      
      return NextResponse.json({
        success: verification.valid,
        message: verification.message,
        backupId
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Supported actions: create, restore, verify' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Backup operation failed:', error)
    
    // Log the failure
    try {
      const session = await getServerSession(authOptions)
      if (session) {
        await prisma.auditLog.create({
          data: {
            userId: session.user.id,
            action: 'BACKUP_OPERATION',
            resource: 'backup',
            details: JSON.stringify({ 
              error: error instanceof Error ? error.message : 'Unknown error' 
            }),
            status: 'FAILED',
            risk: 'HIGH'
          }
        })
      }
    } catch (logError) {
      console.error('Failed to log backup error:', logError)
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Backup operation failed' },
      { status: 500 }
    )
  }
}

/**
 * Calculate next backup time based on frequency
 */
function calculateNextBackup(frequency: string): string {
  const now = new Date()
  const next = new Date(now)

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1)
      next.setHours(2, 0, 0, 0)
      break
    case 'weekly':
      next.setDate(next.getDate() + (7 - next.getDay()))
      next.setHours(2, 0, 0, 0)
      break
    case 'monthly':
      next.setMonth(next.getMonth() + 1)
      next.setDate(1)
      next.setHours(2, 0, 0, 0)
      break
    default:
      next.setDate(next.getDate() + 1)
      next.setHours(2, 0, 0, 0)
  }

  return next.toISOString()
}
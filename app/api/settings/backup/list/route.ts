import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listBackups } from '@/lib/backup-manager'

/**
 * GET /api/settings/backup/list
 * Get list of all backups
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backups = await listBackups()
    
    // Format for frontend
    const formattedBackups = backups.map(backup => ({
      id: backup.id,
      fileName: backup.fileName,
      size: backup.sizeFormatted,
      sizeBytes: backup.size,
      type: backup.type,
      compressed: backup.compressed,
      includesFiles: backup.includesFiles,
      createdAt: backup.createdAt.toISOString(),
      status: backup.status,
      metadata: backup.metadata
    }))

    return NextResponse.json(formattedBackups)
  } catch (error) {
    console.error('Failed to get backup list:', error)
    return NextResponse.json(
      { error: 'Failed to get backup list' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { deleteBackup, getBackup } from '@/lib/backup-manager'
import { prisma } from '@/lib/prisma'
import { createReadStream } from 'fs'
import { stat } from 'fs/promises'

/**
 * GET /api/settings/backup/[id]
 * Download a backup file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backup = await getBackup(params.id)
    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    // Log the download
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BACKUP_DOWNLOAD',
        resource: 'backup',
        details: JSON.stringify({ fileName: backup.fileName }),
        status: 'SUCCESS'
      }
    })

    // Read the file
    const fileStats = await stat(backup.filePath)
    const fileStream = createReadStream(backup.filePath)

    // Return file as download
    return new NextResponse(fileStream as any, {
      headers: {
        'Content-Type': backup.compressed ? 'application/zip' : 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${backup.fileName}"`,
        'Content-Length': fileStats.size.toString()
      }
    })
  } catch (error) {
    console.error('Failed to download backup:', error)
    return NextResponse.json(
      { error: 'Failed to download backup' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/settings/backup/[id]
 * Delete a backup file
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const backup = await getBackup(params.id)
    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    const success = await deleteBackup(params.id)
    
    if (!success) {
      throw new Error('Failed to delete backup')
    }

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'BACKUP_DELETE',
        resource: 'backup',
        details: JSON.stringify({ fileName: backup.fileName }),
        status: 'SUCCESS',
        risk: 'MEDIUM'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete backup:', error)
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    )
  }
}

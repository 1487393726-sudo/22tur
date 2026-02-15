'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { 
  Database, 
  Download, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  HardDrive,
  Calendar,
  FileArchive,
  Shield,
  Clock,
  Play,
  Pause
} from 'lucide-react'
import { toast } from 'sonner'

interface Backup {
  id: string
  fileName: string
  size: string
  sizeBytes: number
  type: 'database' | 'full' | 'files'
  compressed: boolean
  includesFiles: boolean
  createdAt: string
  status: 'success' | 'failed' | 'in_progress'
}

interface BackupStats {
  totalBackups: number
  totalSize: number
  totalSizeFormatted: string
  oldestBackup?: string
  newestBackup?: string
  successCount: number
  failedCount: number
}

interface SchedulerStatus {
  enabled: boolean
  running: boolean
  frequency: string
  nextRun: string | null
  config: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly' | 'custom'
    compress: boolean
    includeFiles: boolean
    notifyOnSuccess: boolean
    notifyOnFailure: boolean
  }
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([])
  const [stats, setStats] = useState<BackupStats | null>(null)
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [restoreId, setRestoreId] = useState<string | null>(null)

  useEffect(() => {
    loadBackups()
    loadStats()
    loadSchedulerStatus()
  }, [])

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/settings/backup/list')
      if (!response.ok) throw new Error('Failed to load backups')
      const data = await response.json()
      setBackups(data)
    } catch (error) {
      toast.error('Failed to load backups')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/settings/backup')
      if (!response.ok) throw new Error('Failed to load stats')
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/admin/backup-scheduler')
      if (!response.ok) throw new Error('Failed to load scheduler status')
      const data = await response.json()
      setScheduler(data)
    } catch (error) {
      console.error('Failed to load scheduler status:', error)
    }
  }

  const toggleScheduler = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/backup-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: enabled ? 'start' : 'stop'
        })
      })

      if (!response.ok) throw new Error('Failed to toggle scheduler')

      const data = await response.json()
      setScheduler(data.status)
      toast.success(data.message)
    } catch (error) {
      toast.error('Failed to toggle scheduler')
      console.error(error)
    }
  }

  const updateSchedulerFrequency = async (frequency: string) => {
    try {
      const response = await fetch('/api/admin/backup-scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'configure',
          config: { frequency }
        })
      })

      if (!response.ok) throw new Error('Failed to update frequency')

      const data = await response.json()
      setScheduler(data.status)
      toast.success('Backup frequency updated')
    } catch (error) {
      toast.error('Failed to update frequency')
      console.error(error)
    }
  }

  const createBackup = async (includeFiles: boolean = false) => {
    setCreating(true)
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'create',
          compress: true,
          includeFiles
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create backup')
      }

      const data = await response.json()
      toast.success(data.message)
      await loadBackups()
      await loadStats()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create backup')
    } finally {
      setCreating(false)
    }
  }

  const downloadBackup = async (id: string, fileName: string) => {
    try {
      const response = await fetch(`/api/settings/backup/${id}`)
      if (!response.ok) throw new Error('Failed to download backup')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Backup downloaded successfully')
    } catch (error) {
      toast.error('Failed to download backup')
      console.error(error)
    }
  }

  const deleteBackup = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/backup/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete backup')

      toast.success('Backup deleted successfully')
      await loadBackups()
      await loadStats()
    } catch (error) {
      toast.error('Failed to delete backup')
      console.error(error)
    } finally {
      setDeleteId(null)
    }
  }

  const restoreBackup = async (id: string) => {
    try {
      const response = await fetch('/api/settings/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupId: id })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to restore backup')
      }

      toast.success('Backup restored successfully. Please restart the application.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to restore backup')
    } finally {
      setRestoreId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backup Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, manage, and restore database backups
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              loadBackups()
              loadStats()
            }}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => createBackup(false)}
            disabled={creating}
          >
            <Database className="h-4 w-4 mr-2" />
            {creating ? 'Creating...' : 'Create Backup'}
          </Button>
        </div>
      </div>

      {/* Scheduler Configuration */}
      {scheduler && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Automatic Backup Schedule
            </CardTitle>
            <CardDescription>
              Configure automatic backup scheduling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="scheduler-enabled">Enable Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically create backups on a schedule
                </p>
              </div>
              <Switch
                id="scheduler-enabled"
                checked={scheduler.running}
                onCheckedChange={toggleScheduler}
              />
            </div>

            {scheduler.running && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Backup Frequency</Label>
                  <Select
                    value={scheduler.frequency}
                    onValueChange={updateSchedulerFrequency}
                  >
                    <SelectTrigger id="frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily (2:00 AM)</SelectItem>
                      <SelectItem value="weekly">Weekly (Sunday 2:00 AM)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st day 2:00 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <p className="font-medium">Scheduler Active</p>
                    <p className="text-muted-foreground">
                      Next backup: {scheduler.nextRun || 'Calculating...'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBackups}</div>
              <p className="text-xs text-muted-foreground">
                {stats.successCount} successful
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSizeFormatted}</div>
              <p className="text-xs text-muted-foreground">
                Across all backups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Latest Backup</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.newestBackup ? formatDate(stats.newestBackup).split(',')[0] : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.newestBackup ? formatDate(stats.newestBackup).split(',')[1] : 'No backups yet'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Backups Table */}
      <Card>
        <CardHeader>
          <CardTitle>Backup History</CardTitle>
          <CardDescription>
            View and manage all database backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading backups...
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backups found. Create your first backup to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {backup.compressed ? (
                          <FileArchive className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Database className="h-4 w-4 text-muted-foreground" />
                        )}
                        {backup.fileName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {backup.type === 'full' ? 'Full' : 'Database'}
                      </Badge>
                      {backup.includesFiles && (
                        <Badge variant="secondary" className="ml-1">
                          +Files
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{backup.size}</TableCell>
                    <TableCell>{formatDate(backup.createdAt)}</TableCell>
                    <TableCell>
                      {backup.status === 'success' ? (
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadBackup(backup.id, backup.fileName)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRestoreId(backup.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(backup.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this backup? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteBackup(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={!!restoreId} onOpenChange={() => setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Backup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this backup? This will replace the current database
              with the backup data. A backup of the current database will be created automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreId && restoreBackup(restoreId)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

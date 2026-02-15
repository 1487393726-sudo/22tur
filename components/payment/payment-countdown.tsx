'use client'

/**
 * 支付倒计时组件
 * 
 * 显示支付剩余时间，超时后自动取消
 */

import { useEffect, useState } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface PaymentCountdownProps {
  expiresAt: Date
  onExpired?: () => void
  showProgress?: boolean
  className?: string
}

export function PaymentCountdown({
  expiresAt,
  onExpired,
  showProgress = true,
  className
}: PaymentCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0)
  const [totalTime, setTotalTime] = useState<number>(0)
  const [isExpired, setIsExpired] = useState<boolean>(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const diff = Math.max(0, Math.floor((expiry - now) / 1000))
      
      return diff
    }

    // 初始化总时间（用于进度条）
    const initial = calculateTimeLeft()
    setTotalTime(initial)
    setTimeLeft(initial)

    // 倒计时
    const timer = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining <= 0 && !isExpired) {
        setIsExpired(true)
        onExpired?.()
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt, onExpired, isExpired])

  // 格式化时间
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 计算进度百分比
  const progress = totalTime > 0 ? (timeLeft / totalTime) * 100 : 0

  // 判断是否即将过期（少于5分钟）
  const isUrgent = timeLeft > 0 && timeLeft <= 5 * 60

  if (isExpired) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          支付已超时，请重新发起支付
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={cn(
            'h-4 w-4',
            isUrgent ? 'text-red-500' : 'text-muted-foreground'
          )} />
          <span className="text-sm text-muted-foreground">
            剩余时间
          </span>
        </div>
        <span className={cn(
          'text-lg font-mono font-semibold',
          isUrgent && 'text-red-500 animate-pulse'
        )}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {showProgress && (
        <Progress 
          value={progress} 
          className={cn(
            'h-2',
            isUrgent && 'bg-red-100'
          )}
        />
      )}

      {isUrgent && (
        <p className="text-xs text-red-500">
          ⚠️ 支付即将超时，请尽快完成支付
        </p>
      )}
    </div>
  )
}

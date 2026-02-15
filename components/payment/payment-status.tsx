'use client'

/**
 * 支付状态显示组件
 * 
 * 显示支付的当前状态（待支付、成功、失败等）
 */

import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Ban
} from 'lucide-react'
import { PaymentStatus } from '@/types/payment'
import { cn } from '@/lib/utils'

interface PaymentStatusBadgeProps {
  status: PaymentStatus
  className?: string
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const statusConfig = {
    [PaymentStatus.PENDING]: {
      label: '待支付',
      icon: Clock,
      variant: 'secondary' as const,
      className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
    },
    [PaymentStatus.SUCCESS]: {
      label: '支付成功',
      icon: CheckCircle2,
      variant: 'default' as const,
      className: 'bg-green-100 text-green-800 hover:bg-green-100'
    },
    [PaymentStatus.FAILED]: {
      label: '支付失败',
      icon: XCircle,
      variant: 'destructive' as const,
      className: 'bg-red-100 text-red-800 hover:bg-red-100'
    },
    [PaymentStatus.REFUNDED]: {
      label: '已退款',
      icon: RefreshCw,
      variant: 'outline' as const,
      className: 'bg-purple-100 text-white800 hover:bg-purple-100'
    },
    [PaymentStatus.CANCELLED]: {
      label: '已取消',
      icon: Ban,
      variant: 'outline' as const,
      className: 'bg-gray-100 text-gray-800 hover:bg-gray-100'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge 
      variant={config.variant}
      className={cn('flex items-center gap-1.5', config.className, className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  )
}

interface PaymentStatusCardProps {
  status: PaymentStatus
  transactionId?: string
  amount?: number
  currency?: string
  paidAt?: Date
  failureReason?: string
  className?: string
}

export function PaymentStatusCard({
  status,
  transactionId,
  amount,
  currency = 'CNY',
  paidAt,
  failureReason,
  className
}: PaymentStatusCardProps) {
  const statusConfig = {
    [PaymentStatus.PENDING]: {
      title: '等待支付',
      description: '请完成支付以继续',
      icon: Clock,
      iconColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    [PaymentStatus.SUCCESS]: {
      title: '支付成功',
      description: '您的支付已完成',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    [PaymentStatus.FAILED]: {
      title: '支付失败',
      description: failureReason || '支付过程中出现错误',
      icon: XCircle,
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    [PaymentStatus.REFUNDED]: {
      title: '已退款',
      description: '款项已退回原支付账户',
      icon: RefreshCw,
      iconColor: 'text-white600',
      bgColor: 'bg-purple-50'
    },
    [PaymentStatus.CANCELLED]: {
      title: '支付已取消',
      description: '您已取消此次支付',
      icon: Ban,
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  const formatAmount = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      CNY: '¥',
      USD: '$',
      EUR: '€',
      JPY: '¥'
    }
    return `${symbols[currency] || ''}${amount.toFixed(2)}`
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date)
  }

  return (
    <div className={cn('rounded-lg border p-6', config.bgColor, className)}>
      <div className="flex items-start gap-4">
        <div className={cn('p-3 rounded-full bg-white', config.iconColor)}>
          <Icon className="h-8 w-8" />
        </div>
        
        <div className="flex-1 space-y-2">
          <h3 className="text-xl font-semibold">{config.title}</h3>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          
          <div className="space-y-1 pt-2">
            {transactionId && (
              <p className="text-sm">
                <span className="text-muted-foreground">交易号：</span>
                <span className="font-mono">{transactionId}</span>
              </p>
            )}
            
            {amount !== undefined && (
              <p className="text-sm">
                <span className="text-muted-foreground">支付金额：</span>
                <span className="font-semibold">{formatAmount(amount, currency)}</span>
              </p>
            )}
            
            {paidAt && (
              <p className="text-sm">
                <span className="text-muted-foreground">支付时间：</span>
                <span>{formatDate(paidAt)}</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

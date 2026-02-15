/**
 * 支付详情页面
 * 显示单个支付交易的详细信息
 */

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PaymentStatus, PaymentMethod } from '@/types/payment'
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

interface PaymentTransaction {
  id: string
  orderId: string
  userId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  transactionId?: string | null
  paymentUrl?: string | null
  qrCode?: string | null
  metadata?: string | null
  failureReason?: string | null
  paidAt?: Date | null
  expiredAt?: Date | null
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    email: string
    firstName?: string | null
    lastName?: string | null
  }
}

export default function PaymentDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [payment, setPayment] = useState<PaymentTransaction | null>(null)
  const [loading, setLoading] = useState(true)

  // 加载支付详情
  const loadPayment = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/payment/status/${id}`)
      if (!response.ok) {
        throw new Error('加载支付详情失败')
      }

      const data = await response.json()
      setPayment(data)
    } catch (error) {
      console.error('加载支付详情失败:', error)
      toast.error('加载支付详情失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && id) {
      loadPayment()
    } else if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, id])

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('已复制到剪贴板')
  }

  // 获取状态配置
  const getStatusConfig = (status: PaymentStatus) => {
    const configs: Record<
      PaymentStatus,
      { icon: any; color: string; label: string; description: string }
    > = {
      PENDING: {
        icon: Clock,
        color: 'text-yellow-600',
        label: '待支付',
        description: '等待用户完成支付',
      },
      SUCCESS: {
        icon: CheckCircle2,
        color: 'text-green-600',
        label: '支付成功',
        description: '支付已完成',
      },
      FAILED: {
        icon: XCircle,
        color: 'text-red-600',
        label: '支付失败',
        description: '支付未能完成',
      },
      CANCELLED: {
        icon: XCircle,
        color: 'text-gray-600',
        label: '已取消',
        description: '支付已被取消',
      },
      REFUNDED: {
        icon: RefreshCw,
        color: 'text-blue-600',
        label: '已退款',
        description: '支付已退款',
      },
    }
    return configs[status] || configs.PENDING
  }

  // 获取支付方式名称
  const getMethodName = (method: PaymentMethod) => {
    const names: Record<PaymentMethod, string> = {
      ALIPAY: '支付宝',
      WECHAT: '微信支付',
      BANK: '银行卡',
      CREDIT_CARD: '信用卡',
    }
    return names[method] || method
  }

  // 格式化金额
  const formatAmount = (amount: number, currency: string = 'CNY') => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  // 格式化日期
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  // 重试支付
  const handleRetry = async () => {
    try {
      toast.info('重试功能开发中...')
      // TODO: 调用重试 API
    } catch (error) {
      toast.error('重试失败')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!payment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">支付记录不存在</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/payments')}
            >
              返回列表
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = getStatusConfig(payment.status)
  const StatusIcon = statusConfig.icon

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/payments')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        返回列表
      </Button>

      {/* 状态卡片 */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full bg-muted ${statusConfig.color}`}>
                <StatusIcon className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{statusConfig.label}</h2>
                <p className="text-muted-foreground">
                  {statusConfig.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                {formatAmount(payment.amount, payment.currency)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {getMethodName(payment.method)}
              </p>
            </div>
          </div>

          {/* 失败原因 */}
          {payment.failureReason && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>失败原因：</strong>
                {payment.failureReason}
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          {(payment.status === 'FAILED' || payment.status === 'CANCELLED') && (
            <div className="mt-4">
              <Button onClick={handleRetry} className="w-full md:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                重新支付
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 交易信息 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>交易信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">交易ID</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {payment.id}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(payment.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">订单号</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {payment.orderId}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(payment.orderId)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {payment.transactionId && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  第三方交易号
                </p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {payment.transactionId}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(payment.transactionId!)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">支付金额</p>
              <p className="text-lg font-semibold">
                {formatAmount(payment.amount, payment.currency)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">支付方式</p>
              <p className="font-medium">{getMethodName(payment.method)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">支付状态</p>
              <Badge variant="outline">{statusConfig.label}</Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">创建时间</p>
              <p className="font-medium">{formatDate(payment.createdAt)}</p>
            </div>

            {payment.paidAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">支付时间</p>
                <p className="font-medium">{formatDate(payment.paidAt)}</p>
              </div>
            )}

            {payment.expiredAt && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">过期时间</p>
                <p className="font-medium">{formatDate(payment.expiredAt)}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-muted-foreground mb-1">更新时间</p>
              <p className="font-medium">{formatDate(payment.updatedAt)}</p>
            </div>
          </div>

          {/* 元数据 */}
          {payment.metadata && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">附加信息</p>
                <pre className="text-sm bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(JSON.parse(payment.metadata), null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 用户信息 */}
      {payment.user && (
        <Card>
          <CardHeader>
            <CardTitle>用户信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">用户ID</p>
                <p className="font-medium">{payment.user.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">邮箱</p>
                <p className="font-medium">{payment.user.email}</p>
              </div>
              {(payment.user.firstName || payment.user.lastName) && (
                <div>
                  <p className="text-sm text-muted-foreground">姓名</p>
                  <p className="font-medium">
                    {payment.user.firstName} {payment.user.lastName}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

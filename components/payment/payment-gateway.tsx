'use client'

/**
 * 支付网关组件
 * 
 * 功能：
 * - 显示支付方式选择
 * - 显示支付二维码（扫码支付）
 * - 显示支付状态和倒计时
 * - 支持支付宝和微信支付
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  CreditCard, 
  Smartphone, 
  QrCode, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { PaymentMethod, PaymentStatus } from '@/types/payment'

interface PaymentGatewayProps {
  orderId: string
  amount: number
  currency?: string
  description?: string
  onSuccess?: (transactionId: string) => void
  onError?: (error: string) => void
  onCancel?: () => void
}

export function PaymentGateway({
  orderId,
  amount,
  currency = 'CNY',
  description,
  onSuccess,
  onError,
  onCancel
}: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(PaymentMethod.ALIPAY)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(PaymentStatus.PENDING)
  const [transactionId, setTransactionId] = useState<string>('')
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [qrCode, setQrCode] = useState<string>('')
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60) // 30分钟倒计时
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  // 倒计时
  useEffect(() => {
    if (paymentStatus !== PaymentStatus.PENDING || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setPaymentStatus(PaymentStatus.CANCELLED)
          setError('支付超时，请重新发起支付')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [paymentStatus, timeLeft])

  // 轮询支付状态
  useEffect(() => {
    if (!transactionId || paymentStatus !== PaymentStatus.PENDING) return

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payment/status/${transactionId}`)
        const data = await response.json()

        if (data.status === PaymentStatus.SUCCESS) {
          setPaymentStatus(PaymentStatus.SUCCESS)
          onSuccess?.(transactionId)
          clearInterval(pollInterval)
        } else if (data.status === PaymentStatus.FAILED) {
          setPaymentStatus(PaymentStatus.FAILED)
          setError(data.failureReason || '支付失败')
          onError?.(data.failureReason || '支付失败')
          clearInterval(pollInterval)
        }
      } catch (err) {
        console.error('轮询支付状态失败:', err)
      }
    }, 3000) // 每3秒轮询一次

    return () => clearInterval(pollInterval)
  }, [transactionId, paymentStatus, onSuccess, onError])

  // 创建支付
  const handleCreatePayment = async (method: PaymentMethod) => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency,
          method
        })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || '创建支付失败')
      }

      setTransactionId(data.transaction.id)
      setPaymentUrl(data.paymentUrl || '')
      setQrCode(data.qrCode || '')
      setPaymentStatus(PaymentStatus.PENDING)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '创建支付失败'
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // 取消支付
  const handleCancelPayment = async () => {
    if (!transactionId) {
      onCancel?.()
      return
    }

    try {
      await fetch('/api/payment/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionId })
      })

      setPaymentStatus(PaymentStatus.CANCELLED)
      onCancel?.()
    } catch (err) {
      console.error('取消支付失败:', err)
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 格式化金额
  const formatAmount = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      CNY: '¥',
      USD: '$',
      EUR: '€',
      JPY: '¥'
    }
    return `${symbols[currency] || ''}${amount.toFixed(2)}`
  }

  // 支付成功状态
  if (paymentStatus === PaymentStatus.SUCCESS) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <h3 className="text-2xl font-bold">支付成功！</h3>
            <p className="text-muted-foreground">
              交易号：{transactionId}
            </p>
            <Button onClick={() => window.location.reload()}>
              完成
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 支付失败状态
  if (paymentStatus === PaymentStatus.FAILED || paymentStatus === PaymentStatus.CANCELLED) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <XCircle className="h-16 w-16 text-red-500" />
            <h3 className="text-2xl font-bold">
              {paymentStatus === PaymentStatus.FAILED ? '支付失败' : '支付已取消'}
            </h3>
            {error && (
              <p className="text-muted-foreground text-center">{error}</p>
            )}
            <div className="flex gap-4">
              <Button variant="outline" onClick={onCancel}>
                返回
              </Button>
              <Button onClick={() => {
                setPaymentStatus(PaymentStatus.PENDING)
                setError('')
                setTransactionId('')
              }}>
                重新支付
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 未创建支付 - 显示支付方式选择
  if (!transactionId) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>选择支付方式</CardTitle>
          <CardDescription>
            {description && <span className="block mb-2">{description}</span>}
            <span className="text-lg font-semibold">
              支付金额：{formatAmount(amount, currency)}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedMethod} onValueChange={(value) => setSelectedMethod(value as PaymentMethod)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value={PaymentMethod.ALIPAY}>
                <Smartphone className="h-4 w-4 mr-2" />
                支付宝
              </TabsTrigger>
              <TabsTrigger value={PaymentMethod.WECHAT}>
                <Smartphone className="h-4 w-4 mr-2" />
                微信支付
              </TabsTrigger>
            </TabsList>

            <TabsContent value={PaymentMethod.ALIPAY} className="space-y-4">
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-24 w-24 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-12 w-12 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">支付宝支付</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      使用支付宝扫码或跳转支付
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value={PaymentMethod.WECHAT} className="space-y-4">
              <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="h-24 w-24 bg-green-100 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-12 w-12 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">微信支付</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      使用微信扫码支付
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isLoading}
            >
              取消
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleCreatePayment(selectedMethod)}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  创建支付中...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  确认支付
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 支付中 - 显示二维码和倒计时
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>扫码支付</CardTitle>
            <CardDescription>
              请使用{selectedMethod === PaymentMethod.ALIPAY ? '支付宝' : '微信'}扫描二维码完成支付
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* 支付金额 */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">支付金额</p>
            <p className="text-3xl font-bold">{formatAmount(amount, currency)}</p>
          </div>

          {/* 二维码 */}
          <div className="flex justify-center">
            {qrCode ? (
              <div className="p-4 bg-white rounded-lg border-2">
                <img src={qrCode} alt="支付二维码" className="h-64 w-64" />
              </div>
            ) : (
              <div className="h-64 w-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isLoading ? '生成二维码中...' : '二维码加载失败'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 支付链接（移动端） */}
          {paymentUrl && (
            <div className="text-center">
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => window.open(paymentUrl, '_blank')}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                打开{selectedMethod === PaymentMethod.ALIPAY ? '支付宝' : '微信'}支付
              </Button>
            </div>
          )}

          {/* 支付状态 */}
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              等待支付中... 支付完成后将自动跳转
            </AlertDescription>
          </Alert>

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelPayment}
            >
              取消支付
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                // 手动刷新支付状态
                fetch(`/api/payment/status/${transactionId}`)
                  .then(res => res.json())
                  .then(data => {
                    if (data.status === PaymentStatus.SUCCESS) {
                      setPaymentStatus(PaymentStatus.SUCCESS)
                      onSuccess?.(transactionId)
                    }
                  })
              }}
            >
              我已完成支付
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

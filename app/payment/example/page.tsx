'use client'

/**
 * 支付网关示例页面
 * 
 * 展示如何使用支付网关组件
 */

import { useState } from 'react'
import { PaymentGateway } from '@/components/payment/payment-gateway'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PaymentExamplePage() {
  const router = useRouter()
  const [showPayment, setShowPayment] = useState(false)

  // 模拟订单数据
  const mockOrder = {
    orderId: `ORDER_${Date.now()}`,
    amount: 99.99,
    currency: 'CNY',
    description: '会员服务 - 月度订阅'
  }

  const handlePaymentSuccess = (transactionId: string) => {
    console.log('支付成功！交易ID:', transactionId)
    alert(`支付成功！\n交易ID: ${transactionId}`)
    setShowPayment(false)
  }

  const handlePaymentError = (error: string) => {
    console.error('支付失败:', error)
    alert(`支付失败：${error}`)
  }

  const handlePaymentCancel = () => {
    console.log('支付已取消')
    setShowPayment(false)
  }

  if (showPayment) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => setShowPayment(false)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        <PaymentGateway
          orderId={mockOrder.orderId}
          amount={mockOrder.amount}
          currency={mockOrder.currency}
          description={mockOrder.description}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          onCancel={handlePaymentCancel}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">支付网关示例</h1>
        <p className="text-muted-foreground">
          演示支付网关组件的使用方法
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 订单信息 */}
        <Card>
          <CardHeader>
            <CardTitle>订单信息</CardTitle>
            <CardDescription>模拟订单数据</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">订单号：</span>
              <span className="font-mono text-sm">{mockOrder.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">商品：</span>
              <span>{mockOrder.description}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">金额：</span>
              <span className="text-lg font-semibold">
                ¥{mockOrder.amount.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* 功能说明 */}
        <Card>
          <CardHeader>
            <CardTitle>功能特性</CardTitle>
            <CardDescription>支付网关组件功能</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>支持支付宝和微信支付</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>显示支付二维码</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>30分钟支付倒计时</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>自动轮询支付状态</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>支持取消和重试</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>响应式设计</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 使用说明 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
          <CardDescription>如何集成支付网关组件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">1. 导入组件</h3>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`import { PaymentGateway } from '@/components/payment/payment-gateway'`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">2. 使用组件</h3>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`<PaymentGateway
  orderId="ORDER_123456"
  amount={99.99}
  currency="CNY"
  description="商品描述"
  onSuccess={(transactionId) => {
    console.log('支付成功', transactionId)
  }}
  onError={(error) => {
    console.error('支付失败', error)
  }}
  onCancel={() => {
    console.log('支付取消')
  }}
/>`}</code>
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">3. 配置后端API</h3>
            <p className="text-sm text-muted-foreground mb-2">
              需要实现以下API端点：
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• POST /api/payment/create - 创建支付</li>
              <li>• GET /api/payment/status/[id] - 查询支付状态</li>
              <li>• POST /api/payment/cancel - 取消支付</li>
              <li>• POST /api/payment/callback - 支付回调</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 开始支付按钮 */}
      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={() => setShowPayment(true)}
          className="px-8"
        >
          开始支付演示
        </Button>
      </div>

      {/* 注意事项 */}
      <Card className="mt-6 border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800">
            <strong>注意：</strong> 这是一个演示页面。实际使用时需要：
          </p>
          <ul className="text-sm text-yellow-800 mt-2 space-y-1 ml-4">
            <li>1. 配置支付宝/微信支付的商户信息</li>
            <li>2. 实现后端支付API</li>
            <li>3. 处理支付回调和签名验证</li>
            <li>4. 实现订单状态更新逻辑</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

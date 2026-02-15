'use client'

/**
 * 支付方式选择器组件
 * 
 * 用于选择支付方式（支付宝、微信、银行卡等）
 */

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Smartphone, CreditCard, Building2, Check } from 'lucide-react'
import { PaymentMethod } from '@/types/payment'

interface PaymentMethodOption {
  value: PaymentMethod
  label: string
  icon: React.ReactNode
  description: string
  color: string
}

const paymentMethods: PaymentMethodOption[] = [
  {
    value: PaymentMethod.ALIPAY,
    label: '支付宝',
    icon: <Smartphone className="h-6 w-6" />,
    description: '使用支付宝扫码或跳转支付',
    color: 'bg-blue-100 text-blue-600 hover:bg-blue-200'
  },
  {
    value: PaymentMethod.WECHAT,
    label: '微信支付',
    icon: <Smartphone className="h-6 w-6" />,
    description: '使用微信扫码支付',
    color: 'bg-green-100 text-green-600 hover:bg-green-200'
  },
  {
    value: PaymentMethod.BANK,
    label: '银行卡',
    icon: <Building2 className="h-6 w-6" />,
    description: '使用网银支付',
    color: 'bg-purple-100 text-white600 hover:bg-purple-200'
  },
  {
    value: PaymentMethod.CREDIT_CARD,
    label: '信用卡',
    icon: <CreditCard className="h-6 w-6" />,
    description: '使用信用卡支付',
    color: 'bg-orange-100 text-orange-600 hover:bg-orange-200'
  }
]

interface PaymentMethodSelectorProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
  disabled?: boolean
  availableMethods?: PaymentMethod[]
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
  availableMethods
}: PaymentMethodSelectorProps) {
  const methods = availableMethods
    ? paymentMethods.filter(m => availableMethods.includes(m.value))
    : paymentMethods

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {methods.map((method) => {
        const isSelected = value === method.value

        return (
          <Card
            key={method.value}
            className={cn(
              'relative cursor-pointer transition-all duration-200',
              'hover:shadow-md hover:scale-[1.02]',
              isSelected && 'ring-2 ring-primary shadow-md',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            onClick={() => !disabled && onChange(method.value)}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* 图标 */}
                <div className={cn(
                  'p-3 rounded-lg transition-colors',
                  method.color
                )}>
                  {method.icon}
                </div>

                {/* 内容 */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">
                    {method.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {method.description}
                  </p>
                </div>

                {/* 选中标记 */}
                {isSelected && (
                  <div className="flex-shrink-0">
                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Receipt,
  Calendar,
  PieChart,
} from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"

interface Expense {
  id: string
  title: string
  amount: number
  category: string
  date: string
}

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  dueDate: string
}

interface ProjectFinanceProps {
  projectId: string
  budget?: number
  expenses: Expense[]
  invoices: Invoice[]
}

export function ProjectFinance({ projectId, budget, expenses, invoices }: ProjectFinanceProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // 计算财务数据
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const budgetUsage = budget ? (totalExpenses / budget) * 100 : 0
  const remainingBudget = budget ? budget - totalExpenses : 0

  // 按类别分组支出
  const expensesByCategory = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0
    }
    acc[expense.category] += expense.amount
    return acc
  }, {} as Record<string, number>)

  // 按状态分组发票
  const invoicesByStatus = {
    DRAFT: invoices.filter((i) => i.status === "DRAFT"),
    SENT: invoices.filter((i) => i.status === "SENT"),
    PAID: invoices.filter((i) => i.status === "PAID"),
    OVERDUE: invoices.filter((i) => i.status === "OVERDUE"),
  }

  const getInvoiceStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; variant: any }> = {
      DRAFT: { text: "草稿", variant: "secondary" },
      SENT: { text: "已发送", variant: "default" },
      PAID: { text: "已支付", variant: "success" },
      OVERDUE: { text: "逾期", variant: "destructive" },
      CANCELLED: { text: "已取消", variant: "outline" },
    }
    const config = statusMap[status] || statusMap.DRAFT
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      人力: "bg-blue-500",
      设备: "bg-green-500",
      材料: "bg-yellow-500",
      差旅: "bg-purple-500",
      其他: "bg-gray-500",
    }
    return colors[category] || colors["其他"]
  }

  return (
    <div className="space-y-6">
      {/* 财务概览卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">项目预算</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {budget ? `¥${budget.toLocaleString()}` : "未设置"}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">总支出</p>
                <p className="text-2xl font-bold text-white mt-2">
                  ¥{totalExpenses.toLocaleString()}
                </p>
                {budget && (
                  <p className="text-xs text-white200 mt-1">
                    {budgetUsage.toFixed(1)}% 已使用
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">总收入</p>
                <p className="text-2xl font-bold text-white mt-2">
                  ¥{totalInvoices.toLocaleString()}
                </p>
                <p className="text-xs text-white200 mt-1">{invoices.length} 张发票</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">剩余预算</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {budget ? `¥${remainingBudget.toLocaleString()}` : "-"}
                </p>
                {budget && (
                  <p className="text-xs text-white200 mt-1">
                    {((remainingBudget / budget) * 100).toFixed(1)}% 可用
                  </p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-white300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 预算使用进度 */}
      {budget && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              预算使用情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white200">预算使用率</span>
                <span className="text-white font-medium">{budgetUsage.toFixed(1)}%</span>
              </div>
              <Progress
                value={Math.min(budgetUsage, 100)}
                className={`h-3 ${
                  budgetUsage > 90
                    ? "[&>div]:bg-red-500"
                    : budgetUsage > 70
                      ? "[&>div]:bg-yellow-500"
                      : "[&>div]:bg-green-500"
                }`}
              />
              <div className="flex justify-between text-xs text-white200">
                <span>已支出: ¥{totalExpenses.toLocaleString()}</span>
                <span>剩余: ¥{remainingBudget.toLocaleString()}</span>
              </div>
            </div>
            {budgetUsage > 90 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm">
                  ⚠️ 预算使用率已超过 90%，请注意控制支出
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 详细信息标签页 */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-white/5">
              <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
                概览
              </TabsTrigger>
              <TabsTrigger value="expenses" className="data-[state=active]:bg-white/20">
                支出明细
              </TabsTrigger>
              <TabsTrigger value="invoices" className="data-[state=active]:bg-white/20">
                发票记录
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* 支出分类统计 */}
              <div>
                <h4 className="text-white font-medium mb-4">支出分类统计</h4>
                <div className="space-y-3">
                  {Object.entries(expensesByCategory).map(([category, amount]) => {
                    const percentage = budget ? (amount / budget) * 100 : 0
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white200">{category}</span>
                          <span className="text-white font-medium">
                            ¥{amount.toLocaleString()}
                          </span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getCategoryColor(category)} transition-all`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {Object.keys(expensesByCategory).length === 0 && (
                    <p className="text-white200 text-sm text-center py-4">暂无支出记录</p>
                  )}
                </div>
              </div>

              {/* 发票状态统计 */}
              <div>
                <h4 className="text-white font-medium mb-4">发票状态统计</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {invoicesByStatus.DRAFT.length}
                    </p>
                    <p className="text-xs text-white200 mt-1">草稿</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {invoicesByStatus.SENT.length}
                    </p>
                    <p className="text-xs text-white200 mt-1">已发送</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {invoicesByStatus.PAID.length}
                    </p>
                    <p className="text-xs text-white200 mt-1">已支付</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">
                      {invoicesByStatus.OVERDUE.length}
                    </p>
                    <p className="text-xs text-white200 mt-1">逾期</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-6">
              <div className="space-y-3">
                {expenses.length > 0 ? (
                  expenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-white font-medium">{expense.title}</h5>
                          <Badge variant="outline">{expense.category}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white200">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(expense.date), "yyyy-MM-dd", { locale: zhCN })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          ¥{expense.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Receipt className="h-12 w-12 text-white300 mx-auto mb-4" />
                    <p className="text-white mb-2">暂无支出记录</p>
                    <p className="text-white200 text-sm">项目支出将在这里显示</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="mt-6">
              <div className="space-y-3">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="text-white font-medium">{invoice.number}</h5>
                          {getInvoiceStatusBadge(invoice.status)}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-white200">
                          <Calendar className="h-3 w-3" />
                          <span>
                            到期日:{" "}
                            {format(new Date(invoice.dueDate), "yyyy-MM-dd", { locale: zhCN })}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          ¥{invoice.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-white300 mx-auto mb-4" />
                    <p className="text-white mb-2">暂无发票记录</p>
                    <p className="text-white200 text-sm">项目发票将在这里显示</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

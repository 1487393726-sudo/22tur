"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Eye, Download, Send } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/invoice-calculations"

interface Invoice {
  id: string
  number: string
  amount: number
  status: string
  dueDate: string
  createdAt: string
  client: {
    name: string
    company?: string
  }
  project?: {
    name: string
  }
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchInvoices()
  }, [page, statusFilter])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "all" && { status: statusFilter }),
      })

      const response = await fetch(`/api/invoices?${params}`)
      if (!response.ok) {
        throw new Error("Failed to fetch invoices")
      }

      const data = await response.json()
      setInvoices(data.invoices)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error("Failed to fetch invoices:", error)
      toast.error("加载发票列表失败")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; variant: any }> = {
      DRAFT: { text: "草稿", variant: "secondary" },
      SENT: { text: "已发送", variant: "default" },
      PAID: { text: "已支付", variant: "success" },
      OVERDUE: { text: "已逾期", variant: "destructive" },
      CANCELLED: { text: "已取消", variant: "outline" },
    }
    const config = statusMap[status] || statusMap.DRAFT
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      invoice.number.toLowerCase().includes(query) ||
      invoice.client.name.toLowerCase().includes(query) ||
      invoice.client.company?.toLowerCase().includes(query)
    )
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">发票管理</h1>
            <p className="text-purple-200">管理和查看所有发票</p>
          </div>
          <Button onClick={() => router.push("/invoices/create")}>
            <Plus className="h-4 w-4 mr-2" />
            创建发票
          </Button>
        </div>

        {/* 筛选和搜索 */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="搜索发票号、客户名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="筛选状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="SENT">已发送</SelectItem>
                  <SelectItem value="PAID">已支付</SelectItem>
                  <SelectItem value="OVERDUE">已逾期</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 发票列表 */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">发票列表</CardTitle>
            <CardDescription className="text-purple-200">
              共 {filteredInvoices.length} 张发票
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-white">加载中...</div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-white">
                <p className="mb-4">暂无发票</p>
                <Button onClick={() => router.push("/invoices/create")}>
                  创建第一张发票
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-purple-200">发票号</TableHead>
                      <TableHead className="text-purple-200">客户</TableHead>
                      <TableHead className="text-purple-200">项目</TableHead>
                      <TableHead className="text-purple-200">金额</TableHead>
                      <TableHead className="text-purple-200">状态</TableHead>
                      <TableHead className="text-purple-200">到期日期</TableHead>
                      <TableHead className="text-purple-200 text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow
                        key={invoice.id}
                        className="border-white/10 hover:bg-white/5 cursor-pointer"
                        onClick={() => router.push(`/invoices/${invoice.id}`)}
                      >
                        <TableCell className="text-white font-medium">
                          {invoice.number}
                        </TableCell>
                        <TableCell className="text-white">
                          <div>
                            <p className="font-medium">
                              {invoice.client.company || invoice.client.name}
                            </p>
                            {invoice.client.company && (
                              <p className="text-sm text-purple-200">
                                {invoice.client.name}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {invoice.project?.name || "-"}
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(invoice.amount)}
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-white">
                          {format(new Date(invoice.dueDate), "yyyy-MM-dd", {
                            locale: zhCN,
                          })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/invoices/${invoice.id}`)}
                              className="text-white hover:bg-white/10"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  上一页
                </Button>
                <span className="flex items-center px-4 text-white">
                  第 {page} / {totalPages} 页
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  下一页
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

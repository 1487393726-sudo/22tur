"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { InvoicePreview } from "@/components/invoices/invoice-preview"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInvoice()
  }, [params.id])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch invoice")
      }
      const data = await response.json()
      
      // 解析 description 字段中的 JSON 数据
      let parsedData = data
      if (data.description) {
        try {
          const descriptionData = JSON.parse(data.description)
          parsedData = {
            ...data,
            items: descriptionData.items || [],
            taxRate: descriptionData.taxRate || 13,
            notes: descriptionData.notes || "",
            description: descriptionData.description || "",
          }
        } catch (e) {
          console.error("Failed to parse description:", e)
        }
      }
      
      setInvoice(parsedData)
    } catch (error) {
      console.error("Failed to fetch invoice:", error)
      toast.error("加载发票失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = async () => {
    // PDF 下载由 InvoicePreview 组件内部处理
    // 这里不需要额外操作
  }

  const handleSend = async () => {
    toast.info("邮件发送功能即将推出")
    // TODO: 实现邮件发送功能（Task 10.6）
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <p className="text-white">加载中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
        <div className="max-w-5xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-12 text-center">
              <p className="text-white mb-4">发票不存在</p>
              <Button variant="outline" onClick={() => router.back()}>
                返回
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6 print:bg-white print:p-0">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 页面标题 - 不打印 */}
        <div className="flex items-center gap-4 print:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">发票详情</h1>
            <p className="text-purple-200">发票号: {invoice.number}</p>
          </div>
        </div>

        {/* 发票预览 */}
        <InvoicePreview
          invoice={invoice}
          companyInfo={{
            name: "您的公司名称",
            address: "公司地址：北京市朝阳区XX路XX号",
            phone: "010-12345678",
            email: "contact@company.com",
            taxId: "税号：91110000XXXXXXXXXX",
            bankAccount: "开户行：中国工商银行北京分行 账号：1234 5678 9012 3456",
          }}
          onPrint={handlePrint}
          onSend={handleSend}
        />
      </div>
    </div>
  )
}

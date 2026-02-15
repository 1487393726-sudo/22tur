"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Printer, Send } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import {
  calculateInvoiceDetails,
  formatCurrency,
} from "@/lib/invoice-calculations"
import {
  generateInvoicePDF,
  downloadPDF,
} from "@/lib/pdf-generator"
import { toast } from "sonner"

interface InvoiceLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  subtotal: number
}

interface InvoiceData {
  number: string
  dueDate: Date
  createdAt?: Date
  status?: string
  description?: string
  notes?: string
  items: InvoiceLineItem[]
  taxRate: number
  client: {
    name: string
    company?: string
    email?: string
    phone?: string
    address?: string
  }
  project?: {
    name: string
  }
}

interface CompanyInfo {
  name: string
  address?: string
  phone?: string
  email?: string
  taxId?: string
  bankAccount?: string
}

interface InvoicePreviewProps {
  invoice: InvoiceData
  companyInfo?: CompanyInfo
  onPrint?: () => void
  onDownload?: () => void
  onSend?: () => void
  showActions?: boolean
}

const defaultCompanyInfo: CompanyInfo = {
  name: "您的公司名称",
  address: "公司地址",
  phone: "联系电话",
  email: "company@example.com",
  taxId: "税号：XXXXXXXXXX",
  bankAccount: "开户行：XX银行 账号：XXXX XXXX XXXX XXXX",
}

export function InvoicePreview({
  invoice,
  companyInfo = defaultCompanyInfo,
  onPrint,
  onDownload,
  onSend,
  showActions = true,
}: InvoicePreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  // 计算发票详细金额
  const details = calculateInvoiceDetails(invoice.items, invoice.taxRate)

  // 获取状态显示文本和颜色
  const getStatusDisplay = (status?: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      DRAFT: { text: "草稿", color: "text-gray-500" },
      SENT: { text: "已发送", color: "text-blue-500" },
      PAID: { text: "已支付", color: "text-green-500" },
      OVERDUE: { text: "已逾期", color: "text-red-500" },
      CANCELLED: { text: "已取消", color: "text-gray-400" },
    }
    return statusMap[status || "DRAFT"] || statusMap.DRAFT
  }

  const statusDisplay = getStatusDisplay(invoice.status)

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  const handleDownloadPDF = async () => {
    if (onDownload) {
      onDownload()
      return
    }

    if (!previewRef.current) {
      toast.error("无法生成 PDF")
      return
    }

    try {
      setIsGeneratingPDF(true)
      toast.info("正在生成 PDF...")

      // 生成 PDF
      const blob = await generateInvoicePDF(
        previewRef.current,
        invoice.number,
        {
          quality: 0.95,
          scale: 2,
        }
      )

      // 下载 PDF
      downloadPDF(blob, `invoice-${invoice.number}.pdf`)
      toast.success("PDF 已下载")
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast.error("PDF 生成失败")
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 操作按钮 - 不打印 */}
      {showActions && (
        <div className="flex justify-end gap-2 print:hidden">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            打印
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            {isGeneratingPDF ? "生成中..." : "下载 PDF"}
          </Button>
          {onSend && (
            <Button onClick={onSend}>
              <Send className="h-4 w-4 mr-2" />
              发送邮件
            </Button>
          )}
        </div>
      )}

      {/* 发票预览内容 */}
      <Card
        ref={previewRef}
        className="bg-white text-black print:shadow-none print:border-none"
      >
        <CardContent className="p-8 md:p-12">
          {/* 头部 - 公司信息和发票标题 */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white600 mb-2">
                {companyInfo.name}
              </h1>
              {companyInfo.address && (
                <p className="text-sm text-gray-600">{companyInfo.address}</p>
              )}
              {companyInfo.phone && (
                <p className="text-sm text-gray-600">电话: {companyInfo.phone}</p>
              )}
              {companyInfo.email && (
                <p className="text-sm text-gray-600">邮箱: {companyInfo.email}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-2">发票</h2>
              <p className="text-sm text-gray-600">
                发票号: <span className="font-semibold">{invoice.number}</span>
              </p>
              {invoice.createdAt && (
                <p className="text-sm text-gray-600">
                  开票日期:{" "}
                  {format(new Date(invoice.createdAt), "yyyy年MM月dd日", {
                    locale: zhCN,
                  })}
                </p>
              )}
              <p className="text-sm text-gray-600">
                到期日期:{" "}
                {format(new Date(invoice.dueDate), "yyyy年MM月dd日", {
                  locale: zhCN,
                })}
              </p>
              {invoice.status && (
                <p className={`text-sm font-semibold mt-2 ${statusDisplay.color}`}>
                  状态: {statusDisplay.text}
                </p>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          {/* 客户信息和项目信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-2">
                客户信息
              </h3>
              <div className="space-y-1">
                <p className="font-semibold">
                  {invoice.client.company || invoice.client.name}
                </p>
                {invoice.client.company && invoice.client.name && (
                  <p className="text-sm text-gray-600">
                    联系人: {invoice.client.name}
                  </p>
                )}
                {invoice.client.email && (
                  <p className="text-sm text-gray-600">{invoice.client.email}</p>
                )}
                {invoice.client.phone && (
                  <p className="text-sm text-gray-600">{invoice.client.phone}</p>
                )}
                {invoice.client.address && (
                  <p className="text-sm text-gray-600">{invoice.client.address}</p>
                )}
              </div>
            </div>

            {invoice.project && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">
                  项目信息
                </h3>
                <p className="font-semibold">{invoice.project.name}</p>
              </div>
            )}
          </div>

          {/* 发票描述 */}
          {invoice.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">描述</h3>
              <p className="text-sm text-gray-700">{invoice.description}</p>
            </div>
          )}

          {/* 明细表格 */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">
                    项目描述
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                    数量
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                    单价
                  </th>
                  <th className="text-right py-3 px-2 text-sm font-semibold text-gray-700">
                    小计
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 px-2 text-sm">{item.description}</td>
                    <td className="py-3 px-2 text-sm text-right">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-2 text-sm text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-3 px-2 text-sm text-right font-medium">
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 金额汇总 */}
          <div className="flex justify-end mb-8">
            <div className="w-full md:w-1/2 space-y-2">
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">小计:</span>
                <span className="text-sm font-medium">
                  {formatCurrency(details.subtotal)}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600">
                  税额 ({details.taxRate}%):
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(details.taxAmount)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between py-2">
                <span className="text-lg font-bold">总计:</span>
                <span className="text-lg font-bold text-white600">
                  {formatCurrency(details.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* 备注 */}
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">备注</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {invoice.notes}
              </p>
            </div>
          )}

          <Separator className="my-6" />

          {/* 页脚 - 公司详细信息 */}
          <div className="text-center text-xs text-gray-500 space-y-1">
            {companyInfo.taxId && <p>{companyInfo.taxId}</p>}
            {companyInfo.bankAccount && <p>{companyInfo.bankAccount}</p>}
            <p className="mt-4">感谢您的业务！</p>
          </div>
        </CardContent>
      </Card>

      {/* 打印样式 */}
      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          
          .print\\:border-none {
            border: none !important;
          }
          
          /* 确保内容适合页面 */
          @page {
            size: A4;
            margin: 1cm;
          }
          
          /* 避免分页时断开表格行 */
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          /* 确保标题不会单独在页面底部 */
          h1, h2, h3 {
            page-break-after: avoid;
          }
        }
      `}</style>
    </div>
  )
}

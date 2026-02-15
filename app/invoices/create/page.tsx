"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { InvoiceForm, InvoiceFormData } from "@/components/invoices/invoice-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function CreateInvoicePage() {
  const router = useRouter()
  const [clients, setClients] = useState<Array<{ id: string; name: string; company?: string }>>([])
  const [projects, setProjects] = useState<Array<{ id: string; name: string; clientId: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // 获取客户列表
      const clientsRes = await fetch("/api/clients")
      if (clientsRes.ok) {
        const clientsData = await clientsRes.json()
        setClients(clientsData)
      }

      // 获取项目列表
      const projectsRes = await fetch("/api/projects")
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json()
        setProjects(projectsData)
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
      toast.error("加载数据失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (data: InvoiceFormData) => {
    try {
      // 计算总金额
      const subtotal = data.items.reduce((sum, item) => sum + item.subtotal, 0)
      const taxAmount = subtotal * (data.taxRate / 100)
      const totalAmount = subtotal + taxAmount

      // 准备发票数据
      const invoiceData = {
        number: data.number,
        clientId: data.clientId,
        projectId: data.projectId || null,
        amount: totalAmount,
        status: "DRAFT",
        dueDate: data.dueDate.toISOString(),
        description: JSON.stringify({
          description: data.description,
          items: data.items,
          taxRate: data.taxRate,
          subtotal,
          taxAmount,
          totalAmount,
          notes: data.notes,
        }),
      }

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error("Failed to create invoice")
      }

      const result = await response.json()
      toast.success("发票创建成功")
      router.push(`/invoices/${result.id}`)
    } catch (error) {
      console.error("Failed to create invoice:", error)
      throw error
    }
  }

  const handleCancel = () => {
    router.back()
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">创建发票</h1>
          <p className="text-purple-200">填写发票信息并添加明细项</p>
        </div>

        {/* 发票表单 */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">发票信息</CardTitle>
            <CardDescription className="text-purple-200">
              请填写完整的发票信息，系统将自动计算税额和总额
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              clients={clients}
              projects={projects}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

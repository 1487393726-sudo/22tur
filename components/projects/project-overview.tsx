"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Calendar,
  DollarSign,
  Users,
  FileText,
  CheckSquare,
  Edit,
  Building2,
  User,
  Clock,
  TrendingUp,
} from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"

interface ProjectOverviewProps {
  project: {
    id: string
    name: string
    description?: string
    status: string
    priority: string
    startDate?: string
    endDate?: string
    budget?: number
    client: {
      id: string
      name: string
      company?: string
    }
    department?: {
      id: string
      name: string
    }
    members: Array<{
      id: string
      role: string
      user: {
        id: string
        firstName: string
        lastName: string
        avatar?: string
      }
    }>
    tasks: Array<{
      id: string
      title: string
      status: string
    }>
    documents: Array<{
      id: string
      title: string
    }>
    expenses?: Array<{
      id: string
      amount: number
    }>
  }
  onUpdate: () => void
}

export function ProjectOverview({ project, onUpdate }: ProjectOverviewProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
    budget: project.budget?.toString() || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          budget: formData.budget ? parseFloat(formData.budget) : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update project")
      }

      toast.success("项目信息已更新")
      setIsEditDialogOpen(false)
      onUpdate()
    } catch (error) {
      console.error("Failed to update project:", error)
      toast.error("更新项目失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  // 计算统计数据
  const completedTasks = project.tasks.filter((task) => task.status === "DONE").length
  const taskCompletionRate =
    project.tasks.length > 0 ? Math.round((completedTasks / project.tasks.length) * 100) : 0
  const totalExpenses = project.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0
  const budgetUsageRate = project.budget ? Math.round((totalExpenses / project.budget) * 100) : 0

  return (
    <div className="space-y-6">
      {/* 基本信息卡片 */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">基本信息</CardTitle>
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-white border-white/20">
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-white/20">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-white">编辑项目信息</DialogTitle>
                  <DialogDescription className="text-white200">
                    修改项目的基本信息
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white">
                      项目名称
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      项目描述
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="text-white">
                      预算金额
                    </Label>
                    <Input
                      id="budget"
                      type="number"
                      step="0.01"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="text-white border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isSubmitting ? "保存中..." : "保存"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white200 text-sm">
                <FileText className="h-4 w-4" />
                <span>项目名称</span>
              </div>
              <p className="text-white font-medium">{project.name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white200 text-sm">
                <User className="h-4 w-4" />
                <span>客户</span>
              </div>
              <p className="text-white font-medium">
                {project.client.name}
                {project.client.company && (
                  <span className="text-white200 text-sm ml-2">({project.client.company})</span>
                )}
              </p>
            </div>

            {project.department && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white200 text-sm">
                  <Building2 className="h-4 w-4" />
                  <span>部门</span>
                </div>
                <p className="text-white font-medium">{project.department.name}</p>
              </div>
            )}

            {project.budget && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white200 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>预算</span>
                </div>
                <p className="text-white font-medium">¥{project.budget.toLocaleString()}</p>
              </div>
            )}

            {project.startDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white200 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>开始日期</span>
                </div>
                <p className="text-white font-medium">
                  {format(new Date(project.startDate), "yyyy-MM-dd", { locale: zhCN })}
                </p>
              </div>
            )}

            {project.endDate && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white200 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>结束日期</span>
                </div>
                <p className="text-white font-medium">
                  {format(new Date(project.endDate), "yyyy-MM-dd", { locale: zhCN })}
                </p>
              </div>
            )}
          </div>

          {project.description && (
            <div className="space-y-2 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-white200 text-sm">
                <FileText className="h-4 w-4" />
                <span>项目描述</span>
              </div>
              <p className="text-white">{project.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 统计数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white200 text-sm">团队成员</p>
                <p className="text-3xl font-bold text-white mt-2">{project.members.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-white300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white200 text-sm">任务总数</p>
                <p className="text-3xl font-bold text-white mt-2">{project.tasks.length}</p>
                <p className="text-white200 text-xs mt-1">
                  已完成 {completedTasks} / {project.tasks.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white200 text-sm">文档数量</p>
                <p className="text-3xl font-bold text-white mt-2">{project.documents.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white200 text-sm">已支出</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ¥{totalExpenses.toLocaleString()}
                </p>
                {project.budget && (
                  <p className="text-white200 text-xs mt-1">预算使用率 {budgetUsageRate}%</p>
                )}
              </div>
              <div className="h-12 w-12 rounded-full bg-pink-500/20 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 项目进度卡片 */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            项目进度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white200">任务完成率</span>
              <span className="text-white font-medium">{taskCompletionRate}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
            <p className="text-white200 text-xs">
              {completedTasks} 个任务已完成，{project.tasks.length - completedTasks} 个任务进行中
            </p>
          </div>

          {project.budget && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white200">预算使用率</span>
                <span className="text-white font-medium">{budgetUsageRate}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    budgetUsageRate > 90
                      ? "bg-red-500"
                      : budgetUsageRate > 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetUsageRate, 100)}%` }}
                />
              </div>
              <p className="text-white200 text-xs">
                已支出 ¥{totalExpenses.toLocaleString()}，剩余 ¥
                {(project.budget - totalExpenses).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 项目时间线卡片 */}
      {(project.startDate || project.endDate) && (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              项目时间线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.startDate && (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">项目开始</p>
                    <p className="text-white200 text-sm">
                      {format(new Date(project.startDate), "yyyy年MM月dd日", { locale: zhCN })}
                    </p>
                  </div>
                </div>
              )}

              {project.endDate && (
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">计划结束</p>
                    <p className="text-white200 text-sm">
                      {format(new Date(project.endDate), "yyyy年MM月dd日", { locale: zhCN })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Calendar, DollarSign, Users, FileText, CheckSquare } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"
import { ProjectOverview } from "@/components/projects/project-overview"
import { ProjectMembers } from "@/components/projects/project-members"
import { ProjectTasks } from "@/components/projects/project-tasks"
import { ProjectDocuments } from "@/components/projects/project-documents"
import { ProjectFinance } from "@/components/projects/project-finance"

interface Project {
  id: string
  name: string
  description?: string
  status: string
  priority: string
  startDate?: string
  endDate?: string
  budget?: number
  clientId: string
  departmentId?: string
  createdAt: string
  updatedAt: string
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
}

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    fetchProject()
  }, [params.id])

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      if (!response.ok) {
        throw new Error("Failed to fetch project")
      }
      const data = await response.json()
      setProject(data)
    } catch (error) {
      console.error("Failed to fetch project:", error)
      toast.error("加载项目失败")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; variant: any }> = {
      PLANNING: { text: "计划中", variant: "secondary" },
      IN_PROGRESS: { text: "进行中", variant: "default" },
      COMPLETED: { text: "已完成", variant: "success" },
      ON_HOLD: { text: "暂停", variant: "warning" },
      CANCELLED: { text: "已取消", variant: "destructive" },
    }
    const config = statusMap[status] || statusMap.PLANNING
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  const getPriorityBadge = (priority: string) => {
    const priorityMap: Record<string, { text: string; variant: any }> = {
      LOW: { text: "低", variant: "secondary" },
      MEDIUM: { text: "中", variant: "default" },
      HIGH: { text: "高", variant: "destructive" },
    }
    const config = priorityMap[priority] || priorityMap.MEDIUM
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  const calculateProgress = () => {
    if (!project || !project.tasks || project.tasks.length === 0) return 0
    const completedTasks = project.tasks.filter((task) => task.status === "DONE").length
    return Math.round((completedTasks / project.tasks.length) * 100)
  }

  if (isLoading) {
    return (
      <div className="purple-gradient-page purple-gradient-content min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="purple-gradient-card bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="purple-gradient-card p-12 text-center">
              <p className="text-white">加载中...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="purple-gradient-card bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="purple-gradient-card p-12 text-center">
              <p className="text-white mb-4">项目不存在</p>
              <Button variant="outline" onClick={() => router.back()}>
                返回
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* 项目头部信息 */}
        <Card className="purple-gradient-card bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="purple-gradient-card p-6">
            <div className="space-y-4">
              {/* 标题行 */}
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="purple-gradient-title text-3xl font-bold text-white">{project.name}</h1>
                  {project.description && (
                    <p className="text-purple-200">{project.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(project.status)}
                  {getPriorityBadge(project.priority)}
                </div>
              </div>

              {/* 统计信息 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <Users className="h-5 w-5 text-purple-300" />
                  <div>
                    <p className="text-sm text-purple-200">成员</p>
                    <p className="text-lg font-semibold text-white">
                      {project.members?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <CheckSquare className="h-5 w-5 text-purple-300" />
                  <div>
                    <p className="text-sm text-purple-200">任务</p>
                    <p className="text-lg font-semibold text-white">
                      {project.tasks?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <FileText className="h-5 w-5 text-purple-300" />
                  <div>
                    <p className="text-sm text-purple-200">文档</p>
                    <p className="text-lg font-semibold text-white">
                      {project.documents?.length || 0}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                  <DollarSign className="h-5 w-5 text-purple-300" />
                  <div>
                    <p className="text-sm text-purple-200">预算</p>
                    <p className="text-lg font-semibold text-white">
                      {project.budget ? `¥${project.budget.toLocaleString()}` : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 进度条 */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-purple-200">项目进度</span>
                  <span className="text-white font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* 日期信息 */}
              <div className="flex flex-wrap gap-4 text-sm text-purple-200">
                {project.startDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      开始：
                      {format(new Date(project.startDate), "yyyy-MM-dd", {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      结束：
                      {format(new Date(project.endDate), "yyyy-MM-dd", {
                        locale: zhCN,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 标签页内容 */}
        <Card className="purple-gradient-card bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="purple-gradient-card p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5 bg-white/5">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
                  概览
                </TabsTrigger>
                <TabsTrigger value="members" className="data-[state=active]:bg-white/20">
                  成员
                </TabsTrigger>
                <TabsTrigger value="tasks" className="data-[state=active]:bg-white/20">
                  任务
                </TabsTrigger>
                <TabsTrigger value="documents" className="data-[state=active]:bg-white/20">
                  文档
                </TabsTrigger>
                <TabsTrigger value="finance" className="data-[state=active]:bg-white/20">
                  财务
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <ProjectOverview project={project} onUpdate={fetchProject} />
              </TabsContent>

              <TabsContent value="members" className="mt-6">
                <ProjectMembers 
                  projectId={project.id} 
                  members={project.members} 
                  onUpdate={fetchProject} 
                />
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <ProjectTasks
                  projectId={project.id}
                  tasks={project.tasks}
                  members={project.members}
                  onUpdate={fetchProject}
                />
              </TabsContent>

              <TabsContent value="documents" className="mt-6">
                <ProjectDocuments
                  projectId={project.id}
                  documents={project.documents}
                  onUpdate={fetchProject}
                />
              </TabsContent>

              <TabsContent value="finance" className="mt-6">
                <ProjectFinance
                  projectId={project.id}
                  budget={project.budget}
                  expenses={project.expenses || []}
                  invoices={project.invoices || []}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

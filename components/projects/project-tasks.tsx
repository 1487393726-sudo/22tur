"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Calendar, User, CheckCircle2, Circle, Clock } from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  dueDate?: string
  assignee?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
  creator: {
    id: string
    firstName: string
    lastName: string
  }
  createdAt: string
}

interface ProjectTasksProps {
  projectId: string
  tasks: Task[]
  members: Array<{
    user: {
      id: string
      firstName: string
      lastName: string
    }
  }>
  onUpdate: () => void
}

export function ProjectTasks({ projectId, tasks, members, onUpdate }: ProjectTasksProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [viewMode, setViewMode] = useState<"status" | "list">("status")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    assigneeId: "",
    dueDate: "",
  })

  // 按状态分组任务
  const tasksByStatus = {
    TODO: tasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: tasks.filter((t) => t.status === "IN_PROGRESS"),
    DONE: tasks.filter((t) => t.status === "DONE"),
  }

  // 计算进度
  const completedCount = tasksByStatus.DONE.length
  const totalCount = tasks.length
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // 创建任务
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error("请输入任务标题")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          priority: formData.priority,
          assigneeId: formData.assigneeId || undefined,
          dueDate: formData.dueDate || undefined,
        }),
      })

      if (!response.ok) throw new Error("Failed to create task")

      toast.success("任务已创建")
      setIsCreateDialogOpen(false)
      setFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        assigneeId: "",
        dueDate: "",
      })
      onUpdate()
    } catch (error) {
      console.error("Failed to create task:", error)
      toast.error("创建任务失败")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { text: string; variant: any; icon: any }> = {
      TODO: { text: "待办", variant: "secondary", icon: Circle },
      IN_PROGRESS: { text: "进行中", variant: "default", icon: Clock },
      DONE: { text: "已完成", variant: "success", icon: CheckCircle2 },
    }
    const config = statusMap[status] || statusMap.TODO
    const Icon = config.icon
    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    )
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

  const StatusColumn = ({ status, title }: { status: string; title: string }) => {
    const statusTasks = tasksByStatus[status as keyof typeof tasksByStatus]
    return (
      <div className="flex-1 min-w-[280px]">
        <div className="bg-white/5 rounded-lg p-3 mb-3">
          <h4 className="text-white font-medium flex items-center justify-between">
            {title}
            <span className="text-sm text-white200">{statusTasks.length}</span>
          </h4>
        </div>
        <div className="space-y-3">
          {statusTasks.map((task) => (
            <Card
              key={task.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-white font-medium flex-1">{task.title}</h5>
                    {getPriorityBadge(task.priority)}
                  </div>
                  {task.description && (
                    <p className="text-sm text-white200 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-white200">
                    {task.assignee && (
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>
                          {task.assignee.firstName} {task.assignee.lastName}
                        </span>
                      </div>
                    )}
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{format(new Date(task.dueDate), "MM-dd", { locale: zhCN })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {statusTasks.length === 0 && (
            <div className="text-center py-8 text-white300 text-sm">暂无任务</div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">项目任务</h3>
          <p className="text-sm text-white200">
            共 {totalCount} 个任务，已完成 {completedCount} 个
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">按状态</SelectItem>
              <SelectItem value="list">列表视图</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-white/20 hover:bg-white/30 text-white">
                <Plus className="h-4 w-4 mr-2" />
                创建任务
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-white/20 max-w-2xl">
              <form onSubmit={handleCreateTask}>
                <DialogHeader>
                  <DialogTitle className="text-white">创建新任务</DialogTitle>
                  <DialogDescription className="text-white200">
                    为项目添加新的任务
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">
                      任务标题 *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="输入任务标题..."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">
                      任务描述
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white/10 border-white/20 text-white min-h-[100px]"
                      placeholder="输入任务描述..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-white">
                        优先级
                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(v) => setFormData({ ...formData, priority: v })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">低</SelectItem>
                          <SelectItem value="MEDIUM">中</SelectItem>
                          <SelectItem value="HIGH">高</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="assignee" className="text-white">
                        负责人
                      </Label>
                      <Select
                        value={formData.assigneeId}
                        onValueChange={(v) => setFormData({ ...formData, assigneeId: v })}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="选择负责人" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">未分配</SelectItem>
                          {members.map((member) => (
                            <SelectItem key={member.user.id} value={member.user.id}>
                              {member.user.firstName} {member.user.lastName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate" className="text-white">
                      截止日期
                    </Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="text-white border-white/20"
                  >
                    取消
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-white/20 hover:bg-white/30 text-white"
                  >
                    {isSubmitting ? "创建中..." : "创建"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 进度条 */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white200">任务完成进度</span>
              <span className="text-white font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-white200">
              {completedCount} / {totalCount} 个任务已完成
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 任务视图 */}
      {viewMode === "status" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <StatusColumn status="TODO" title="待办" />
          <StatusColumn status="IN_PROGRESS" title="进行中" />
          <StatusColumn status="DONE" title="已完成" />
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-white font-medium">{task.title}</h5>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-sm text-white200">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-white200">
                      {task.assignee && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {task.assignee.firstName} {task.assignee.lastName}
                          </span>
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {format(new Date(task.dueDate), "yyyy-MM-dd", { locale: zhCN })}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <span>
                          创建于 {format(new Date(task.createdAt), "yyyy-MM-dd", { locale: zhCN })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {tasks.length === 0 && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 text-white300 mx-auto mb-4" />
                <p className="text-white mb-2">暂无任务</p>
                <p className="text-white200 text-sm mb-4">点击上方按钮创建任务</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

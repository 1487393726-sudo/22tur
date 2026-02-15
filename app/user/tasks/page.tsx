"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit,
  Trash2,
  Search,
  Sparkles,
} from "lucide-react";
import "@/styles/user-pages.css";

interface UserTask {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function TasksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tasks, setTasks] = useState<UserTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<UserTask | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session?.user) fetchTasks();
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/user/tasks");
      if (response.ok) setTasks(await response.json());
    } catch (error) {
      console.error("获取任务列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return alert("请输入任务标题");

    try {
      const method = editingTask ? "PUT" : "POST";
      const payload = editingTask ? { ...formData, taskId: editingTask.id } : formData;
      const response = await fetch("/api/user/tasks", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTasks();
        resetForm();
      }
    } catch (error) {
      console.error("操作失败:", error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？")) return;
    try {
      await fetch("/api/user/tasks", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      await fetchTasks();
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await fetch("/api/user/tasks/complete", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      });
      await fetchTasks();
    } catch (error) {
      console.error("操作失败:", error);
    }
  };

  const resetForm = () => {
    setFormData({ title: "", description: "", priority: "MEDIUM", dueDate: "" });
    setEditingTask(null);
    setShowAddDialog(false);
  };

  const getStatusBadge = (s: string) => {
    const styles: Record<string, string> = {
      TODO: "bg-muted text-muted-foreground",
      IN_PROGRESS: "bg-primary/30 text-primary",
      COMPLETED: "bg-success/30 text-success",
      CANCELLED: "bg-destructive/30 text-destructive",
    };
    const labels: Record<string, string> = { TODO: "待办", IN_PROGRESS: "进行中", COMPLETED: "已完成", CANCELLED: "已取消" };
    return <Badge className={styles[s] || ""}>{labels[s] || s}</Badge>;
  };

  const getPriorityBadge = (p: string) => {
    const styles: Record<string, string> = { HIGH: "bg-destructive/30 text-destructive", MEDIUM: "bg-warning/30 text-warning", LOW: "bg-success/30 text-success" };
    const labels: Record<string, string> = { HIGH: "高", MEDIUM: "中", LOW: "低" };
    return <Badge className={styles[p] || ""}>{labels[p] || p}</Badge>;
  };

  const getStatusIcon = (s: string) => {
    if (s === "IN_PROGRESS") return <AlertCircle className="h-5 w-5 text-primary" />;
    if (s === "COMPLETED") return <CheckCircle2 className="h-5 w-5 text-success" />;
    return <Circle className="h-5 w-5 text-muted-foreground" />;
  };

  const filteredTasks = tasks.filter((task) => {
    const tabMatch = activeTab === "active" ? ["TODO", "IN_PROGRESS"].includes(task.status) : activeTab === "completed" ? task.status === "COMPLETED" : task.status === "CANCELLED";
    const priorityMatch = filterPriority === "all" || task.priority === filterPriority;
    const searchMatch = !searchTerm || task.title.toLowerCase().includes(searchTerm.toLowerCase());
    return tabMatch && priorityMatch && searchMatch;
  });

  const stats = { total: tasks.length, todo: tasks.filter((t) => t.status === "TODO").length, inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length, completed: tasks.filter((t) => t.status === "COMPLETED").length };

  if (status === "loading") return <div className="user-page-container flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" /></div>;
  if (!session?.user) return null;

  return (
    <div className="user-page-container">
      <div className="user-page-hero">
        <div className="user-page-hero-content">
          <div className="user-page-hero-header">
            <div className="user-page-hero-icon"><CheckSquare className="w-8 h-8" /></div>
            <div className="user-page-hero-title-section">
              <div className="user-page-hero-title-row">
                <h1 className="user-page-hero-title">任务管理</h1>
                <span className="user-page-badge user-page-badge-new">{stats.total} 个任务</span>
                <Sparkles className="user-page-sparkle" />
              </div>
              <p className="user-page-hero-description">管理您的待办任务，提高工作效率</p>
            </div>
          </div>
          <div className="user-page-stats-grid">
            {[{ icon: CheckSquare, value: stats.total, label: "总任务" }, { icon: Circle, value: stats.todo, label: "待办" }, { icon: AlertCircle, value: stats.inProgress, label: "进行中" }, { icon: CheckCircle2, value: stats.completed, label: "已完成" }].map((s, i) => (
              <div key={i} className="user-page-stat-card">
                <div className="user-page-stat-icon"><s.icon className="w-5 h-5" /></div>
                <div className="user-page-stat-content">
                  <span className="user-page-stat-value">{s.value}</span>
                  <span className="user-page-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="user-page-actions">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <button className="user-button user-button-primary user-button-md"><Plus className="w-4 h-4" />新建任务</button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-foreground">创建新任务</DialogTitle>
                  <DialogDescription className="text-muted-foreground">添加一个新的任务到您的待办列表</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label className="text-foreground">任务标题 *</Label><Input placeholder="请输入任务标题" value={formData.title} onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))} className="bg-background border-border text-foreground" required /></div>
                  <div><Label className="text-foreground">任务描述</Label><Textarea placeholder="请输入任务描述" value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} rows={3} className="bg-background border-border text-foreground" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="text-foreground">优先级</Label><Select value={formData.priority} onValueChange={(v) => setFormData((p) => ({ ...p, priority: v }))}><SelectTrigger className="bg-background border-border text-foreground"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="HIGH">高</SelectItem><SelectItem value="MEDIUM">中</SelectItem><SelectItem value="LOW">低</SelectItem></SelectContent></Select></div>
                    <div><Label className="text-foreground">截止日期</Label><Input type="date" value={formData.dueDate} onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))} className="bg-background border-border text-foreground" /></div>
                  </div>
                  <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={resetForm} className="bg-background border-border text-foreground">取消</Button><button type="submit" className="user-button user-button-primary user-button-md">创建任务</button></div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      <div className="user-page-content">
        <div className="user-search-filter-bar">
          <div className="user-search-input-wrapper"><Search className="user-search-icon w-4 h-4" /><input type="text" placeholder="搜索任务..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="user-search-input" /></div>
          <Select value={filterPriority} onValueChange={setFilterPriority}><SelectTrigger className="w-40 bg-white/5 border-white/10 text-white"><SelectValue placeholder="筛选优先级" /></SelectTrigger><SelectContent><SelectItem value="all">所有优先级</SelectItem><SelectItem value="HIGH">高优先级</SelectItem><SelectItem value="MEDIUM">中优先级</SelectItem><SelectItem value="LOW">低优先级</SelectItem></SelectContent></Select>
        </div>
        <div className="user-tabs">
          {[{ id: "active", label: "进行中", icon: AlertCircle, count: stats.todo + stats.inProgress }, { id: "completed", label: "已完成", icon: CheckCircle2, count: stats.completed }, { id: "cancelled", label: "已取消", icon: Circle }].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`user-tab ${activeTab === t.id ? "active" : ""}`}><t.icon className="user-tab-icon" /><span>{t.label}</span>{t.count !== undefined && <span className="user-tab-badge">{t.count}</span>}</button>
          ))}
        </div>
        {loading ? <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400" /></div> : filteredTasks.length === 0 ? (
          <div className="user-card"><div className="user-empty-state"><div className="user-empty-state-icon"><CheckSquare className="w-12 h-12" /></div><h3 className="user-empty-state-title">{activeTab === "active" ? "暂无进行中的任务" : "暂无相关任务"}</h3><p className="user-empty-state-description">{activeTab === "active" ? "创建您的第一个任务" : "相关任务会显示在这里"}</p>{activeTab === "active" && <button onClick={() => setShowAddDialog(true)} className="user-button user-button-primary user-button-md"><Plus className="w-4 h-4" />创建任务</button>}</div></div>
        ) : (
          <div className="space-y-3">{filteredTasks.map((task) => (
            <div key={task.id} className="user-list-item">
              <div className="user-list-item-icon">{getStatusIcon(task.status)}</div>
              <div className="user-list-item-content">
                <div className="user-list-item-header"><span className="user-list-item-title">{task.title}</span>{getStatusBadge(task.status)}{getPriorityBadge(task.priority)}</div>
                {task.description && <p className="user-list-item-description">{task.description}</p>}
                <div className="user-list-item-meta"><span className="flex items-center gap-1"><Calendar className="w-4 h-4" />创建于 {new Date(task.createdAt).toLocaleDateString()}</span>{task.dueDate && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />截止 {new Date(task.dueDate).toLocaleDateString()}</span>}</div>
              </div>
              <div className="user-list-item-actions">
                {!["COMPLETED", "CANCELLED"].includes(task.status) && <Button size="sm" onClick={() => handleComplete(task.id)} className="bg-green-500/20 text-green-300 hover:bg-green-500/30 border-0"><CheckCircle2 className="w-4 h-4 mr-1" />完成</Button>}
                <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditingTask(task); setFormData({ title: task.title, description: task.description || "", priority: task.priority, dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "" }); setShowAddDialog(true); }} className="text-white/60 hover:text-white hover:bg-white/10"><Edit className="w-4 h-4" /></Button><Button size="sm" variant="ghost" onClick={() => handleDelete(task.id)} className="text-red-400 hover:text-red-300 hover:bg-red-500/10"><Trash2 className="w-4 h-4" /></Button></div>
              </div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Flag,
  CheckCircle2,
  Circle,
  AlertCircle,
  Edit,
  Trash2,
  Filter,
} from "lucide-react";

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
  const [showEditDialog, setShowEditDialog] = useState(false);

  // 表单数据状态
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });

  // ?  const [filterPriority, setFilterPriority] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session]);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/user/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error(":", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("请输入任务标题");
      return;
    }

    try {
      const url = editingTask ? "/api/user/tasks" : "/api/user/tasks";
      const method = editingTask ? "PUT" : "POST";
      const payload = editingTask
        ? { ...formData, taskId: editingTask.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchTasks();
        resetForm();
        alert(editingTask ? "" : "");
      } else {
        const error = await response.json();
        alert(error.message || "");
      }
    } catch (error) {
      console.error(":", error);
      alert("");
    }
  };

  const handleEdit = (task: UserTask) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().split("T")[0]
        : "",
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？")) {
      return;
    }

    try {
      const response = await fetch("/api/user/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        await fetchTasks();
        alert("");
      } else {
        alert("");
      }
    } catch (error) {
      console.error(":", error);
      alert("");
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      const response = await fetch("/api/user/tasks/complete", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId }),
      });

      if (response.ok) {
        await fetchTasks();
        alert("任务已删除");
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("删除任务失败:", error);
      alert("删除失败");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "MEDIUM",
      dueDate: "",
    });
    setEditingTask(null);
    setShowAddDialog(false);
    setShowEditDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "TODO":
        return (
          <Badge variant="outline" data-oid="_rkve-9">
            
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-500" data-oid="n18dasl">
            ?          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500" data-oid="ptcs4ad">
            ?          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" data-oid="ovhsa9p">
            ?          </Badge>
        );
      default:
        return (
          <Badge variant="outline" data-oid="x0gv_lf">
            {status}
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return (
          <Badge variant="destructive" data-oid="s86-c26">
            ?          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-orange-500" data-oid="47e57qq">
            ?          </Badge>
        );
      case "LOW":
        return (
          <Badge variant="secondary" data-oid="eyz573k">
            ?          </Badge>
        );
      default:
        return (
          <Badge variant="outline" data-oid=".y:2aju">
            {priority}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "TODO":
        return <Circle className="h-5 w-5 text-gray-400" data-oid="in77tj6" />;
      case "IN_PROGRESS":
        return (
          <AlertCircle className="h-5 w-5 text-blue-500" data-oid="7kcq_p2" />
        );
      case "COMPLETED":
        return (
          <CheckCircle2 className="h-5 w-5 text-green-500" data-oid="6m11kzn" />
        );
      default:
        return <Circle className="h-5 w-5 text-gray-400" data-oid="vqeb-bn" />;
    }
  };

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    let matchesTab = true;
    let matchesPriority = true;
    let matchesSearch = true;

    switch (activeTab) {
      case "active":
        matchesTab = ["TODO", "IN_PROGRESS"].includes(task.status);
        break;
      case "completed":
        matchesTab = task.status === "COMPLETED";
        break;
      case "cancelled":
        matchesTab = task.status === "CANCELLED";
        break;
    }

    if (filterPriority !== "all") {
      matchesPriority = task.priority === filterPriority;
    }

    if (searchTerm) {
      matchesSearch =
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    }

    return matchesTab && matchesPriority && matchesSearch;
  });

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
  };

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        data-oid="irqc2.j"
      >
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          data-oid="mtxj8xs"
        ></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900"
      data-oid="vb.5m3d"
    >
      {/* ?*/}
      <header
        className="bg-black/50 backdrop-blur-sm border-b border-white/10"
        data-oid="e4dqeyw"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="p8:3chn"
        >
          <div
            className="flex justify-between items-center h-16"
            data-oid="njs:4hg"
          >
            <div className="flex items-center space-x-4" data-oid="0qhmiti">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-white/10"
                data-oid="jiokh1n"
              >
                <ArrowLeft className="h-4 w-4 mr-2" data-oid="ye8-yi8" />
                ?              </Button>
              <h1
                className="purple-gradient-title text-xl font-semibold text-white"
                data-oid="lcf-8q9"
              >
                
              </h1>
            </div>
            <Dialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              data-oid=".1f8eu2"
            >
              <DialogTrigger asChild data-oid="yh.57vh">
                <Button data-oid="vyvp37g" className="purple-gradient-button">
                  <Plus className="h-4 w-4 mr-2" data-oid="3acfznl" />
                  
                </Button>
              </DialogTrigger>
              <DialogContent
                className="bg-black/90 border-white/20 backdrop-blur-sm"
                data-oid="w:0u3v5"
              >
                <DialogHeader data-oid="3twmrr8">
                  <DialogTitle className="text-white" data-oid="vvbrqog">
                    ?                  </DialogTitle>
                  <DialogDescription
                    className="text-gray-300"
                    data-oid="-gpdw.l"
                  >
                    
                  </DialogDescription>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  data-oid="kiu1tj9"
                >
                  <div data-oid="tohtpiw">
                    <Label
                      htmlFor="title"
                      className="text-white"
                      data-oid="yvthl2i"
                    >
                       *
                    </Label>
                    <Input
                      id="title"
                      placeholder="?
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      required
                      data-oid="4c8:h-:"
                    />
                  </div>

                  <div data-oid="5ksk6bh">
                    <Label
                      htmlFor="description"
                      className="text-white"
                      data-oid="wz5fp8h"
                    >
                      
                    </Label>
                    <Textarea
                      id="description"
                      placeholder=""
                      value={formData.description}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      data-oid="5iuc5mk"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4" data-oid="rbq:dm9">
                    <div data-oid="d.c9qex">
                      <Label
                        htmlFor="priority"
                        className="text-white"
                        data-oid="iz.zwtn"
                      >
                        ?                      </Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, priority: value }))
                        }
                        data-oid="sczisbs"
                      >
                        <SelectTrigger
                          className="bg-white/10 border-white/20 text-white"
                          data-oid="gyu7ne."
                        >
                          <SelectValue data-oid="b6g8w-z" />
                        </SelectTrigger>
                        <SelectContent data-oid="z7.k-8e">
                          <SelectItem value="HIGH" data-oid="jm3hxbk">
                            ?                          </SelectItem>
                          <SelectItem value="MEDIUM" data-oid="fndu26l">
                            ?                          </SelectItem>
                          <SelectItem value="LOW" data-oid="ue4aias">
                            ?                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div data-oid=".htmy.h">
                      <Label
                        htmlFor="dueDate"
                        className="text-white"
                        data-oid="3wqj5n."
                      >
                        
                      </Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dueDate: e.target.value,
                          }))
                        }
                        className="bg-white/10 border-white/20 text-white"
                        data-oid="r6nwws:"
                      />
                    </div>
                  </div>

                  <div
                    className="flex justify-end space-x-2"
                    data-oid=".htwx15"
                  >
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      data-oid="db3:sf7"
                    >
                      
                    </Button>
                    <Button
                      type="submit"
                      className="purple-gradient-button bg-white/20 hover:bg-white/30 text-white border-white/30"
                      data-oid="qhszmr0"
                    >
                      
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
        data-oid="276jesu"
      >
        <div className="px-4 py-6 sm:px-0" data-oid="h204s47">
          {/*  */}
          <div
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
            data-oid="e0vapoi"
          >
            <Card
              className="purple-gradient-card bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="j.sxf6w"
            >
              <CardContent className="purple-gradient-card p-6" data-oid="-8vg:rq">
                <div
                  className="flex items-center justify-between"
                  data-oid="i080cpj"
                >
                  <div data-oid="yand9ys">
                    <p
                      className="text-sm font-medium text-gray-300"
                      data-oid="zo7w8u2"
                    >
                      ?                    </p>
                    <p
                      className="text-2xl font-bold text-white"
                      data-oid="xdl0yc-"
                    >
                      {taskStats.total}
                    </p>
                  </div>
                  <CheckSquare
                    className="h-8 w-8 text-blue-400"
                    data-oid="mpj0qv2"
                  />
                </div>
              </CardContent>
            </Card>
            <Card
              className="purple-gradient-card bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="gzqges-"
            >
              <CardContent className="purple-gradient-card p-6" data-oid="j3yxzo2">
                <div
                  className="flex items-center justify-between"
                  data-oid="vsaow9r"
                >
                  <div data-oid="33w3v-d">
                    <p
                      className="text-sm font-medium text-gray-300"
                      data-oid="6s1:i-g"
                    >
                      
                    </p>
                    <p
                      className="text-2xl font-bold text-white"
                      data-oid="qnub69c"
                    >
                      {taskStats.todo}
                    </p>
                  </div>
                  <Circle
                    className="h-8 w-8 text-gray-400"
                    data-oid="zfu90cv"
                  />
                </div>
              </CardContent>
            </Card>
            <Card
              className="purple-gradient-card bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="kj2b6zs"
            >
              <CardContent className="purple-gradient-card p-6" data-oid="irn879m">
                <div
                  className="flex items-center justify-between"
                  data-oid="2qea:tb"
                >
                  <div data-oid="gruu9cu">
                    <p
                      className="text-sm font-medium text-gray-300"
                      data-oid="7x-mwhx"
                    >
                      ?                    </p>
                    <p
                      className="text-2xl font-bold text-white"
                      data-oid="exa_s.n"
                    >
                      {taskStats.inProgress}
                    </p>
                  </div>
                  <AlertCircle
                    className="h-8 w-8 text-blue-400"
                    data-oid="7-p4dw9"
                  />
                </div>
              </CardContent>
            </Card>
            <Card
              className="purple-gradient-card bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="y:vo5uv"
            >
              <CardContent className="purple-gradient-card p-6" data-oid="qjwklmc">
                <div
                  className="flex items-center justify-between"
                  data-oid="ccx3pku"
                >
                  <div data-oid="7h7wc.h">
                    <p
                      className="text-sm font-medium text-gray-300"
                      data-oid="1_ix3js"
                    >
                      ?                    </p>
                    <p
                      className="text-2xl font-bold text-white"
                      data-oid="1w-pckr"
                    >
                      {taskStats.completed}
                    </p>
                  </div>
                  <CheckCircle2
                    className="h-8 w-8 text-green-400"
                    data-oid="icp1.mc"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ?*/}
          <Card
            className="purple-gradient-card mb-6 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="6lazlvl"
          >
            <CardContent className="purple-gradient-card p-4" data-oid="_0f5:1-">
              <div
                className="flex flex-col md:flex-row gap-4"
                data-oid="kl4qyb6"
              >
                <div className="flex-1 relative" data-oid="9iejcwy">
                  <Filter
                    className="absolute left-3 top-3 h-4 w-4 text-gray-300"
                    data-oid="t6-5b0b"
                  />
                  <Input
                    placeholder="..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-white/10 border-white/20 text-white placeholder-gray-400"
                    data-oid="sqm0tk."
                  />
                </div>
                <Select
                  value={filterPriority}
                  onValueChange={setFilterPriority}
                  data-oid="fjmi2pi"
                >
                  <SelectTrigger
                    className="w-full md:w-48 bg-white/10 border-white/20 text-white"
                    data-oid="e7j71f8"
                  >
                    <SelectValue placeholder="" data-oid="nx.x:6-" />
                  </SelectTrigger>
                  <SelectContent data-oid="b:ckki3">
                    <SelectItem value="all" data-oid="nrsz5i.">
                      
                    </SelectItem>
                    <SelectItem value="HIGH" data-oid="23n9kvt">
                      
                    </SelectItem>
                    <SelectItem value="MEDIUM" data-oid="4pky4xs">
                      
                    </SelectItem>
                    <SelectItem value="LOW" data-oid="-6p6w3_">
                      
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            data-oid="9f:bdec"
          >
            <TabsList className="grid w-full grid-cols-3" data-oid="5h6336r">
              <TabsTrigger value="active" data-oid="f-e5.aq">
                ?              </TabsTrigger>
              <TabsTrigger value="completed" data-oid="pun.4mm">
                ?              </TabsTrigger>
              <TabsTrigger value="cancelled" data-oid="6rlg_7_">
                ?              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6" data-oid="0rhi3h_">
              {loading ? (
                <div
                  className="flex items-center justify-center h-64"
                  data-oid="tbk6dc4"
                >
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                    data-oid="2tad:.o"
                  ></div>
                </div>
              ) : (
                <div className="space-y-4" data-oid="iyb0t1s">
                  {filteredTasks.length === 0 ? (
                    <Card
                      className="purple-gradient-card bg-white/10 border-white/20 backdrop-blur-sm"
                      data-oid="qswn83k"
                    >
                      <CardContent
                        className="purple-gradient-card text-center py-12"
                        data-oid="nj3o7nq"
                      >
                        <CheckSquare
                          className="h-12 w-12 text-gray-400 mx-auto mb-4"
                          data-oid="lhtmpw3"
                        />
                        <h3
                          className="text-lg font-medium text-white mb-2"
                          data-oid="2mbmu1v"
                        >
                          {activeTab === "active"
                            ? ""
                            : activeTab === "completed"
                              ? ""
                              : ""}
                        </h3>
                        <p className="text-gray-300 mb-4" data-oid="5cyl_bc">
                          {activeTab === "active"
                            ? "?
                            : activeTab === "completed"
                              ? "?
                              : ""}
                        </p>
                        {activeTab === "active" && (
                          <Button
                            onClick={() => setShowAddDialog(true)}
                            className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                            data-oid="-_hjxn0"
                          >
                            <Plus className="h-4 w-4 mr-2" data-oid="a7msqfw" />
                            
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="purple-gradient-card bg-white/10 border-white/20 backdrop-blur-sm"
                        data-oid="8s3vun6"
                      >
                        <CardContent className="purple-gradient-card p-6" data-oid="thlhzod">
                          <div
                            className="flex items-start justify-between"
                            data-oid="fcgyy8q"
                          >
                            <div
                              className="flex items-start space-x-3 flex-1"
                              data-oid="hemca2v"
                            >
                              {getStatusIcon(task.status)}
                              <div
                                className="flex-1 min-w-0"
                                data-oid="n6x2r.n"
                              >
                                <div
                                  className="flex items-center space-x-2 mb-2"
                                  data-oid=".0c:6:d"
                                >
                                  <h3
                                    className="font-medium text-white truncate"
                                    data-oid="ox8-f5h"
                                  >
                                    {task.title}
                                  </h3>
                                  {getStatusBadge(task.status)}
                                  {getPriorityBadge(task.priority)}
                                </div>

                                {task.description && (
                                  <p
                                    className="text-sm text-gray-300 mb-3 line-clamp-2"
                                    data-oid="jj6itbg"
                                  >
                                    {task.description}
                                  </p>
                                )}

                                <div
                                  className="flex items-center space-x-4 text-sm text-gray-400"
                                  data-oid="rmr.le9"
                                >
                                  <div
                                    className="flex items-center space-x-1"
                                    data-oid="g7vagio"
                                  >
                                    <Calendar
                                      className="h-4 w-4"
                                      data-oid="egyk7d_"
                                    />
                                    <span data-oid="0sb:8:b">
                                      {" "}
                                      {new Date(
                                        task.createdAt,
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>

                                  {task.dueDate && (
                                    <div
                                      className="flex items-center space-x-1"
                                      data-oid=".68hrtv"
                                    >
                                      <Clock
                                        className="h-4 w-4"
                                        data-oid="8ugs4be"
                                      />
                                      <span data-oid="o5qe8ia">
                                        {" "}
                                        {new Date(
                                          task.dueDate,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}

                                  {task.completedAt && (
                                    <div
                                      className="flex items-center space-x-1"
                                      data-oid="zi5td6e"
                                    >
                                      <CheckCircle2
                                        className="h-4 w-4"
                                        data-oid="0s-alv_"
                                      />
                                      <span data-oid="9-:itb5">
                                        {" "}
                                        {new Date(
                                          task.completedAt,
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div
                              className="flex items-center space-x-2 ml-4"
                              data-oid="na3zd2j"
                            >
                              {task.status !== "COMPLETED" &&
                                task.status !== "CANCELLED" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEdit(task)}
                                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                      data-oid="fu5unug"
                                    >
                                      <Edit
                                        className="h-4 w-4"
                                        data-oid="somx3c."
                                      />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleComplete(task.id)}
                                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                      data-oid="06mve:k"
                                    >
                                      <CheckCircle2
                                        className="h-4 w-4"
                                        data-oid="zysa090"
                                      />
                                    </Button>
                                  </>
                                )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(task.id)}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                data-oid="z-ym-sr"
                              >
                                <Trash2
                                  className="h-4 w-4"
                                  data-oid="139kio8"
                                />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ?*/}
      <Dialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        data-oid="m.xxcr3"
      >
        <DialogContent
          className="bg-black/90 border-white/20 backdrop-blur-sm"
          data-oid="0fwyeof"
        >
          <DialogHeader data-oid="lkpoz33">
            <DialogTitle className="text-white" data-oid="82smwt-">
              
            </DialogTitle>
            <DialogDescription className="text-gray-300" data-oid="cmm_g7t">
              
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-oid="nspmhkb"
          >
            <div data-oid="7qtumij">
              <Label
                htmlFor="edit-title"
                className="text-white"
                data-oid="lpi89om"
              >
                 *
              </Label>
              <Input
                id="edit-title"
                placeholder="?
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                required
                data-oid="8ibziqk"
              />
            </div>

            <div data-oid="b52v9hl">
              <Label
                htmlFor="edit-description"
                className="text-white"
                data-oid="oqj15rd"
              >
                
              </Label>
              <Textarea
                id="edit-description"
                placeholder=""
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                data-oid="ck3w2ur"
              />
            </div>

            <div className="grid grid-cols-2 gap-4" data-oid="6g4n9-i">
              <div data-oid="5bt99fn">
                <Label
                  htmlFor="edit-priority"
                  className="text-white"
                  data-oid="mhg879q"
                >
                  ?                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, priority: value }))
                  }
                  data-oid="0u7_7co"
                >
                  <SelectTrigger
                    className="bg-white/10 border-white/20 text-white"
                    data-oid="veknmou"
                  >
                    <SelectValue data-oid="rauw1ux" />
                  </SelectTrigger>
                  <SelectContent data-oid="hk75cxk">
                    <SelectItem value="HIGH" data-oid="50k5klt">
                      ?                    </SelectItem>
                    <SelectItem value="MEDIUM" data-oid="pikldsq">
                      ?                    </SelectItem>
                    <SelectItem value="LOW" data-oid="tt1wrs.">
                      ?                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div data-oid="i9y8jsg">
                <Label
                  htmlFor="edit-dueDate"
                  className="text-white"
                  data-oid="c4wrbzr"
                >
                  
                </Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                  className="bg-white/10 border-white/20 text-white"
                  data-oid="8x-q_uo"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2" data-oid="fz6mnk:">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                data-oid="ky5jp.9"
              >
                
              </Button>
              <Button
                type="submit"
                className="purple-gradient-button bg-white/20 hover:bg-white/30 text-white border-white/30"
                data-oid="t3n.4tc"
              >
                
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

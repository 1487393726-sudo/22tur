"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  CheckSquare,
  Calendar,
  User,
  AlertCircle,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTaskModal } from "@/components/task/create-task-modal";
import { ViewTaskModal } from "@/components/task/view-task-modal";
import { EditTaskModal } from "@/components/task/edit-task-modal";
import { TaskStatus, TaskPriority, TaskItem } from "@/types";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  assigneeId?: string;
  assignee?: {
    name: string;
    email: string;
  };
  creator?: {
    name: string;
  };
  project?: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // 获取状态徽章样式
  const getStatusBadge = (status: TaskStatus) => {
    const statusConfig = {
      TODO: {
        label: "待办",
        className: "bg-gray-100 text-gray-800",
        icon: <Clock className="w-3 h-3" data-oid="8et7r7c" />,
      },
      IN_PROGRESS: {
        label: "进行中",
        className: "bg-blue-100 text-blue-800",
        icon: <RotateCcw className="w-3 h-3" data-oid="f7.stpb" />,
      },
      IN_REVIEW: {
        label: "待审核",
        className: "bg-yellow-100 text-yellow-800",
        icon: <AlertCircle className="w-3 h-3" data-oid="qdpsgf7" />,
      },
      DONE: {
        label: "已完成",
        className: "bg-green-100 text-green-800",
        icon: <CheckCircle className="w-3 h-3" data-oid="ran7iqc" />,
      },
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className} data-oid="971bu:1">
        {config.icon}
        <span className="ml-1" data-oid="e372zge">
          {config.label}
        </span>
      </Badge>
    );
  };

  // 获取优先级徽章样式
  const getPriorityBadge = (priority: TaskPriority) => {
    const priorityConfig = {
      LOW: { label: "低", className: "bg-green-100 text-green-800" },
      MEDIUM: { label: "中", className: "bg-yellow-100 text-yellow-800" },
      HIGH: { label: "高", className: "bg-orange-100 text-orange-800" },
      URGENT: { label: "紧急", className: "bg-red-100 text-red-800" },
    };

    const config = priorityConfig[priority];
    return (
      <Badge className={config.className} data-oid="dwyqwzf">
        {config.label}
      </Badge>
    );
  };

  // 获取任务数据
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
        setFilteredTasks(data);
      }
    } catch (error) {
      console.error("获取任务数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索和过滤
  useEffect(() => {
    let filtered = tasks;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assignee?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          task.project?.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 状态过滤
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // 优先级过滤
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
    setViewModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setEditModalOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("确定要删除这个任务吗？此操作不可撤销。")) {
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error("删除任务失败:", error);
    }
  };

  const handleTaskCreated = () => {
    fetchTasks();
    setCreateModalOpen(false);
  };

  const handleTaskUpdated = () => {
    fetchTasks();
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  // 计算统计数据
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const urgentTasks = tasks.filter(
    (t) => t.priority === "URGENT" && t.status !== "DONE",
  ).length;
  const overdueTasks = tasks.filter(
    (t) => new Date(t.dueDate) < new Date() && t.status !== "DONE",
  ).length;

  if (loading) {
    return (
      <div className="p-6" data-oid="vzb_.y2">
        <div className="max-w-7xl mx-auto" data-oid="lyn921n">
          <div className="animate-pulse" data-oid="lt7zzex">
            <div
              className="h-8 bg-gray-200 rounded w-64 mb-8"
              data-oid="8rqvfv1"
            ></div>
            <div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              data-oid="k0ypy.t"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 rounded-lg"
                  data-oid="mdwjjhl"
                ></div>
              ))}
            </div>
            <div
              className="h-96 bg-gray-100 rounded-lg"
              data-oid="yq22btq"
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-oid="63n5noc">
      <div className="max-w-7xl mx-auto" data-oid="hwa3-87">
        {/* 页面标题 */}
        <div
          className="flex justify-between items-center mb-8"
          data-oid="khz_ug8"
        >
          <div data-oid="30p5oa7">
            <h1 className="text-3xl font-bold theme-gradient-text" data-oid="dg:i4-l">
              任务管理
            </h1>
            <p className="text-gray-300 mt-2" data-oid="fex::0m">
              分配任务、跟踪进度和管理团队工作
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="theme-gradient-bg text-white hover:shadow-lg transition-shadow"
            data-oid="i:nhalp"
          >
            <Plus className="w-4 h-4 mr-2" data-oid="-mjs:y9" />
            创建任务
          </Button>
        </div>

        {/* 统计卡片 */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-oid="c9w80r4"
        >
          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="mu-prrh"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="e8bt7ca"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="u5ytfau"
              >
                总任务数
              </CardTitle>
              <CheckSquare
                className="h-4 w-4 text-blue-400"
                data-oid="j9pva78"
              />
            </CardHeader>
            <CardContent data-oid="hzvde0a">
              <div className="text-2xl font-bold text-white" data-oid="ky:qidv">
                {totalTasks}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="vy9e3_e"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid=":qfw7gy"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="hqj.w0r"
              >
                进行中
              </CardTitle>
              <RotateCcw
                className="h-4 w-4 text-yellow-400"
                data-oid=":x3djeo"
              />
            </CardHeader>
            <CardContent data-oid="hddgohc">
              <div className="text-2xl font-bold text-white" data-oid="mv59a02">
                {inProgressTasks}
              </div>
              <p className="text-xs text-gray-300" data-oid=":3m269o">
                {totalTasks > 0
                  ? Math.round((inProgressTasks / totalTasks) * 100)
                  : 0}
                % 活跃
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid=".0q:9mx"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="abxgwb4"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="lmdv74w"
              >
                已完成
              </CardTitle>
              <CheckCircle
                className="h-4 w-4 text-green-400"
                data-oid="2or1_wa"
              />
            </CardHeader>
            <CardContent data-oid="8y315j5">
              <div className="text-2xl font-bold text-white" data-oid="3z-hbob">
                {completedTasks}
              </div>
              <p className="text-xs text-gray-300" data-oid="g.:kbl5">
                {totalTasks > 0
                  ? Math.round((completedTasks / totalTasks) * 100)
                  : 0}
                % 完成率
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="hv4fqp0"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="k1c_hbc"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="4k56-4h"
              >
                紧急任务
              </CardTitle>
              <AlertCircle
                className="h-4 w-4 text-red-400"
                data-oid="ix9sd-j"
              />
            </CardHeader>
            <CardContent data-oid="i71ygu5">
              <div
                className="text-2xl font-bold text-red-400"
                data-oid="onozyas"
              >
                {urgentTasks}
              </div>
              <p className="text-xs text-gray-300" data-oid="ysaetcf">
                {overdueTasks} 项已逾期
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和过滤 */}
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm mb-6"
          data-oid="vvfqf.y"
        >
          <CardContent className="p-4" data-oid="iaonzek">
            <div className="flex flex-col sm:flex-row gap-4" data-oid="t494x.m">
              <div className="flex-1" data-oid="t889q3m">
                <div className="relative" data-oid="4-h1:3r">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4"
                    data-oid="j5.15bo"
                  />
                  <Input
                    placeholder="搜索任务标题、描述、负责人或项目..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                    data-oid="1t7vqms"
                  />
                </div>
              </div>
              <div className="flex gap-2" data-oid="ig-3d-7">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white"
                  data-oid="luo:2-l"
                >
                  <option value="all" data-oid="ch55r36">
                    所有状态
                  </option>
                  <option value="TODO" data-oid="08xlfox">
                    待办
                  </option>
                  <option value="IN_PROGRESS" data-oid="pyyb438">
                    进行中
                  </option>
                  <option value="IN_REVIEW" data-oid="8jd7kr4">
                    待审核
                  </option>
                  <option value="DONE" data-oid="xhz2jxa">
                    已完成
                  </option>
                </select>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white"
                  data-oid="0rjlsfl"
                >
                  <option value="all" data-oid=":y6-b7x">
                    所有优先级
                  </option>
                  <option value="LOW" data-oid="jon5g19">
                    低
                  </option>
                  <option value="MEDIUM" data-oid="76uny7.">
                    中
                  </option>
                  <option value="HIGH" data-oid="dt237j7">
                    高
                  </option>
                  <option value="URGENT" data-oid=":esxrta">
                    紧急
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据标签页 */}
        <Tabs defaultValue="all" className="space-y-4" data-oid=":6u_j:_">
          <TabsList
            className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-5 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid=":pytap8"
          >
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="kyj8b89"
            >
              全部任务
            </TabsTrigger>
            <TabsTrigger
              value="todo"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="nxr:abd"
            >
              待办
            </TabsTrigger>
            <TabsTrigger
              value="in-progress"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="9.5lz1h"
            >
              进行中
            </TabsTrigger>
            <TabsTrigger
              value="in-review"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="zg6iwp-"
            >
              待审核
            </TabsTrigger>
            <TabsTrigger
              value="done"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="b9mw_1h"
            >
              已完成
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" data-oid="ipr3mm6">
            <TaskTable
              tasks={filteredTasks}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              data-oid="6xeenxc"
            />
          </TabsContent>

          <TabsContent value="todo" data-oid="eggqop3">
            <TaskTable
              tasks={filteredTasks.filter((t) => t.status === "TODO")}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              data-oid="w7tonll"
            />
          </TabsContent>

          <TabsContent value="in-progress" data-oid="4g25vws">
            <TaskTable
              tasks={filteredTasks.filter((t) => t.status === "IN_PROGRESS")}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              data-oid="kfac2tt"
            />
          </TabsContent>

          <TabsContent value="in-review" data-oid="wa6bljb">
            <TaskTable
              tasks={filteredTasks.filter((t) => t.status === "IN_REVIEW")}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              data-oid="96g4e2u"
            />
          </TabsContent>

          <TabsContent value="done" data-oid="g5_mjgd">
            <TaskTable
              tasks={filteredTasks.filter((t) => t.status === "DONE")}
              onView={handleViewTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              getStatusBadge={getStatusBadge}
              getPriorityBadge={getPriorityBadge}
              data-oid="4597-h4"
            />
          </TabsContent>
        </Tabs>

        {/* 模态框 */}
        <CreateTaskModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleTaskCreated}
          data-oid="f91i6-."
        />

        <ViewTaskModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          task={selectedTask}
          data-oid="-j2kcl."
        />

        <EditTaskModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          task={selectedTask}
          onSuccess={handleTaskUpdated}
          data-oid="qowe575"
        />
      </div>
    </div>
  );
}

// 任务表格组件
interface TaskTableProps {
  tasks: Task[];
  onView: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  getStatusBadge: (status: TaskStatus) => JSX.Element;
  getPriorityBadge: (priority: TaskPriority) => JSX.Element;
}

function TaskTable({
  tasks,
  onView,
  onEdit,
  onDelete,
  getStatusBadge,
  getPriorityBadge,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <Card
        className="bg-white/10 border-white/20 backdrop-blur-sm"
        data-oid="ahf.1kq"
      >
        <CardContent className="p-12" data-oid="518kly8">
          <div className="text-center" data-oid="oywl_1t">
            <CheckSquare
              className="mx-auto h-12 w-12 text-gray-300 mb-4"
              data-oid="u.ipm1i"
            />
            <h3
              className="text-lg font-medium text-white mb-2"
              data-oid="i2nrkno"
            >
              暂无任务
            </h3>
            <p className="text-gray-300" data-oid="e19.c-c">
              没有找到符合条件的任务
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className="bg-white/10 border-white/20 backdrop-blur-sm"
      data-oid="8kolprf"
    >
      <CardContent className="p-0" data-oid="kpnwk:2">
        <div className="overflow-x-auto" data-oid="iqj6po7">
          <Table data-oid="13.ggfq">
            <TableHeader data-oid="kekcz:s">
              <TableRow data-oid="j3ri_of">
                <TableHead className="text-white" data-oid="bslkujc">
                  任务标题
                </TableHead>
                <TableHead className="text-white" data-oid="mo-1yb3">
                  状态
                </TableHead>
                <TableHead className="text-white" data-oid="c-mj5ne">
                  优先级
                </TableHead>
                <TableHead className="text-white" data-oid="2:5.bfm">
                  负责人
                </TableHead>
                <TableHead className="text-white" data-oid="j3p:gfy">
                  项目
                </TableHead>
                <TableHead className="text-white" data-oid="6ysd:c5">
                  截止日期
                </TableHead>
                <TableHead className="text-white w-[100px]" data-oid="t:w6epl">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-oid="_-.s0o7">
              {tasks.map((task) => (
                <TableRow key={task.id} data-oid="d-xhuq:">
                  <TableCell data-oid="iji0yn5">
                    <div data-oid="b8fae11">
                      <div
                        className="font-medium text-white"
                        data-oid="yo-h6ks"
                      >
                        {task.title}
                      </div>
                      <div
                        className="text-sm text-gray-300 truncate max-w-xs"
                        data-oid=":xs9_87"
                      >
                        {task.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell data-oid="r93p5gj">
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell data-oid="1y4p9he">
                    {getPriorityBadge(task.priority)}
                  </TableCell>
                  <TableCell data-oid="q7dl:eb">
                    {task.assignee ? (
                      <div data-oid=":qjcqno">
                        <div
                          className="font-medium text-white"
                          data-oid="fo9_i67"
                        >
                          {task.assignee.name}
                        </div>
                        <div
                          className="text-sm text-gray-300"
                          data-oid="yotwjn0"
                        >
                          {task.assignee.email}
                        </div>
                      </div>
                    ) : (
                      <span
                        className="text-sm text-gray-400"
                        data-oid="tz24.wv"
                      >
                        未分配
                      </span>
                    )}
                  </TableCell>
                  <TableCell data-oid="i90zff1">
                    {task.project ? (
                      <span
                        className="text-sm text-gray-300"
                        data-oid="7wf85f_"
                      >
                        {task.project.name}
                      </span>
                    ) : (
                      <span
                        className="text-sm text-gray-400"
                        data-oid="uidyr:s"
                      >
                        -
                      </span>
                    )}
                  </TableCell>
                  <TableCell data-oid=":8cic:.">
                    <div
                      className="flex items-center text-sm"
                      data-oid="1ugbu2d"
                    >
                      <Calendar
                        className="w-3 h-3 mr-1 text-gray-300"
                        data-oid="jrscdt5"
                      />
                      <span
                        className={
                          new Date(task.dueDate) < new Date() &&
                          task.status !== "DONE"
                            ? "text-red-400"
                            : "text-gray-300"
                        }
                        data-oid="hx1wxjy"
                      >
                        {new Date(task.dueDate).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell data-oid="xbc:d0.">
                    <DropdownMenu data-oid="dwz4p:k">
                      <DropdownMenuTrigger asChild data-oid="tlrtj6-">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-300 hover:text-white hover:bg-white/10"
                          data-oid="bhr944:"
                        >
                          <MoreHorizontal
                            className="h-4 w-4"
                            data-oid="eh_0c3b"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" data-oid="ae.j:s0">
                        <DropdownMenuItem
                          onClick={() => onView(task)}
                          data-oid="ksb106y"
                        >
                          <Eye className="w-4 h-4 mr-2" data-oid="jgdt0zo" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEdit(task)}
                          data-oid="anfmvlh"
                        >
                          <Edit className="w-4 h-4 mr-2" data-oid="ylhowzu" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(task.id)}
                          className="text-red-600"
                          data-oid=":cvn.yz"
                        >
                          <Trash2 className="w-4 h-4 mr-2" data-oid="ct5jclx" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

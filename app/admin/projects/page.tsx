"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { ProjectWithDetails } from "@/lib/types";
import {
  formatDate,
  formatCurrency,
  getProjectStatusText,
  getPriorityText,
  getStatusColor,
  getPriorityColor,
  calculateProgress,
} from "@/lib/utils";

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const params = new URLSearchParams({
        search,
        status: statusFilter !== "all" ? statusFilter : "",
        priority: priorityFilter !== "all" ? priorityFilter : "",
      });

      const response = await fetch(`/api/projects?${params}`);
      const result = await response.json();

      if (result.success) {
        setProjects(result.data.items || result.data.projects || []);
      } else {
        console.error("加载项目列表失败:", result.message || result.error);
      }
    } catch (error) {
      console.error("加载项目列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        loadProjects();
      } else {
        alert("删除失败: " + result.error);
      }
    } catch (error) {
      console.error("删除项目失败:", error);
      alert("删除失败，请重试");
    }
  };

  const calculateProjectProgress = (project: ProjectWithDetails) => {
    const completedTasks = project.tasks.filter(
      (task) => task.status === "COMPLETED",
    ).length;
    return calculateProgress(completedTasks, project.tasks.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="kma3lv-">
        <div className="text-white" data-oid="vhm.hh2">
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-oid="l:pwbh-">
      {/* 页面标题 */}
      <div className="flex justify-between items-center" data-oid="qy0j9:i">
        <div data-oid="gn31:4b">
          <h1 className="text-3xl font-bold theme-gradient-text" data-oid="7amgp7r">
            项目管理
          </h1>
          <p className="text-gray-300" data-oid="8sx61j.">
            管理和跟踪所有项目进度
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="theme-gradient-bg text-white hover:shadow-lg transition-shadow"
          data-oid="qqb4:2:"
        >
          <Plus className="mr-2 h-4 w-4" data-oid="9i:nf5j" />
          新建项目
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card
        className="bg-white/10 border-white/20 backdrop-blur-sm"
        data-oid="6jxjdf1"
      >
        <CardContent className="p-4" data-oid="1ijr_5:">
          <div className="flex gap-4" data-oid="k3xsy:q">
            <div className="flex-1" data-oid="n6jmcfk">
              <div className="relative" data-oid="_nh5hn2">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300"
                  data-oid="0juas_y"
                />
                <Input
                  placeholder="搜索项目名称、客户..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  data-oid="s2fgu25"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              data-oid="3as7l5n"
            >
              <SelectTrigger
                className="w-40 bg-white/10 border-white/20 text-white"
                data-oid="t1tlpun"
              >
                <Filter className="mr-2 h-4 w-4" data-oid="zibfjjz" />
                <SelectValue placeholder="状态筛选" data-oid="c:c_qi6" />
              </SelectTrigger>
              <SelectContent data-oid="xs_i-8y">
                <SelectItem value="all" data-oid="0_t4l1z">
                  全部状态
                </SelectItem>
                <SelectItem value="PLANNING" data-oid=".439vbe">
                  计划中
                </SelectItem>
                <SelectItem value="IN_PROGRESS" data-oid="._p.ek9">
                  进行中
                </SelectItem>
                <SelectItem value="ON_HOLD" data-oid="r66_am8">
                  暂停
                </SelectItem>
                <SelectItem value="COMPLETED" data-oid="3hu.nri">
                  已完成
                </SelectItem>
                <SelectItem value="CANCELLED" data-oid="79fuxyq">
                  已取消
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={setPriorityFilter}
              data-oid="-ry0-xu"
            >
              <SelectTrigger
                className="w-40 bg-white/10 border-white/20 text-white"
                data-oid="77argmk"
              >
                <SelectValue placeholder="优先级筛选" data-oid="ncn184e" />
              </SelectTrigger>
              <SelectContent data-oid="6zy6d8q">
                <SelectItem value="all" data-oid="9ziaeru">
                  全部优先级
                </SelectItem>
                <SelectItem value="LOW" data-oid="epooc5e">
                  低
                </SelectItem>
                <SelectItem value="MEDIUM" data-oid="z70dc5s">
                  中
                </SelectItem>
                <SelectItem value="HIGH" data-oid="dp_vmw0">
                  高
                </SelectItem>
                <SelectItem value="URGENT" data-oid=".642i82">
                  紧急
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadProjects}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-oid="jiicsjj"
            >
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 项目卡片网格 */}
      <div
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        data-oid="_6ttd77"
      >
        {projects.map((project) => (
          <Card
            key={project.id}
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="uiobueo"
          >
            <CardHeader data-oid="wbw5uim">
              <div
                className="flex justify-between items-start"
                data-oid="or:usqj"
              >
                <div data-oid="m14:k7n">
                  <CardTitle className="text-white text-lg" data-oid="xnoscs.">
                    {project.name}
                  </CardTitle>
                  <p className="text-gray-300 text-sm" data-oid="gm9qh_5">
                    {project.client.name}
                  </p>
                </div>
                <DropdownMenu data-oid="mlv9wk0">
                  <DropdownMenuTrigger asChild data-oid="7mxa9.l">
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0 text-gray-300 hover:text-white"
                      data-oid="2u50dv3"
                    >
                      <MoreHorizontal className="h-4 w-4" data-oid="yumu00v" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" data-oid="4vsl2rx">
                    <DropdownMenuLabel data-oid="vztj6.u">
                      操作
                    </DropdownMenuLabel>
                    <DropdownMenuItem data-oid="bee3hnb">
                      <Eye className="mr-2 h-4 w-4" data-oid="ym3ijty" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem data-oid="vshc83h">
                      <Edit className="mr-2 h-4 w-4" data-oid="dwba84o" />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuSeparator data-oid=".i0z1r1" />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDeleteProject(project.id)}
                      data-oid="svjp4ea"
                    >
                      <Trash2 className="mr-2 h-4 w-4" data-oid="imwpr6u" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="c12uff8">
              {/* 状态和优先级 */}
              <div className="flex gap-2" data-oid="6il-fqo">
                <Badge
                  className={getStatusColor(project.status as any)}
                  data-oid="b4yg4k1"
                >
                  {getProjectStatusText(project.status as any)}
                </Badge>
                <Badge
                  className={getPriorityColor(project.priority as any)}
                  data-oid="mklps:4"
                >
                  {getPriorityText(project.priority as any)}
                </Badge>
              </div>

              {/* 项目描述 */}
              {project.description && (
                <p
                  className="text-gray-300 text-sm line-clamp-2"
                  data-oid="yf:mf3q"
                >
                  {project.description}
                </p>
              )}

              {/* 项目信息 */}
              <div className="space-y-2 text-sm" data-oid="pmxwvi3">
                <div
                  className="flex items-center gap-2 text-gray-300"
                  data-oid="b8qtbyq"
                >
                  <Users className="h-4 w-4" data-oid="8_6-deg" />
                  <span data-oid="kzcjlvn">{project._count.members} 成员</span>
                </div>
                <div
                  className="flex items-center gap-2 text-gray-300"
                  data-oid="p.r2k5q"
                >
                  <Calendar className="h-4 w-4" data-oid=":drwgaa" />
                  <span data-oid="fnq_bfm">
                    {formatDate(project.startDate)} -{" "}
                    {formatDate(project.endDate)}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 text-gray-300"
                  data-oid="jk5tfzx"
                >
                  <DollarSign className="h-4 w-4" data-oid="5p:v9um" />
                  <span data-oid="lyd94pa">
                    {formatCurrency(project.budget)}
                  </span>
                </div>
              </div>

              {/* 进度条 */}
              <div data-oid="b2gbgh0">
                <div
                  className="flex justify-between text-sm mb-2"
                  data-oid=":1iw:os"
                >
                  <span className="text-gray-300" data-oid="0yxfk_f">
                    进度
                  </span>
                  <span className="text-white" data-oid="gih6tu.">
                    {calculateProjectProgress(project)}%
                  </span>
                </div>
                <Progress
                  value={calculateProjectProgress(project)}
                  className="h-2"
                  data-oid=":p_me8g"
                />

                <div className="text-xs text-gray-300 mt-1" data-oid="5-zfi:e">
                  {
                    project.tasks.filter((task) => task.status === "COMPLETED")
                      .length
                  }{" "}
                  / {project.tasks.length} 任务完成
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm"
          data-oid="k71cpvq"
        >
          <CardContent className="text-center py-8" data-oid="_3gi0zx">
            <p className="text-gray-300" data-oid="k-80hp8">
              暂无项目数据
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

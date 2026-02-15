"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Briefcase,
  Plus,
  Search,
  Eye,
  CheckCircle,
  Loader2,
  ArrowLeft,
  Calendar,
  DollarSign,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface Assignment {
  id: string;
  title: string;
  taskType: string;
  startDate: string;
  endDate: string;
  rate: number;
  rateType: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  staff: {
    id: string;
    name: string;
    title: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface HRStaff {
  id: string;
  name: string;
  title: string;
  status: string;
  dailyRate: number | null;
}

const statusMap: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "进行中", color: "bg-blue-500/20 text-blue-300" },
  COMPLETED: { label: "已完成", color: "bg-green-500/20 text-green-300" },
  CANCELLED: { label: "已取消", color: "bg-red-500/20 text-red-300" },
};

const taskTypeMap: Record<string, string> = {
  MARKETING: "市场营销",
  PLANNING: "活动策划",
  STRATEGY: "战略咨询",
  LIAISON: "商务联络",
};

const rateTypeMap: Record<string, string> = {
  HOURLY: "时薪",
  DAILY: "日薪",
  MONTHLY: "月薪",
  FIXED: "固定",
};

export default function HRAssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [staffList, setStaffList] = useState<HRStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    staffId: "",
    clientId: "",
    title: "",
    description: "",
    taskType: "STRATEGY",
    startDate: "",
    endDate: "",
    rate: "",
    rateType: "DAILY",
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const [assignmentsRes, staffRes] = await Promise.all([
        fetch(`/api/hr/assignments?${params}`),
        fetch("/api/hr/staff?status=AVAILABLE"),
      ]);

      if (assignmentsRes.ok) {
        const data = await assignmentsRes.json();
        setAssignments(data.data || []);
      }

      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaffList(data.data || []);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${a.client.firstName} ${a.client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreate = async () => {
    if (
      !formData.staffId ||
      !formData.clientId ||
      !formData.title ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.rate
    ) {
      alert("请填写必填字段");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/hr/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          staffId: formData.staffId,
          clientId: formData.clientId,
          title: formData.title,
          description: formData.description || null,
          taskType: formData.taskType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          rate: parseFloat(formData.rate),
          rateType: formData.rateType,
        }),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setFormData({
          staffId: "",
          clientId: "",
          title: "",
          description: "",
          taskType: "STRATEGY",
          startDate: "",
          endDate: "",
          rate: "",
          rateType: "DAILY",
        });
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "创建失败");
      }
    } catch (error) {
      console.error("创建失败:", error);
      alert("创建失败");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/hr/assignments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("更新失败:", error);
    }
  };

  const stats = {
    total: assignments.length,
    active: assignments.filter((a) => a.status === "ACTIVE").length,
    completed: assignments.filter((a) => a.status === "COMPLETED").length,
    totalAmount: assignments
      .filter((a) => a.status !== "CANCELLED")
      .reduce((sum, a) => sum + a.totalAmount, 0),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/admin/hr")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">任务分配</h1>
            <p className="text-gray-400">管理人力资源任务分配</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建任务
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总任务</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">进行中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总金额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                ¥{stats.totalAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选 */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索任务、人员或客户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="ACTIVE">进行中</SelectItem>
                  <SelectItem value="COMPLETED">已完成</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 任务列表 */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">任务</TableHead>
                  <TableHead className="text-white">人员</TableHead>
                  <TableHead className="text-white">客户</TableHead>
                  <TableHead className="text-white">类型</TableHead>
                  <TableHead className="text-white">周期</TableHead>
                  <TableHead className="text-white">金额</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id} className="border-white/10">
                    <TableCell>
                      <div className="text-white font-medium">{assignment.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-white">{assignment.staff.name}</div>
                        <div className="text-sm text-gray-400">{assignment.staff.title}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300">
                        {assignment.client.firstName} {assignment.client.lastName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-gray-300 border-gray-500">
                        {taskTypeMap[assignment.taskType] || assignment.taskType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300 text-sm">
                        {new Date(assignment.startDate).toLocaleDateString("zh-CN")}
                        <br />
                        至 {new Date(assignment.endDate).toLocaleDateString("zh-CN")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">
                        ¥{assignment.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {rateTypeMap[assignment.rateType]}: ¥{assignment.rate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusMap[assignment.status]?.color}>
                        {statusMap[assignment.status]?.label || assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => router.push(`/admin/hr/assignments/${assignment.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {assignment.status === "ACTIVE" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => updateStatus(assignment.id, "COMPLETED")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredAssignments.length === 0 && (
              <div className="py-12 text-center">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">没有找到任务</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建任务对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>创建任务</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label>选择人员 *</Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => setFormData({ ...formData, staffId: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="选择人员" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - {s.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>客户ID *</Label>
                <Input
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="输入客户用户ID"
                />
              </div>
              <div className="space-y-2">
                <Label>任务标题 *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label>任务类型</Label>
                <Select
                  value={formData.taskType}
                  onValueChange={(value) => setFormData({ ...formData, taskType: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARKETING">市场营销</SelectItem>
                    <SelectItem value="PLANNING">活动策划</SelectItem>
                    <SelectItem value="STRATEGY">战略咨询</SelectItem>
                    <SelectItem value="LIAISON">商务联络</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>开始日期 *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>结束日期 *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>费率 *</Label>
                  <Input
                    type="number"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>计费方式</Label>
                  <Select
                    value={formData.rateType}
                    onValueChange={(value) => setFormData({ ...formData, rateType: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">时薪</SelectItem>
                      <SelectItem value="DAILY">日薪</SelectItem>
                      <SelectItem value="MONTHLY">月薪</SelectItem>
                      <SelectItem value="FIXED">固定</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>任务描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                取消
              </Button>
              <Button onClick={handleCreate} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}

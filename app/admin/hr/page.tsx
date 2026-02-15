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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Briefcase,
  DollarSign,
  Calendar,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface HRStaff {
  id: string;
  name: string;
  title: string;
  skills: string;
  experience: number;
  hourlyRate: number | null;
  dailyRate: number | null;
  monthlyRate: number | null;
  status: string;
  avatar: string | null;
  createdAt: string;
  _count: {
    assignments: number;
  };
}

const statusMap: Record<string, { label: string; color: string }> = {
  AVAILABLE: { label: "可用", color: "bg-green-500/20 text-green-300" },
  ASSIGNED: { label: "已分配", color: "bg-blue-500/20 text-blue-300" },
  ON_LEAVE: { label: "休假中", color: "bg-yellow-500/20 text-yellow-300" },
  INACTIVE: { label: "不可用", color: "bg-gray-500/20 text-gray-300" },
};

export default function HRManagementPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<HRStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    skills: "",
    experience: "0",
    hourlyRate: "",
    dailyRate: "",
    monthlyRate: "",
    bio: "",
  });

  useEffect(() => {
    fetchStaff();
  }, [statusFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/hr/staff?${params}`);
      if (res.ok) {
        const data = await res.json();
        setStaff(data.data || []);
      }
    } catch (error) {
      console.error("获取人员列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreate = async () => {
    if (!formData.name || !formData.title || !formData.skills) {
      alert("请填写必填字段");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/hr/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          title: formData.title,
          skills: JSON.stringify(formData.skills.split(",").map((s) => s.trim())),
          experience: parseInt(formData.experience) || 0,
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
          dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
          monthlyRate: formData.monthlyRate ? parseFloat(formData.monthlyRate) : null,
          bio: formData.bio || null,
        }),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setFormData({
          name: "",
          title: "",
          skills: "",
          experience: "0",
          hourlyRate: "",
          dailyRate: "",
          monthlyRate: "",
          bio: "",
        });
        fetchStaff();
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

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个人员吗？")) return;

    try {
      const res = await fetch(`/api/hr/staff/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchStaff();
      } else {
        const error = await res.json();
        alert(error.error || "删除失败");
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const parseSkills = (skills: string): string[] => {
    try {
      return JSON.parse(skills);
    } catch {
      return [skills];
    }
  };

  const stats = {
    total: staff.length,
    available: staff.filter((s) => s.status === "AVAILABLE").length,
    assigned: staff.filter((s) => s.status === "ASSIGNED").length,
    totalAssignments: staff.reduce((sum, s) => sum + s._count.assignments, 0),
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">人力资源管理</h1>
            <p className="text-gray-400">管理外包人员和任务分配</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/hr/assignments")}
            >
              <Briefcase className="h-4 w-4 mr-2" />
              任务分配
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加人员
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总人数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">可用人员</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.available}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已分配</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.assigned}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总任务数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stats.totalAssignments}
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
                  placeholder="搜索姓名或职位..."
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
                  <SelectItem value="AVAILABLE">可用</SelectItem>
                  <SelectItem value="ASSIGNED">已分配</SelectItem>
                  <SelectItem value="ON_LEAVE">休假中</SelectItem>
                  <SelectItem value="INACTIVE">不可用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 人员列表 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStaff.map((person) => (
            <Card key={person.id} className="bg-white/10 border-white/20">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      {person.avatar ? (
                        <img
                          src={person.avatar}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{person.name}</h3>
                      <p className="text-gray-400 text-sm">{person.title}</p>
                    </div>
                  </div>
                  <Badge className={statusMap[person.status]?.color}>
                    {statusMap[person.status]?.label || person.status}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>{person.experience} 年经验</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    <span>{person._count.assignments} 个任务</span>
                  </div>
                  {person.dailyRate && (
                    <div className="flex items-center gap-2 text-gray-400">
                      <DollarSign className="h-4 w-4" />
                      <span>¥{person.dailyRate}/天</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {parseSkills(person.skills)
                    .slice(0, 3)
                    .map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-gray-300 border-gray-500 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  {parseSkills(person.skills).length > 3 && (
                    <Badge variant="outline" className="text-gray-500 border-gray-600 text-xs">
                      +{parseSkills(person.skills).length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => router.push(`/admin/hr/staff/${person.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(person.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStaff.length === 0 && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">没有找到人员</p>
            </CardContent>
          </Card>
        )}

        {/* 创建人员对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>添加人员</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>姓名 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>职位 *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>技能 * (逗号分隔)</Label>
                <Input
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="市场营销, 活动策划, 品牌推广"
                />
              </div>
              <div className="space-y-2">
                <Label>工作年限</Label>
                <Input
                  type="number"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>时薪</Label>
                  <Input
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>日薪</Label>
                  <Input
                    type="number"
                    value={formData.dailyRate}
                    onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>月薪</Label>
                  <Input
                    type="number"
                    value={formData.monthlyRate}
                    onChange={(e) => setFormData({ ...formData, monthlyRate: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>简介</Label>
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
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

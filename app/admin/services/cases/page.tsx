"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Image as ImageIcon,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  ArrowLeft,
  Video,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface ServiceCase {
  id: string;
  title: string;
  titleEn: string | null;
  description: string | null;
  coverImage: string | null;
  images: string | null;
  videoUrl: string | null;
  clientName: string | null;
  completedAt: string | null;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  service: {
    id: string;
    name: string;
  };
}

interface ServiceItem {
  id: string;
  name: string;
}

export default function CasesManagementPage() {
  const router = useRouter();
  const [cases, setCases] = useState<ServiceCase[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: "",
    title: "",
    titleEn: "",
    description: "",
    coverImage: "",
    videoUrl: "",
    clientName: "",
    completedAt: "",
    isFeatured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [casesRes, servicesRes] = await Promise.all([
        fetch("/api/services/cases?limit=100"),
        fetch("/api/services/items?limit=100"),
      ]);

      if (casesRes.ok) {
        const data = await casesRes.json();
        setCases(data.data || []);
      }

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.data || []);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.serviceId || !formData.title) {
      alert("请填写必填字段");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/services/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: formData.serviceId,
          title: formData.title,
          titleEn: formData.titleEn || null,
          description: formData.description || null,
          coverImage: formData.coverImage || null,
          videoUrl: formData.videoUrl || null,
          clientName: formData.clientName || null,
          completedAt: formData.completedAt || null,
          isFeatured: formData.isFeatured,
        }),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setFormData({
          serviceId: "",
          title: "",
          titleEn: "",
          description: "",
          coverImage: "",
          videoUrl: "",
          clientName: "",
          completedAt: "",
          isFeatured: false,
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

  const toggleStatus = async (caseItem: ServiceCase) => {
    try {
      const res = await fetch(`/api/services/cases/${caseItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !caseItem.isActive }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  const toggleFeatured = async (caseItem: ServiceCase) => {
    try {
      const res = await fetch(`/api/services/cases/${caseItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !caseItem.isFeatured }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个案例吗？")) return;

    try {
      const res = await fetch(`/api/services/cases/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
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
          <Button variant="ghost" onClick={() => router.push("/admin/services/items")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">案例管理</h1>
            <p className="text-gray-400">管理服务案例和作品展示</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            添加案例
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总案例数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{cases.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已发布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {cases.filter((c) => c.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">精选案例</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {cases.filter((c) => c.isFeatured).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">有视频</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {cases.filter((c) => c.videoUrl).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索 */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="搜索案例标题或服务名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* 案例列表 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="bg-white/10 border-white/20 overflow-hidden">
              {/* 封面图 */}
              <div className="aspect-video bg-white/5 relative">
                {caseItem.coverImage ? (
                  <img
                    src={caseItem.coverImage}
                    alt={caseItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-gray-500" />
                  </div>
                )}
                {caseItem.videoUrl && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-purple-500/80">
                      <Video className="h-3 w-3 mr-1" />
                      视频
                    </Badge>
                  </div>
                )}
                {caseItem.isFeatured && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-yellow-500/80">
                      <Star className="h-3 w-3 mr-1" />
                      精选
                    </Badge>
                  </div>
                )}
              </div>

              <CardContent className="pt-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-white font-medium">{caseItem.title}</h3>
                    <p className="text-sm text-gray-400">{caseItem.service.name}</p>
                  </div>
                  <Badge
                    className={
                      caseItem.isActive
                        ? "bg-green-500/20 text-green-300"
                        : "bg-gray-500/20 text-gray-300"
                    }
                  >
                    {caseItem.isActive ? "已发布" : "未发布"}
                  </Badge>
                </div>

                {caseItem.clientName && (
                  <p className="text-sm text-gray-400 mb-2">客户: {caseItem.clientName}</p>
                )}

                {caseItem.description && (
                  <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                    {caseItem.description}
                  </p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      caseItem.isFeatured
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-gray-400 hover:text-gray-300"
                    }
                    onClick={() => toggleFeatured(caseItem)}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={
                      caseItem.isActive
                        ? "text-yellow-400 hover:text-yellow-300"
                        : "text-green-400 hover:text-green-300"
                    }
                    onClick={() => toggleStatus(caseItem)}
                  >
                    {caseItem.isActive ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDelete(caseItem.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="py-12 text-center">
              <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">没有找到案例</p>
            </CardContent>
          </Card>
        )}

        {/* 创建案例对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>添加案例</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                <Label>关联服务 *</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="选择服务" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>案例标题 *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>英文标题</Label>
                  <Input
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>案例描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>封面图片URL</Label>
                <Input
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>视频URL</Label>
                <Input
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="https://..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>客户名称</Label>
                  <Input
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>完成日期</Label>
                  <Input
                    type="date"
                    value={formData.completedAt}
                    onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <Label>设为精选</Label>
                <Switch
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
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

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface ServicePackage {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  originalPrice: number;
  discountPrice: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  items: Array<{
    id: string;
    quantity: number;
    service: {
      id: string;
      name: string;
    };
  }>;
}

export default function PackagesManagementPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nameEn: "",
    description: "",
    originalPrice: "",
    discountPrice: "",
    isActive: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/services/packages");
      if (res.ok) {
        const data = await res.json();
        setPackages(data.data || []);
      }
    } catch (error) {
      console.error("获取套餐列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!formData.name || !formData.originalPrice || !formData.discountPrice) {
      alert("请填写必填字段");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/services/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          nameEn: formData.nameEn || null,
          description: formData.description || null,
          originalPrice: parseFloat(formData.originalPrice),
          discountPrice: parseFloat(formData.discountPrice),
          isActive: formData.isActive,
        }),
      });

      if (res.ok) {
        setShowCreateDialog(false);
        setFormData({
          name: "",
          nameEn: "",
          description: "",
          originalPrice: "",
          discountPrice: "",
          isActive: true,
        });
        fetchPackages();
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

  const toggleStatus = async (pkg: ServicePackage) => {
    try {
      const res = await fetch(`/api/services/packages/${pkg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !pkg.isActive }),
      });

      if (res.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个套餐吗？")) return;

    try {
      const res = await fetch(`/api/services/packages/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchPackages();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const calculateSavings = (pkg: ServicePackage) => {
    const savings = pkg.originalPrice - pkg.discountPrice;
    const percent = Math.round((savings / pkg.originalPrice) * 100);
    return { savings, percent };
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
            <h1 className="text-2xl font-bold text-white">套餐管理</h1>
            <p className="text-gray-400">管理服务套餐和优惠组合</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建套餐
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总套餐数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{packages.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已上架</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {packages.filter((p) => p.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">平均折扣</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                {packages.length > 0
                  ? Math.round(
                      packages.reduce((sum, p) => sum + calculateSavings(p).percent, 0) /
                        packages.length
                    )
                  : 0}
                %
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总服务项</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {packages.reduce((sum, p) => sum + p.items.length, 0)}
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
                placeholder="搜索套餐名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/5 border-white/20 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* 套餐列表 */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">套餐名称</TableHead>
                  <TableHead className="text-white">原价</TableHead>
                  <TableHead className="text-white">优惠价</TableHead>
                  <TableHead className="text-white">节省</TableHead>
                  <TableHead className="text-white">包含服务</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPackages.map((pkg) => {
                  const { savings, percent } = calculateSavings(pkg);
                  return (
                    <TableRow key={pkg.id} className="border-white/10">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{pkg.name}</div>
                          {pkg.nameEn && (
                            <div className="text-sm text-gray-400">{pkg.nameEn}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-400 line-through">
                          ¥{pkg.originalPrice.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-white font-medium">
                          ¥{pkg.discountPrice.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500/20 text-green-300">
                          省 ¥{savings.toLocaleString()} ({percent}%)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-gray-300">{pkg.items.length} 项服务</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            pkg.isActive
                              ? "bg-green-500/20 text-green-300"
                              : "bg-gray-500/20 text-gray-300"
                          }
                        >
                          {pkg.isActive ? "已上架" : "已下架"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => router.push(`/admin/services/packages/${pkg.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={
                              pkg.isActive
                                ? "text-yellow-400 hover:text-yellow-300"
                                : "text-green-400 hover:text-green-300"
                            }
                            onClick={() => toggleStatus(pkg)}
                          >
                            {pkg.isActive ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
                            onClick={() => handleDelete(pkg.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredPackages.length === 0 && (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">没有找到套餐</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 创建套餐对话框 */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>创建套餐</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>套餐名称 *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>英文名称</Label>
                  <Input
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>套餐描述</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>原价 *</Label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, originalPrice: e.target.value })
                    }
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label>优惠价 *</Label>
                  <Input
                    type="number"
                    value={formData.discountPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPrice: e.target.value })
                    }
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <Label>立即上架</Label>
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked })
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

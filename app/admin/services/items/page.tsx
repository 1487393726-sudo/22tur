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
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface ServiceItem {
  id: string;
  name: string;
  nameEn: string | null;
  description: string | null;
  categoryId: string;
  minPrice: number | null;
  maxPrice: number | null;
  basePrice: number | null;
  unit: string | null;
  deliveryDays: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
  };
  _count?: {
    orderItems: number;
  };
}

interface Category {
  id: string;
  name: string;
  nameEn: string | null;
}

export default function ServiceItemsPage() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch("/api/services/items"),
        fetch("/api/services/categories"),
      ]);

      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.data || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.data || []);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.nameEn?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesCategory =
      categoryFilter === "all" || service.categoryId === categoryFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && service.isActive) ||
      (statusFilter === "inactive" && !service.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleStatus = async (service: ServiceItem) => {
    try {
      const res = await fetch(`/api/services/items/${service.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("更新状态失败:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个服务吗？")) return;

    try {
      const res = await fetch(`/api/services/items/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  };

  const formatPrice = (service: ServiceItem) => {
    if (service.basePrice) {
      return `¥${service.basePrice.toLocaleString()}`;
    }
    if (service.minPrice && service.maxPrice) {
      return `¥${service.minPrice.toLocaleString()} - ¥${service.maxPrice.toLocaleString()}`;
    }
    if (service.minPrice) {
      return `¥${service.minPrice.toLocaleString()}起`;
    }
    return "面议";
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
            <h1 className="text-2xl font-bold text-white">服务项目管理</h1>
            <p className="text-gray-400">管理多端服务平台的服务项目</p>
          </div>
          <Button onClick={() => router.push("/admin/services/items/new")}>
            <Plus className="h-4 w-4 mr-2" />
            添加服务
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总服务数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{services.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已上架</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                {services.filter((s) => s.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已下架</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">
                {services.filter((s) => !s.isActive).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">服务类目</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{categories.length}</div>
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
                  placeholder="搜索服务名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="服务类目" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类目</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">已上架</SelectItem>
                  <SelectItem value="inactive">已下架</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 服务列表 */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">服务名称</TableHead>
                  <TableHead className="text-white">类目</TableHead>
                  <TableHead className="text-white">价格</TableHead>
                  <TableHead className="text-white">交付周期</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">排序</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id} className="border-white/10">
                    <TableCell>
                      <div>
                        <div className="font-medium text-white">{service.name}</div>
                        {service.nameEn && (
                          <div className="text-sm text-gray-400">{service.nameEn}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-gray-300 border-gray-500">
                        {service.category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">{formatPrice(service)}</div>
                      {service.unit && (
                        <div className="text-sm text-gray-400">/{service.unit}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300">
                        {service.deliveryDays ? `${service.deliveryDays}天` : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          service.isActive
                            ? "bg-green-500/20 text-green-300"
                            : "bg-gray-500/20 text-gray-300"
                        }
                      >
                        {service.isActive ? "已上架" : "已下架"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300">{service.sortOrder}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => router.push(`/admin/services/items/${service.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={
                            service.isActive
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-green-400 hover:text-green-300"
                          }
                          onClick={() => toggleStatus(service)}
                        >
                          {service.isActive ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300"
                          onClick={() => handleDelete(service.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredServices.length === 0 && (
              <div className="py-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">没有找到服务项目</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}

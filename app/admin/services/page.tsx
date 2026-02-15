"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Search,
  Filter,
  Crown,
  Star,
  Building,
  DollarSign,
  Edit,
  Trash2,
  Calendar,
  Users,
} from "lucide-react";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RequireAuth } from "@/components/auth/require-auth";

// 服务类型定义
interface Service {
  id: string;
  name: string;
  description: string;
  type: "SERVICE" | "INVESTMENT" | "SUBSCRIPTION";
  price: number;
  currency: string;
  billingCycle: "MONTHLY" | "YEARLY" | "ONETIME";
  features: string[];
  userTypes: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subscriptionCount?: number;
  totalRevenue?: number;
}

interface ServiceStats {
  total: number;
  active: number;
  services: number;
  investments: number;
  subscriptions: number;
  totalRevenue: number;
}

export default function ServiceManagementPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "SERVICE",
    price: 0,
    billingCycle: "MONTHLY",
    features: "",
    userTypes: ["NORMAL"],
  });

  // 加载服务数据
  const fetchServices = async () => {
    try {
      const response = await fetch('/api/subscription/services');
      if (response.ok) {
        const data = await response.json();
        // 确保返回的是数组
        setServices(Array.isArray(data) ? data : []);
      } else {
        setServices([]);
      }
    } catch (error) {
      console.error('获取服务列表失败:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  // 计算统计数据
  const calculateStats = (serviceData: Service[]) => {
    const serviceStats: ServiceStats = {
      total: serviceData.length,
      active: serviceData.filter(s => s.isActive).length,
      services: serviceData.filter(s => s.type === "SERVICE").length,
      investments: serviceData.filter(s => s.type === "INVESTMENT").length,
      subscriptions: serviceData.filter(s => s.type === "SUBSCRIPTION").length,
      totalRevenue: serviceData.reduce((sum, s) => sum + (s.totalRevenue || 0), 0),
    };

    setStats(serviceStats);
  };

  // 过滤服务
  useEffect(() => {
    if (!Array.isArray(services)) return;

    const filtered = services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           service.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = typeFilter === "all" || service.type === typeFilter;
      const matchesStatus = statusFilter === "all" || 
                           (statusFilter === "active" && service.isActive) ||
                           (statusFilter === "inactive" && !service.isActive);

      return matchesSearch && matchesType && matchesStatus;
    });

    setFilteredServices(filtered);
  }, [services, searchTerm, typeFilter, statusFilter]);

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (services.length > 0) {
      calculateStats(services);
    }
  }, [services]);

  // 获取服务类型信息
  const getTypeInfo = (type: string) => {
    switch (type) {
      case "SERVICE":
        return {
          icon: Package,
          label: "服务",
          color: "bg-blue-500/20 text-blue-300 border-blue-500/30"
        };
      case "INVESTMENT":
        return {
          icon: DollarSign,
          label: "投资",
          color: "bg-green-500/20 text-green-300 border-green-500/30"
        };
      case "SUBSCRIPTION":
        return {
          icon: Crown,
          label: "订阅",
          color: "bg-purple-500/20 text-white border-purple-500/30"
        };
      default:
        return {
          icon: Package,
          label: "未知",
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
        };
    }
  };

  // 获取计费周期信息
  const getBillingCycleInfo = (cycle: string) => {
    switch (cycle) {
      case "MONTHLY":
        return { label: "月付", color: "bg-blue-500/20 text-blue-300" };
      case "YEARLY":
        return { label: "年付", color: "bg-green-500/20 text-green-300" };
      case "ONETIME":
        return { label: "一次性", color: "bg-purple-500/20 text-white" };
      default:
        return { label: "未知", color: "bg-gray-500/20 text-gray-300" };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  const handleSubmit = async (isEdit: boolean = false) => {
    try {
      const url = isEdit ? `/api/subscription/services/${selectedService?.id}` : '/api/subscription/services';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchServices();
        setShowCreateDialog(false);
        setShowEditDialog(false);
        // 重置表单
        setFormData({
          name: "",
          description: "",
          type: "SERVICE",
          price: 0,
          billingCycle: "MONTHLY",
          features: "",
          userTypes: ["NORMAL"],
        });
      }
    } catch (error) {
      console.error('操作失败:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      type: service.type,
      price: service.price,
      billingCycle: service.billingCycle,
      features: service.features.join(', '),
      userTypes: service.userTypes,
    });
    setShowEditDialog(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (confirm('确定要删除这个服务吗？')) {
      try {
        const response = await fetch(`/api/subscription/services/${serviceId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          await fetchServices();
        }
      } catch (error) {
        console.error('删除失败:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">加载中...</div>
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold text-white">服务管理</h1>
          <p className="text-gray-300">管理系统中的所有服务、投资和订阅产品</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  总服务数
                </CardTitle>
                <Package className="h-4 w-4 text-gray-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-gray-300">活跃 {stats.active}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  基础服务
                </CardTitle>
                <Package className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.services}</div>
                <p className="text-xs text-gray-300">单次服务</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  投资产品
                </CardTitle>
                <DollarSign className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.investments}</div>
                <p className="text-xs text-gray-300">投资理财</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  订阅服务
                </CardTitle>
                <Crown className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.subscriptions}</div>
                <p className="text-xs text-gray-300">定期订阅</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  总收入
                </CardTitle>
                <DollarSign className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <p className="text-xs text-gray-300">累计收益</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  活跃率
                </CardTitle>
                <Users className="h-4 w-4 text-cyan-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-400">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </div>
                <p className="text-xs text-gray-300">服务活跃度</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 搜索和过滤 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">服务列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="搜索服务名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="服务类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="SERVICE">基础服务</SelectItem>
                  <SelectItem value="INVESTMENT">投资产品</SelectItem>
                  <SelectItem value="SUBSCRIPTION">订阅服务</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="active">活跃</SelectItem>
                  <SelectItem value="inactive">非活跃</SelectItem>
                </SelectContent>
              </Select>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-white/10 hover:bg-white/20 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    添加服务
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-primary-900 border-white/20 text-white">
                  <DialogHeader>
                    <DialogTitle>添加新服务</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      创建一个新的服务、投资产品或订阅计划
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">服务名称</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">服务类型</Label>
                      <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SERVICE">基础服务</SelectItem>
                          <SelectItem value="INVESTMENT">投资产品</SelectItem>
                          <SelectItem value="SUBSCRIPTION">订阅服务</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="price">价格</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingCycle">计费周期</Label>
                      <Select value={formData.billingCycle} onValueChange={(value: any) => setFormData({...formData, billingCycle: value})}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MONTHLY">月付</SelectItem>
                          <SelectItem value="YEARLY">年付</SelectItem>
                          <SelectItem value="ONETIME">一次性</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">描述</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="bg-white/5 border-white/20 text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="features">功能特性（用逗号分隔）</Label>
                      <Textarea
                        id="features"
                        value={formData.features}
                        onChange={(e) => setFormData({...formData, features: e.target.value})}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="功能1, 功能2, 功能3"
                        rows={2}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      取消
                    </Button>
                    <Button onClick={() => handleSubmit(false)}>
                      创建服务
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* 服务表格 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">服务</TableHead>
                  <TableHead className="text-white">类型</TableHead>
                  <TableHead className="text-white">价格</TableHead>
                  <TableHead className="text-white">计费周期</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">订阅数</TableHead>
                  <TableHead className="text-white">创建时间</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => {
                  const TypeInfo = getTypeInfo(service.type);
                  const BillingInfo = getBillingCycleInfo(service.billingCycle);
                  return (
                    <TableRow key={service.id} className="border-white/10">
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{service.name}</div>
                          <div className="text-sm text-gray-400 line-clamp-1">
                            {service.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${TypeInfo.color} border`}>
                          <TypeInfo.icon className="h-3 w-3 mr-1" />
                          {TypeInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-white font-medium">
                          {formatCurrency(service.price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={BillingInfo.color}>
                          {BillingInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={service.isActive ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}>
                          {service.isActive ? "活跃" : "非活跃"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-white">
                          {service.subscriptionCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-300">
                          {formatDate(service.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
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
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* 如果没有服务数据 */}
        {filteredServices.length === 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">没有找到服务</h3>
              <p className="text-gray-400">尝试调整搜索条件或添加新服务</p>
            </CardContent>
          </Card>
        )}

        {/* 编辑对话框 */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="bg-primary-900 border-white/20 text-white">
            <DialogHeader>
              <DialogTitle>编辑服务</DialogTitle>
              <DialogDescription className="text-gray-400">
                修改服务信息和配置
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">服务名称</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-type">服务类型</Label>
                <Select value={formData.type} onValueChange={(value: any) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SERVICE">基础服务</SelectItem>
                    <SelectItem value="INVESTMENT">投资产品</SelectItem>
                    <SelectItem value="SUBSCRIPTION">订阅服务</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">价格</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">描述</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                取消
              </Button>
              <Button onClick={() => handleSubmit(true)}>
                保存修改
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAuth>
  );
}
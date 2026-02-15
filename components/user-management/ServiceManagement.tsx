'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Package,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: 'SERVICE' | 'INVESTMENT';
  status: string;
  imageUrl?: string;
  features?: any;
  duration?: string;
  deliveryTime?: string;
  createdAt: string;
  _count: {
    subscriptions: number;
    purchases: number;
    investments: number;
  };
}

const SERVICE_CATEGORIES = [
  '基础服务',
  '高级服务',
  '企业服务',
  '投资产品',
  '咨询服务',
  '技术支持',
  '培训课程',
  '定制开发'
];

export default function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    type: 'SERVICE' as 'SERVICE' | 'INVESTMENT',
    status: 'ACTIVE',
    imageUrl: '',
    features: '',
    duration: '',
    deliveryTime: ''
  });

  useEffect(() => {
    fetchServices();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        features: formData.features ? JSON.parse(formData.features) : null
      };

      const url = editingService 
        ? `/api/subscription/services/${editingService.id}`
        : '/api/subscription/services';
      
      const method = editingService ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchServices();
        setIsCreateDialogOpen(false);
        setEditingService(null);
        resetForm();
      }
    } catch (error) {
      console.error('保存服务失败:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      price: service.price.toString(),
      category: service.category,
      type: service.type,
      status: service.status,
      imageUrl: service.imageUrl || '',
      features: service.features ? JSON.stringify(service.features) : '',
      duration: service.duration || '',
      deliveryTime: service.deliveryTime || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('确定要删除这个服务吗？')) return;
    
    try {
      const response = await fetch(`/api/subscription/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchServices();
      }
    } catch (error) {
      console.error('删除服务失败:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      category: '',
      type: 'SERVICE',
      status: 'ACTIVE',
      imageUrl: '',
      features: '',
      duration: '',
      deliveryTime: ''
    });
  };

  const getTypeIcon = (type: string) => {
    return type === 'SERVICE' ? Package : TrendingUp;
  };

  const getTypeLabel = (type: string) => {
    return type === 'SERVICE' ? '服务' : '投资';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      DRAFT: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      ACTIVE: '活跃',
      INACTIVE: '非活跃',
      DRAFT: '草稿'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || service.category === categoryFilter;
    const matchesType = typeFilter === 'ALL' || service.type === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || service.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  const getServiceStats = () => {
    const stats = {
      total: services.length,
      active: services.filter(s => s.status === 'ACTIVE').length,
      services: services.filter(s => s.type === 'SERVICE').length,
      investments: services.filter(s => s.type === 'INVESTMENT').length,
      totalSubscriptions: services.reduce((sum, s) => sum + s._count.subscriptions, 0),
      totalPurchases: services.reduce((sum, s) => sum + s._count.purchases, 0)
    };
    return stats;
  };

  const stats = getServiceStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总服务数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃服务</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">服务产品</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.services}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">投资产品</CardTitle>
            <TrendingUp className="h-4 w-4 text-white600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.investments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">订阅总数</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">购买总数</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPurchases}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>服务管理</CardTitle>
            <CardDescription>管理所有服务产品和投资产品</CardDescription>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingService(null); resetForm(); }}>
                <Plus className="h-4 w-4 mr-2" />
                创建服务
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? '编辑服务' : '创建新服务'}
                </DialogTitle>
                <DialogDescription>
                  {editingService ? '编辑现有服务信息' : '创建一个新的服务或投资产品'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">服务名称</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="price">价格</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">分类</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择分类" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">类型</Label>
                    <Select value={formData.type} onValueChange={(value: 'SERVICE' | 'INVESTMENT') => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SERVICE">服务</SelectItem>
                        <SelectItem value="INVESTMENT">投资</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">状态</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">活跃</SelectItem>
                        <SelectItem value="INACTIVE">非活跃</SelectItem>
                        <SelectItem value="DRAFT">草稿</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">图片链接</Label>
                    <Input
                      id="imageUrl"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                  
                  {formData.type === 'SERVICE' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="duration">服务时长</Label>
                        <Input
                          id="duration"
                          value={formData.duration}
                          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                          placeholder="如：1个月、1年"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deliveryTime">交付时间</Label>
                        <Input
                          id="deliveryTime"
                          value={formData.deliveryTime}
                          onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                          placeholder="如：3-5个工作日"
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2 py-2">
                  <Label htmlFor="description">描述</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                
                <div className="space-y-2 py-2">
                  <Label htmlFor="features">特性 (JSON格式)</Label>
                  <Textarea
                    id="features"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder='["特性1", "特性2", "特性3"]'
                    rows={3}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    取消
                  </Button>
                  <Button type="submit">
                    {editingService ? '更新' : '创建'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索服务名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">所有分类</SelectItem>
                {SERVICE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">所有类型</SelectItem>
                <SelectItem value="SERVICE">服务</SelectItem>
                <SelectItem value="INVESTMENT">投资</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">所有状态</SelectItem>
                <SelectItem value="ACTIVE">活跃</SelectItem>
                <SelectItem value="INACTIVE">非活跃</SelectItem>
                <SelectItem value="DRAFT">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 服务列表 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>服务信息</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>价格</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>统计</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => {
                  const TypeIcon = getTypeIcon(service.type);
                  
                  return (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {service.imageUrl && (
                            <img 
                              src={service.imageUrl} 
                              alt={service.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{service.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {service.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">
                          {service.category}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          {getTypeLabel(service.type)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold">¥{service.price}</div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(service.status)}>
                          {getStatusLabel(service.status)}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div>订阅: {service._count.subscriptions}</div>
                          <div>购买: {service._count.purchases}</div>
                          {service.type === 'INVESTMENT' && (
                            <div>投资: {service._count.investments}</div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(service.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
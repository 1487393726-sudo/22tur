'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Eye, 
  Edit, 
  Settings,
  Calendar,
  CreditCard,
  Crown,
  Building,
  User as UserIcon
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  userType: 'NORMAL' | 'MEMBER' | 'VIP' | 'ENTERPRISE';
  membershipExpiry?: string;
  status: string;
  createdAt: string;
  subscriptions?: Array<{
    id: string;
    status: string;
    endDate: string;
    planType?: string;
    amount?: number;
    service: {
      title: string;
      category: string;
      type: string;
    };
  }>;
  purchases?: Array<{
    id: string;
    status: string;
    purchaseDate: string;
    amount?: number;
    service: {
      title: string;
      type: string;
    };
  }>;
}

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: 'SERVICE' | 'INVESTMENT';
  status: string;
  imageUrl?: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchServices();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users-simple');
      if (response.ok) {
        const data = await response.json();
        // 确保返回的是数组
        setUsers(Array.isArray(data) ? data : []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/subscription/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('获取服务列表失败:', error);
    }
  };

  const getUserTypeLabel = (type: string) => {
    const types = {
      NORMAL: { label: '普通用户', icon: UserIcon, color: 'bg-gray-100 text-gray-800' },
      MEMBER: { label: '会员用户', icon: CreditCard, color: 'bg-blue-100 text-blue-800' },
      VIP: { label: 'VIP用户', icon: Crown, color: 'bg-purple-100 text-white800' },
      ENTERPRISE: { label: '企业用户', icon: Building, color: 'bg-green-100 text-green-800' }
    };
    return types[type as keyof typeof types] || types.NORMAL;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-yellow-100 text-yellow-800',
      PENDING: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const isMembershipExpired = (expiryDate?: string) => {
    if (!expiryDate) return true;
    return new Date(expiryDate) < new Date();
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUserType = userTypeFilter === 'ALL' || user.userType === userTypeFilter;
    const matchesStatus = statusFilter === 'ALL' || user.status === statusFilter;
    
    return matchesSearch && matchesUserType && matchesStatus;
  });

  const getUserStats = () => {
    const stats = {
      total: users.length,
      normal: users.filter(u => u.userType === 'NORMAL').length,
      member: users.filter(u => u.userType === 'MEMBER').length,
      vip: users.filter(u => u.userType === 'VIP').length,
      enterprise: users.filter(u => u.userType === 'ENTERPRISE').length,
      expired: users.filter(u => isMembershipExpired(u.membershipExpiry)).length
    };
    return stats;
  };

  const stats = getUserStats();

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">普通用户</CardTitle>
            <UserPlus className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.normal}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会员用户</CardTitle>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.member}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIP用户</CardTitle>
            <Crown className="h-4 w-4 text-white600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vip}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">企业用户</CardTitle>
            <Building className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enterprise}</div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle>用户管理</CardTitle>
          <CardDescription>管理所有用户账户和会员状态</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索用户名、姓名或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="用户类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">所有类型</SelectItem>
                <SelectItem value="NORMAL">普通用户</SelectItem>
                <SelectItem value="MEMBER">会员用户</SelectItem>
                <SelectItem value="VIP">VIP用户</SelectItem>
                <SelectItem value="ENTERPRISE">企业用户</SelectItem>
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
              </SelectContent>
            </Select>
          </div>

          {/* 用户列表 */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>会员到期</TableHead>
                  <TableHead>注册时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const userTypeInfo = getUserTypeLabel(user.userType);
                  const Icon = userTypeInfo.icon;
                  const expired = isMembershipExpired(user.membershipExpiry);
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.username}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={userTypeInfo.color}>
                          <Icon className="h-3 w-3 mr-1" />
                          {userTypeInfo.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status === 'ACTIVE' ? '活跃' : '非活跃'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.membershipExpiry ? (
                            <>
                              <Calendar className="h-4 w-4" />
                              <span className={`text-sm ${expired ? 'text-red-600' : ''}`}>
                                {new Date(user.membershipExpiry).toLocaleDateString()}
                              </span>
                              {expired && (
                                <Badge variant="destructive" className="text-xs">
                                  已过期
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              无会员
                            </span>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Settings className="h-4 w-4" />
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

      {/* 用户详情弹窗 */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          services={services}
          onClose={() => setSelectedUser(null)}
          onUpdate={fetchUsers}
        />
      )}
    </div>
  );
}

// 用户详情弹窗组件
function UserDetailsModal({ 
  user, 
  services, 
  onClose, 
  onUpdate 
}: { 
  user: User; 
  services: Service[]; 
  onClose: () => void; 
  onUpdate: () => void;
}) {
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('subscriptions');

  useEffect(() => {
    fetchUserDetails();
  }, [user.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      // 获取用户的订阅和购买记录
      const [subscriptionsResponse, purchasesResponse] = await Promise.all([
        fetch(`/api/subscription/subscriptions?userId=${user.id}`),
        fetch(`/api/subscription/purchase?userId=${user.id}`)
      ]);

      if (subscriptionsResponse.ok && purchasesResponse.ok) {
        const subscriptions = await subscriptionsResponse.json();
        const purchases = await purchasesResponse.json();
        
        setUserDetails({
          ...user,
          subscriptions,
          purchases
        });
      }
    } catch (error) {
      console.error('获取用户详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!userDetails) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">用户详情</h2>
            <Button variant="outline" onClick={onClose}>
              关闭
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>用户名:</strong> {userDetails.username}</div>
                <div><strong>姓名:</strong> {userDetails.firstName} {userDetails.lastName}</div>
                <div><strong>邮箱:</strong> {userDetails.email}</div>
                <div><strong>用户类型:</strong> {userDetails.userType}</div>
                <div><strong>会员到期:</strong> {
                  userDetails.membershipExpiry 
                    ? new Date(userDetails.membershipExpiry).toLocaleDateString()
                    : '无'
                }</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>账户统计</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>注册时间:</strong> {new Date(userDetails.createdAt).toLocaleDateString()}</div>
                <div><strong>订阅数量:</strong> {userDetails.subscriptions?.length || 0}</div>
                <div><strong>购买记录:</strong> {userDetails.purchases?.length || 0}</div>
                <div><strong>活跃状态:</strong> {
                  userDetails.status === 'ACTIVE' ? '活跃' : '非活跃'
                }</div>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="subscriptions">订阅服务</TabsTrigger>
              <TabsTrigger value="purchases">购买记录</TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>订阅服务</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails.subscriptions && userDetails.subscriptions.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.subscriptions.map((subscription) => (
                        <div key={subscription.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{subscription.service.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {subscription.service.category} - {subscription.service.type}
                              </p>
                              <p className="text-sm mt-1">
                                计划: {subscription.planType === 'MONTHLY' ? '月付' : '年付'}
                              </p>
                              <p className="text-sm">
                                状态: <Badge className={
                                  subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }>
                                  {subscription.status === 'ACTIVE' ? '活跃' : '已过期'}
                                </Badge>
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">¥{subscription.amount}</div>
                              <div className="text-sm text-muted-foreground">
                                到期: {new Date(subscription.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无订阅服务
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purchases" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>购买记录</CardTitle>
                </CardHeader>
                <CardContent>
                  {userDetails.purchases && userDetails.purchases.length > 0 ? (
                    <div className="space-y-4">
                      {userDetails.purchases.map((purchase) => (
                        <div key={purchase.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{purchase.service.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {purchase.service.type}
                              </p>
                              <p className="text-sm mt-1">
                                购买时间: {new Date(purchase.purchaseDate).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">¥{purchase.amount}</div>
                              <Badge className={
                                purchase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }>
                                {purchase.status === 'COMPLETED' ? '已完成' : '待处理'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无购买记录
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
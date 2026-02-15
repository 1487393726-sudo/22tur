"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Search,
  Crown,
  Star,
  Building,
  User,
  Mail,
  Phone,
  Edit,
  Trash2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { RequireAuth } from "@/components/auth/require-auth";

// 用户类型定义
interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  userType: "NORMAL" | "MEMBER" | "VIP" | "ENTERPRISE";
  membershipExpiry?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  subscriptionCount?: number;
  totalSpent?: number;
}

interface UserStats {
  total: number;
  normal: number;
  member: number;
  vip: number;
  enterprise: number;
  newThisMonth: number;
}

export default function UserManagementPage() {
  const t = useTranslations("admin.users");
  const tc = useTranslations("common");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // 加载用户数据
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users-simple');
      if (response.ok) {
        const data = await response.json();
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

  // 计算统计数据
  const calculateStats = (userData: User[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const userStats: UserStats = {
      total: userData.length,
      normal: userData.filter(u => u.userType === "NORMAL").length,
      member: userData.filter(u => u.userType === "MEMBER").length,
      vip: userData.filter(u => u.userType === "VIP").length,
      enterprise: userData.filter(u => u.userType === "ENTERPRISE").length,
      newThisMonth: userData.filter(u => {
        const createdDate = new Date(u.createdAt);
        return createdDate.getMonth() === currentMonth && 
               createdDate.getFullYear() === currentYear;
      }).length,
    };

    setStats(userStats);
  };

  // 过滤用户
  useEffect(() => {
    if (!Array.isArray(users)) return;

    const filtered = users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesUserType = userTypeFilter === "all" || user.userType === userTypeFilter;
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesUserType && matchesStatus;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, userTypeFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      calculateStats(users);
    }
  }, [users]);

  // 获取用户类型图标和样式
  const getUserTypeInfo = (userType: string) => {
    switch (userType) {
      case "NORMAL":
        return {
          icon: User,
          label: tc("userTypes.normal"),
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
        };
      case "MEMBER":
        return {
          icon: Star,
          label: tc("userTypes.member"),
          color: "bg-blue-500/20 text-blue-300 border-blue-500/30"
        };
      case "VIP":
        return {
          icon: Crown,
          label: tc("userTypes.vip"),
          color: "bg-purple-500/20 text-white border-purple-500/30"
        };
      case "ENTERPRISE":
        return {
          icon: Building,
          label: tc("userTypes.enterprise"),
          color: "bg-green-500/20 text-green-300 border-green-500/30"
        };
      default:
        return {
          icon: User,
          label: tc("userTypes.normal"),
          color: "bg-gray-500/20 text-gray-300 border-gray-500/30"
        };
    }
  };

  // 获取状态样式和文本
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return { label: tc("status.active"), color: "bg-green-500/20 text-green-300 border-green-500/30" };
      case "INACTIVE":
        return { label: tc("status.inactive"), color: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
      case "SUSPENDED":
        return { label: tc("status.cancelled"), color: "bg-red-500/20 text-red-300 border-red-500/30" };
      default:
        return { label: status, color: "bg-gray-500/20 text-gray-300 border-gray-500/30" };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white">{tc("buttons.loading")}</div>
      </div>
    );
  }

  return (
    <RequireAuth adminOnly>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold theme-gradient-text">{t("title")}</h1>
          <p className="text-gray-300">{t("description")}</p>
        </div>

        {/* 统计卡片 */}
        {stats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {t("table.username")}
                </CardTitle>
                <Users className="h-4 w-4 text-gray-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <p className="text-xs text-gray-300">+{stats.newThisMonth}</p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {tc("userTypes.normal")}
                </CardTitle>
                <User className="h-4 w-4 text-gray-300" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.normal}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {tc("userTypes.member")}
                </CardTitle>
                <Star className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{stats.member}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {tc("userTypes.vip")}
                </CardTitle>
                <Crown className="h-4 w-4 text-white" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.vip}</div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-white">
                  {tc("userTypes.enterprise")}
                </CardTitle>
                <Building className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{stats.enterprise}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 搜索和过滤 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder={tc("buttons.search") + "..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder={t("table.userType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tc("buttons.filter")}</SelectItem>
                  <SelectItem value="NORMAL">{tc("userTypes.normal")}</SelectItem>
                  <SelectItem value="MEMBER">{tc("userTypes.member")}</SelectItem>
                  <SelectItem value="VIP">{tc("userTypes.vip")}</SelectItem>
                  <SelectItem value="ENTERPRISE">{tc("userTypes.enterprise")}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-32 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder={t("table.status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{tc("buttons.filter")}</SelectItem>
                  <SelectItem value="ACTIVE">{tc("status.active")}</SelectItem>
                  <SelectItem value="INACTIVE">{tc("status.inactive")}</SelectItem>
                  <SelectItem value="SUSPENDED">{tc("status.cancelled")}</SelectItem>
                </SelectContent>
              </Select>
              <Button className="theme-gradient-bg text-white hover:shadow-lg transition-shadow">
                <Plus className="h-4 w-4 mr-2" />
                {t("addUser")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 用户表格 */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">{t("table.username")}</TableHead>
                  <TableHead className="text-white">{t("table.userType")}</TableHead>
                  <TableHead className="text-white">{t("table.status")}</TableHead>
                  <TableHead className="text-white">{t("table.email")}</TableHead>
                  <TableHead className="text-white">{t("table.createdAt")}</TableHead>
                  <TableHead className="text-white">{t("table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const TypeInfo = getUserTypeInfo(user.userType);
                  const statusInfo = getStatusInfo(user.status);
                  return (
                    <TableRow key={user.id} className="border-white/10">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`/avatars/${user.id}.jpg`} />
                            <AvatarFallback className="bg-white/10 text-white">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-400">
                              @{user.username}
                            </div>
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
                        <Badge className={`${statusInfo.color} border`}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-300">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center text-sm text-gray-300">
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-300">
                          {formatDate(user.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300"
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

        {/* 如果没有用户数据 */}
        {filteredUsers.length === 0 && (
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">{tc("empty.noResults")}</h3>
              <p className="text-gray-400">{t("addUser")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </RequireAuth>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  FileText,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateClientModal } from "@/components/client/create-client-modal";
import { ViewClientModal } from "@/components/client/view-client-modal";
import { EditClientModal } from "@/components/client/edit-client-modal";
import { Client } from "@prisma/client";

type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';

interface ClientWithProjects extends Client {
  _count: {
    projects: number;
  };
  totalProjectValue: number;
  website?: string;
  contactPerson?: string;
  position?: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientWithProjects[]>([]);
  const [filteredClients, setFilteredClients] = useState<ClientWithProjects[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] =
    useState<ClientWithProjects | null>(null);

  // 获取状态徽章样式
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      ACTIVE: { label: "活跃", className: "bg-green-100 text-green-800" },
      INACTIVE: { label: "未活跃", className: "bg-gray-100 text-gray-800" },
      PROSPECT: {
        label: "潜在客户",
        className: "bg-yellow-100 text-yellow-800",
      },
      CHURNED: { label: "已流失", className: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800" };
    return (
      <Badge className={config.className} data-oid="r7t55:x">
        {config.label}
      </Badge>
    );
  };

  // 获取客户数据
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data);
        setFilteredClients(data);
      }
    } catch (error) {
      console.error("获取客户数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索和过滤
  useEffect(() => {
    let filtered = clients;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.industry?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // 状态过滤
    if (statusFilter !== "all") {
      filtered = filtered.filter((client) => client.status === statusFilter);
    }

    setFilteredClients(filtered);
  }, [clients, searchTerm, statusFilter]);

  const handleViewClient = (client: ClientWithProjects) => {
    setSelectedClient(client);
    setViewModalOpen(true);
  };

  const handleEditClient = (client: ClientWithProjects) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("确定要删除这个客户吗？此操作不可撤销。")) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error("删除客户失败:", error);
    }
  };

  const handleClientCreated = () => {
    fetchClients();
    setCreateModalOpen(false);
  };

  const handleClientUpdated = () => {
    fetchClients();
    setEditModalOpen(false);
    setSelectedClient(null);
  };

  // 计算统计数据
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const totalRevenue = clients.reduce(
    (sum, client) => sum + (client.totalProjectValue || 0),
    0,
  );
  const averageProjectValue =
    totalClients > 0 ? totalRevenue / totalClients : 0;

  if (loading) {
    return (
      <div className="p-6" data-oid="d-rns7n">
        <div className="max-w-7xl mx-auto" data-oid="ac:2beg">
          <div className="animate-pulse" data-oid="er18p7n">
            <div
              className="h-8 bg-gray-200 rounded w-64 mb-8"
              data-oid="2g15t.c"
            ></div>
            <div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              data-oid="t-m6382"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 rounded-lg"
                  data-oid="kg2lv3e"
                ></div>
              ))}
            </div>
            <div
              className="h-96 bg-gray-100 rounded-lg"
              data-oid="oo7l47o"
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-oid="liu5orm">
      <div className="max-w-7xl mx-auto" data-oid="tntbk88">
        {/* 页面标题 */}
        <div
          className="flex justify-between items-center mb-8"
          data-oid="dndtzi3"
        >
          <div data-oid="zeha5ui">
            <h1 className="text-3xl font-bold theme-gradient-text" data-oid="btwrnnw">
              客户管理
            </h1>
            <p className="text-gray-300 mt-2" data-oid=".lji0rg">
              管理客户信息、合同状态和项目历史
            </p>
          </div>
          <Button
            onClick={() => setCreateModalOpen(true)}
            className="theme-gradient-bg text-white hover:shadow-lg transition-shadow"
            data-oid="u-_olvb"
          >
            <Plus className="w-4 h-4 mr-2" data-oid="yqwls3e" />
            新增客户
          </Button>
        </div>

        {/* 统计卡片 */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-oid="8oh:8im"
        >
          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="qb71gsv"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="3xx2.ba"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="ohrvntj"
              >
                总客户数
              </CardTitle>
              <Building2 className="h-4 w-4 text-gray-300" data-oid="3h8y21m" />
            </CardHeader>
            <CardContent data-oid="3dgz-8_">
              <div className="text-2xl font-bold text-white" data-oid="1_vx6:3">
                {totalClients}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="jt06x-s"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="e55vnez"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid=".7evvqz"
              >
                活跃客户
              </CardTitle>
              <Building2 className="h-4 w-4 text-gray-300" data-oid="3p2_bpm" />
            </CardHeader>
            <CardContent data-oid="73600bs">
              <div className="text-2xl font-bold text-white" data-oid="p9geir-">
                {activeClients}
              </div>
              <p className="text-xs text-gray-300" data-oid="jft1zfo">
                {totalClients > 0
                  ? Math.round((activeClients / totalClients) * 100)
                  : 0}
                % 活跃率
              </p>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="n6gqajw"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="n7ejo9d"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="etlaotz"
              >
                总收入
              </CardTitle>
              <DollarSign
                className="h-4 w-4 text-green-400"
                data-oid="a-uydyp"
              />
            </CardHeader>
            <CardContent data-oid="zum8-bc">
              <div
                className="text-2xl font-bold text-green-400"
                data-oid="fwmca05"
              >
                ¥{totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="nvv:9_9"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="6qzq6:g"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="trwj9p7"
              >
                平均项目价值
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-300" data-oid="mbnmzh9" />
            </CardHeader>
            <CardContent data-oid="a57ti0f">
              <div className="text-2xl font-bold text-white" data-oid="wyobi:i">
                ¥{Math.round(averageProjectValue).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和过滤 */}
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm mb-6"
          data-oid="-_t27vq"
        >
          <CardContent className="p-4" data-oid="w9na1tc">
            <div className="flex flex-col sm:flex-row gap-4" data-oid="-0lgp5-">
              <div className="flex-1" data-oid="bx_litb">
                <div className="relative" data-oid="8ke6_am">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4"
                    data-oid="zpkm10b"
                  />
                  <Input
                    placeholder="搜索客户名称、邮箱、电话或行业..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                    data-oid="h__6-ta"
                  />
                </div>
              </div>
              <div className="flex gap-2" data-oid="829gn4k">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white"
                  aria-label="筛选客户状态"
                  data-oid="tl:2_.a"
                >
                  <option
                    value="all"
                    className="text-gray-900"
                    data-oid="1gwxkbu"
                  >
                    所有状态
                  </option>
                  <option
                    value="ACTIVE"
                    className="text-gray-900"
                    data-oid="8.mq7gz"
                  >
                    活跃
                  </option>
                  <option
                    value="INACTIVE"
                    className="text-gray-900"
                    data-oid="_sqnz-g"
                  >
                    未活跃
                  </option>
                  <option
                    value="PROSPECT"
                    className="text-gray-900"
                    data-oid="2c4d0vb"
                  >
                    潜在客户
                  </option>
                  <option
                    value="CHURNED"
                    className="text-gray-900"
                    data-oid="64j6iqo"
                  >
                    已流失
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 客户列表 */}
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm"
          data-oid="rvoodwk"
        >
          <CardHeader data-oid="974jdnt">
            <CardTitle className="text-white" data-oid="uv7okfp">
              客户列表
            </CardTitle>
          </CardHeader>
          <CardContent data-oid="eiu_8br">
            {filteredClients.length === 0 ? (
              <div className="text-center py-12" data-oid="ndqf2wz">
                <Building2
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  data-oid="j3m8lg2"
                />
                <h3
                  className="text-lg font-medium text-white mb-2"
                  data-oid="m9l76b4"
                >
                  {searchTerm || statusFilter !== "all"
                    ? "没有找到匹配的客户"
                    : "暂无客户数据"}
                </h3>
                <p className="text-gray-300 mb-4" data-oid="nzipnwd">
                  {searchTerm || statusFilter !== "all"
                    ? "请尝试调整搜索条件或筛选器"
                    : "开始添加您的第一个客户吧"}
                </p>
                {!searchTerm && statusFilter === "all" && (
                  <Button
                    onClick={() => setCreateModalOpen(true)}
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    data-oid="3txvy9g"
                  >
                    <Plus className="w-4 h-4 mr-2" data-oid="iyfy6iq" />
                    新增客户
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto" data-oid="th7x40e">
                <Table data-oid="drip3bf">
                  <TableHeader data-oid="xe4jbvq">
                    <TableRow data-oid="3mcay99">
                      <TableHead className="text-white" data-oid="h5c30.5">
                        客户名称
                      </TableHead>
                      <TableHead className="text-white" data-oid="6u.5go7">
                        联系人
                      </TableHead>
                      <TableHead className="text-white" data-oid="-flvhcp">
                        联系方式
                      </TableHead>
                      <TableHead className="text-white" data-oid="ftsl.u1">
                        行业
                      </TableHead>
                      <TableHead className="text-white" data-oid="hqitz.j">
                        状态
                      </TableHead>
                      <TableHead className="text-white" data-oid="5a_1gj6">
                        项目数
                      </TableHead>
                      <TableHead className="text-white" data-oid="9vpd72.">
                        总价值
                      </TableHead>
                      <TableHead className="text-white" data-oid="0y0xk-0">
                        创建时间
                      </TableHead>
                      <TableHead
                        className="w-[100px] text-white"
                        data-oid="3ip-xyf"
                      >
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-oid=":l418gy">
                    {filteredClients.map((client) => (
                      <TableRow key={client.id} data-oid="_t2:q9d">
                        <TableCell data-oid="k.62cd8">
                          <div data-oid="vui0ge5">
                            <div
                              className="font-medium text-white"
                              data-oid="6gamb8-"
                            >
                              {client.name}
                            </div>
                            {client.website && (
                              <a
                                href={client.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline text-sm"
                                data-oid="p4qzyrq"
                              >
                                {client.website}
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-oid="rnfx.14">
                          <div data-oid="k4tx6ql">
                            <div
                              className="font-medium text-white"
                              data-oid="-m5gave"
                            >
                              {client.contactPerson || "-"}
                            </div>
                            <div
                              className="text-sm text-gray-300"
                              data-oid="i5d84s."
                            >
                              {client.position || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell data-oid="b1xvjl1">
                          <div className="space-y-1" data-oid="cm5k593">
                            {client.email && (
                              <div
                                className="flex items-center text-sm text-gray-300"
                                data-oid="h5f4qki"
                              >
                                <Mail
                                  className="w-3 h-3 mr-1"
                                  data-oid="rboxqce"
                                />
                                {client.email}
                              </div>
                            )}
                            {client.phone && (
                              <div
                                className="flex items-center text-sm text-gray-300"
                                data-oid="qlpv23u"
                              >
                                <Phone
                                  className="w-3 h-3 mr-1"
                                  data-oid="lhynfbo"
                                />
                                {client.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-oid="m1b.jgu">
                          <Badge
                            variant="outline"
                            className="text-gray-300 border-gray-300"
                            data-oid="1il7tcm"
                          >
                            {client.industry || "其他"}
                          </Badge>
                        </TableCell>
                        <TableCell data-oid="ghwtpgx">
                          {getStatusBadge(client.status)}
                        </TableCell>
                        <TableCell data-oid="yljezop">
                          <div
                            className="font-medium text-white"
                            data-oid="-nk:o9."
                          >
                            {client._count.projects}
                          </div>
                        </TableCell>
                        <TableCell data-oid="65jv2-4">
                          <div
                            className="font-medium text-white"
                            data-oid="zo5aq60"
                          >
                            ¥{(client.totalProjectValue || 0).toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell data-oid=".-chkk_">
                          <div
                            className="flex items-center text-sm text-gray-300"
                            data-oid="r1sh-5t"
                          >
                            <Calendar
                              className="w-3 h-3 mr-1"
                              data-oid="rf0sywf"
                            />
                            {new Date(client.createdAt).toLocaleDateString(
                              "zh-CN",
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-oid="jdt3f-5">
                          <DropdownMenu data-oid="blhds14">
                            <DropdownMenuTrigger asChild data-oid="zpe07cv">
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                data-oid="wlw_uau"
                              >
                                <MoreHorizontal
                                  className="h-4 w-4"
                                  data-oid="czsgz01"
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" data-oid=":62_v18">
                              <DropdownMenuItem
                                onClick={() => handleViewClient(client)}
                                data-oid="9-5mv_b"
                              >
                                <Eye
                                  className="w-4 h-4 mr-2"
                                  data-oid="73h-9hy"
                                />
                                查看详情
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleEditClient(client)}
                                data-oid="yf8iozl"
                              >
                                <Edit
                                  className="w-4 h-4 mr-2"
                                  data-oid=".k.39o1"
                                />
                                编辑
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteClient(client.id)}
                                className="text-red-600"
                                data-oid="7p173ut"
                              >
                                <Trash2
                                  className="w-4 h-4 mr-2"
                                  data-oid="gg1vas7"
                                />
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 模态框 */}
        <CreateClientModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={handleClientCreated}
          data-oid="m13ro57"
        />

        <ViewClientModal
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
          client={selectedClient}
          data-oid="m4vd-lb"
        />

        <EditClientModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          client={selectedClient}
          onSuccess={handleClientUpdated}
          data-oid=".xrjvqh"
        />
      </div>
    </div>
  );
}

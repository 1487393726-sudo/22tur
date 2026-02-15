"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { UserWithDepartment } from "@/lib/types";
import { formatDate, getRoleText } from "@/lib/utils";
import { CreateEmployeeModal } from "@/components/employee/create-employee-modal";

export default function EmployeesPage() {
  const { data: session } = useSession();
  const [employees, setEmployees] = useState<UserWithDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const params = new URLSearchParams({
        search,
        role: roleFilter !== "all" ? roleFilter : "",
      });

      const response = await fetch(`/api/users?${params}`);
      const result = await response.json();

      if (result.success) {
        // API返回的数据结构是 { data: [...], pagination: {...} }
        setEmployees(result.data.data || []);
      } else {
        console.error("加载员工列表失败:", result.error);
        setEmployees([]); // 确保employees不会为undefined
      }
    } catch (error) {
      console.error("加载员工列表失败:", error);
      setEmployees([]); // 确保employees不会为undefined
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async (userId: string) => {
    if (!confirm("确定要删除这个员工吗？")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        loadEmployees();
      } else {
        alert("删除失败: " + result.error);
      }
    } catch (error) {
      console.error("删除员工失败:", error);
      alert("删除失败，请重试");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="jo4wb4a">
        <div className="text-white" data-oid="yzlhae4">
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-oid="5.d_k_o">
      {/* 页面标题 */}
      <div className="flex justify-between items-center" data-oid="cu43ozh">
        <div data-oid="r_.ucob">
          <h1 className="text-3xl font-bold theme-gradient-text" data-oid="adrjvvb">
            员工管理
          </h1>
          <p className="text-gray-300" data-oid="ojf2dvi">
            管理公司员工信息和组织架构
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="theme-gradient-bg text-white hover:shadow-lg transition-shadow"
          data-oid="n0p95uv"
        >
          <Plus className="mr-2 h-4 w-4" data-oid="1hil55c" />
          新增员工
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <Card
        className="bg-white/10 border-white/20 backdrop-blur-sm"
        data-oid="qmqs1nm"
      >
        <CardContent className="p-4" data-oid="wrjre5.">
          <div className="flex gap-4" data-oid="ksyy:oe">
            <div className="flex-1" data-oid="cmensjq">
              <div className="relative" data-oid="q1o4o48">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300"
                  data-oid="3:i_3g5"
                />
                <Input
                  placeholder="搜索员工姓名、邮箱..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                  data-oid="9.hlw.d"
                />
              </div>
            </div>
            <Select
              value={roleFilter}
              onValueChange={setRoleFilter}
              data-oid="-a7n0pl"
            >
              <SelectTrigger
                className="w-40 bg-white/10 border-white/20 text-white"
                data-oid="-keyuq7"
              >
                <Filter className="mr-2 h-4 w-4" data-oid="vltgapo" />
                <SelectValue placeholder="角色筛选" data-oid="vw6xn24" />
              </SelectTrigger>
              <SelectContent data-oid="9d4f:d_">
                <SelectItem value="all" data-oid="ru3apu1">
                  全部角色
                </SelectItem>
                <SelectItem value="ADMIN" data-oid="ipeirv7">
                  管理员
                </SelectItem>
                <SelectItem value="MANAGER" data-oid="0ls5_bb">
                  经理
                </SelectItem>
                <SelectItem value="EMPLOYEE" data-oid="b1y31e4">
                  员工
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={loadEmployees}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-oid="je.h06n"
            >
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 员工列表 */}
      <Card
        className="bg-white/10 border-white/20 backdrop-blur-sm"
        data-oid="44r0k2n"
      >
        <CardHeader data-oid="n4iwkjp">
          <CardTitle className="text-white" data-oid="ft-hh.j">
            员工列表 ({employees.length})
          </CardTitle>
        </CardHeader>
        <CardContent data-oid="cw82w77">
          <Table data-oid="zokdpw0">
            <TableHeader data-oid="y7u1fvq">
              <TableRow data-oid="npjog_j">
                <TableHead className="text-white" data-oid="zl_lmdu">
                  姓名
                </TableHead>
                <TableHead className="text-white" data-oid="xvy9xr7">
                  邮箱
                </TableHead>
                <TableHead className="text-white" data-oid="cfh2w1_">
                  部门
                </TableHead>
                <TableHead className="text-white" data-oid="q74h:ve">
                  职位
                </TableHead>
                <TableHead className="text-white" data-oid="wn4q-uu">
                  角色
                </TableHead>
                <TableHead className="text-white" data-oid="39e:o3k">
                  入职日期
                </TableHead>
                <TableHead className="text-white" data-oid="ij1809a">
                  操作
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-oid="gygykr.">
              {employees.map((employee) => (
                <TableRow key={employee.id} data-oid="s6-yw98">
                  <TableCell
                    className="text-white font-medium"
                    data-oid="jfaegby"
                  >
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell className="text-gray-300" data-oid="s44rsc3">
                    {employee.email}
                  </TableCell>
                  <TableCell className="text-gray-300" data-oid="xpd4p59">
                    {employee.department?.name || "-"}
                  </TableCell>
                  <TableCell className="text-gray-300" data-oid="spp2254">
                    {employee.position || "-"}
                  </TableCell>
                  <TableCell data-oid="63rsle:">
                    <Badge
                      className={
                        employee.role === "ADMIN"
                          ? "bg-red-100 text-red-800"
                          : employee.role === "MANAGER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }
                      data-oid="9rg7.--"
                    >
                      {getRoleText(employee.role as any)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300" data-oid="zvngasg">
                    {formatDate(employee.hireDate)}
                  </TableCell>
                  <TableCell data-oid="kklhhdb">
                    <DropdownMenu data-oid="5c612ry">
                      <DropdownMenuTrigger asChild data-oid="qog7zwa">
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-gray-300 hover:text-white"
                          data-oid="ujhxg1."
                        >
                          <span className="sr-only" data-oid="izmhwqr">
                            打开菜单
                          </span>
                          <MoreHorizontal
                            className="h-4 w-4"
                            data-oid=".ozwj.k"
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" data-oid="-r9dsij">
                        <DropdownMenuLabel data-oid="-:nzjeq">
                          操作
                        </DropdownMenuLabel>
                        <DropdownMenuItem data-oid="c-74z.y">
                          <Eye className="mr-2 h-4 w-4" data-oid="wpvyy_y" />
                          查看详情
                        </DropdownMenuItem>
                        <DropdownMenuItem data-oid="1x2u_nz">
                          <Edit className="mr-2 h-4 w-4" data-oid="jtsyb-a" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator data-oid="ek:sl1v" />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDeleteEmployee(employee.id)}
                          data-oid="oicqqy2"
                        >
                          <Trash2 className="mr-2 h-4 w-4" data-oid="ofkcmo6" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {employees.length === 0 && (
            <div className="text-center py-8 text-gray-300" data-oid="bj-xstt">
              暂无员工数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* 创建员工模态框 */}
      <CreateEmployeeModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={loadEmployees}
        data-oid="vcqo8rm"
      />
    </div>
  );
}

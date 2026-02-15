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
  FileText,
  Search,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { RequireAuth } from "@/components/auth/require-auth";

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  status: string;
  clientSignedAt: string | null;
  companySignedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    client: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "草稿", color: "bg-gray-500/20 text-gray-300" },
  PENDING_CLIENT: { label: "待客户签署", color: "bg-yellow-500/20 text-yellow-300" },
  PENDING_COMPANY: { label: "待公司签署", color: "bg-blue-500/20 text-blue-300" },
  SIGNED: { label: "已签署", color: "bg-green-500/20 text-green-300" },
  CANCELLED: { label: "已取消", color: "bg-red-500/20 text-red-300" },
};

export default function AdminContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchContracts();
  }, [statusFilter]);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      const res = await fetch(`/api/contracts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContracts(data.data || []);
      }
    } catch (error) {
      console.error("获取合同列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.order.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${contract.order.client.firstName} ${contract.order.client.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const signContract = async (contractId: string) => {
    try {
      const res = await fetch(`/api/contracts/${contractId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature: "公司电子签章",
          signatureType: "company",
        }),
      });

      if (res.ok) {
        fetchContracts();
      } else {
        const error = await res.json();
        alert(error.error || "签署失败");
      }
    } catch (error) {
      console.error("签署失败:", error);
    }
  };

  const stats = {
    total: contracts.length,
    pendingClient: contracts.filter((c) => c.status === "PENDING_CLIENT").length,
    pendingCompany: contracts.filter((c) => c.status === "PENDING_COMPANY").length,
    signed: contracts.filter((c) => c.status === "SIGNED").length,
    totalAmount: contracts
      .filter((c) => c.status === "SIGNED")
      .reduce((sum, c) => sum + c.order.total, 0),
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
        <div>
          <h1 className="text-2xl font-bold theme-gradient-text">合同管理</h1>
          <p className="text-gray-400">管理服务合同和签署状态</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">总合同</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">待客户签署</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pendingClient}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">待公司签署</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">{stats.pendingCompany}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">已签署</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.signed}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">签约金额</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                ¥{stats.totalAmount.toLocaleString()}
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
                  placeholder="搜索合同号、标题或客户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="合同状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="DRAFT">草稿</SelectItem>
                  <SelectItem value="PENDING_CLIENT">待客户签署</SelectItem>
                  <SelectItem value="PENDING_COMPANY">待公司签署</SelectItem>
                  <SelectItem value="SIGNED">已签署</SelectItem>
                  <SelectItem value="CANCELLED">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 合同列表 */}
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10">
                  <TableHead className="text-white">合同编号</TableHead>
                  <TableHead className="text-white">合同标题</TableHead>
                  <TableHead className="text-white">客户</TableHead>
                  <TableHead className="text-white">金额</TableHead>
                  <TableHead className="text-white">状态</TableHead>
                  <TableHead className="text-white">创建时间</TableHead>
                  <TableHead className="text-white">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <TableRow key={contract.id} className="border-white/10">
                    <TableCell>
                      <div className="font-medium text-white">{contract.contractNumber}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300">{contract.title}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-white">
                          {contract.order.client.firstName} {contract.order.client.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {contract.order.client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-white font-medium">
                        ¥{contract.order.total.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusMap[contract.status]?.color}>
                        {statusMap[contract.status]?.label || contract.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-gray-300">
                        {new Date(contract.createdAt).toLocaleDateString("zh-CN")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:text-blue-300"
                          onClick={() => router.push(`/admin/contracts/${contract.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {contract.status === "PENDING_COMPANY" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => signContract(contract.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {contract.status === "SIGNED" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:text-gray-300"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredContracts.length === 0 && (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">没有找到合同</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RequireAuth>
  );
}

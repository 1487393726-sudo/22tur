"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react";

interface InvestmentProject {
  id: string;
  title: string;
  category: string;
  status: string;
  investmentAmount: number;
  expectedReturn: number;
  totalRaised: number;
  investorCount: number;
  createdAt: string;
}

export default function InvestmentProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<InvestmentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/investment-projects?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProjects(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("获取项目列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      const response = await fetch(`/api/investment-projects/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProjects();
      } else {
        alert("删除失败");
      }
    } catch (error) {
      console.error("删除项目失败:", error);
      alert("删除失败");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      DRAFT: { label: "草稿", variant: "secondary" },
      ACTIVE: { label: "活跃", variant: "default" },
      CLOSED: { label: "关闭", variant: "destructive" },
      COMPLETED: { label: "完成", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">投资项目管理</h1>
          <p className="text-gray-600 mt-1">管理所有投资项目</p>
        </div>
        <Button onClick={() => router.push("/admin/investment-projects/create")}>
          <Plus className="mr-2 h-4 w-4" />
          创建项目
        </Button>
      </div>

      {/* 搜索和筛选 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 flex gap-2">
          <Input
            placeholder="搜索项目名称..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} variant="outline">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="状态筛选" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">全部状态</SelectItem>
            <SelectItem value="DRAFT">草稿</SelectItem>
            <SelectItem value="ACTIVE">活跃</SelectItem>
            <SelectItem value="CLOSED">关闭</SelectItem>
            <SelectItem value="COMPLETED">完成</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 项目列表 */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">暂无项目</p>
          <Button
            className="mt-4"
            onClick={() => router.push("/admin/investment-projects/create")}
          >
            创建第一个项目
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>项目名称</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">投资金额</TableHead>
                  <TableHead className="text-right">预期回报</TableHead>
                  <TableHead className="text-right">已筹集</TableHead>
                  <TableHead className="text-right">投资人数</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>{project.category || "-"}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell className="text-right">
                      ¥{project.investmentAmount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {project.expectedReturn}%
                    </TableCell>
                    <TableCell className="text-right">
                      ¥{project.totalRaised.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {project.investorCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.push(`/admin/investment-projects/${project.id}`)
                          }
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            router.push(`/admin/investment-projects/${project.id}/edit`)
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                上一页
              </Button>
              <span className="flex items-center px-4">
                第 {page} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

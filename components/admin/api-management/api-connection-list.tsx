"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  TestTube,
  RefreshCw,
} from "lucide-react";
import type { ApiConnection, ConnectionType, ConnectionStatus } from "@/types/api-management";

interface ApiConnectionListProps {
  connections: ApiConnection[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const statusColors: Record<ConnectionStatus, string> = {
  ACTIVE: "bg-green-500",
  INACTIVE: "bg-gray-500",
  ERROR: "bg-red-500",
};

const typeLabels: Record<ConnectionType, string> = {
  PAYMENT: "支付",
  EMAIL: "邮件",
  SMS: "短信",
  STORAGE: "存储",
  CUSTOM: "自定义",
};


export function ApiConnectionList({
  connections,
  onEdit,
  onDelete,
  onTest,
  onRefresh,
  loading = false,
}: ApiConnectionListProps) {
  const t = useTranslations("admin");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredConnections = connections.filter((conn) => {
    const matchesSearch = conn.name.toLowerCase().includes(search.toLowerCase()) ||
                          conn.provider.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || conn.type === typeFilter;
    const matchesStatus = statusFilter === "all" || conn.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="搜索连接名称或提供商..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20">
            <SelectItem value="all" className="text-white hover:bg-white/10">全部类型</SelectItem>
            <SelectItem value="PAYMENT" className="text-white hover:bg-white/10">支付</SelectItem>
            <SelectItem value="EMAIL" className="text-white hover:bg-white/10">邮件</SelectItem>
            <SelectItem value="SMS" className="text-white hover:bg-white/10">短信</SelectItem>
            <SelectItem value="STORAGE" className="text-white hover:bg-white/10">存储</SelectItem>
            <SelectItem value="CUSTOM" className="text-white hover:bg-white/10">自定义</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-white/10 border-white/20 text-white">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/20">
            <SelectItem value="all" className="text-white hover:bg-white/10">全部状态</SelectItem>
            <SelectItem value="ACTIVE" className="text-white hover:bg-white/10">活跃</SelectItem>
            <SelectItem value="INACTIVE" className="text-white hover:bg-white/10">未激活</SelectItem>
            <SelectItem value="ERROR" className="text-white hover:bg-white/10">错误</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={onRefresh} disabled={loading} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="rounded-md border border-white/20 bg-white/5 backdrop-blur-sm">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white">名称</TableHead>
              <TableHead className="text-white">类型</TableHead>
              <TableHead className="text-white">提供商</TableHead>
              <TableHead className="text-white">环境</TableHead>
              <TableHead className="text-white">状态</TableHead>
              <TableHead className="text-white">最后测试</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConnections.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-300">
                  暂无 API 连接
                </TableCell>
              </TableRow>
            ) : (
              filteredConnections.map((conn) => (
                <TableRow key={conn.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    {conn.name}
                    {conn.isDefault && (
                      <Badge variant="secondary" className="ml-2">默认</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-300">{typeLabels[conn.type]}</TableCell>
                  <TableCell className="text-gray-300">{conn.provider}</TableCell>
                  <TableCell>
                    <Badge variant={conn.environment === "PRODUCTION" ? "destructive" : "outline"}>
                      {conn.environment === "PRODUCTION" ? "生产" : "沙箱"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusColors[conn.status]}`} />
                      <span className="text-gray-300">{conn.status === "ACTIVE" ? "活跃" : conn.status === "INACTIVE" ? "未激活" : "错误"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {conn.lastTestedAt
                      ? new Date(conn.lastTestedAt).toLocaleString("zh-CN")
                      : "从未测试"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white hover:bg-white/10">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-white/20">
                        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer" onClick={() => onTest(conn.id)}>
                          <TestTube className="mr-2 h-4 w-4" />
                          测试连接
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer" onClick={() => onEdit(conn.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(conn.id)}
                          className="text-red-400 hover:bg-white/10 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

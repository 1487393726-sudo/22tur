"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: any;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  } | null;
  level: "INFO" | "WARN" | "ERROR";
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // 筛选状态
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    status: "",
    risk: "",
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const response = await fetch(`/api/security/logs?${params}`);
      if (response.ok) {
        const result = await response.json();
        setLogs(result.data || []);
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("获取审计日志失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = async (exportFormat: "csv" | "json") => {
    try {
      const params = new URLSearchParams({
        format: exportFormat,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== "")
        ),
      });

      const response = await fetch(`/api/security/logs/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${exportFormat}-${format(new Date(), "yyyy-MM-dd")}.${exportFormat}`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("导出日志失败:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      SUCCESS: { variant: "default" as const, label: "成功", icon: CheckCircle, color: "text-green-600" },
      FAILED: { variant: "destructive" as const, label: "失败", icon: XCircle, color: "text-red-600" },
      WARNING: { variant: "secondary" as const, label: "警告", icon: AlertTriangle, color: "text-yellow-600" },
    };
    const item = config[status as keyof typeof config] || config.SUCCESS;
    const Icon = item.icon;
    return (
      <Badge variant={item.variant} className="flex items-center gap-1">
        <Icon className={`w-3 h-3 ${item.color}`} />
        {item.label}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const config = {
      LOW: { variant: "secondary" as const, label: "低", color: "bg-blue-500" },
      MEDIUM: { variant: "default" as const, label: "中", color: "bg-yellow-500" },
      HIGH: { variant: "default" as const, label: "高", color: "bg-orange-500" },
      CRITICAL: { variant: "destructive" as const, label: "严重", color: "bg-red-500" },
    };
    const item = config[risk as keyof typeof config] || config.LOW;
    return (
      <Badge variant={item.variant} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${item.color}`} />
        {item.label}
      </Badge>
    );
  };

  const getActionName = (action: string) => {
    const nameMap: Record<string, string> = {
      LOGIN: "登录",
      LOGOUT: "登出",
      REGISTER: "注册",
      CREATE: "创建",
      READ: "读取",
      UPDATE: "更新",
      DELETE: "删除",
      EXPORT: "导出",
      DOWNLOAD: "下载",
      UPLOAD: "上传",
    };
    return nameMap[action] || action;
  };

  return (
    <div className="space-y-6">
      {/* 筛选器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 操作类型 */}
            <div className="space-y-2">
              <Label>操作类型</Label>
              <Select
                value={filters.action}
                onValueChange={(value) =>
                  setFilters({ ...filters, action: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部操作" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部操作</SelectItem>
                  <SelectItem value="LOGIN">登录</SelectItem>
                  <SelectItem value="LOGOUT">登出</SelectItem>
                  <SelectItem value="CREATE">创建</SelectItem>
                  <SelectItem value="READ">读取</SelectItem>
                  <SelectItem value="UPDATE">更新</SelectItem>
                  <SelectItem value="DELETE">删除</SelectItem>
                  <SelectItem value="EXPORT">导出</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态 */}
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters({ ...filters, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部状态</SelectItem>
                  <SelectItem value="SUCCESS">成功</SelectItem>
                  <SelectItem value="FAILED">失败</SelectItem>
                  <SelectItem value="WARNING">警告</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 风险等级 */}
            <div className="space-y-2">
              <Label>风险等级</Label>
              <Select
                value={filters.risk}
                onValueChange={(value) =>
                  setFilters({ ...filters, risk: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="全部等级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部等级</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="CRITICAL">严重</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 搜索 */}
            <div className="space-y-2">
              <Label>搜索</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="搜索资源、ID..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* 开始日期 */}
            <div className="space-y-2">
              <Label>开始日期</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>

            {/* 结束日期 */}
            <div className="space-y-2">
              <Label>结束日期</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  action: "",
                  resource: "",
                  status: "",
                  risk: "",
                  userId: "",
                  startDate: "",
                  endDate: "",
                  search: "",
                });
                setPagination({ ...pagination, page: 1 });
              }}
            >
              重置筛选
            </Button>
            <Button onClick={() => setPagination({ ...pagination, page: 1 })}>
              <Search className="w-4 h-4 mr-2" />
              应用筛选
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          共 {pagination.total} 条记录，第 {pagination.page} / {pagination.totalPages} 页
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchLogs}>
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" onClick={() => exportLogs("csv")}>
            <Download className="w-4 h-4 mr-2" />
            导出 CSV
          </Button>
          <Button variant="outline" onClick={() => exportLogs("json")}>
            <Download className="w-4 h-4 mr-2" />
            导出 JSON
          </Button>
        </div>
      </div>

      {/* 日志表格 */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>时间</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>操作</TableHead>
                <TableHead>资源</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>风险</TableHead>
                <TableHead>IP地址</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-slate-600">加载中...</p>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-slate-600">暂无日志记录</p>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), "MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-sm">
                            {log.user?.name || "系统"}
                          </div>
                          <div className="text-xs text-slate-500">
                            {log.user?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{getActionName(log.action)}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate" title={log.resource}>
                        {log.resource}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell>{getRiskBadge(log.risk)}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.ipAddress || "-"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedLog(log);
                          setShowDetailDialog(true);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 分页 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-600">
          显示 {(pagination.page - 1) * pagination.limit + 1} -{" "}
          {Math.min(pagination.page * pagination.limit, pagination.total)} 条
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPrev}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page - 1 })
            }
          >
            <ChevronLeft className="w-4 h-4" />
            上一页
          </Button>
          <div className="text-sm">
            第 {pagination.page} / {pagination.totalPages} 页
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNext}
            onClick={() =>
              setPagination({ ...pagination, page: pagination.page + 1 })
            }
          >
            下一页
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 详情对话框 */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>审计日志详情</DialogTitle>
            <DialogDescription>查看完整的操作日志信息</DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>操作类型</Label>
                    <p className="font-medium mt-1">
                      {getActionName(selectedLog.action)}
                    </p>
                  </div>
                  <div>
                    <Label>资源</Label>
                    <p className="font-medium mt-1">{selectedLog.resource}</p>
                  </div>
                  <div>
                    <Label>资源ID</Label>
                    <p className="font-mono text-sm mt-1">
                      {selectedLog.resourceId || "-"}
                    </p>
                  </div>
                  <div>
                    <Label>状态</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <Label>风险等级</Label>
                    <div className="mt-1">{getRiskBadge(selectedLog.risk)}</div>
                  </div>
                  <div>
                    <Label>时间</Label>
                    <p className="font-mono text-sm mt-1">
                      {format(
                        new Date(selectedLog.timestamp),
                        "yyyy-MM-dd HH:mm:ss",
                        { locale: zhCN }
                      )}
                    </p>
                  </div>
                  <div>
                    <Label>用户</Label>
                    <p className="font-medium mt-1">
                      {selectedLog.user?.name || "系统"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedLog.user?.email}
                    </p>
                  </div>
                  <div>
                    <Label>IP地址</Label>
                    <p className="font-mono text-sm mt-1">
                      {selectedLog.ipAddress || "-"}
                    </p>
                  </div>
                </div>

                {selectedLog.userAgent && (
                  <div>
                    <Label>User Agent</Label>
                    <p className="text-sm text-slate-600 mt-1 break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}

                {selectedLog.sessionId && (
                  <div>
                    <Label>会话ID</Label>
                    <p className="font-mono text-sm mt-1">
                      {selectedLog.sessionId}
                    </p>
                  </div>
                )}

                {selectedLog.details && (
                  <div>
                    <Label>详细信息</Label>
                    <pre className="mt-1 p-3 bg-slate-50 rounded-lg text-xs overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

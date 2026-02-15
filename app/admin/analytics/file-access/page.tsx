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
  Users,
  Eye,
  Download,
  BarChart3,
  RefreshCw,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import Link from "next/link";

interface TotalStats {
  totalAccess: number;
  successAccess: number;
  failedAccess: number;
  viewCount: number;
  downloadCount: number;
  previewCount: number;
  uniqueUsers: number;
  uniqueFiles: number;
  successRate: string;
}

interface FileStat {
  fileId: string;
  file: { id: string; fileName: string; originalName: string; fileType: string; project: { title: string } } | null;
  accessCount: number;
}

interface UserStat {
  userId: string;
  user: { id: string; firstName: string; lastName: string; email: string } | null;
  accessCount: number;
}

interface AccessLog {
  id: string;
  action: string;
  success: boolean;
  errorMessage?: string;
  ipAddress?: string;
  accessedAt: string;
  file: { fileName: string; originalName: string; fileType: string };
  user: { firstName: string; lastName: string; email: string };
}

export default function FileAccessAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [actionFilter, setActionFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  
  const [totalStats, setTotalStats] = useState<TotalStats | null>(null);
  const [fileStats, setFileStats] = useState<FileStat[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [actionDistribution, setActionDistribution] = useState<{ action: string; count: number }[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<{ hour: number; count: number }[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [period, actionFilter, page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        period,
        page: page.toString(),
        limit: "20",
      });
      if (actionFilter) params.set("action", actionFilter);

      const response = await fetch(`/api/admin/analytics/file-access?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTotalStats(data.totalStats);
        setFileStats(data.fileStats || []);
        setUserStats(data.userStats || []);
        setActionDistribution(data.actionDistribution || []);
        setHourlyDistribution(data.hourlyDistribution || []);
        setLogs(data.logs?.data || []);
        setTotalLogs(data.logs?.total || 0);
        setTotalPages(data.logs?.totalPages || 1);
      }
    } catch (error) {
      console.error("获取统计数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      VIEW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
      DOWNLOAD: "bg-green-500/20 text-green-400 border-green-500/50",
      PREVIEW: "bg-purple-500/20 text-white border-purple-500/50",
    };
    const labels: Record<string, string> = {
      VIEW: "查看",
      DOWNLOAD: "下载",
      PREVIEW: "预览",
    };
    return (
      <Badge className={styles[action] || "bg-gray-500/20 text-gray-400"}>
        {labels[action] || action}
      </Badge>
    );
  };

  const getFileTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      pdf: "📄",
      html: "🌐",
      ppt: "📊",
      pptx: "📊",
    };
    return icons[type.toLowerCase()] || "📁";
  };

  // 计算小时分布的最大值
  const maxHourlyCount = Math.max(...hourlyDistribution.map((h) => h.count), 1);


  return (
    <div className="p-8 space-y-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/admin/analytics">
              <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                <FileText className="h-8 w-8" />
                文件访问分析
              </h1>
              <p className="text-gray-300">查看文件访问统计和用户行为</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 bg-white/10 border-white/20 text-white">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">近 7 天</SelectItem>
                <SelectItem value="30">近 30 天</SelectItem>
                <SelectItem value="90">近 90 天</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData} variant="ghost" size="icon" className="text-gray-300">
              <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 text-white animate-spin" />
            <span className="ml-3 text-gray-300">加载中...</span>
          </div>
        ) : (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-300 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    总访问次数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {totalStats?.totalAccess || 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    成功率: {totalStats?.successRate || 0}%
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-300 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    下载次数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {totalStats?.downloadCount || 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    预览: {totalStats?.previewCount || 0} 次
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    活跃用户
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {totalStats?.uniqueUsers || 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">独立用户</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-orange-300 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    访问文件数
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-white">
                    {totalStats?.uniqueFiles || 0}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">独立文件</p>
                </CardContent>
              </Card>
            </div>

            {/* 访问时间分布和操作类型 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 24小时访问分布 */}
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    24小时访问分布
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    按小时统计的访问量
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-end gap-1">
                    {hourlyDistribution.map((item) => (
                      <div
                        key={item.hour}
                        className="flex-1 flex flex-col items-center group"
                      >
                        <div
                          className="w-full bg-purple-500/50 hover:bg-purple-500/70 rounded-t transition-all cursor-pointer"
                          style={{
                            height: `${(item.count / maxHourlyCount) * 100}%`,
                            minHeight: item.count > 0 ? "4px" : "0",
                          }}
                          title={`${item.hour}:00 - ${item.count} 次访问`}
                        />
                        {item.hour % 4 === 0 && (
                          <span className="text-xs text-gray-500 mt-1">
                            {item.hour}:00
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 操作类型分布 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    操作类型
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {actionDistribution.map((item) => {
                      const total = actionDistribution.reduce((sum, a) => sum + a.count, 0);
                      const percentage = total > 0 ? (item.count / total) * 100 : 0;
                      return (
                        <div key={item.action} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{getActionBadge(item.action)}</span>
                            <span className="text-white">{item.count} 次</span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.action === "VIEW"
                                  ? "bg-blue-500"
                                  : item.action === "DOWNLOAD"
                                  ? "bg-green-500"
                                  : "bg-purple-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>


            {/* 热门文件和活跃用户 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 热门文件 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">热门文件</CardTitle>
                  <CardDescription className="text-gray-400">
                    访问次数最多的文件
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {fileStats.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">暂无数据</p>
                  ) : (
                    <div className="space-y-3">
                      {fileStats.map((item, index) => (
                        <div
                          key={item.fileId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                        >
                          <span className="text-xl font-bold text-gray-500 w-6">
                            {index + 1}
                          </span>
                          <span className="text-xl">
                            {getFileTypeIcon(item.file?.fileType || "")}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {item.file?.originalName || item.file?.fileName || "未知文件"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {item.file?.project?.title || ""}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-white">
                            {item.accessCount} 次
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 活跃用户 */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">活跃用户</CardTitle>
                  <CardDescription className="text-gray-400">
                    访问文件最多的用户
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {userStats.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">暂无数据</p>
                  ) : (
                    <div className="space-y-3">
                      {userStats.map((item, index) => (
                        <div
                          key={item.userId}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
                        >
                          <span className="text-xl font-bold text-gray-500 w-6">
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">
                              {item.user
                                ? `${item.user.firstName} ${item.user.lastName}`
                                : "未知用户"}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {item.user?.email || ""}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-white">
                            {item.accessCount} 次
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 访问日志 */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">访问日志</CardTitle>
                    <CardDescription className="text-gray-400">
                      详细的文件访问记录
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="w-28 bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="全部" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">全部</SelectItem>
                        <SelectItem value="VIEW">查看</SelectItem>
                        <SelectItem value="DOWNLOAD">下载</SelectItem>
                        <SelectItem value="PREVIEW">预览</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {logs.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">暂无访问记录</p>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/20">
                          <TableHead className="text-gray-300">用户</TableHead>
                          <TableHead className="text-gray-300">文件</TableHead>
                          <TableHead className="text-gray-300">操作</TableHead>
                          <TableHead className="text-gray-300">状态</TableHead>
                          <TableHead className="text-gray-300">IP</TableHead>
                          <TableHead className="text-gray-300">时间</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log.id} className="border-white/10">
                            <TableCell className="text-white">
                              {log.user.firstName} {log.user.lastName}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <span>{getFileTypeIcon(log.file.fileType)}</span>
                                <span className="truncate max-w-[150px]">
                                  {log.file.originalName || log.file.fileName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{getActionBadge(log.action)}</TableCell>
                            <TableCell>
                              {log.success ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-500" />
                              )}
                            </TableCell>
                            <TableCell className="text-gray-400 font-mono text-xs">
                              {log.ipAddress || "-"}
                            </TableCell>
                            <TableCell className="text-gray-400">
                              {new Date(log.accessedAt).toLocaleString("zh-CN")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* 分页 */}
                    {totalPages > 1 && (
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-400">
                          共 {totalLogs} 条记录
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                          >
                            上一页
                          </Button>
                          <span className="text-gray-400 px-3 py-1">
                            {page} / {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                          >
                            下一页
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

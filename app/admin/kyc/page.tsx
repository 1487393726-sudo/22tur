"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Eye,
  Search,
  RefreshCw,
  Users,
  FileCheck,
  FileX,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

interface KYCRecord {
  id: string;
  userId: string;
  status: string;
  idType: string;
  idNumber: string;
  realName: string;
  frontImage?: string;
  backImage?: string;
  selfieImage?: string;
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface KYCStats {
  total: number;
  pending: number;
  reviewing: number;
  approved: number;
  rejected: number;
  expired: number;
  expiringIn30Days: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "待审核", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
  REVIEWING: { label: "审核中", color: "bg-blue-100 text-blue-800", icon: <Clock className="w-4 h-4" /> },
  APPROVED: { label: "已通过", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
  EXPIRED: { label: "已过期", color: "bg-gray-100 text-gray-800", icon: <AlertTriangle className="w-4 h-4" /> },
};

const ID_TYPES: Record<string, string> = {
  ID_CARD: "身份证",
  PASSPORT: "护照",
  DRIVER_LICENSE: "驾驶证",
  OTHER: "其他",
};

export default function KYCAdminPage() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<KYCRecord[]>([]);
  const [stats, setStats] = useState<KYCStats | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // 详情对话框
  const [selectedRecord, setSelectedRecord] = useState<KYCRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // 审核对话框
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [rejectionReason, setRejectionReason] = useState("");
  const [expiryDays, setExpiryDays] = useState("365");
  const [submitting, setSubmitting] = useState(false);

  // 获取统计数据
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/kyc/stats");
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("获取统计失败:", error);
    }
  }, []);

  // 获取 KYC 列表
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: "20",
      });
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/admin/kyc?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setRecords(data.data.submissions);
        setTotal(data.data.total);
      }
    } catch (error) {
      console.error("获取列表失败:", error);
      toast.error("获取列表失败");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchStats();
    fetchRecords();
  }, [fetchStats, fetchRecords]);

  // 查看详情
  const handleViewDetail = async (record: KYCRecord) => {
    setSelectedRecord(record);
    setDetailLoading(true);
    
    try {
      const response = await fetch(`/api/admin/kyc/${record.id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedRecord(data.data);
      }
    } catch (error) {
      console.error("获取详情失败:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  // 打开审核对话框
  const handleOpenReview = (record: KYCRecord) => {
    setSelectedRecord(record);
    setReviewStatus("APPROVED");
    setRejectionReason("");
    setExpiryDays("365");
    setReviewDialogOpen(true);
  };

  // 提交审核
  const handleSubmitReview = async () => {
    if (!selectedRecord) return;
    
    if (reviewStatus === "REJECTED" && !rejectionReason.trim()) {
      toast.error("请填写拒绝原因");
      return;
    }

    setSubmitting(true);
    
    try {
      const expiresAt = reviewStatus === "APPROVED"
        ? new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const response = await fetch(`/api/admin/kyc/${selectedRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: reviewStatus,
          rejectionReason: reviewStatus === "REJECTED" ? rejectionReason : undefined,
          expiresAt,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setReviewDialogOpen(false);
        setSelectedRecord(null);
        fetchRecords();
        fetchStats();
      } else {
        toast.error(data.error || "审核失败");
      }
    } catch (error) {
      toast.error("审核失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">KYC 认证管理</h1>
          <p className="text-gray-500">审核用户身份认证申请</p>
        </div>
        <Button onClick={() => { fetchStats(); fetchRecords(); }} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-gray-500">总申请</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-gray-500">待审核</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.approved}</p>
                  <p className="text-xs text-gray-500">已通过</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <FileX className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                  <p className="text-xs text-gray-500">已拒绝</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.expired}</p>
                  <p className="text-xs text-gray-500">已过期</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.expiringIn30Days}</p>
                  <p className="text-xs text-gray-500">30天内过期</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 筛选和列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>认证申请列表</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="状态筛选" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="PENDING">待审核</SelectItem>
                  <SelectItem value="REVIEWING">审核中</SelectItem>
                  <SelectItem value="APPROVED">已通过</SelectItem>
                  <SelectItem value="REJECTED">已拒绝</SelectItem>
                  <SelectItem value="EXPIRED">已过期</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              暂无认证申请
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>用户</TableHead>
                  <TableHead>证件类型</TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>提交时间</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.PENDING;
                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{record.user?.name || "-"}</p>
                          <p className="text-xs text-gray-500">{record.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{ID_TYPES[record.idType] || record.idType}</TableCell>
                      <TableCell>{record.realName}</TableCell>
                      <TableCell>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(record)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(record.status === "PENDING" || record.status === "REVIEWING") && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenReview(record)}
                            >
                              审核
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* 分页 */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                上一页
              </Button>
              <span className="text-sm text-gray-500">
                第 {page} 页，共 {Math.ceil(total / 20)} 页
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(p => p + 1)}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 详情对话框 */}
      <Dialog open={!!selectedRecord && !reviewDialogOpen} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>KYC 认证详情</DialogTitle>
          </DialogHeader>
          
          {detailLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">用户</Label>
                  <p className="font-medium">{selectedRecord.user?.name || "-"}</p>
                  <p className="text-sm text-gray-500">{selectedRecord.user?.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">状态</Label>
                  <Badge className={STATUS_CONFIG[selectedRecord.status]?.color}>
                    {STATUS_CONFIG[selectedRecord.status]?.label}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">证件类型</Label>
                  <p className="font-medium">{ID_TYPES[selectedRecord.idType]}</p>
                </div>
                <div>
                  <Label className="text-gray-500">证件号码</Label>
                  <p className="font-medium">{selectedRecord.idNumber}</p>
                </div>
              </div>

              <div>
                <Label className="text-gray-500">真实姓名</Label>
                <p className="font-medium">{selectedRecord.realName}</p>
              </div>

              {selectedRecord.rejectionReason && (
                <div>
                  <Label className="text-gray-500">拒绝原因</Label>
                  <p className="text-red-600">{selectedRecord.rejectionReason}</p>
                </div>
              )}

              {selectedRecord.expiresAt && (
                <div>
                  <Label className="text-gray-500">有效期至</Label>
                  <p className="font-medium">
                    {new Date(selectedRecord.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div>
                <Label className="text-gray-500">提交时间</Label>
                <p className="font-medium">
                  {new Date(selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedRecord(null)}>
              关闭
            </Button>
            {selectedRecord && (selectedRecord.status === "PENDING" || selectedRecord.status === "REVIEWING") && (
              <Button onClick={() => handleOpenReview(selectedRecord)}>
                审核
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 审核对话框 */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核 KYC 认证</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>审核结果</Label>
              <Select
                value={reviewStatus}
                onValueChange={(v) => setReviewStatus(v as "APPROVED" | "REJECTED")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVED">通过</SelectItem>
                  <SelectItem value="REJECTED">拒绝</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reviewStatus === "APPROVED" && (
              <div>
                <Label>有效期（天）</Label>
                <Select value={expiryDays} onValueChange={setExpiryDays}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90 天</SelectItem>
                    <SelectItem value="180">180 天</SelectItem>
                    <SelectItem value="365">1 年</SelectItem>
                    <SelectItem value="730">2 年</SelectItem>
                    <SelectItem value="1095">3 年</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {reviewStatus === "REJECTED" && (
              <div>
                <Label>拒绝原因</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="请填写拒绝原因"
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitReview} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交审核"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

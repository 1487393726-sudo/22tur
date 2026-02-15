"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  FileText,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ApprovalDetail {
  id: string;
  workflow: {
    id: string;
    name: string;
    description: string;
  };
  status: string;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  currentNodeId?: string;
  variables: Record<string, any>;
  executions: Array<{
    id: string;
    nodeId: string;
    node: {
      name: string;
      type: string;
    };
    status: string;
    assignedTo?: string;
    startedAt: string;
    completedAt?: string;
    notes?: string;
  }>;
  logs: Array<{
    id: string;
    action: string;
    message: string;
    timestamp: string;
  }>;
}

export default function ApprovalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [approval, setApproval] = useState<ApprovalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApprovalDetail();
  }, [id]);

  const fetchApprovalDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/workflow/instance/${id}`);
      if (response.ok) {
        const data = await response.json();
        setApproval(data);
      } else {
        toast.error("获取审批详情失败");
      }
    } catch (error) {
      console.error("获取审批详情失败:", error);
      toast.error("获取审批详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approval) return;

    // 找到当前待审批的执行记录
    const pendingExecution = approval.executions.find(
      (e) => e.status === "PENDING"
    );

    if (!pendingExecution) {
      toast.error("没有找到待审批的节点");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/workflow/execution/${pendingExecution.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "approve",
            notes: notes,
          }),
        }
      );

      if (response.ok) {
        toast.success("审批通过", {
          description: "工作流将继续执行",
        });
        setShowApproveDialog(false);
        setNotes("");
        fetchApprovalDetail();
      } else {
        const error = await response.json();
        toast.error("审批失败", {
          description: error.error || "未知错误",
        });
      }
    } catch (error) {
      console.error("审批失败:", error);
      toast.error("审批失败", {
        description: "网络错误，请稍后重试",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!approval) return;

    const pendingExecution = approval.executions.find(
      (e) => e.status === "PENDING"
    );

    if (!pendingExecution) {
      toast.error("没有找到待审批的节点");
      return;
    }

    if (!notes || !notes.trim()) {
      toast.error("请填写拒绝原因");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(
        `/api/workflow/execution/${pendingExecution.id}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "reject",
            notes: notes,
          }),
        }
      );

      if (response.ok) {
        toast.success("审批已拒绝");
        setShowRejectDialog(false);
        setNotes("");
        fetchApprovalDetail();
      } else {
        const error = await response.json();
        toast.error("操作失败", {
          description: error.error || "未知错误",
        });
      }
    } catch (error) {
      console.error("拒绝失败:", error);
      toast.error("操作失败", {
        description: "网络错误，请稍后重试",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: any; icon: any; label: string }
    > = {
      PENDING: { variant: "secondary", icon: Clock, label: "待审批" },
      RUNNING: { variant: "default", icon: Clock, label: "审批中" },
      COMPLETED: { variant: "default", icon: CheckCircle, label: "已完成" },
      FAILED: { variant: "destructive", icon: XCircle, label: "已拒绝" },
      CANCELLED: { variant: "outline", icon: XCircle, label: "已取消" },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!approval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">审批记录不存在</p>
          <Button
            variant="outline"
            onClick={() => router.push("/approvals")}
            className="mt-4"
          >
            返回列表
          </Button>
        </div>
      </div>
    );
  }

  const pendingExecution = approval.executions.find(
    (e) => e.status === "PENDING"
  );
  const canApprove = pendingExecution && approval.status === "RUNNING";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/approvals")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">审批详情</h1>
            <p className="text-slate-600 mt-1">{approval.workflow.name}</p>
          </div>
          {getStatusBadge(approval.status)}
        </div>

        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle>申请信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">申请人</p>
                  <p className="font-medium">{approval.startedBy}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <p className="text-sm text-slate-600">申请时间</p>
                  <p className="font-medium">
                    {format(new Date(approval.startedAt), "yyyy-MM-dd HH:mm", {
                      locale: zhCN,
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* 申请内容 */}
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">申请内容</h4>
              <div className="space-y-2">
                {Object.entries(approval.variables).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-2">
                    <span className="text-sm text-slate-600 min-w-24">
                      {key}:
                    </span>
                    <span className="text-sm font-medium">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 审批历史 */}
        <Card>
          <CardHeader>
            <CardTitle>审批历史</CardTitle>
            <CardDescription>查看审批流程的执行记录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {approval.executions.map((execution, index) => (
                <div
                  key={execution.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        execution.status === "COMPLETED"
                          ? "bg-green-100 text-green-600"
                          : execution.status === "FAILED"
                            ? "bg-red-100 text-red-600"
                            : execution.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {execution.status === "COMPLETED" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : execution.status === "FAILED" ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    {index < approval.executions.length - 1 && (
                      <div className="w-0.5 h-12 bg-slate-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{execution.node.name}</h4>
                      {getStatusBadge(execution.status)}
                    </div>
                    {execution.assignedTo && (
                      <p className="text-sm text-slate-600">
                        审批人: {execution.assignedTo}
                      </p>
                    )}
                    <p className="text-sm text-slate-500">
                      {format(new Date(execution.startedAt), "yyyy-MM-dd HH:mm", {
                        locale: zhCN,
                      })}
                      {execution.completedAt &&
                        ` - ${format(new Date(execution.completedAt), "HH:mm")}`}
                    </p>
                    {execution.notes && (
                      <p className="text-sm text-slate-700 mt-2 p-2 bg-slate-50 rounded">
                        {execution.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 审批操作 */}
        {canApprove && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-900">待您审批</CardTitle>
              <CardDescription>
                当前节点: {pendingExecution.node.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowApproveDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  通过
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  拒绝
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 审批通过对话框 */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>审批通过</DialogTitle>
              <DialogDescription>
                确认通过此审批申请吗？您可以添加审批意见。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="approve-notes">审批意见（可选）</Label>
                <Textarea
                  id="approve-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="请输入审批意见..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowApproveDialog(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    确认通过
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 审批拒绝对话框 */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>审批拒绝</DialogTitle>
              <DialogDescription>
                确认拒绝此审批申请吗？请填写拒绝原因。
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="reject-notes">
                  拒绝原因 <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reject-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="请输入拒绝原因..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                disabled={submitting}
              >
                取消
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    确认拒绝
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

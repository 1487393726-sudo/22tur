"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

interface ApprovalItem {
  id: string;
  workflowName: string;
  title: string;
  status: string;
  startedBy: string;
  startedAt: string;
  completedAt?: string;
  currentNode?: string;
}

function ApprovalsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "pending";

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // 模拟数据（实际应该从 API 获取）
  const [pendingApprovals, setPendingApprovals] = useState<ApprovalItem[]>([]);
  const [initiatedApprovals, setInitiatedApprovals] = useState<ApprovalItem[]>(
    []
  );
  const [completedApprovals, setCompletedApprovals] = useState<ApprovalItem[]>(
    []
  );

  useEffect(() => {
    fetchApprovals();
  }, [activeTab]);

  const fetchApprovals = async () => {
    try {
      setLoading(true);

      // 获取待我审批的
      const pendingResponse = await fetch("/api/approvals?type=pending");
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        setPendingApprovals(
          pendingData.map((item: any) => ({
            id: item.id,
            workflowName: item.workflowName,
            title: item.workflowDescription || item.workflowName,
            status: "PENDING",
            startedBy: item.startedByName,
            startedAt: item.startedAt,
            currentNode: item.currentNode,
          }))
        );
      }

      // 获取我发起的
      const initiatedResponse = await fetch("/api/approvals?type=initiated");
      if (initiatedResponse.ok) {
        const initiatedData = await initiatedResponse.json();
        setInitiatedApprovals(
          initiatedData.map((item: any) => ({
            id: item.id,
            workflowName: item.workflowName,
            title: item.workflowDescription || item.workflowName,
            status: item.status,
            startedBy: item.startedByName,
            startedAt: item.startedAt,
            currentNode: item.currentNode,
          }))
        );
      }

      // 获取已完成的
      const completedResponse = await fetch("/api/approvals?type=completed");
      if (completedResponse.ok) {
        const completedData = await completedResponse.json();
        setCompletedApprovals(
          completedData.map((item: any) => ({
            id: item.id,
            workflowName: item.workflowName,
            title: item.workflowDescription || item.workflowName,
            status: item.status,
            startedBy: item.startedByName,
            startedAt: item.startedAt,
            completedAt: item.completedAt,
          }))
        );
      }

      setLoading(false);
    } catch (error) {
      console.error("获取审批列表失败:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { variant: any; icon: any; label: string; color: string }
    > = {
      PENDING: {
        variant: "secondary",
        icon: Clock,
        label: "待审批",
        color: "bg-yellow-500",
      },
      RUNNING: {
        variant: "default",
        icon: AlertCircle,
        label: "审批中",
        color: "bg-blue-500",
      },
      COMPLETED: {
        variant: "default",
        icon: CheckCircle,
        label: "已完成",
        color: "bg-green-500",
      },
      FAILED: {
        variant: "destructive",
        icon: XCircle,
        label: "已拒绝",
        color: "bg-red-500",
      },
      CANCELLED: {
        variant: "outline",
        icon: XCircle,
        label: "已取消",
        color: "bg-gray-500",
      },
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

  const renderApprovalList = (approvals: ApprovalItem[]) => {
    if (loading) {
      return (
        <div className="text-center py-12 text-slate-600">加载中...</div>
      );
    }

    if (approvals.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-600">暂无审批记录</p>
        </div>
      );
    }

    const filteredApprovals = approvals.filter(
      (approval) =>
        approval.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        approval.workflowName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredApprovals.length === 0) {
      return (
        <div className="text-center py-12 text-slate-600">
          未找到匹配的审批记录
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <Card
            key={approval.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/approvals/${approval.id}`)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {approval.title}
                    </h3>
                    {getStatusBadge(approval.status)}
                  </div>
                  <p className="text-sm text-slate-600 mb-3">
                    {approval.workflowName}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span>申请人: {approval.startedBy}</span>
                    <span>•</span>
                    <span>
                      {format(new Date(approval.startedAt), "yyyy-MM-dd HH:mm", {
                        locale: zhCN,
                      })}
                    </span>
                    {approval.currentNode && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">
                          当前节点: {approval.currentNode}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  查看详情
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">审批中心</h1>
            <p className="text-slate-600 mt-2">管理和处理审批流程</p>
          </div>
          <Button
            onClick={() => router.push("/approvals/new")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            发起审批
          </Button>
        </div>

        {/* 搜索栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索审批标题或工作流名称..."
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* 标签页 */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:w-96">
            <TabsTrigger value="pending">待我审批</TabsTrigger>
            <TabsTrigger value="initiated">我发起的</TabsTrigger>
            <TabsTrigger value="completed">已完成</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {renderApprovalList(pendingApprovals)}
          </TabsContent>

          <TabsContent value="initiated" className="space-y-4 mt-6">
            {renderApprovalList(initiatedApprovals)}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4 mt-6">
            {renderApprovalList(completedApprovals)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 flex items-center justify-center">加载中...</div>}>
      <ApprovalsPageContent />
    </Suspense>
  );
}

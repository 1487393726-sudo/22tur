"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FolderKanban,
  CheckCircle,
  Clock,
  Circle,
  MessageSquare,
  Loader2,
  Calendar,
  FileText,
} from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: string;
  order: number;
  dueDate: string | null;
  completedAt: string | null;
  deliverables: string | null;
  feedback: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  createdAt: string;
  clientNote: string | null;
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    unitPrice: number;
    service: {
      name: string;
      description: string | null;
    };
  }>;
  package: {
    name: string;
  } | null;
}

const milestoneStatusMap: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待开始", color: "bg-gray-100 text-gray-800" },
  IN_PROGRESS: { label: "进行中", color: "bg-blue-100 text-blue-800" },
  COMPLETED: { label: "已完成", color: "bg-green-100 text-green-800" },
  BLOCKED: { label: "已阻塞", color: "bg-red-100 text-red-800" },
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [orderRes, milestonesRes] = await Promise.all([
        fetch(`/api/orders/${params.id}`),
        fetch(`/api/orders/${params.id}/milestones`),
      ]);

      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrder(orderData);
      }

      if (milestonesRes.ok) {
        const milestonesData = await milestonesRes.json();
        setMilestones(milestonesData);
      }
    } catch (error) {
      console.error("获取项目详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMilestoneIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "IN_PROGRESS":
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter((m) => m.status === "COMPLETED").length;
    return Math.round((completed / milestones.length) * 100);
  };

  const openFeedbackDialog = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    setFeedback(milestone.feedback || "");
    setShowFeedbackDialog(true);
  };

  const submitFeedback = async () => {
    if (!selectedMilestone) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/orders/${params.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          milestoneId: selectedMilestone.id,
          feedback,
        }),
      });

      if (res.ok) {
        setShowFeedbackDialog(false);
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || "提交失败");
      }
    } catch (error) {
      console.error("提交反馈失败:", error);
      alert("提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-muted-foreground">项目不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    );
  }

  const progress = calculateProgress();

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      {/* 项目概览 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="purple-gradient-title text-xl flex items-center gap-2">
                <FolderKanban className="h-5 w-5" />
                {order.items[0]?.service?.name || "服务项目"}
                {order.items.length > 1 && ` 等${order.items.length}项`}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                订单编号: {order.orderNumber}
              </p>
            </div>
            <Badge
              variant={order.status === "COMPLETED" ? "outline" : "default"}
            >
              {order.status === "IN_PROGRESS" ? "进行中" : order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
            <div>
              <span className="text-muted-foreground">项目金额</span>
              <p className="font-medium text-primary">
                ¥{order.total.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">开始时间</span>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(order.createdAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">里程碑</span>
              <p className="font-medium">{milestones.length} 个</p>
            </div>
            <div>
              <span className="text-muted-foreground">已完成</span>
              <p className="font-medium">
                {milestones.filter((m) => m.status === "COMPLETED").length} 个
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">整体进度</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* 里程碑列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="purple-gradient-title text-lg">项目里程碑</CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2" />
              <p>暂无里程碑，项目规划中...</p>
            </div>
          ) : (
            <div className="relative">
              {/* 时间线 */}
              <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-muted" />

              <div className="space-y-6">
                {milestones.map((milestone, index) => (
                  <div key={milestone.id} className="relative pl-8">
                    {/* 图标 */}
                    <div className="absolute left-0 bg-background">
                      {getMilestoneIcon(milestone.status)}
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">
                            {index + 1}. {milestone.title}
                          </h4>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {milestone.description}
                            </p>
                          )}
                        </div>
                        <Badge className={milestoneStatusMap[milestone.status]?.color}>
                          {milestoneStatusMap[milestone.status]?.label || milestone.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {milestone.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            预计: {new Date(milestone.dueDate).toLocaleDateString("zh-CN")}
                          </span>
                        )}
                        {milestone.completedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            完成: {new Date(milestone.completedAt).toLocaleDateString("zh-CN")}
                          </span>
                        )}
                      </div>

                      {/* 交付物 */}
                      {milestone.deliverables && (
                        <div className="mt-3 p-2 bg-muted/50 rounded text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground mb-1">
                            <FileText className="h-3 w-3" />
                            交付物
                          </span>
                          <p>{milestone.deliverables}</p>
                        </div>
                      )}

                      {/* 反馈 */}
                      {milestone.feedback && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                          <span className="flex items-center gap-1 text-blue-600 mb-1">
                            <MessageSquare className="h-3 w-3" />
                            我的反馈
                          </span>
                          <p>{milestone.feedback}</p>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      {milestone.status === "COMPLETED" && (
                        <div className="mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFeedbackDialog(milestone)}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {milestone.feedback ? "修改反馈" : "提交反馈"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 服务项目 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="purple-gradient-title text-lg">服务项目</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3 bg-muted/30 rounded"
              >
                <div>
                  <p className="font-medium">{item.service.name}</p>
                  {item.service.description && (
                    <p className="text-sm text-muted-foreground">
                      {item.service.description}
                    </p>
                  )}
                </div>
                <p className="font-medium">
                  ¥{(item.unitPrice * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 反馈对话框 */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>提交反馈 - {selectedMilestone?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="请输入您对此阶段交付成果的反馈..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>
              取消
            </Button>
            <Button onClick={submitFeedback} disabled={submitting || !feedback.trim()} className="purple-gradient-button">
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              提交反馈
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

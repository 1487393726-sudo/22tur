"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send, Loader2 } from "lucide-react";

interface Workflow {
  id: string;
  name: string;
  description: string;
  category: string;
  status: string;
}

export default function NewApprovalPage() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 表单数据
  const [formData, setFormData] = useState<Record<string, any>>({
    title: "",
    description: "",
    amount: "",
    department: "",
    reason: "",
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/workflow");
      if (response.ok) {
        const data = await response.json();
        // 只显示激活状态的工作流
        const activeWorkflows = data.filter(
          (w: Workflow) => w.status === "ACTIVE"
        );
        setWorkflows(activeWorkflows);
      }
    } catch (error) {
      console.error("获取工作流列表失败:", error);
      toast.error("获取工作流列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleWorkflowChange = (workflowId: string) => {
    const workflow = workflows.find((w) => w.id === workflowId);
    setSelectedWorkflow(workflow || null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedWorkflow) {
      toast.error("请选择工作流");
      return;
    }

    if (!formData.title || !formData.title.trim()) {
      toast.error("请输入申请标题");
      return;
    }

    try {
      setSubmitting(true);

      // 准备变量
      const variables = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        submittedAt: new Date().toISOString(),
      };

      // 启动工作流
      const response = await fetch(
        `/api/workflow/${selectedWorkflow.id}/execute`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variables }),
        }
      );

      if (response.ok) {
        const instance = await response.json();
        toast.success("审批申请已提交", {
          description: "您可以在审批列表中查看进度",
        });
        router.push(`/approvals?tab=initiated`);
      } else {
        const error = await response.json();
        toast.error("提交失败", {
          description: error.error || "未知错误",
        });
      }
    } catch (error) {
      console.error("提交审批失败:", error);
      toast.error("提交失败", {
        description: "网络错误，请稍后重试",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/approvals")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">发起审批</h1>
            <p className="text-slate-600 mt-1">选择工作流并填写申请信息</p>
          </div>
        </div>

        {/* 选择工作流 */}
        <Card>
          <CardHeader>
            <CardTitle>选择工作流</CardTitle>
            <CardDescription>
              选择适合您申请类型的工作流模板
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="ml-2 text-slate-600">加载中...</span>
              </div>
            ) : workflows.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                暂无可用的工作流
              </div>
            ) : (
              <Select
                value={selectedWorkflow?.id || ""}
                onValueChange={handleWorkflowChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择工作流" />
                </SelectTrigger>
                <SelectContent>
                  {workflows.map((workflow) => (
                    <SelectItem key={workflow.id} value={workflow.id}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workflow.name}</span>
                        <span className="text-xs text-slate-500">
                          ({workflow.category})
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {selectedWorkflow && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900">
                  {selectedWorkflow.name}
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedWorkflow.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    {selectedWorkflow.category}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 申请表单 */}
        {selectedWorkflow && (
          <Card>
            <CardHeader>
              <CardTitle>填写申请信息</CardTitle>
              <CardDescription>
                请填写完整的申请信息，以便审批人了解详情
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 申请标题 */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  申请标题 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="请输入申请标题"
                />
              </div>

              {/* 申请描述 */}
              <div className="space-y-2">
                <Label htmlFor="description">申请描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="请详细描述您的申请内容"
                  rows={4}
                />
              </div>

              {/* 根据工作流类型显示不同字段 */}
              {selectedWorkflow.category.includes("财务") && (
                <div className="space-y-2">
                  <Label htmlFor="amount">金额</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", parseFloat(e.target.value))
                    }
                    placeholder="请输入金额"
                  />
                </div>
              )}

              {selectedWorkflow.category.includes("人力资源") && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="department">部门</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      placeholder="请输入部门名称"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">原因</Label>
                    <Textarea
                      id="reason"
                      value={formData.reason}
                      onChange={(e) =>
                        handleInputChange("reason", e.target.value)
                      }
                      placeholder="请说明原因"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* 其他通用字段 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">开始日期</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate || ""}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">结束日期</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate || ""}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                  />
                </div>
              </div>

              {/* 附件上传（可选） */}
              <div className="space-y-2">
                <Label htmlFor="attachments">附件</Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleInputChange("attachments", files);
                  }}
                />
                <p className="text-xs text-slate-500">
                  支持上传多个文件，单个文件不超过 10MB
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 提交按钮 */}
        {selectedWorkflow && (
          <div className="flex items-center justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/approvals")}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  提交审批
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

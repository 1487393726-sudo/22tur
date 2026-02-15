"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, XCircle, Clock, User, FileText, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface NodeExecution {
  id: string;
  nodeId: string;
  nodeName: string;
  nodeType: string;
  status: string;
  assignedTo?: string;
  assignedUser?: {
    firstName: string;
    lastName: string;
  };
  result?: string;
  notes?: string;
  startedAt: string;
  completedAt?: string;
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  workflow: {
    name: string;
    description?: string;
  };
  status: string;
  startedBy: string;
  startedByUser: {
    firstName: string;
    lastName: string;
  };
  data?: any;
  startedAt: string;
  completedAt?: string;
  nodeExecutions: NodeExecution[];
}

interface ApprovalPanelProps {
  instance: WorkflowInstance;
  currentExecution?: NodeExecution;
  onApprove: (notes: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  canApprove?: boolean;
}

const approvalSchema = z.object({
  notes: z.string().min(1, "请填写审批意见"),
});

type ApprovalFormData = z.infer<typeof approvalSchema>;

export function ApprovalPanel({
  instance,
  currentExecution,
  onApprove,
  onReject,
  canApprove = false,
}: ApprovalPanelProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApprovalFormData>({
    resolver: zodResolver(approvalSchema),
  });

  const handleApprove = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      await onApprove(data.notes);
      reset();
      toast.success("审批通过");
    } catch (error) {
      console.error("审批失败:", error);
      toast.error("审批失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (data: ApprovalFormData) => {
    setIsSubmitting(true);
    try {
      await onReject(data.notes);
      reset();
      toast.success("审批已拒绝");
    } catch (error) {
      console.error("拒绝失败:", error);
      toast.error("操作失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-400";
      case "FAILED":
        return "text-red-400";
      case "PENDING":
        return "text-yellow-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-400" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 申请信息 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          申请信息
        </h3>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-white/60 text-sm w-24">工作流:</span>
            <span className="text-white text-sm flex-1">{instance.workflow.name}</span>
          </div>

          {instance.workflow.description && (
            <div className="flex items-start gap-3">
              <span className="text-white/60 text-sm w-24">描述:</span>
              <span className="text-white text-sm flex-1">{instance.workflow.description}</span>
            </div>
          )}

          <div className="flex items-start gap-3">
            <span className="text-white/60 text-sm w-24">申请人:</span>
            <span className="text-white text-sm flex-1">
              {instance.startedByUser.firstName} {instance.startedByUser.lastName}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-white/60 text-sm w-24">申请时间:</span>
            <span className="text-white text-sm flex-1">
              {new Date(instance.startedAt).toLocaleString("zh-CN")}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-white/60 text-sm w-24">状态:</span>
            <span className={`text-sm flex-1 ${getStatusColor(instance.status)}`}>
              {instance.status === "RUNNING" && "进行中"}
              {instance.status === "COMPLETED" && "已完成"}
              {instance.status === "FAILED" && "已拒绝"}
              {instance.status === "CANCELLED" && "已取消"}
            </span>
          </div>

          {instance.data && (
            <div className="flex items-start gap-3">
              <span className="text-white/60 text-sm w-24">申请数据:</span>
              <div className="text-white text-sm flex-1">
                <pre className="bg-black/20 rounded p-3 overflow-auto text-xs">
                  {JSON.stringify(instance.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 审批历史 */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          审批历史
        </h3>

        <div className="space-y-4">
          {instance.nodeExecutions
            .filter((exec) => exec.status !== "PENDING")
            .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
            .map((execution, index) => (
              <div
                key={execution.id}
                className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0"
              >
                <div className="flex-shrink-0 mt-1">{getStatusIcon(execution.status)}</div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{execution.nodeName}</span>
                    <span className="text-white/60 text-xs">
                      {new Date(execution.startedAt).toLocaleString("zh-CN")}
                    </span>
                  </div>

                  {execution.assignedUser && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <User className="w-4 h-4" />
                      <span>
                        {execution.assignedUser.firstName} {execution.assignedUser.lastName}
                      </span>
                    </div>
                  )}

                  {execution.notes && (
                    <div className="bg-black/20 rounded p-3">
                      <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>审批意见</span>
                      </div>
                      <p className="text-white text-sm">{execution.notes}</p>
                    </div>
                  )}

                  {execution.result && (
                    <div className="text-sm">
                      <span className="text-white/60">结果: </span>
                      <span className={getStatusColor(execution.status)}>{execution.result}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

          {instance.nodeExecutions.filter((exec) => exec.status !== "PENDING").length === 0 && (
            <div className="text-center text-white/40 py-8">暂无审批记录</div>
          )}
        </div>
      </div>

      {/* 审批操作 */}
      {canApprove && currentExecution && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            审批意见
          </h3>

          <form className="space-y-4">
            <div>
              <label className="text-sm text-white/80 mb-2 block">
                请填写审批意见 <span className="text-red-400">*</span>
              </label>
              <Textarea
                {...register("notes")}
                placeholder="请输入您的审批意见..."
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 min-h-[120px]"
              />
              {errors.notes && (
                <p className="text-red-400 text-sm mt-1">{errors.notes.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleSubmit(handleApprove)}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "处理中..." : "通过"}
              </Button>

              <Button
                type="button"
                onClick={handleSubmit(handleReject)}
                disabled={isSubmitting}
                variant="outline"
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {isSubmitting ? "处理中..." : "拒绝"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 无权限提示 */}
      {!canApprove && instance.status === "RUNNING" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
          <p className="text-yellow-400 text-sm">您没有权限审批此流程</p>
        </div>
      )}
    </div>
  );
}

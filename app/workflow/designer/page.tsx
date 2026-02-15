"use client";

import { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "reactflow/dist/style.css";

export default function WorkflowDesignerPage() {
  const router = useRouter();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);

  // 工作流基本信息
  const [workflowInfo, setWorkflowInfo] = useState({
    name: "",
    description: "",
    category: "项目管理",
  });

  // 保存工作流回调
  const handleSave = (workflowData: any) => {
    setWorkflowInfo({
      name: workflowData.name,
      description: workflowData.description,
      category: workflowData.category,
    });
    setShowSaveDialog(true);
  };

  // 测试工作流回调
  const handleTest = (results: any) => {
    setTestResults(results);
    setShowTestDialog(true);
  };

  // 保存工作流到服务器
  const saveWorkflow = async (nodes: any[], edges: any[]) => {
    if (!workflowInfo.name.trim()) {
      toast.error("请输入工作流名称");
      return;
    }

    try {
      // 准备节点数据
      const workflowNodes = nodes.map((node) => ({
        name: node.data.label,
        type: node.data.type,
        position: node.position,
        config: node.data.config || {},
      }));

      // 准备转换数据
      const transitions = edges.map((edge) => ({
        fromNodeId: edge.source,
        toNodeId: edge.target,
        condition: edge.label || null,
      }));

      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workflowInfo.name,
          description: workflowInfo.description,
          category: workflowInfo.category,
          status: "DRAFT",
          triggerType: "MANUAL",
          priority: "MEDIUM",
          nodes: workflowNodes,
          transitions: transitions,
        }),
      });

      if (response.ok) {
        toast.success("工作流保存成功");
        setShowSaveDialog(false);
        router.push("/workflow");
      } else {
        const error = await response.json();
        toast.error("保存失败", {
          description: error.error || "未知错误",
        });
      }
    } catch (error) {
      console.error("保存工作流失败:", error);
      toast.error("保存失败", {
        description: "网络错误，请稍后重试",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 工作流设计器画布 */}
      <div className="flex-1">
        <ReactFlow>
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>

      {/* 保存对话框 */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>保存工作流</DialogTitle>
            <DialogDescription>
              请填写工作流的基本信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">工作流名称 *</Label>
              <Input
                id="name"
                value={workflowInfo.name}
                onChange={(e) =>
                  setWorkflowInfo({ ...workflowInfo, name: e.target.value })
                }
                placeholder="请输入工作流名称"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={workflowInfo.description}
                onChange={(e) =>
                  setWorkflowInfo({
                    ...workflowInfo,
                    description: e.target.value,
                  })
                }
                placeholder="请描述工作流的用途和功能"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">分类</Label>
              <Input
                id="category"
                value={workflowInfo.category}
                onChange={(e) =>
                  setWorkflowInfo({ ...workflowInfo, category: e.target.value })
                }
                placeholder="例如：项目管理、人力资源"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              取消
            </Button>
            <Button onClick={() => saveWorkflow([], [])}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 测试结果对话框 */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>工作流测试结果</DialogTitle>
            <DialogDescription>
              {testResults?.success
                ? "工作流验证通过！"
                : "发现以下问题："}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {testResults?.errors && testResults.errors.length > 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">错误：</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                  {testResults.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            {testResults?.warnings && testResults.warnings.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">警告：</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                  {testResults.warnings.map((warning: string, index: number) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            {testResults?.path && testResults.path.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">执行路径：</h4>
                <div className="flex flex-wrap gap-2">
                  {testResults.path.map((nodeName: string, index: number) => (
                    <div key={index} className="flex items-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-sm">
                        {nodeName}
                      </span>
                      {index < testResults.path.length - 1 && (
                        <span className="mx-2 text-blue-400">→</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowTestDialog(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

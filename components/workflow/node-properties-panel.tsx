"use client";

import { useState, useEffect } from "react";
import { Node } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface NodePropertiesPanelProps {
  node: Node | null;
  onUpdate: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

export default function NodePropertiesPanel({
  node,
  onUpdate,
  onClose,
}: NodePropertiesPanelProps) {
  const [localData, setLocalData] = useState<any>({});

  useEffect(() => {
    if (node) {
      setLocalData({
        label: node.data.label || "",
        description: node.data.description || "",
        config: node.data.config || {},
      });
    }
  }, [node]);

  if (!node) {
    return (
      <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 p-4">
        <div className="text-center text-white/60 mt-8">
          <p>选择一个节点</p>
          <p className="text-sm mt-2">点击画布上的节点查看和编辑属性</p>
        </div>
      </div>
    );
  }

  const handleSave = () => {
    onUpdate(node.id, localData);
    onClose();
  };

  const handleChange = (field: string, value: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleConfigChange = (field: string, value: any) => {
    setLocalData((prev: any) => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value,
      },
    }));
  };

  return (
    <div className="w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 p-4 overflow-y-auto">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg">节点属性</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 节点类型 */}
          <div className="space-y-2">
            <Label className="text-white">节点类型</Label>
            <div className="px-3 py-2 bg-white/5 rounded-lg border border-white/10">
              <span className="text-white text-sm">{node.data.type}</span>
            </div>
          </div>

          {/* 节点名称 */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-white">
              节点名称 *
            </Label>
            <Input
              id="label"
              value={localData.label || ""}
              onChange={(e) => handleChange("label", e.target.value)}
              placeholder="请输入节点名称"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* 节点描述 */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              描述
            </Label>
            <Textarea
              id="description"
              value={localData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="请输入节点描述"
              rows={3}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          {/* 审批节点特定配置 */}
          {node.data.type === "APPROVAL" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="approver" className="text-white">
                  审批人 *
                </Label>
                <Input
                  id="approver"
                  value={localData.config?.approver || ""}
                  onChange={(e) => handleConfigChange("approver", e.target.value)}
                  placeholder="请输入审批人ID或邮箱"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approvalType" className="text-white">
                  审批类型
                </Label>
                <Select
                  value={localData.config?.approvalType || "single"}
                  onValueChange={(value) =>
                    handleConfigChange("approvalType", value)
                  }
                >
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">单人审批</SelectItem>
                    <SelectItem value="multiple">多人审批</SelectItem>
                    <SelectItem value="sequential">顺序审批</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* 决策节点特定配置 */}
          {node.data.type === "DECISION" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="condition" className="text-white">
                  条件表达式
                </Label>
                <Textarea
                  id="condition"
                  value={localData.config?.condition || ""}
                  onChange={(e) =>
                    handleConfigChange("condition", e.target.value)
                  }
                  placeholder="例如：amount > 10000"
                  rows={2}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-200 text-xs">
                  💡 提示：使用变量名和运算符定义条件
                </p>
              </div>
            </>
          )}

          {/* 任务节点特定配置 */}
          {node.data.type === "TASK" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-white">
                  负责人
                </Label>
                <Input
                  id="assignee"
                  value={localData.config?.assignee || ""}
                  onChange={(e) => handleConfigChange("assignee", e.target.value)}
                  placeholder="请输入负责人ID或邮箱"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-white">
                  截止时间（天）
                </Label>
                <Input
                  id="dueDate"
                  type="number"
                  value={localData.config?.dueDate || ""}
                  onChange={(e) =>
                    handleConfigChange("dueDate", parseInt(e.target.value))
                  }
                  placeholder="例如：3"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </>
          )}

          {/* 保存按钮 */}
          <div className="pt-4">
            <Button onClick={handleSave} className="w-full">
              保存属性
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

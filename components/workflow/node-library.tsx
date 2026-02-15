"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PlayCircle,
  CheckCircle,
  GitBranch,
  Square,
  Bell,
} from "lucide-react";

const nodeTypes = [
  {
    type: "START",
    label: "开始",
    icon: PlayCircle,
    color: "bg-green-500",
    description: "工作流的起点",
  },
  {
    type: "TASK",
    label: "任务",
    icon: Square,
    color: "bg-blue-500",
    description: "执行具体任务",
  },
  {
    type: "APPROVAL",
    label: "审批",
    icon: CheckCircle,
    color: "bg-amber-500",
    description: "需要审批的节点",
  },
  {
    type: "DECISION",
    label: "决策",
    icon: GitBranch,
    color: "bg-purple-500",
    description: "条件分支判断",
  },
  {
    type: "END",
    label: "结束",
    icon: CheckCircle,
    color: "bg-red-500",
    description: "工作流的终点",
  },
];

export default function NodeLibrary() {
  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="w-64 bg-white/5 backdrop-blur-sm border-r border-white/10 p-4 overflow-y-auto">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">节点库</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {nodeTypes.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
                className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-lg cursor-move transition-colors border border-white/10"
              >
                <div className={`${node.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">
                    {node.label}
                  </div>
                  <div className="text-white/60 text-xs">
                    {node.description}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg">
        <p className="text-blue-200 text-xs">
          💡 提示：拖拽节点到画布上创建工作流
        </p>
      </div>
    </div>
  );
}

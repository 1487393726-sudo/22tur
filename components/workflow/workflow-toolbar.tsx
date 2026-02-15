"use client";

import { Button } from "@/components/ui/button";
import { Save, Play, Download, Upload, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkflowToolbarProps {
  onSave: () => void;
  onTest: () => void;
  onExport: () => void;
  onImport: () => void;
}

export default function WorkflowToolbar({
  onSave,
  onTest,
  onExport,
  onImport,
}: WorkflowToolbarProps) {
  const router = useRouter();

  return (
    <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/workflow")}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="h-6 w-px bg-white/20" />
          <h1 className="text-xl font-bold text-white">工作流设计器</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onImport}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Upload className="w-4 h-4 mr-2" />
            导入
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onTest}
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Play className="w-4 h-4 mr-2" />
            测试
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}

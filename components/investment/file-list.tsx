"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  Lock,
  Unlock,
  Edit,
  Trash2,
  GripVertical,
  Loader2,
} from "lucide-react";

interface FileListProps {
  projectId: string;
  editable?: boolean;
}

interface ProjectFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isLocked: boolean;
  unlockPrice: number | null;
  description: string | null;
  order: number;
  createdAt: string;
}

export function FileList({ projectId, editable = false }: FileListProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingFile, setEditingFile] = useState<ProjectFile | null>(null);
  const [editFormData, setEditFormData] = useState({
    fileName: "",
    description: "",
    isLocked: true,
    unlockPrice: "0",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFiles();
  }, [projectId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/api/investment-projects/${projectId}/files`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "加载文件列表失败");
      }

      setFiles(data.files || []);
    } catch (error: any) {
      setError(error.message || "加载文件列表失败");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (file: ProjectFile) => {
    setEditingFile(file);
    setEditFormData({
      fileName: file.fileName,
      description: file.description || "",
      isLocked: file.isLocked,
      unlockPrice: file.unlockPrice?.toString() || "0",
    });
  };

  const handleSave = async () => {
    if (!editingFile) return;

    try {
      setSaving(true);
      setError("");

      const response = await fetch(`/api/files/${editingFile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: editFormData.fileName,
          description: editFormData.description,
          isLocked: editFormData.isLocked,
          unlockPrice: editFormData.isLocked
            ? parseFloat(editFormData.unlockPrice)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "更新文件失败");
      }

      // 更新本地列表
      setFiles((prev) =>
        prev.map((f) => (f.id === editingFile.id ? data.file : f))
      );

      setEditingFile(null);
    } catch (error: any) {
      setError(error.message || "更新文件失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("确定要删除这个文件吗？")) return;

    try {
      setError("");

      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除文件失败");
      }

      // 从列表中移除
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error: any) {
      setError(error.message || "删除文件失败");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    return <FileText className="h-5 w-5 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-50 border-red-200">
        <AlertDescription className="text-red-700">{error}</AlertDescription>
      </Alert>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
        <p>暂无文件</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {files.map((file) => (
        <Card key={file.id} className="p-4">
          <div className="flex items-center gap-3">
            {editable && (
              <div className="cursor-move">
                <GripVertical className="h-5 w-5 text-gray-400" />
              </div>
            )}

            {getFileIcon(file.fileType)}

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{file.fileName}</div>
              <div className="text-sm text-gray-500">
                {formatFileSize(file.fileSize)}
                {file.description && ` • ${file.description}`}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {file.isLocked ? (
                <div className="flex items-center gap-1 text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
                  <Lock className="h-4 w-4" />
                  <span>¥{file.unlockPrice || 0}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-sm text-green-600 px-2 py-1 bg-green-50 rounded">
                  <Unlock className="h-4 w-4" />
                  <span>免费</span>
                </div>
              )}

              {editable && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(file)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}

      {/* 编辑对话框 */}
      <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑文件信息</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fileName">文件名</Label>
              <Input
                id="fileName"
                value={editFormData.fileName}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    fileName: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <Label htmlFor="description">文件描述</Label>
              <Textarea
                id="description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isLocked">是否锁定文件</Label>
              <Switch
                id="isLocked"
                checked={editFormData.isLocked}
                onCheckedChange={(checked) =>
                  setEditFormData((prev) => ({ ...prev, isLocked: checked }))
                }
              />
            </div>

            {editFormData.isLocked && (
              <div>
                <Label htmlFor="unlockPrice">解锁价格（元）</Label>
                <Input
                  id="unlockPrice"
                  type="number"
                  value={editFormData.unlockPrice}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      unlockPrice: e.target.value,
                    }))
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingFile(null)}
              disabled={saving}
            >
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saving ? "保存中..." : "保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  X,
  FileText,
  Loader2,
  Lock,
  Unlock,
  File,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface FileUploadProps {
  projectId: string;
  onUploadSuccess?: (file: any) => void;
  maxSize?: number; // MB
}

interface UploadedFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  isLocked: boolean;
  unlockPrice?: number;
  description?: string;
}

export function FileUpload({
  projectId,
  onUploadSuccess,
  maxSize = 50,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [fileSettings, setFileSettings] = useState<{
    [key: string]: {
      isLocked: boolean;
      unlockPrice: string;
      description: string;
    };
  }>({});

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");

      // 检查文件大小
      const oversizedFiles = acceptedFiles.filter(
        (file) => file.size > maxSize * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setError(`文件大小不能超过 ${maxSize}MB`);
        return;
      }

      setUploading(true);

      for (const file of acceptedFiles) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          // 获取文件设置
          const settings = fileSettings[file.name] || {
            isLocked: true,
            unlockPrice: "0",
            description: "",
          };

          formData.append("isLocked", settings.isLocked.toString());
          formData.append("unlockPrice", settings.unlockPrice);
          formData.append("description", settings.description);

          // 模拟上传进度
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          const response = await fetch(
            `/api/investment-projects/${projectId}/files`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || "上传失败");
          }

          // 更新进度
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

          // 添加到已上传列表
          setUploadedFiles((prev) => [
            ...prev,
            {
              id: data.file.id,
              fileName: data.file.fileName,
              fileType: data.file.fileType,
              fileSize: data.file.fileSize,
              isLocked: data.file.isLocked,
              unlockPrice: data.file.unlockPrice,
              description: data.file.description,
            },
          ]);

          // 清除文件设置
          setFileSettings((prev) => {
            const newSettings = { ...prev };
            delete newSettings[file.name];
            return newSettings;
          });

          // 调用成功回调
          if (onUploadSuccess) {
            onUploadSuccess(data.file);
          }
        } catch (error: any) {
          setError(error.message || "上传失败，请稍后重试");
        } finally {
          // 清除进度
          setTimeout(() => {
            setUploadProgress((prev) => {
              const newProgress = { ...prev };
              delete newProgress[file.name];
              return newProgress;
            });
          }, 1000);
        }
      }

      setUploading(false);
    },
    [projectId, maxSize, fileSettings, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      accept: {
        "application/pdf": [".pdf"],
        "text/html": [".html", ".htm"],
        "application/vnd.ms-powerpoint": [".ppt"],
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          [".pptx"],
      },
      maxSize: maxSize * 1024 * 1024,
      multiple: true,
      disabled: uploading,
    });

  const removeFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除失败");
      }

      setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
    } catch (error: any) {
      setError(error.message || "删除失败，请稍后重试");
    }
  };

  const updateFileSetting = (
    fileName: string,
    field: string,
    value: any
  ) => {
    setFileSettings((prev) => ({
      ...prev,
      [fileName]: {
        ...(prev[fileName] || {
          isLocked: true,
          unlockPrice: "0",
          description: "",
        }),
        [field]: value,
      },
    }));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5" />;
    if (fileType.includes("html")) return <File className="h-5 w-5" />;
    if (fileType.includes("powerpoint") || fileType.includes("presentation"))
      return <FileText className="h-5 w-5" />;
    return <File className="h-5 w-5" />;
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-12 w-12 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">放开以上传文件...</p>
          ) : (
            <>
              <p className="text-gray-600">
                拖拽文件到此处，或点击选择文件
              </p>
              <p className="text-sm text-gray-500">
                支持 PDF、HTML、PPT、PPTX 格式，单个文件最大 {maxSize}MB
              </p>
            </>
          )}
        </div>
      </Card>

      {/* 待上传文件设置 */}
      {acceptedFiles.length > 0 && !uploading && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700">
            待上传文件设置
          </h3>
          {acceptedFiles.map((file) => {
            const settings = fileSettings[file.name] || {
              isLocked: true,
              unlockPrice: "0",
              description: "",
            };

            return (
              <Card key={file.name} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.type)}
                      <div>
                        <div className="font-medium">{file.name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(file.size)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`locked-${file.name}`}>
                        是否锁定文件
                      </Label>
                      <Switch
                        id={`locked-${file.name}`}
                        checked={settings.isLocked}
                        onCheckedChange={(checked) =>
                          updateFileSetting(file.name, "isLocked", checked)
                        }
                      />
                    </div>

                    {settings.isLocked && (
                      <div>
                        <Label htmlFor={`price-${file.name}`}>
                          解锁价格（元）
                        </Label>
                        <Input
                          id={`price-${file.name}`}
                          type="number"
                          value={settings.unlockPrice}
                          onChange={(e) =>
                            updateFileSetting(
                              file.name,
                              "unlockPrice",
                              e.target.value
                            )
                          }
                          placeholder="0"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor={`desc-${file.name}`}>文件描述</Label>
                      <Textarea
                        id={`desc-${file.name}`}
                        value={settings.description}
                        onChange={(e) =>
                          updateFileSetting(
                            file.name,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="简要描述文件内容"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* 上传进度 */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([name, progress]) => (
            <div key={name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate flex-1">{name}</span>
                <span className="text-gray-500 ml-2">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* 已上传的文件 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">已上传的文件</h3>
          <div className="space-y-2">
            {uploadedFiles.map((file) => (
              <Card key={file.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1">
                      <div className="font-medium">{file.fileName}</div>
                      <div className="text-sm text-gray-500">
                        {formatFileSize(file.fileSize)}
                        {file.description && ` • ${file.description}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {file.isLocked ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Lock className="h-4 w-4" />
                        <span>¥{file.unlockPrice || 0}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <Unlock className="h-4 w-4" />
                        <span>免费</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 加载状态 */}
      {uploading && (
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>上传中...</span>
        </div>
      )}
    </div>
  );
}

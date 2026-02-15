"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  projectId: string;
  onUploadSuccess?: (imageUrl: string) => void;
  maxSize?: number; // MB
  maxFiles?: number;
}

interface UploadedImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  name: string;
}

export function ImageUpload({
  projectId,
  onUploadSuccess,
  maxSize = 5,
  maxFiles = 10,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [error, setError] = useState("");
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("");

      // 检查文件数量
      if (uploadedImages.length + acceptedFiles.length > maxFiles) {
        setError(`最多只能上传 ${maxFiles} 张图片`);
        return;
      }

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

          // 模拟上传进度
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

          const response = await fetch(
            `/api/investment-projects/${projectId}/upload-image`,
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
          setUploadedImages((prev) => [
            ...prev,
            {
              id: data.image.id,
              url: data.image.url,
              thumbnailUrl: data.image.thumbnailUrl,
              name: file.name,
            },
          ]);

          // 调用成功回调
          if (onUploadSuccess) {
            onUploadSuccess(data.image.url);
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
    [projectId, uploadedImages.length, maxFiles, maxSize, onUploadSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: maxSize * 1024 * 1024,
    multiple: true,
    disabled: uploading || uploadedImages.length >= maxFiles,
  });

  const removeImage = async (imageId: string) => {
    try {
      const response = await fetch(
        `/api/investment-projects/${projectId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除失败");
      }

      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (error: any) {
      setError(error.message || "删除失败，请稍后重试");
    }
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
        } ${
          uploading || uploadedImages.length >= maxFiles
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-12 w-12 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600 font-medium">放开以上传图片...</p>
          ) : (
            <>
              <p className="text-gray-600">
                拖拽图片到此处，或点击选择文件
              </p>
              <p className="text-sm text-gray-500">
                支持 JPG、PNG、WebP 格式，单个文件最大 {maxSize}MB
              </p>
              <p className="text-sm text-gray-500">
                已上传 {uploadedImages.length}/{maxFiles} 张
              </p>
            </>
          )}
        </div>
      </Card>

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

      {/* 已上传的图片 */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">已上传的图片</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200"
              >
                <div className="aspect-square relative bg-gray-100">
                  <Image
                    src={image.thumbnailUrl || image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeImage(image.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 truncate">
                  {image.name}
                </div>
              </div>
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

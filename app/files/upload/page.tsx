'use client';

import { useState } from 'react';
import { FileUploader, type UploadedFile } from '@/components/files/file-uploader';
import { FilePreview } from '@/components/files/file-preview';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default function FileUploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [previewFile, setPreviewFile] = useState<{
    id: string;
    name: string;
    url: string;
    type: string;
    size?: number;
  } | null>(null);

  const handleUploadComplete = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    console.log('上传完成:', files);
  };

  const handleUploadError = (error: string) => {
    console.error('上传错误:', error);
  };

  const handlePreview = (file: UploadedFile) => {
    if (file.url) {
      setPreviewFile({
        id: file.id,
        name: file.name,
        url: file.url,
        type: file.type,
        size: file.size,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">文件上传</h1>
          <p className="text-white/60">上传和管理您的文件</p>
        </div>

        {/* 文件上传组件 */}
        <FileUploader
          maxFiles={10}
          maxSize={10 * 1024 * 1024} // 10MB
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
        />

        {/* 上传完成的文件列表 */}
        {uploadedFiles.length > 0 && (
          <Card className="mt-6 bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              已上传的文件 ({uploadedFiles.length})
            </h2>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="text-white font-medium">{file.name}</p>
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 text-sm hover:underline"
                      >
                        查看文件
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white/60 text-sm">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    {file.status === 'success' && file.url && (
                      <Button
                        size="sm"
                        onClick={() => handlePreview(file)}
                        className="bg-purple-500 hover:bg-purple-600"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        预览
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* 文件预览对话框 */}
      {previewFile && (
        <FilePreview
          file={previewFile}
          open={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Download,
  RotateCcw,
  Eye,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatFileSize } from '@/lib/file-validation';

interface Version {
  id: string;
  version: number;
  changeLog: string;
  filePath: string;
  size: number;
  createdAt: string;
  isCurrent: boolean;
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    avatar: string | null;
  } | null;
}

interface VersionHistoryProps {
  documentId: string;
  onPreview?: (version: Version) => void;
}

export function VersionHistory({ documentId, onPreview }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [documentId]);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/documents/${documentId}/versions`);

      if (!response.ok) {
        throw new Error('获取版本历史失败');
      }

      const data = await response.json();
      setVersions(data.versions || []);
    } catch (error) {
      console.error('获取版本历史失败:', error);
      toast.error('获取版本历史失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!confirm(`确定要恢复到版本 ${versionNumber} 吗？`)) {
      return;
    }

    try {
      setRestoringId(versionId);
      const response = await fetch(`/api/documents/${documentId}/restore`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ versionId }),
      });

      if (!response.ok) {
        throw new Error('恢复版本失败');
      }

      const data = await response.json();
      toast.success(data.message || '版本恢复成功');
      
      // 刷新版本列表
      await fetchVersions();
    } catch (error) {
      console.error('恢复版本失败:', error);
      toast.error('恢复版本失败');
    } finally {
      setRestoringId(null);
    }
  };

  const handleDownload = (version: Version) => {
    const a = document.createElement('a');
    a.href = version.filePath;
    a.download = `version-${version.version}`;
    a.click();
    toast.success('开始下载');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAuthorName = (author: Version['author']) => {
    if (!author) return '未知用户';
    return `${author.firstName || ''} ${author.lastName || ''}`.trim() || '未知用户';
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-white/40 animate-spin mr-2" />
          <span className="text-white/60">加载版本历史...</span>
        </div>
      </Card>
    );
  }

  if (versions.length === 0) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-8">
        <div className="text-center text-white/60">
          <FileText className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <p>暂无版本历史</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-medium flex items-center gap-2">
          <Clock className="w-5 h-5" />
          版本历史 ({versions.length})
        </h3>
      </div>

      <ScrollArea className="max-h-[600px]">
        <div className="p-4">
          {/* 时间线 */}
          <div className="relative">
            {/* 时间线竖线 */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

            {/* 版本列表 */}
            <div className="space-y-6">
              {versions.map((version, index) => (
                <div key={version.id} className="relative pl-14">
                  {/* 时间线圆点 */}
                  <div
                    className={`absolute left-4 top-2 w-4 h-4 rounded-full border-2 ${
                      version.isCurrent
                        ? 'bg-green-500 border-green-400'
                        : 'bg-white/10 border-white/20'
                    }`}
                  >
                    {version.isCurrent && (
                      <CheckCircle2 className="w-3 h-3 text-white absolute -top-0.5 -left-0.5" />
                    )}
                  </div>

                  {/* 版本卡片 */}
                  <Card
                    className={`p-4 ${
                      version.isCurrent
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {/* 版本头部 */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={version.author?.avatar || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                            {getInitials(getAuthorName(version.author))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">
                              版本 {version.version}
                            </h4>
                            {version.isCurrent && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                                当前版本
                              </span>
                            )}
                          </div>
                          <p className="text-white/60 text-sm">
                            {getAuthorName(version.author)}
                          </p>
                        </div>
                      </div>

                      <span className="text-white/40 text-xs">
                        {formatDate(version.createdAt)}
                      </span>
                    </div>

                    {/* 变更日志 */}
                    {version.changeLog && (
                      <p className="text-white/80 text-sm mb-3">{version.changeLog}</p>
                    )}

                    {/* 文件信息 */}
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">
                        {formatFileSize(version.size)}
                      </span>

                      {/* 操作按钮 */}
                      <div className="flex items-center gap-2">
                        {onPreview && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onPreview(version)}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            预览
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(version)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          下载
                        </Button>

                        {!version.isCurrent && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRestore(version.id, version.version)}
                            disabled={restoringId === version.id}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                          >
                            {restoringId === version.id ? (
                              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            ) : (
                              <RotateCcw className="w-4 h-4 mr-1" />
                            )}
                            恢复
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}

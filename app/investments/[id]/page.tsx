"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FilePreviewModal } from "@/components/investment/file-preview-modal";
import {
  TrendingUp,
  Clock,
  Users,
  Eye,
  ArrowLeft,
  Calendar,
  Shield,
  FileText,
  Lock,
  Unlock,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ProjectFile {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  description: string | null;
  isLocked: boolean;
  unlockPrice: number | null;
  downloadCount: number;
  viewCount: number;
  canAccess?: boolean;
  accessReason?: string;
}

interface InvestmentProject {
  id: string;
  title: string;
  shortDesc: string | null;
  description: string;
  category: string | null;
  status: string;
  investmentAmount: number;
  targetAmount: number | null;
  totalRaised: number;
  minInvestment: number | null;
  maxInvestment: number | null;
  expectedReturn: number;
  duration: number;
  riskLevel: string | null;
  coverImage: string | null;
  gallery: string | null;
  tags: string | null;
  viewCount: number;
  investorCount: number;
  startDate: string | null;
  endDate: string | null;
  files: ProjectFile[];
}

// 状态颜色映射
const statusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DRAFT: "bg-gray-100 text-gray-800",
  CLOSED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
};

const statusLabels: Record<string, string> = {
  ACTIVE: "募集中",
  DRAFT: "即将开始",
  CLOSED: "已结束",
  COMPLETED: "已完成",
};

const riskColors: Record<string, string> = {
  LOW: "text-green-600 bg-green-50",
  MEDIUM: "text-yellow-600 bg-yellow-50",
  HIGH: "text-red-600 bg-red-50",
};

const riskLabels: Record<string, string> = {
  LOW: "低风险",
  MEDIUM: "中风险",
  HIGH: "高风险",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<InvestmentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);

  const projectId = params.id as string;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      // 获取项目详情
      const response = await fetch(`/api/investment-projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取项目详情失败");
      }

      // 获取文件列表（包含访问状态）
      const filesResponse = await fetch(`/api/investment-projects/${projectId}/files`);
      const filesData = await filesResponse.json();

      // 合并文件访问状态
      const projectWithFiles = {
        ...data.project,
        files: filesData.files || data.project.files || [],
      };

      setProject(projectWithFiles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(2)}亿`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万`;
    }
    return amount.toLocaleString();
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // 计算募集进度
  const getProgress = (raised: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  // 解析图片集
  const getGalleryImages = () => {
    if (!project?.gallery) return [];
    try {
      return JSON.parse(project.gallery);
    } catch {
      return [];
    }
  };

  // 解析标签
  const getTags = () => {
    if (!project?.tags) return [];
    try {
      return JSON.parse(project.tags);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">加载失败</h2>
        <p className="text-gray-500 mb-4">{error || "项目不存在"}</p>
        <Button onClick={() => router.push("/investments")}>
          返回项目列表
        </Button>
      </div>
    );
  }

  const galleryImages = getGalleryImages();
  const allImages = project.coverImage
    ? [project.coverImage, ...galleryImages]
    : galleryImages;
  const tags = getTags();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/investments")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回项目列表
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧主内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 图片轮播 */}
            {allImages.length > 0 && (
              <Card className="overflow-hidden">
                <div className="relative h-80 md:h-96 bg-gray-200">
                  <Image
                    src={allImages[currentImageIndex]}
                    alt={project.title}
                    fill
                    className="object-cover"
                  />
                  {allImages.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === 0 ? allImages.length - 1 : prev - 1
                          )
                        }
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={() =>
                          setCurrentImageIndex((prev) =>
                            prev === allImages.length - 1 ? 0 : prev + 1
                          )
                        }
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {allImages.map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            aria-label={`查看第 ${index + 1} 张图片`}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white/50"
                            }`}
                            onClick={() => setCurrentImageIndex(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            )}

            {/* 项目标题和标签 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    <p className="text-gray-500">{project.shortDesc}</p>
                  </div>
                  <Badge className={statusColors[project.status]}>
                    {statusLabels[project.status]}
                  </Badge>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
            </Card>

            {/* 详情标签页 */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="description" className="flex-1">
                  项目介绍
                </TabsTrigger>
                <TabsTrigger value="files" className="flex-1">
                  项目文件
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card>
                  <CardContent className="pt-6">
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{project.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="files">
                <Card>
                  <CardContent className="pt-6">
                    {project.files && project.files.length > 0 ? (
                      <div className="space-y-4">
                        {project.files.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                              file.canAccess ? "hover:bg-gray-50" : "bg-gray-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <div className={`p-2 rounded-lg ${
                                file.canAccess ? "bg-blue-100" : "bg-gray-100"
                              }`}>
                                <FileText className={`h-6 w-6 ${
                                  file.canAccess ? "text-blue-600" : "text-gray-400"
                                }`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{file.originalName || file.fileName}</p>
                                  {file.isLocked && !file.canAccess && (
                                    <Lock className="h-4 w-4 text-amber-500" />
                                  )}
                                  {file.isLocked && file.canAccess && (
                                    <Unlock className="h-4 w-4 text-green-500" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.fileSize)} · {file.viewCount || 0} 次浏览 · {file.downloadCount} 次下载
                                </p>
                                {file.description && (
                                  <p className="text-sm text-gray-500 mt-1">
                                    {file.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.canAccess ? (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setPreviewOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    预览
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/api/files/${file.id}/download`, "_blank")}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    下载
                                  </Button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {file.unlockPrice && file.unlockPrice > 0 ? (
                                    <span className="text-sm text-amber-600 font-medium">
                                      投资后解锁
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-500">
                                      {file.accessReason || "需要投资后访问"}
                                    </span>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={() => router.push(`/investments/${projectId}/invest`)}
                                  >
                                    立即投资
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">
                        暂无项目文件
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* 右侧投资信息 */}
          <div className="space-y-6">
            {/* 投资概览 */}
            <Card>
              <CardHeader>
                <CardTitle>投资概览</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 预期回报 */}
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">预期年化回报</p>
                  <p className="text-4xl font-bold text-green-600">
                    {project.expectedReturn}%
                  </p>
                </div>

                {/* 募集进度 */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-500">募集进度</span>
                    <span className="font-medium">
                      {getProgress(project.totalRaised, project.targetAmount).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={getProgress(project.totalRaised, project.targetAmount)}
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm mt-2">
                    <span>已募集 ¥{formatAmount(project.totalRaised)}</span>
                    <span>目标 ¥{formatAmount(project.targetAmount || 0)}</span>
                  </div>
                </div>

                {/* 关键信息 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Clock className="h-4 w-4" />
                      <span className="text-xs">投资期限</span>
                    </div>
                    <p className="font-semibold">{project.duration}个月</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-xs">投资人数</span>
                    </div>
                    <p className="font-semibold">{project.investorCount}人</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-xs">起投金额</span>
                    </div>
                    <p className="font-semibold">
                      ¥{formatAmount(project.minInvestment || 0)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Eye className="h-4 w-4" />
                      <span className="text-xs">浏览次数</span>
                    </div>
                    <p className="font-semibold">{project.viewCount}</p>
                  </div>
                </div>

                {/* 风险等级 */}
                {project.riskLevel && (
                  <div className={`p-3 rounded-lg ${riskColors[project.riskLevel]}`}>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">
                        风险等级：{riskLabels[project.riskLevel]}
                      </span>
                    </div>
                  </div>
                )}

                {/* 投资按钮 */}
                {project.status === "ACTIVE" && (
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={() => router.push(`/investments/${projectId}/invest`)}
                  >
                    立即投资
                  </Button>
                )}
                {project.status === "DRAFT" && (
                  <Button className="w-full" size="lg" disabled>
                    即将开始
                  </Button>
                )}
                {(project.status === "CLOSED" || project.status === "COMPLETED") && (
                  <Button className="w-full" size="lg" disabled>
                    已结束
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* 项目时间 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">项目时间</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {project.startDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">开始日期</p>
                      <p className="font-medium">
                        {new Date(project.startDate).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                  </div>
                )}
                {project.endDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">结束日期</p>
                      <p className="font-medium">
                        {new Date(project.endDate).toLocaleDateString("zh-CN")}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 文件预览模态框 */}
      {selectedFile && (
        <FilePreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          fileId={selectedFile.id}
          fileName={selectedFile.originalName || selectedFile.fileName}
          fileType={selectedFile.fileType}
          onDownload={() => {
            window.open(`/api/files/${selectedFile.id}/download`, "_blank");
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  CheckCircle,
} from 'lucide-react';

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

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  CLOSED: 'bg-red-100 text-red-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
};

const statusLabels: Record<string, string> = {
  ACTIVE: '募集中',
  DRAFT: '即将开始',
  CLOSED: '已结束',
  COMPLETED: '已完成',
};

const riskColors: Record<string, string> = {
  LOW: 'text-green-600 bg-green-50',
  MEDIUM: 'text-yellow-600 bg-yellow-50',
  HIGH: 'text-red-600 bg-red-50',
};

const riskLabels: Record<string, string> = {
  LOW: '低风险',
  MEDIUM: '中风险',
  HIGH: '高风险',
};

export default function ClientProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<InvestmentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const projectId = params.id as string;

  useEffect(() => {
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/investment-projects/${projectId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '获取项目详情失败');
      }

      const filesResponse = await fetch(`/api/investment-projects/${projectId}/files`);
      const filesData = await filesResponse.json();

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

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(2)}亿`;
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}万`;
    }
    return amount.toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getProgress = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600 mb-4">
              <AlertTriangle className="w-5 h-5" />
              <span>加载失败</span>
            </div>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">项目不存在</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const galleryImages = project.gallery ? JSON.parse(project.gallery) : [];
  const allImages = project.coverImage ? [project.coverImage, ...galleryImages] : galleryImages;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按钮 */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回项目列表
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 左侧主要内容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 项目图片 */}
            {allImages.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video">
                    <Image
                      src={allImages[currentImageIndex]}
                      alt={project.title}
                      fill
                      className="object-cover rounded-t-lg"
                    />
                    {allImages.length > 1 && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length)}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % allImages.length)}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 项目标题和状态 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                    {project.shortDesc && (
                      <p className="text-muted-foreground">{project.shortDesc}</p>
                    )}
                  </div>
                  <Badge className={statusColors[project.status] || 'bg-gray-100'}>
                    {statusLabels[project.status] || project.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="description">
                  <TabsList>
                    <TabsTrigger value="description">项目介绍</TabsTrigger>
                    <TabsTrigger value="files">项目文件</TabsTrigger>
                  </TabsList>
                  <TabsContent value="description" className="mt-4">
                    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: project.description }} />
                  </TabsContent>
                  <TabsContent value="files" className="mt-4">
                    {project.files && project.files.length > 0 ? (
                      <div className="space-y-3">
                        {project.files.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{file.originalName}</p>
                                <p className="text-sm text-muted-foreground">{formatFileSize(file.fileSize)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {file.isLocked ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Unlock className="w-4 h-4 text-green-600" />
                              )}
                              <Button size="sm" variant="outline" disabled={file.isLocked && !file.canAccess}>
                                <Download className="w-4 h-4 mr-1" />
                                下载
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">暂无项目文件</p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* 右侧投资信息 */}
          <div className="space-y-6">
            {/* 投资进度 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">投资进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>已募集</span>
                    <span className="font-medium">¥{formatAmount(project.totalRaised)}</span>
                  </div>
                  <Progress value={getProgress(project.totalRaised, project.targetAmount || project.investmentAmount)} />
                  <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                    <span>目标: ¥{formatAmount(project.targetAmount || project.investmentAmount)}</span>
                    <span>{getProgress(project.totalRaised, project.targetAmount || project.investmentAmount).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">预期收益</span>
                    </div>
                    <p className="text-xl font-bold text-primary">{project.expectedReturn}%</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">投资期限</span>
                    </div>
                    <p className="text-xl font-bold">{project.duration}个月</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">投资人数</span>
                    </div>
                    <p className="text-lg font-medium">{project.investorCount}人</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Eye className="w-4 h-4" />
                      <span className="text-sm">浏览次数</span>
                    </div>
                    <p className="text-lg font-medium">{project.viewCount}次</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 风险等级 */}
            {project.riskLevel && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    风险等级
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={riskColors[project.riskLevel] || 'bg-gray-100'}>
                    {riskLabels[project.riskLevel] || project.riskLevel}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* 投资按钮 */}
            <Button className="w-full" size="lg" disabled={project.status !== 'ACTIVE'}>
              {project.status === 'ACTIVE' ? '立即投资' : '暂不可投资'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

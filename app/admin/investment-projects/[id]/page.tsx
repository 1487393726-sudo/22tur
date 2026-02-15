"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, Edit, Trash2 } from "lucide-react";
import { ImageUpload } from "@/components/investment/image-upload";
import { FileUpload } from "@/components/investment/file-upload";
import { FileList } from "@/components/investment/file-list";

interface InvestmentProject {
  id: string;
  title: string;
  description: string;
  shortDesc: string;
  category: string;
  status: string;
  investmentAmount: number;
  targetAmount: number;
  totalRaised: number;
  expectedReturn: number;
  duration: number;
  minInvestment: number;
  maxInvestment: number;
  riskLevel: string;
  investorCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<InvestmentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      try {
        const response = await fetch(`/api/investment-projects/${projectId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "加载项目失败");
        }

        setProject(data.project);
      } catch (error: any) {
        setError(error.message || "加载项目失败");
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  const handleDelete = async () => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      const response = await fetch(`/api/investment-projects/${projectId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "删除失败");
      }

      router.push("/admin/investment-projects");
    } catch (error: any) {
      setError(error.message || "删除失败");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      DRAFT: { label: "草稿", variant: "secondary" },
      ACTIVE: { label: "活跃", variant: "default" },
      CLOSED: { label: "关闭", variant: "destructive" },
      COMPLETED: { label: "完成", variant: "outline" },
    };

    const config = statusConfig[status] || { label: status, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getRiskBadge = (riskLevel: string) => {
    const riskConfig: Record<string, { label: string; variant: any }> = {
      LOW: { label: "低风险", variant: "outline" },
      MEDIUM: { label: "中风险", variant: "secondary" },
      HIGH: { label: "高风险", variant: "destructive" },
    };

    const config = riskConfig[riskLevel] || { label: riskLevel, variant: "secondary" };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">加载中...</span>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-700">
            {error || "项目不存在"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const progressPercentage = project.targetAmount
    ? Math.round((project.totalRaised / project.targetAmount) * 100)
    : 0;

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-gray-600 mt-1">{project.shortDesc}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push(`/admin/investment-projects/${projectId}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              编辑
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              删除
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert className="mb-6 bg-red-50 border-red-200">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {/* 项目概览 */}
        <Card>
          <CardHeader>
            <CardTitle>项目概览</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">状态</p>
                <div className="mt-1">{getStatusBadge(project.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">风险等级</p>
                <div className="mt-1">{getRiskBadge(project.riskLevel)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-600">分类</p>
                <p className="font-medium mt-1">{project.category || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">投资人数</p>
                <p className="font-medium mt-1">{project.investorCount}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-gray-600 mb-2">详细描述</p>
              <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* 投资信息 */}
        <Card>
          <CardHeader>
            <CardTitle>投资信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600">投资金额</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ¥{project.investmentAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">预期回报率</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {project.expectedReturn}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">投资期限</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {project.duration} 个月
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">最小投资额</p>
                <p className="font-medium mt-1">
                  {project.minInvestment ? `¥${project.minInvestment.toLocaleString()}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">最大投资额</p>
                <p className="font-medium mt-1">
                  {project.maxInvestment ? `¥${project.maxInvestment.toLocaleString()}` : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">目标筹集</p>
                <p className="font-medium mt-1">
                  {project.targetAmount ? `¥${project.targetAmount.toLocaleString()}` : "-"}
                </p>
              </div>
            </div>

            {/* 筹集进度 */}
            {project.targetAmount && (
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-2">筹集进度</p>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      已筹集: ¥{project.totalRaised.toLocaleString()}
                    </span>
                    <span className="font-medium">{progressPercentage}%</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 项目图片 */}
        <Card>
          <CardHeader>
            <CardTitle>项目图片</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              projectId={projectId}
              onUploadSuccess={(url) => {
                console.log("图片上传成功:", url);
              }}
            />
          </CardContent>
        </Card>

        {/* 上传文件 */}
        <Card>
          <CardHeader>
            <CardTitle>上传文件</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              projectId={projectId}
              onUploadSuccess={(file) => {
                console.log("文件上传成功:", file);
              }}
            />
          </CardContent>
        </Card>

        {/* 文件列表 */}
        <Card>
          <CardHeader>
            <CardTitle>已上传文件</CardTitle>
          </CardHeader>
          <CardContent>
            <FileList projectId={projectId} editable={true} />
          </CardContent>
        </Card>

        {/* 统计信息 */}
        <Card>
          <CardHeader>
            <CardTitle>统计信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">浏览次数</p>
                <p className="text-2xl font-bold mt-1">{project.viewCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">投资人数</p>
                <p className="text-2xl font-bold mt-1">{project.investorCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">创建时间</p>
                <p className="text-sm mt-1">
                  {new Date(project.createdAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">更新时间</p>
                <p className="text-sm mt-1">
                  {new Date(project.updatedAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

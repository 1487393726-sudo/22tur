"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { InvestmentForm } from "@/components/investment/investment-form";
import {
  ArrowLeft,
  TrendingUp,
  Clock,
  Users,
  Shield,
  Loader2,
  AlertTriangle,
  LogIn,
} from "lucide-react";

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
  investorCount: number;
}

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

export default function InvestPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [project, setProject] = useState<InvestmentProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        throw new Error(data.error || "获取项目详情失败");
      }

      setProject(data.project);
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

  // 计算募集进度
  const getProgress = (raised: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min((raised / target) * 100, 100);
  };

  const handleInvestSuccess = (investment: any) => {
    // 投资成功后跳转到我的投资页面
    router.push("/user/investments?tab=project");
  };

  // 加载中
  if (loading || sessionStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // 未登录
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => router.push(`/investments/${projectId}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回项目详情
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <LogIn className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">请先登录</h3>
                <p className="text-gray-500 mb-6">
                  您需要登录后才能进行投资操作
                </p>
                <div className="space-y-3">
                  <Button
                    className="w-full"
                    onClick={() => router.push(`/login?callbackUrl=/investments/${projectId}/invest`)}
                  >
                    立即登录
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/register")}
                  >
                    注册新账号
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 加载失败
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

  // 项目不可投资
  if (project.status !== "ACTIVE") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3">
            <Button
              variant="ghost"
              onClick={() => router.push(`/investments/${projectId}`)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              返回项目详情
            </Button>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">项目暂不可投资</h3>
                <p className="text-gray-500 mb-4">
                  当前项目状态：{statusLabels[project.status]}
                </p>
                <Button onClick={() => router.push(`/investments/${projectId}`)}>
                  返回项目详情
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.push(`/investments/${projectId}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回项目详情
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧：投资表单 */}
            <div className="lg:col-span-2">
              <InvestmentForm project={project} onSuccess={handleInvestSuccess} />
            </div>

            {/* 右侧：项目摘要 */}
            <div className="space-y-6">
              {/* 项目信息 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  {project.shortDesc && (
                    <p className="text-sm text-gray-500">{project.shortDesc}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 预期回报 */}
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">预期年化回报</p>
                    <p className="text-2xl font-bold text-green-600">
                      {project.expectedReturn}%
                    </p>
                  </div>

                  {/* 募集进度 */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">募集进度</span>
                      <span className="font-medium">
                        {getProgress(project.totalRaised, project.targetAmount).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={getProgress(project.totalRaised, project.targetAmount)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs mt-1 text-gray-500">
                      <span>¥{formatAmount(project.totalRaised)}</span>
                      <span>¥{formatAmount(project.targetAmount || 0)}</span>
                    </div>
                  </div>

                  {/* 关键信息 */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{project.duration}个月</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span>{project.investorCount}人已投</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span>起投 ¥{formatAmount(project.minInvestment || 0)}</span>
                    </div>
                    {project.riskLevel && (
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span>{riskLabels[project.riskLevel]}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 风险提示 */}
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">投资风险提示</p>
                      <p className="text-yellow-700">
                        投资有风险，入市需谨慎。请在充分了解项目风险后再做投资决定。
                        过往业绩不代表未来表现。
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

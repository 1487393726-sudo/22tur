"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface ProjectDetailCardProps {
  project: {
    id: string;
    title: string;
    description?: string;
    status: string;
    totalRaised: number;
    targetAmount: number;
    investorCount: number;
    expectedReturn: number;
    duration: number;
    minInvestment: number;
    maxInvestment: number;
    createdAt: string;
    developmentDuration?: number;
    implementationDuration?: number;
    launchDuration?: number;
  };
  onInvest?: () => void;
}

export function ProjectDetailCard({ project, onInvest }: ProjectDetailCardProps) {
  // 格式化日期
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 格式化金额
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("zh-CN", {
      style: "currency",
      currency: "CNY",
    });
  };

  // 计算进度百分比
  const progressPercentage = (project.totalRaised / project.targetAmount) * 100;

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800";
      case "CLOSED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 获取状态标签
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "进行中";
      case "CLOSED":
        return "已关闭";
      case "COMPLETED":
        return "已完成";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* 项目头部 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CardTitle className="text-2xl">{project.title}</CardTitle>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <CardDescription className="text-base">
                {project.description || "暂无项目描述"}
              </CardDescription>
            </div>
            {onInvest && project.status === "ACTIVE" && (
              <Button onClick={onInvest} size="lg" className="whitespace-nowrap">
                立即投资
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* 融资进度 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            融资进度
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 进度条 */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">已融资</span>
              <span className="text-sm font-semibold text-blue-600">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* 融资数据 */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">已融资</p>
              <p className="font-semibold text-lg text-blue-600">
                {formatAmount(project.totalRaised)}
              </p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">目标金额</p>
              <p className="font-semibold text-lg">
                {formatAmount(project.targetAmount)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">投资人数</p>
              <p className="font-semibold text-lg text-green-600">
                {project.investorCount}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 项目信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            项目信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 创建时间 */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600 mb-1">项目创建时间</p>
                <p className="font-semibold">{formatDate(project.createdAt)}</p>
              </div>
            </div>

            {/* 开发周期 */}
            {project.developmentDuration && (
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">开发周期</p>
                  <p className="font-semibold">{project.developmentDuration} 个月</p>
                </div>
              </div>
            )}

            {/* 实现周期 */}
            {project.implementationDuration && (
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">实现周期</p>
                  <p className="font-semibold">{project.implementationDuration} 个月</p>
                </div>
              </div>
            )}

            {/* 开业周期 */}
            {project.launchDuration && (
              <div className="flex items-start gap-3">
                <Zap className="w-5 h-5 text-white400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">开业周期</p>
                  <p className="font-semibold">{project.launchDuration} 个月</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 投资条件 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            投资条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 预期收益率 */}
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">年化收益率</p>
              <p className="text-2xl font-bold text-green-600">
                {project.expectedReturn}%
              </p>
            </div>

            {/* 投资期限 */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">投资期限</p>
              <p className="text-2xl font-bold text-blue-600">
                {project.duration}
              </p>
              <p className="text-xs text-gray-500">个月</p>
            </div>

            {/* 最低投资 */}
            <div className="p-4 bg-orange-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">最低投资</p>
              <p className="text-lg font-bold text-orange-600">
                {formatAmount(project.minInvestment)}
              </p>
            </div>

            {/* 最高投资 */}
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">最高投资</p>
              <p className="text-lg font-bold text-white600">
                {formatAmount(project.maxInvestment)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 项目时间线 */}
      {(project.developmentDuration || project.implementationDuration || project.launchDuration) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              项目时间线
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 时间线 */}
              <div className="relative">
                <div className="flex items-center gap-4">
                  {/* 创建 */}
                  <div className="flex flex-col items-center">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-md" />
                    <div className="text-xs text-gray-600 mt-2 text-center">
                      <p className="font-semibold">项目创建</p>
                      <p>{formatDate(project.createdAt)}</p>
                    </div>
                  </div>

                  {/* 连接线 */}
                  <div className="flex-1 h-1 bg-gradient-to-r from-blue-600 to-green-600" />

                  {/* 开发 */}
                  {project.developmentDuration && (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-green-600 rounded-full border-4 border-white shadow-md" />
                        <div className="text-xs text-gray-600 mt-2 text-center">
                          <p className="font-semibold">开发完成</p>
                          <p>+{project.developmentDuration}个月</p>
                        </div>
                      </div>

                      {/* 连接线 */}
                      <div className="flex-1 h-1 bg-gradient-to-r from-green-600 to-purple-600" />
                    </>
                  )}

                  {/* 实现 */}
                  {project.implementationDuration && (
                    <>
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-md" />
                        <div className="text-xs text-gray-600 mt-2 text-center">
                          <p className="font-semibold">实现完成</p>
                          <p>+{project.implementationDuration}个月</p>
                        </div>
                      </div>

                      {/* 连接线 */}
                      <div className="flex-1 h-1 bg-gradient-to-r from-purple-600 to-orange-600" />
                    </>
                  )}

                  {/* 开业 */}
                  {project.launchDuration && (
                    <div className="flex flex-col items-center">
                      <div className="w-4 h-4 bg-orange-600 rounded-full border-4 border-white shadow-md" />
                      <div className="text-xs text-gray-600 mt-2 text-center">
                        <p className="font-semibold">正式开业</p>
                        <p>+{project.launchDuration}个月</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 总周期 */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">项目总周期</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {(project.developmentDuration || 0) + 
                   (project.implementationDuration || 0) + 
                   (project.launchDuration || 0)} 个月
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

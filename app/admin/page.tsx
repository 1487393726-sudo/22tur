"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FolderKanban,
  Handshake,
  CheckSquare,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DashboardStats } from "@/lib/types";
import {
  formatCurrency,
  getRelativeTime,
  getPriorityColor,
  getStatusColor,
} from "@/lib/utils";

export default function Dashboard() {
  const t = useTranslations("admin.dashboard");
  const tc = useTranslations("common");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/dashboard");
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          console.error("API返回错误:", result.error);
          setError(result.error || tc("errors.serverError"));
        }
      } catch (error) {
        console.error("Failed to load dashboard stats:", error);
        setError(tc("errors.networkError"));
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [tc]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="92j59mk">
        <div className="text-white" data-oid=".x8bjof">
          {tc("buttons.loading")}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="zi3jdqp">
        <div className="text-red-400" data-oid="3ryn7ca">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64" data-oid="cy_k:60">
        <div className="text-red-400" data-oid="x:kbi53">
          {tc("empty.noData")}
        </div>
      </div>
    );
  }

  const profit = stats.totalRevenue - stats.totalExpenses;
  const profitMargin =
    stats.totalRevenue > 0 ? (profit / stats.totalRevenue) * 100 : 0;

  // 状态翻译映射
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      IN_PROGRESS: tc("status.inProgress"),
      PLANNING: tc("status.pending"),
      TODO: tc("status.todo"),
      COMPLETED: tc("status.completed"),
    };
    return statusMap[status] || status;
  };

  // 优先级翻译映射
  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      HIGH: tc("priority.high"),
      MEDIUM: tc("priority.medium"),
      LOW: tc("priority.low"),
      URGENT: tc("priority.urgent"),
    };
    return priorityMap[priority] || priority;
  };

  return (
    <div className="space-y-6" data-oid="3d6ej1i">
      {/* 页面标题 */}
      <div className="rounded-lg p-6" data-oid="hvhmuv9">
        <h1 className="text-3xl font-bold theme-gradient-text" data-oid="jaqf1mt">
          {t("title")}
        </h1>
        <p className="text-gray-300" data-oid="gz:_k:u">
          {t("overview")}
        </p>
      </div>

      {/* 统计卡片 */}
      <div
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
        data-oid="cyv60:k"
      >
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="nv1xs4y"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="icd8x_f"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid="52nketf"
            >
              {t("totalUsers")}
            </CardTitle>
            <Users className="h-4 w-4 text-gray-300" data-oid=".p3-r._" />
          </CardHeader>
          <CardContent data-oid="i6_o4:x">
            <div className="text-2xl font-bold text-white" data-oid="1p9bsd_">
              {stats.totalUsers}
            </div>
            <p className="text-xs text-gray-300" data-oid="irje6io">
              +2 {t("comparedToLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="qekb3v."
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="zi447w9"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid=".ipfaf6"
            >
              {t("totalProjects")}
            </CardTitle>
            <FolderKanban
              className="h-4 w-4 text-gray-300"
              data-oid="cs8mg.i"
            />
          </CardHeader>
          <CardContent data-oid="9ua8s17">
            <div className="text-2xl font-bold text-white" data-oid="zz.0jlz">
              {stats.totalProjects}
            </div>
            <p className="text-xs text-gray-300" data-oid="ktzdizf">
              +3 {t("newThisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="wd:9bg5"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="b_tqrnd"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid="pigmk2."
            >
              {t("totalClients")}
            </CardTitle>
            <Handshake className="h-4 w-4 text-gray-300" data-oid="em9cuhh" />
          </CardHeader>
          <CardContent data-oid=":8vq_qk">
            <div className="text-2xl font-bold text-white" data-oid="83hlb3_">
              {stats.totalClients}
            </div>
            <p className="text-xs text-gray-300" data-oid="daj:xgg">
              +1 {t("newThisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="u-w_5hv"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="qef9cv3"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid="msh5mj9"
            >
              {t("activeTasks")}
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-gray-300" data-oid="rlk4uii" />
          </CardHeader>
          <CardContent data-oid="5re2:-r">
            <div className="text-2xl font-bold text-white" data-oid="m:8geng">
              {stats.activeTasks}
            </div>
            <p className="text-xs text-gray-300" data-oid="jjfjpn9">
              {t("pendingTasks")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 财务数据 */}
      <div className="grid gap-4 md:grid-cols-3" data-oid="co762c3">
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="uo7c:ze"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="_24ghb3"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid="xcbp_oy"
            >
              {t("totalRevenue")}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" data-oid="3_r4t4w" />
          </CardHeader>
          <CardContent data-oid="qwihuav">
            <div
              className="text-2xl font-bold text-green-400"
              data-oid="3ir:usd"
            >
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-green-300" data-oid="9fyx7z7">
              +12% {t("comparedToLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid=":_0wwk9"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="m1chwg0"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid="e6or42s"
            >
              {t("totalExpenses")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-400" data-oid="gh0d_6u" />
          </CardHeader>
          <CardContent data-oid="yql_oqn">
            <div className="text-2xl font-bold text-red-400" data-oid="l6w7w10">
              {formatCurrency(stats.totalExpenses)}
            </div>
            <p className="text-xs text-red-300" data-oid="z0ja3f3">
              +8% {t("comparedToLastMonth")}
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="_t5_s2-"
        >
          <CardHeader
            className="flex flex-row items-center justify-between space-y-0 pb-2"
            data-oid="04st-s4"
          >
            <CardTitle
              className="text-sm font-medium text-white"
              data-oid="of_xa48"
            >
              {t("netProfit")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" data-oid="_kvwuh6" />
          </CardHeader>
          <CardContent data-oid="ht9-zif">
            <div
              className="text-2xl font-bold text-blue-400"
              data-oid="64m:xso"
            >
              {formatCurrency(profit)}
            </div>
            <p className="text-xs text-blue-300" data-oid="n:o:402">
              {t("profitMargin")} {profitMargin.toFixed(1)}%
            </p>
            <Progress
              value={profitMargin}
              className="mt-2"
              data-oid="al9z0t3"
            />
          </CardContent>
        </Card>
      </div>

      {/* 最近项目和即将到来的任务 */}
      <div className="grid gap-6 md:grid-cols-2" data-oid="m4u0z65">
        {/* 最近项目 */}
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="9:frdx0"
        >
          <CardHeader data-oid="yade5yh">
            <CardTitle className="text-white" data-oid="tetagpb">
              {t("recentProjects")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" data-oid="18l6v-6">
            {stats.recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                data-oid="0dh3iw."
              >
                <div className="flex-1" data-oid="nt1mgwt">
                  <h4 className="font-medium text-white" data-oid="1-9ok_e">
                    {project.name}
                  </h4>
                  <p className="text-sm text-gray-300" data-oid="2.h0:a:">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
                <div
                  className="flex flex-col items-end gap-2"
                  data-oid="ycqszcj"
                >
                  <Badge
                    className={getStatusColor(project.status)}
                    data-oid="wszosam"
                  >
                    {getStatusText(project.status)}
                  </Badge>
                  <Badge
                    className={getPriorityColor(project.priority)}
                    data-oid="v:rc_eg"
                  >
                    {getPriorityText(project.priority)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 即将到来的任务 */}
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm theme-gradient-border"
          data-oid="e3m90nx"
        >
          <CardHeader data-oid="dkix--w">
            <CardTitle className="text-white" data-oid="1fluoyg">
              {t("upcomingTasks")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4" data-oid="h45n1ej">
            {stats.upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
                data-oid="1qdx2co"
              >
                <div className="flex-1" data-oid="lxomw.y">
                  <h4 className="font-medium text-white" data-oid="_h:pap3">
                    {task.title}
                  </h4>
                  <div
                    className="flex items-center gap-2 text-sm text-gray-300"
                    data-oid="ta35qwe"
                  >
                    <Clock className="h-3 w-3" data-oid="75ot1ai" />
                    {getRelativeTime(task.dueDate)}
                  </div>
                </div>
                <div
                  className="flex flex-col items-end gap-2"
                  data-oid="k8dc4kb"
                >
                  <Badge
                    className={getStatusColor(task.status)}
                    data-oid="i1b5zit"
                  >
                    {getStatusText(task.status)}
                  </Badge>
                  <Badge
                    className={getPriorityColor(task.priority)}
                    data-oid="rhcf5xf"
                  >
                    {getPriorityText(task.priority)}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

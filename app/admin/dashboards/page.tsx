"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  LayoutDashboard,
  Globe,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import useSWR from "swr";

interface Dashboard {
  id: string;
  title: string;
  description: string;
  isPublic: boolean;
  widgetCount: number;
  createdAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DashboardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, error, isLoading, mutate } = useSWR("/api/dashboards", fetcher);

  const dashboards: Dashboard[] = data?.dashboards || [];

  // 删除仪表板
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`确定要删除仪表板"${title}"吗？`)) return;

    try {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("删除失败");

      toast.success("仪表板已删除");
      mutate();
    } catch (error) {
      toast.error("删除失败");
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN");
  };

  // 过滤仪表板
  const filteredDashboards = dashboards.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">仪表板管理</h1>
            <p className="text-slate-600 mt-1">创建和管理数据可视化仪表板</p>
          </div>
          <Button
            onClick={() => router.push("/admin/dashboards/editor")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            创建仪表板
          </Button>
        </div>

        {/* 搜索栏 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索仪表板..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* 仪表板列表 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : filteredDashboards.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <LayoutDashboard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "未找到匹配的仪表板" : "还没有仪表板"}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? "尝试其他关键词" : "创建您的第一个数据可视化仪表板"}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push("/admin/dashboards/editor")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  创建仪表板
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDashboards.map((dashboard) => (
              <Card
                key={dashboard.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/dashboards/${dashboard.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <LayoutDashboard className="w-5 h-5 text-blue-600" />
                        {dashboard.isPublic ? (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            公开
                          </span>
                        ) : (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            私有
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg">{dashboard.title}</CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {dashboard.description || "暂无描述"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{dashboard.widgetCount}</span> 个小部件
                    </div>

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <div>创建于 {formatDate(dashboard.createdAt)}</div>
                      <div className="mt-1">
                        创建者: {dashboard.creator.firstName} {dashboard.creator.lastName}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/dashboards/${dashboard.id}`);
                        }}
                        className="flex-1"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        查看
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/dashboards/editor?id=${dashboard.id}`);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(dashboard.id, dashboard.title);
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

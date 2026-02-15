"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Play, Edit, Trash2, Calendar, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import useSWR from "swr";

interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
  config: any;
  createdAt: string;
  updatedAt: string;
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 12;

  // 
  const { data, error, isLoading, mutate } = useSWR(
    `/api/reports?page=${page}&limit=${limit}&search=${searchQuery}`,
    fetcher,
    {
      refreshInterval: 30000, // ?30 ?
    }
  );

  const reports = data?.reports || [];
  const pagination = data?.pagination || { page: 1, limit: 12, total: 0, totalPages: 1 };

  // 
  const handleExecute = async (reportId: string) => {
    try {
      toast.loading("...", { id: "execute" });

      const response = await fetch(`/api/reports/${reportId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "");
      }

      const data = await response.json();
      toast.success("", { id: "execute" });

      // 
      router.push(`/reports/${reportId}`);
    } catch (error) {
      console.error(":", error);
      toast.error(error instanceof Error ? error.message : "", { id: "execute" });
    }
  };

  // 
  const handleDelete = async (reportId: string, reportName: string) => {
    if (!confirm(`?${reportName}"`)) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "删除失败");
      }

      toast.success("报告已删除");
      mutate(); // 刷新列表
    } catch (error) {
      console.error("删除报告失败:", error);
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  };

  // 
  const getChartIcon = (type: string) => {
    switch (type) {
      case "table":
        return "";
      case "bar":
        return "";
      case "line":
        return "";
      case "pie":
        return "";
      default:
        return "";
    }
  };

  // 
  const getChartTypeName = (type: string) => {
    switch (type) {
      case "table":
        return "表格";
      case "bar":
        return "柱状图";
      case "line":
        return "折线图";
      case "pie":
        return "饼图";
      default:
        return "未知";
    }
  };

  // ?
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/*  */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="purple-gradient-title text-3xl font-bold text-slate-900">报告管理</h1>
            <p className="text-slate-600 mt-1">创建和管理您的业务报告</p>
          </div>
          <Button
            onClick={() => router.push("/reports/new")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            
          </Button>
        </div>

        {/* ?*/}
        <Card className="purple-gradient-card">
          <CardContent className="purple-gradient-card p-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1); // ?
                }}
                placeholder="?.."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/*  */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">...</p>
          </div>
        ) : error ? (
          <Card className="purple-gradient-card">
            <CardContent className="purple-gradient-card p-12 text-center">
              <div className="text-red-500 mb-2">?/div>
              <p className="text-gray-600"></p>
            </CardContent>
          </Card>
        ) : reports.length === 0 ? (
          <Card className="purple-gradient-card">
            <CardContent className="purple-gradient-card p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? "" : "?}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery
                  ? "?
                  : '""?}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => router.push("/reports/new")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/*  */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report: Report) => (
                <Card
                  key={report.id}
                  className="purple-gradient-card hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(`/reports/${report.id}`)}
                >
                  <CardHeader className="purple-gradient-card">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getChartIcon(report.type)}</span>
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                            {getChartTypeName(report.type)}
                          </span>
                        </div>
                        <CardTitle className="purple-gradient-title purple-gradient-card text-lg">{report.name}</CardTitle>
                        <CardDescription className="purple-gradient-card mt-1 line-clamp-2">
                          {report.description || ""}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="purple-gradient-card">
                    <div className="space-y-3">
                      {/*  */}
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">?</span>
                          <span>{report.config?.datasource || ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">:</span>
                          <span>{report.config?.fields?.length || 0} ?/span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">?</span>
                          <span>{report.config?.filters?.length || 0} ?/span>
                        </div>
                      </div>

                      {/*  */}
                      <div className="text-xs text-gray-500 pt-2 border-t">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                        <div className="mt-1">
                          ? {report.creator.firstName} {report.creator.lastName}
                        </div>
                      </div>

                      {/*  */}
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecute(report.id);
                          }}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/reports/${report.id}/edit`);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(report.id, report.name);
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

            {/*  */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  ?
                </Button>
                <span className="text-sm text-gray-600">
                  ?{page} / {pagination.totalPages} ?{pagination.total} 
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  ?
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

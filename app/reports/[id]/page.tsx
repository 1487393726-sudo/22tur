"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Play, Edit, Trash2, RefreshCw, Download, FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import useSWR from "swr";
import { ReportChart } from "@/components/reports/report-chart";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ReportDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;

  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  // 获取报表详情
  const { data: reportData, error: reportError, isLoading: reportLoading } = useSWR(
    `/api/reports/${reportId}`,
    fetcher
  );

  const report = reportData?.report;

  // 执行报表
  const handleExecute = async () => {
    try {
      setExecuting(true);
      toast.loading("正在执行报表...", { id: "execute" });

      const response = await fetch(`/api/reports/${reportId}/execute`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "执行失败");
      }

      const data = await response.json();
      setResult(data.result);
      toast.success("报表执行成功", { id: "execute" });
    } catch (error) {
      console.error("执行报表失败:", error);
      toast.error(error instanceof Error ? error.message : "执行失败", { id: "execute" });
    } finally {
      setExecuting(false);
    }
  };

  // 删除报表
  const handleDelete = async () => {
    if (!confirm(`确定要删除报表"${report?.name}"吗？此操作不可恢复。`)) {
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

      toast.success("报表已删除");
      router.push("/reports");
    } catch (error) {
      console.error("删除报表失败:", error);
      toast.error(error instanceof Error ? error.message : "删除失败");
    }
  };

  // 导出数据为 CSV
  const handleExportCSV = () => {
    if (!result || !result.data || result.data.length === 0) {
      toast.error("没有数据可导出");
      return;
    }

    try {
      const fields = report.config.fields;
      const data = result.data;

      // 生成 CSV 内容
      const headers = fields.join(",");
      const rows = data.map((row: any) =>
        fields.map((field: string) => {
          const value = row[field];
          // 处理包含逗号的值
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value ?? "";
        }).join(",")
      );

      const csv = [headers, ...rows].join("\n");

      // 下载文件
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${report.name}_${new Date().toISOString().split("T")[0]}.csv`;
      link.click();

      toast.success("数据已导出");
    } catch (error) {
      console.error("导出失败:", error);
      toast.error("导出失败");
    }
  };

  // 导出为 Excel
  const handleExportExcel = async () => {
    if (!result || !result.data || result.data.length === 0) {
      toast.error("没有数据可导出");
      return;
    }

    try {
      toast.loading("正在生成 Excel...", { id: "export-excel" });
      
      const response = await fetch(`/api/reports/${reportId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "excel" }),
      });

      if (!response.ok) {
        throw new Error("导出失败");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.name}_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Excel 导出成功", { id: "export-excel" });
    } catch (error) {
      console.error("导出 Excel 失败:", error);
      toast.error("导出失败", { id: "export-excel" });
    }
  };

  // 导出为 PDF
  const handleExportPDF = async () => {
    if (!result || !result.data || result.data.length === 0) {
      toast.error("没有数据可导出");
      return;
    }

    try {
      toast.loading("正在生成 PDF...", { id: "export-pdf" });
      
      const response = await fetch(`/api/reports/${reportId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: "pdf" }),
      });

      if (!response.ok) {
        throw new Error("导出失败");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.name}_${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF 导出成功", { id: "export-pdf" });
    } catch (error) {
      console.error("导出 PDF 失败:", error);
      toast.error("导出失败", { id: "export-pdf" });
    }
  };

  // 格式化单元格值
  const formatCellValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "-";
    }
    if (value instanceof Date || (typeof value === "string" && !isNaN(Date.parse(value)))) {
      try {
        const date = new Date(value);
        return date.toLocaleString("zh-CN");
      } catch {
        return String(value);
      }
    }
    if (typeof value === "boolean") {
      return value ? "是" : "否";
    }
    if (typeof value === "number") {
      return value.toLocaleString("zh-CN");
    }
    return String(value);
  };

  // 获取图表类型名称
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

  // 获取数据源字段信息
  const getFieldLabel = (fieldName: string) => {
    // 这里可以从数据源 API 获取字段标签
    // 简化处理，直接返回字段名
    return fieldName;
  };

  if (reportLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-500">加载报表详情...</p>
          </div>
        </div>
      </div>
    );
  }

  if (reportError || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-red-500 mb-2">❌</div>
              <p className="text-gray-600">报表不存在或加载失败</p>
              <Button onClick={() => router.push("/reports")} className="mt-4">
                返回报表列表
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/reports")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{report.name}</h1>
              <p className="text-slate-600 mt-1">{report.description || "暂无描述"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleExecute}
              disabled={executing}
              className="bg-green-600 hover:bg-green-700"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  执行报表
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push(`/reports/${reportId}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              编辑
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              删除
            </Button>
          </div>
        </div>

        {/* 报表配置 */}
        <Card>
          <CardHeader>
            <CardTitle>报表配置</CardTitle>
            <CardDescription>查看报表的配置信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">数据源</div>
                <div className="font-medium">{report.config?.datasource || "未知"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">字段数量</div>
                <div className="font-medium">{report.config?.fields?.length || 0} 个</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">筛选条件</div>
                <div className="font-medium">{report.config?.filters?.length || 0} 个</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">图表类型</div>
                <div className="font-medium">{getChartTypeName(report.type)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 报表结果 */}
        {result ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>报表结果</CardTitle>
                  <CardDescription>
                    共 {result.total} 条数据
                    {result.aggregated && ` · ${result.aggregated.length} 个聚合结果`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExecute} disabled={executing}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${executing ? "animate-spin" : ""}`} />
                    刷新
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                    <Download className="w-4 h-4 mr-2" />
                    CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportExcel} className="text-green-600 hover:text-green-700">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF} className="text-red-600 hover:text-red-700">
                    <FileText className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {report.type === "table" ? (
                // 表格展示
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        {report.config.fields.map((field: string) => (
                          <th key={field} className="text-left p-3 font-medium">
                            {getFieldLabel(field)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((row: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          {report.config.fields.map((field: string) => (
                            <td key={field} className="p-3">
                              {formatCellValue(row[field])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // 图表展示
                <div>
                  {result.aggregated && result.aggregated.length > 0 ? (
                    <ReportChart
                      type={report.type as "bar" | "line" | "pie"}
                      data={result.aggregated}
                      config={report.config}
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="font-medium">暂无聚合数据</p>
                      <p className="text-sm mt-2">请确保报表配置了聚合方式</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">点击"执行报表"查看结果</h3>
              <p className="text-gray-600 mb-4">报表将根据配置的数据源和筛选条件生成结果</p>
              <Button onClick={handleExecute} disabled={executing} className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                执行报表
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Filter,
  Eye,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  type: string;
  date: string;
  period: string;
  status: "AVAILABLE" | "GENERATING" | "PENDING";
  downloadUrl?: string;
}

export default function InvestmentReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ALL");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // 模拟报告数据
    const mockReports: Report[] = [
      {
        id: "1",
        title: "2024年第三季度投资报告",
        type: "季度报告",
        date: "2024-09-30",
        period: "2024 Q3",
        status: "AVAILABLE",
        downloadUrl: "/api/reports/q3-2024.pdf",
      },
      {
        id: "2",
        title: "2024年第二季度投资报告",
        type: "季度报告",
        date: "2024-06-30",
        period: "2024 Q2",
        status: "AVAILABLE",
        downloadUrl: "/api/reports/q2-2024.pdf",
      },
      {
        id: "3",
        title: "2024年年度投资总结报告",
        type: "年度报告",
        date: "2024-12-31",
        period: "2024",
        status: "GENERATING",
      },
      {
        id: "4",
        title: "投资组合风险评估报告",
        type: "风险评估",
        date: "2024-10-15",
        period: "2024-10",
        status: "AVAILABLE",
        downloadUrl: "/api/reports/risk-assessment.pdf",
      },
    ];

    setTimeout(() => {
      setReports(mockReports);
      setLoading(false);
    }, 1000);
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN");
  };

  const filteredReports =
    filter === "ALL"
      ? reports
      : reports.filter((r) => r.type === filter);

  return (
    <div className="min-h-screen space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="purple-gradient-title text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="h-8 w-8" />
          投资报告
        </h1>
        <p className="purple-gradient-text">
          查看和下载您的投资报告和文档
        </p>
      </div>

      {/* 筛选器 */}
      <Card className="purple-gradient-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="flex gap-2">
              <Button
                variant={filter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("ALL")}
              >
                全部
              </Button>
              <Button
                variant={filter === "季度报告" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("季度报告")}
              >
                季度报告
              </Button>
              <Button
                variant={filter === "年度报告" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("年度报告")}
              >
                年度报告
              </Button>
              <Button
                variant={filter === "风险评估" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("风险评估")}
              >
                风险评估
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 报告列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredReports.length === 0 ? (
          <Card className="col-span-2 purple-gradient-card">
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="purple-gradient-text">暂无报告</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="purple-gradient-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="purple-gradient-title text-lg mb-2">{report.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm purple-gradient-text">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(report.date)}
                      </span>
                      <span>{report.period}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      report.status === "AVAILABLE"
                        ? "bg-green-500/20 text-green-500 border border-green-500/30"
                        : report.status === "GENERATING"
                        ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
                        : "bg-gray-500/20 text-gray-500 border border-gray-500/30"
                    }`}
                  >
                    {report.status === "AVAILABLE"
                      ? "可用"
                      : report.status === "GENERATING"
                      ? "生成中"
                      : "待生成"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="purple-gradient-text text-sm">类型：</span>
                  <span className="purple-gradient-title text-sm font-medium">{report.type}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  {report.status === "AVAILABLE" && report.downloadUrl && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(report.downloadUrl)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        查看
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = report.downloadUrl!;
                          link.download = `${report.title}.pdf`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        下载
                      </Button>
                    </>
                  )}
                  {report.status === "GENERATING" && (
                    <Button variant="outline" size="sm" disabled>
                      生成中...
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

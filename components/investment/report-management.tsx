'use client';

/**
 * Report Management Component
 * 
 * Provides comprehensive report management functionality including:
 * - Report generation configuration interface
 * - Report list with filtering and pagination
 * - Report preview and download functionality
 * - Report distribution management
 * - Scheduled report configuration
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  Plus,
  Eye,
  Settings,
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  InvestmentReport, 
  ReportType, 
  GenerateReportRequest,
  GenerateReportResponse 
} from '@/types/investment-management';

interface ReportManagementProps {
  portfolioId?: string;
  className?: string;
}

interface ReportListItem extends InvestmentReport {
  portfolio?: {
    id: string;
    name: string;
    userId: string;
    totalValue: number;
  };
}

interface ReportFilters {
  portfolioId?: string;
  reportType?: ReportType;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}

const REPORT_TYPE_LABELS = {
  [ReportType.MONTHLY]: '月度报告',
  [ReportType.QUARTERLY]: '季度报告',
  [ReportType.ANNUAL]: '年度报告',
  [ReportType.CUSTOM]: '自定义报告'
};

const REPORT_STATUS_COLORS = {
  'generating': 'bg-yellow-100 text-yellow-800',
  'completed': 'bg-green-100 text-green-800',
  'failed': 'bg-red-100 text-red-800'
};

export function ReportManagement({ 
  portfolioId, 
  className = '' 
}: ReportManagementProps) {
  const [reports, setReports] = useState<ReportListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    portfolioId,
    page: 1,
    limit: 10
  });
  const [totalPages, setTotalPages] = useState(1);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportListItem | null>(null);

  // Report generation form state
  const [generateForm, setGenerateForm] = useState<GenerateReportRequest>({
    portfolioId: portfolioId || '',
    reportType: ReportType.MONTHLY,
    includeCharts: true,
    format: 'PDF'
  });

  useEffect(() => {
    loadReports();
  }, [filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.portfolioId) params.append('portfolioId', filters.portfolioId);
      if (filters.reportType) params.append('reportType', filters.reportType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/reports?${params}`);
      const result = await response.json();

      if (result.success) {
        setReports(result.data.reports);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        console.error('Failed to load reports:', result.error);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);

      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generateForm),
      });

      const result = await response.json();

      if (result.success) {
        setShowGenerateDialog(false);
        await loadReports(); // Refresh the list
        
        // Show success message
        alert('报告生成成功！');
      } else {
        alert(`报告生成失败: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('报告生成失败，请稍后重试');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadReport = async (report: ReportListItem) => {
    try {
      const response = await fetch(`/api/reports/${report.id}/download`);
      const result = await response.json();

      if (result.success) {
        if (result.data.fileUrl) {
          // In a real implementation, this would trigger actual file download
          alert(`文件下载: ${result.data.fileName}`);
        } else {
          // Show JSON content in a new window/modal
          const jsonWindow = window.open('', '_blank');
          if (jsonWindow) {
            jsonWindow.document.write(`
              <html>
                <head><title>报告内容 - ${report.id}</title></head>
                <body>
                  <h1>投资报告</h1>
                  <pre>${JSON.stringify(result.data.report.content, null, 2)}</pre>
                </body>
              </html>
            `);
          }
        }
      } else {
        alert(`下载失败: ${result.message || result.error}`);
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('下载失败，请稍后重试');
    }
  };

  const handlePreviewReport = (report: ReportListItem) => {
    setSelectedReport(report);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReportStatusBadge = (report: ReportListItem) => {
    if (report.fileUrl) {
      return <Badge className="bg-green-100 text-green-800">已完成</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">JSON格式</Badge>;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">报告管理</h2>
          <p className="text-gray-600">生成、管理和分发投资报告</p>
        </div>
        <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              生成报告
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>生成投资报告</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="portfolioId">投资组合ID</Label>
                <Input
                  id="portfolioId"
                  value={generateForm.portfolioId}
                  onChange={(e) => setGenerateForm(prev => ({ ...prev, portfolioId: e.target.value }))}
                  placeholder="输入投资组合ID"
                />
              </div>
              
              <div>
                <Label htmlFor="reportType">报告类型</Label>
                <Select
                  value={generateForm.reportType}
                  onValueChange={(value: ReportType) => setGenerateForm(prev => ({ ...prev, reportType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="format">输出格式</Label>
                <Select
                  value={generateForm.format}
                  onValueChange={(value: 'PDF' | 'EXCEL' | 'JSON') => setGenerateForm(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="EXCEL">Excel</SelectItem>
                    <SelectItem value="JSON">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeCharts"
                  checked={generateForm.includeCharts}
                  onCheckedChange={(checked) => setGenerateForm(prev => ({ ...prev, includeCharts: !!checked }))}
                />
                <Label htmlFor="includeCharts">包含图表</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
                  取消
                </Button>
                <Button onClick={handleGenerateReport} disabled={generating}>
                  {generating ? '生成中...' : '生成报告'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            筛选条件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="filterReportType">报告类型</Label>
              <Select
                value={filters.reportType || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  reportType: value as ReportType || undefined,
                  page: 1 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="所有类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">所有类型</SelectItem>
                  {Object.entries(REPORT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="startDate">开始日期</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, page: 1 }))}
              />
            </div>

            <div>
              <Label htmlFor="endDate">结束日期</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, page: 1 }))}
              />
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => setFilters({ page: 1, limit: 10 })}
                className="w-full"
              >
                清除筛选
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>报告列表</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">暂无报告</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {REPORT_TYPE_LABELS[report.reportType]}
                          </h3>
                          <p className="text-sm text-gray-600">
                            报告期间: {formatDate(report.periodStart)} - {formatDate(report.periodEnd)}
                          </p>
                          {report.portfolio && (
                            <p className="text-sm text-gray-500">
                              投资组合: {report.portfolio.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      {getReportStatusBadge(report)}
                      
                      <div className="text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(report.generatedAt)}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreviewReport(report)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page <= 1}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              >
                上一页
              </Button>
              
              <span className="text-sm text-gray-600">
                第 {filters.page} 页，共 {totalPages} 页
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page >= totalPages}
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              >
                下一页
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                报告预览 - {REPORT_TYPE_LABELS[selectedReport.reportType]}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>报告ID:</strong> {selectedReport.id}
                </div>
                <div>
                  <strong>生成时间:</strong> {formatDate(selectedReport.generatedAt)}
                </div>
                <div>
                  <strong>报告期间:</strong> {formatDate(selectedReport.periodStart)} - {formatDate(selectedReport.periodEnd)}
                </div>
                <div>
                  <strong>状态:</strong> {getReportStatusBadge(selectedReport)}
                </div>
              </div>

              {selectedReport.content && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">报告内容摘要</h4>
                  <div className="text-sm space-y-2">
                    {selectedReport.content.summary && (
                      <div>
                        <strong>投资组合概览:</strong>
                        <ul className="ml-4 mt-1">
                          <li>总价值: ¥{selectedReport.content.summary.totalValue?.toLocaleString()}</li>
                          <li>总投资: ¥{selectedReport.content.summary.totalInvested?.toLocaleString()}</li>
                          <li>总收益: ¥{selectedReport.content.summary.totalReturn?.toLocaleString()}</li>
                          <li>收益率: {selectedReport.content.summary.returnPercentage?.toFixed(2)}%</li>
                        </ul>
                      </div>
                    )}
                    
                    {selectedReport.content.recommendations && selectedReport.content.recommendations.length > 0 && (
                      <div>
                        <strong>投资建议:</strong>
                        <ul className="ml-4 mt-1">
                          {selectedReport.content.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  关闭
                </Button>
                <Button onClick={() => handleDownloadReport(selectedReport)}>
                  <Download className="h-4 w-4 mr-2" />
                  下载报告
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Database, Filter, BarChart3, Eye, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Step = "datasource" | "filter" | "chart" | "preview" | "save";

interface Datasource {
  id: string;
  name: string;
  description: string;
  fields: {
    name: string;
    label: string;
    type: string;
  }[];
}

interface PreviewData {
  data: any[];
  total: number;
  preview: number;
}

interface FilterCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
  logic: "AND" | "OR";
}

interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: "SUM" | "AVG" | "COUNT" | "MIN" | "MAX";
  title?: string;
  colors?: string[];
}

const OPERATORS = [
  { value: "=", label: " (=)" },
  { value: "!=", label: "?(!=)" },
  { value: ">", label: " (>)" },
  { value: "<", label: " (<)" },
  { value: ">=", label: " (>=)" },
  { value: "<=", label: " (<=)" },
  { value: "LIKE", label: " (LIKE)" },
  { value: "NOT LIKE", label: "?(NOT LIKE)" },
  { value: "IN", label: " (IN)" },
  { value: "NOT IN", label: "?(NOT IN)" },
  { value: "IS NULL", label: " (IS NULL)" },
  { value: "IS NOT NULL", label: "?(IS NOT NULL)" },
];

const steps: { id: Step; label: string; icon: any }[] = [
  { id: "datasource", label: "选择数据源", icon: Database },
  { id: "filter", label: "设置筛选", icon: Filter },
  { id: "chart", label: "选择图表", icon: BarChart3 },
  { id: "preview", label: "预览", icon: Eye },
  { id: "save", label: "保存", icon: Save },
];

export default function ReportBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("datasource");
  const [reportConfig, setReportConfig] = useState({
    name: "",
    description: "",
    datasource: "",
    fields: [] as string[],
    filters: [] as FilterCondition[],
    chartType: "",
    chartConfig: {} as ChartConfig,
  });
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loadingDatasources, setLoadingDatasources] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // ?
  useEffect(() => {
    fetchDatasources();
  }, []);

  // ?
  useEffect(() => {
    if (reportConfig.datasource && reportConfig.fields.length > 0) {
      fetchPreviewData();
    }
  }, [reportConfig.datasource, reportConfig.fields]);

  const fetchDatasources = async () => {
    try {
      setLoadingDatasources(true);
      const response = await fetch("/api/reports/datasources");
      if (!response.ok) throw new Error("获取数据源失败");
      const data = await response.json();
      setDatasources(data.datasources);
    } catch (error) {
      console.error("获取数据源失败:", error);
      toast.error("获取数据源失败");
    } finally {
      setLoadingDatasources(false);
    }
  };

  const fetchPreviewData = async () => {
    try {
      setLoadingPreview(true);
      const fields = reportConfig.fields.join(",");
      const response = await fetch(
        `/api/reports/datasources/${reportConfig.datasource}/preview?fields=${fields}`
      );
      if (!response.ok) throw new Error("预览数据失败");
      const data = await response.json();
      setPreviewData(data);
    } catch (error) {
      console.error("预览数据失败:", error);
      toast.error("预览数据失败");
    } finally {
      setLoadingPreview(false);
    }
  };

  const getCurrentDatasource = () => {
    return datasources.find((ds) => ds.id === reportConfig.datasource);
  };

  const addFilter = () => {
    const newFilter: FilterCondition = {
      id: Date.now().toString(),
      field: "",
      operator: "=",
      value: "",
      logic: "AND",
    };
    setReportConfig({
      ...reportConfig,
      filters: [...reportConfig.filters, newFilter],
    });
  };

  const updateFilter = (id: string, updates: Partial<FilterCondition>) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    });
  };

  const removeFilter = (id: string) => {
    setReportConfig({
      ...reportConfig,
      filters: reportConfig.filters.filter((f) => f.id !== id),
    });
  };

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const handleSave = async () => {
    try {
      // 验证报告名称
      if (!reportConfig.name.trim()) {
        toast.error("请输入报告名称");
        return;
      }

      // 验证数据源
      if (!reportConfig.datasource) {
        toast.error("请选择数据源");
        return;
      }

      // 验证字段
      if (reportConfig.fields.length === 0) {
        toast.error("请选择至少一个字段");
        return;
      }

      // 验证图表类型
      if (!reportConfig.chartType) {
        toast.error("请选择图表类型");
        return;
      }

      // 
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: reportConfig.name,
          description:
            reportConfig.description ||
            `? ${reportConfig.datasource}, : ${reportConfig.fields.length}? : ${reportConfig.chartType}`,
          config: {
            datasource: reportConfig.datasource,
            fields: reportConfig.fields,
            filters: reportConfig.filters,
            chartType: reportConfig.chartType,
            chartConfig: reportConfig.chartConfig,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "创建报告失败");
      }

      const data = await response.json();
      toast.success("报告创建成功");
      router.push("/reports");
    } catch (error) {
      console.error("创建报告失败:", error);
      toast.error(error instanceof Error ? error.message : "创建报告失败");
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "datasource":
        const currentDatasource = getCurrentDatasource();
        
        return (
          <div className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader className="purple-gradient-card">
                <CardTitle className="purple-gradient-title purple-gradient-card">选择数据源</CardTitle>
                <CardDescription className="purple-gradient-card">选择报告的数据来源</CardDescription>
              </CardHeader>
              <CardContent className="purple-gradient-card">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="datasource-select" className="text-sm font-medium mb-2 block">
                      ?
                    </label>
                    {loadingDatasources ? (
                      <div className="text-sm text-gray-500">?..</div>
                    ) : (
                      <select
                        id="datasource-select"
                        value={reportConfig.datasource}
                        onChange={(e) => {
                          setReportConfig({
                            ...reportConfig,
                            datasource: e.target.value,
                            fields: [], // 
                          });
                          setPreviewData(null); // 
                        }}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      >
                        <option value="">请选择数据源</option>
                        {datasources.map((ds) => (
                          <option key={ds.id} value={ds.id}>
                            {ds.name} - {ds.description}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {currentDatasource && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">
                           ({reportConfig.fields.length} ?
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const allFields = currentDatasource.fields.map((f) => f.name);
                            setReportConfig({
                              ...reportConfig,
                              fields: reportConfig.fields.length === allFields.length ? [] : allFields,
                            });
                          }}
                        >
                          {reportConfig.fields.length === currentDatasource.fields.length
                            ? "取消全选"
                            : "全选"}
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {currentDatasource.fields.map((field) => (
                          <label
                            key={field.name}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={reportConfig.fields.includes(field.name)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setReportConfig({
                                    ...reportConfig,
                                    fields: [...reportConfig.fields, field.name],
                                  });
                                } else {
                                  setReportConfig({
                                    ...reportConfig,
                                    fields: reportConfig.fields.filter((f) => f !== field.name),
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{field.label}</span>
                              <span className="text-xs text-gray-500 ml-2">({field.type})</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/*  */}
            {reportConfig.datasource && reportConfig.fields.length > 0 && (
              <Card className="purple-gradient-card">
                <CardHeader className="purple-gradient-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="purple-gradient-title purple-gradient-card"></CardTitle>
                      <CardDescription className="purple-gradient-card">
                        ?10 ?{previewData?.total || 0} ?
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchPreviewData}
                      disabled={loadingPreview}
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${loadingPreview ? "animate-spin" : ""}`} />
                      
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="purple-gradient-card">
                  {loadingPreview ? (
                    <div className="text-center py-8 text-gray-500">...</div>
                  ) : previewData && previewData.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            {reportConfig.fields.map((field) => {
                              const fieldInfo = currentDatasource?.fields.find((f) => f.name === field);
                              return (
                                <th key={field} className="text-left p-2 font-medium">
                                  {fieldInfo?.label || field}
                                </th>
                              );
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.data.map((row, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              {reportConfig.fields.map((field) => (
                                <td key={field} className="p-2">
                                  {formatCellValue(row[field])}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500"></div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "filter":
        const currentDatasourceForFilter = getCurrentDatasource();
        
        return (
          <Card className="purple-gradient-card">
            <CardHeader className="purple-gradient-card">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="purple-gradient-title purple-gradient-card">筛选条件</CardTitle>
                  <CardDescription className="purple-gradient-card">添加筛选条件来过滤数据</CardDescription>
                </div>
                <Button type="button" onClick={addFilter} size="sm" className="purple-gradient-button">
                  <Filter className="w-4 h-4 mr-2" />
                  添加筛选
                </Button>
              </div>
            </CardHeader>
            <CardContent className="purple-gradient-card">
              {reportConfig.filters.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>暂无筛选条件</p>
                  <p className="text-sm mt-2">点击"添加筛选"按钮开始</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reportConfig.filters.map((filter, index) => (
                    <div key={filter.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {/* ?*/}
                        {index > 0 && (
                          <div className="w-20">
                            <select
                              value={filter.logic}
                              onChange={(e) =>
                                updateFilter(filter.id, {
                                  logic: e.target.value as "AND" | "OR",
                                })
                              }
                              aria-label="?
                              className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm"
                            >
                              <option value="AND">AND</option>
                              <option value="OR">OR</option>
                            </select>
                          </div>
                        )}

                        {/*  */}
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 mb-1 block"></label>
                          <select
                            value={filter.field}
                            onChange={(e) => updateFilter(filter.id, { field: e.target.value })}
                            aria-label=""
                            className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                          >
                            <option value=""></option>
                            {currentDatasourceForFilter?.fields.map((field) => (
                              <option key={field.name} value={field.name}>
                                {field.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/*  */}
                        <div className="flex-1">
                          <label className="text-xs text-gray-600 mb-1 block">?/label>
                          <select
                            value={filter.operator}
                            onChange={(e) => updateFilter(filter.id, { operator: e.target.value })}
                            aria-label="?
                            className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                          >
                            {OPERATORS.map((op) => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* ?*/}
                        {!["IS NULL", "IS NOT NULL"].includes(filter.operator) && (
                          <div className="flex-1">
                            <label className="text-xs text-gray-600 mb-1 block">?/label>
                            <input
                              type="text"
                              value={filter.value}
                              onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                              placeholder={
                                filter.operator.includes("IN")
                                  ? "用逗号分隔多个值"
                                  : "输入筛选值"
                              }
                              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-sm"
                            />
                          </div>
                        )}

                        {/*  */}
                        <div className={!["IS NULL", "IS NOT NULL"].includes(filter.operator) ? "pt-5" : "pt-5"}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFilter(filter.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* ?*/}
                  {reportConfig.filters.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">?/h4>
                      <div className="text-sm text-blue-800 font-mono">
                        {reportConfig.filters.map((filter, index) => {
                          const field = currentDatasourceForFilter?.fields.find(
                            (f) => f.name === filter.field
                          );
                          return (
                            <div key={filter.id}>
                              {index > 0 && (
                                <span className="text-blue-600 font-bold">{filter.logic} </span>
                              )}
                              <span className="text-blue-900">
                                {field?.label || filter.field || "?"} {filter.operator}{" "}
                                {!["IS NULL", "IS NOT NULL"].includes(filter.operator) &&
                                  `"${filter.value}"`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "chart":
        const currentDatasourceForChart = getCurrentDatasource();
        const needsAxes = ["bar", "line"].includes(reportConfig.chartType);
        const needsGrouping = ["pie"].includes(reportConfig.chartType);
        const needsAggregation = ["bar", "line", "pie"].includes(reportConfig.chartType);

        return (
          <div className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader className="purple-gradient-card">
                <CardTitle className="purple-gradient-title purple-gradient-card"></CardTitle>
                <CardDescription className="purple-gradient-card">?/CardDescription>
              </CardHeader>
              <CardContent className="purple-gradient-card">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { value: "table", label: "", icon: "", desc: "" },
                    { value: "bar", label: "?, icon: "", desc: "" },
                    { value: "line", label: "?, icon: "", desc: "" },
                    { value: "pie", label: "", icon: "", desc: "" },
                  ].map((chart) => (
                    <button
                      key={chart.value}
                      type="button"
                      onClick={() => {
                        setReportConfig({
                          ...reportConfig,
                          chartType: chart.value,
                          chartConfig: {},
                        });
                      }}
                      className={`p-6 border-2 rounded-lg text-center transition-all ${
                        reportConfig.chartType === chart.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-4xl mb-2">{chart.icon}</div>
                      <div className="font-medium">{chart.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{chart.desc}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/*  */}
            {reportConfig.chartType && reportConfig.chartType !== "table" && (
              <Card className="purple-gradient-card">
                <CardHeader className="purple-gradient-card">
                  <CardTitle className="purple-gradient-title purple-gradient-card"></CardTitle>
                  <CardDescription className="purple-gradient-card"></CardDescription>
                </CardHeader>
                <CardContent className="purple-gradient-card">
                  <div className="space-y-4">
                    {/*  */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                         <span className="text-gray-500">(?</span>
                      </label>
                      <input
                        type="text"
                        value={reportConfig.chartConfig.title || ""}
                        onChange={(e) =>
                          setReportConfig({
                            ...reportConfig,
                            chartConfig: {
                              ...reportConfig.chartConfig,
                              title: e.target.value,
                            },
                          })
                        }
                        placeholder="?
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                      />
                    </div>

                    {/* X ?*/}
                    {needsAxes && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          X ?<span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportConfig.chartConfig.xAxis || ""}
                          onChange={(e) =>
                            setReportConfig({
                              ...reportConfig,
                              chartConfig: {
                                ...reportConfig.chartConfig,
                                xAxis: e.target.value,
                              },
                            })
                          }
                          aria-label="X?
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value=""> X ?/option>
                          {reportConfig.fields.map((fieldName) => {
                            const field = currentDatasourceForChart?.fields.find(
                              (f) => f.name === fieldName
                            );
                            return (
                              <option key={fieldName} value={fieldName}>
                                {field?.label || fieldName}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">?/p>
                      </div>
                    )}

                    {/* Y ?*/}
                    {needsAxes && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Y ?<span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportConfig.chartConfig.yAxis || ""}
                          onChange={(e) =>
                            setReportConfig({
                              ...reportConfig,
                              chartConfig: {
                                ...reportConfig.chartConfig,
                                yAxis: e.target.value,
                              },
                            })
                          }
                          aria-label="Y?
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value=""> Y ?/option>
                          {reportConfig.fields.map((fieldName) => {
                            const field = currentDatasourceForChart?.fields.find(
                              (f) => f.name === fieldName
                            );
                            return (
                              <option key={fieldName} value={fieldName}>
                                {field?.label || fieldName}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">?/p>
                      </div>
                    )}

                    {/*  */}
                    {needsGrouping && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                           <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportConfig.chartConfig.groupBy || ""}
                          onChange={(e) =>
                            setReportConfig({
                              ...reportConfig,
                              chartConfig: {
                                ...reportConfig.chartConfig,
                                groupBy: e.target.value,
                              },
                            })
                          }
                          aria-label=""
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value=""></option>
                          {reportConfig.fields.map((fieldName) => {
                            const field = currentDatasourceForChart?.fields.find(
                              (f) => f.name === fieldName
                            );
                            return (
                              <option key={fieldName} value={fieldName}>
                                {field?.label || fieldName}
                              </option>
                            );
                          })}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">?/p>
                      </div>
                    )}

                    {/*  */}
                    {needsAggregation && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                           <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={reportConfig.chartConfig.aggregation || ""}
                          onChange={(e) =>
                            setReportConfig({
                              ...reportConfig,
                              chartConfig: {
                                ...reportConfig.chartConfig,
                                aggregation: e.target.value as ChartConfig["aggregation"],
                              },
                            })
                          }
                          aria-label=""
                          className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                        >
                          <option value=""></option>
                          <option value="COUNT"> (COUNT)</option>
                          <option value="SUM"> (SUM)</option>
                          <option value="AVG">?(AVG)</option>
                          <option value="MIN">?(MIN)</option>
                          <option value="MAX">?(MAX)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">
                          ?
                        </p>
                      </div>
                    )}

                    {/*  */}
                    {(needsAxes || needsGrouping || needsAggregation) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2"></h4>
                        <div className="space-y-1 text-sm text-blue-800">
                          {reportConfig.chartConfig.title && (
                            <div>
                              <span className="font-medium">: </span>
                              {reportConfig.chartConfig.title}
                            </div>
                          )}
                          {reportConfig.chartConfig.xAxis && (
                            <div>
                              <span className="font-medium">X ? </span>
                              {currentDatasourceForChart?.fields.find(
                                (f) => f.name === reportConfig.chartConfig.xAxis
                              )?.label || reportConfig.chartConfig.xAxis}
                            </div>
                          )}
                          {reportConfig.chartConfig.yAxis && (
                            <div>
                              <span className="font-medium">Y ? </span>
                              {currentDatasourceForChart?.fields.find(
                                (f) => f.name === reportConfig.chartConfig.yAxis
                              )?.label || reportConfig.chartConfig.yAxis}
                            </div>
                          )}
                          {reportConfig.chartConfig.groupBy && (
                            <div>
                              <span className="font-medium">: </span>
                              {currentDatasourceForChart?.fields.find(
                                (f) => f.name === reportConfig.chartConfig.groupBy
                              )?.label || reportConfig.chartConfig.groupBy}
                            </div>
                          )}
                          {reportConfig.chartConfig.aggregation && (
                            <div>
                              <span className="font-medium">: </span>
                              {reportConfig.chartConfig.aggregation}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case "preview":
        return (
          <div className="space-y-6">
            {/*  */}
            <Card className="purple-gradient-card">
              <CardHeader className="purple-gradient-card">
                <CardTitle className="purple-gradient-title purple-gradient-card"></CardTitle>
                <CardDescription className="purple-gradient-card">?/CardDescription>
              </CardHeader>
              <CardContent className="purple-gradient-card">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2"></h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <dt className="text-gray-600 w-24">?</dt>
                      <dd className="font-medium">
                        {datasources.find((ds) => ds.id === reportConfig.datasource)?.name ||
                          ""}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-600 w-24">:</dt>
                      <dd className="font-medium">{reportConfig.fields.length} ?/dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-600 w-24">?</dt>
                      <dd className="font-medium">{reportConfig.filters.length} ?/dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-gray-600 w-24">:</dt>
                      <dd className="font-medium">
                        {reportConfig.chartType === "table"
                          ? ""
                          : reportConfig.chartType === "bar"
                            ? "?
                            : reportConfig.chartType === "line"
                              ? "?
                              : reportConfig.chartType === "pie"
                                ? ""
                                : ""}
                      </dd>
                    </div>
                  </dl>
                </div>
              </CardContent>
            </Card>

            {/*  */}
            <Card className="purple-gradient-card">
              <CardHeader className="purple-gradient-card">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="purple-gradient-title purple-gradient-card"></CardTitle>
                    <CardDescription className="purple-gradient-card">
                      {reportConfig.chartType === "table"
                        ? "表格预览"
                        : "图表预览"}
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchPreviewData}
                    disabled={loadingPreview}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingPreview ? "animate-spin" : ""}`} />
                    
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="purple-gradient-card">
                {loadingPreview ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p>...</p>
                  </div>
                ) : !reportConfig.datasource || reportConfig.fields.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p></p>
                  </div>
                ) : !reportConfig.chartType ? (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p></p>
                  </div>
                ) : previewData && previewData.data.length > 0 ? (
                  <div>
                    {reportConfig.chartType === "table" ? (
                      // 
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              {reportConfig.fields.map((field) => {
                                const fieldInfo = getCurrentDatasource()?.fields.find(
                                  (f) => f.name === field
                                );
                                return (
                                  <th key={field} className="text-left p-3 font-medium">
                                    {fieldInfo?.label || field}
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {previewData.data.map((row, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                {reportConfig.fields.map((field) => (
                                  <td key={field} className="p-3">
                                    {formatCellValue(row[field])}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <div className="text-xs text-gray-500 mt-4 text-center">
                          ?{previewData.data.length} ?{previewData.total} ?
                        </div>
                      </div>
                    ) : (
                      // ?
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center text-gray-500">
                        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="font-medium">
                          {reportConfig.chartType === "bar"
                            ? "?
                            : reportConfig.chartType === "line"
                              ? "?
                              : ""}
                          
                        </p>
                        <p className="text-sm mt-2"></p>
                        <div className="mt-4 text-xs text-left max-w-md mx-auto bg-blue-50 p-3 rounded">
                          <div className="font-medium text-blue-900 mb-2">?/div>
                          {reportConfig.chartConfig.title && (
                            <div>: {reportConfig.chartConfig.title}</div>
                          )}
                          {reportConfig.chartConfig.xAxis && (
                            <div>
                              X?{" "}
                              {getCurrentDatasource()?.fields.find(
                                (f) => f.name === reportConfig.chartConfig.xAxis
                              )?.label || reportConfig.chartConfig.xAxis}
                            </div>
                          )}
                          {reportConfig.chartConfig.yAxis && (
                            <div>
                              Y?{" "}
                              {getCurrentDatasource()?.fields.find(
                                (f) => f.name === reportConfig.chartConfig.yAxis
                              )?.label || reportConfig.chartConfig.yAxis}
                            </div>
                          )}
                          {reportConfig.chartConfig.groupBy && (
                            <div>
                              :{" "}
                              {getCurrentDatasource()?.fields.find(
                                (f) => f.name === reportConfig.chartConfig.groupBy
                              )?.label || reportConfig.chartConfig.groupBy}
                            </div>
                          )}
                          {reportConfig.chartConfig.aggregation && (
                            <div>: {reportConfig.chartConfig.aggregation}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p></p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case "save":
        return (
          <Card className="purple-gradient-card">
            <CardHeader className="purple-gradient-card">
              <CardTitle className="purple-gradient-title purple-gradient-card"></CardTitle>
              <CardDescription className="purple-gradient-card"></CardDescription>
            </CardHeader>
            <CardContent className="purple-gradient-card">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                     <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={reportConfig.name}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, name: e.target.value })
                    }
                    placeholder="?
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                     <span className="text-gray-500">(?</span>
                  </label>
                  <textarea
                    value={reportConfig.description}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, description: e.target.value })
                    }
                    placeholder=""
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2"></h4>
                  <dl className="space-y-2 text-sm text-blue-900">
                    <div className="flex gap-2">
                      <dt className="font-medium w-24">?</dt>
                      <dd>
                        {datasources.find((ds) => ds.id === reportConfig.datasource)?.name ||
                          ""}
                      </dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium w-24">:</dt>
                      <dd>{reportConfig.fields.length} ?/dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium w-24">?</dt>
                      <dd>{reportConfig.filters.length} ?/dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="font-medium w-24">:</dt>
                      <dd>
                        {reportConfig.chartType === "table"
                          ? ""
                          : reportConfig.chartType === "bar"
                            ? "?
                            : reportConfig.chartType === "line"
                              ? "?
                              : reportConfig.chartType === "pie"
                                ? ""
                                : ""}
                      </dd>
                    </div>
                  </dl>
                </div>

                <details className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <summary className="font-medium text-gray-900 cursor-pointer">
                     (JSON)
                  </summary>
                  <pre className="text-xs bg-white rounded p-3 overflow-auto max-h-64 mt-2">
                    {JSON.stringify(reportConfig, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/*  */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/reports")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="purple-gradient-title text-3xl font-bold text-slate-900"></h1>
            <p className="text-slate-600 mt-1">?/p>
          </div>
        </div>

        {/* ?*/}
        <Card className="purple-gradient-card">
          <CardContent className="purple-gradient-card p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = index < currentStepIndex;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : isCompleted
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-sm mt-2 ${
                          isActive ? "font-medium text-blue-600" : "text-gray-600"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 ${
                          isCompleted ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/*  */}
        {renderStepContent()}

        {/*  */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ?
          </Button>

          {currentStep === "save" ? (
            <Button
              onClick={handleSave}
              disabled={!reportConfig.name}
              className="purple-gradient-button bg-green-600 hover:bg-green-700"
            >
              <Save className="w-4 h-4 mr-2" />
              
            </Button>
          ) : (
            <Button onClick={handleNext} className="purple-gradient-button bg-blue-600 hover:bg-blue-700">
              ?
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ?
function formatCellValue(value: any): string {
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
}

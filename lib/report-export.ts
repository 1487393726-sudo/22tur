/**
 * 报表导出工具库
 * 支持 Excel (xlsx) 和 PDF 格式导出
 */

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 报表数据类型
export interface ReportData {
  name: string;
  description?: string;
  type: string;
  config: {
    datasource: string;
    fields: string[];
    filters?: any[];
    chartConfig?: any;
  };
  data: any[];
  aggregated?: any[];
  total: number;
}

// 导出选项
export interface ExportOptions {
  filename?: string;
  title?: string;
  author?: string;
  dateRange?: { start: string; end: string };
  includeCharts?: boolean;
  orientation?: "portrait" | "landscape";
}

// 字段标签映射
const fieldLabels: Record<string, string> = {
  id: "ID",
  name: "名称",
  email: "邮箱",
  firstName: "名",
  lastName: "姓",
  role: "角色",
  status: "状态",
  createdAt: "创建时间",
  updatedAt: "更新时间",
  title: "标题",
  description: "描述",
  priority: "优先级",
  dueDate: "截止日期",
  amount: "金额",
  total: "总计",
  count: "数量",
  avg: "平均值",
  sum: "合计",
  min: "最小值",
  max: "最大值",
  budget: "预算",
  progress: "进度",
  duration: "时长",
  startTime: "开始时间",
  endTime: "结束时间",
  invoiceNumber: "发票号",
  clientName: "客户名称",
  projectName: "项目名称",
  taskName: "任务名称",
  assigneeName: "负责人",
};

/**
 * 获取字段标签
 */
export function getFieldLabel(field: string): string {
  return fieldLabels[field] || field;
}

/**
 * 格式化单元格值
 */
export function formatCellValue(value: any): string {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value instanceof Date) {
    return value.toLocaleString("zh-CN");
  }
  if (typeof value === "string" && !isNaN(Date.parse(value)) && value.includes("T")) {
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
    // 检查是否是货币值（通常有小数）
    if (Number.isInteger(value)) {
      return value.toLocaleString("zh-CN");
    }
    return value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return String(value);
}


/**
 * 导出为 Excel 格式
 */
export function exportToExcel(report: ReportData, options: ExportOptions = {}): Blob {
  const filename = options.filename || `${report.name}_${new Date().toISOString().split("T")[0]}`;
  
  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 准备数据
  const fields = report.config.fields;
  const headers = fields.map(getFieldLabel);
  
  // 主数据表
  const mainData = report.data.map((row) =>
    fields.map((field) => {
      const value = row[field];
      // 保持原始值用于 Excel
      if (value === null || value === undefined) return "";
      if (typeof value === "boolean") return value ? "是" : "否";
      return value;
    })
  );
  
  // 创建主数据工作表
  const mainSheet = XLSX.utils.aoa_to_sheet([headers, ...mainData]);
  
  // 设置列宽
  const colWidths = fields.map((field) => ({
    wch: Math.max(getFieldLabel(field).length * 2, 15),
  }));
  mainSheet["!cols"] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, mainSheet, "数据");
  
  // 如果有聚合数据，添加聚合表
  if (report.aggregated && report.aggregated.length > 0) {
    const aggHeaders = Object.keys(report.aggregated[0]).map(getFieldLabel);
    const aggData = report.aggregated.map((row) =>
      Object.values(row).map((value) => {
        if (value === null || value === undefined) return "";
        return value;
      })
    );
    
    const aggSheet = XLSX.utils.aoa_to_sheet([aggHeaders, ...aggData]);
    aggSheet["!cols"] = aggHeaders.map(() => ({ wch: 15 }));
    XLSX.utils.book_append_sheet(workbook, aggSheet, "聚合数据");
  }
  
  // 添加报表信息表
  const infoData = [
    ["报表名称", report.name],
    ["描述", report.description || "-"],
    ["数据源", report.config.datasource],
    ["图表类型", report.type],
    ["数据总数", report.total],
    ["导出时间", new Date().toLocaleString("zh-CN")],
    ["导出人", options.author || "-"],
  ];
  
  if (options.dateRange) {
    infoData.push(["日期范围", `${options.dateRange.start} 至 ${options.dateRange.end}`]);
  }
  
  const infoSheet = XLSX.utils.aoa_to_sheet(infoData);
  infoSheet["!cols"] = [{ wch: 15 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, infoSheet, "报表信息");
  
  // 生成 Excel 文件
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  return new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

/**
 * 导出为 PDF 格式
 */
export function exportToPDF(report: ReportData, options: ExportOptions = {}): Blob {
  const orientation = options.orientation || (report.config.fields.length > 5 ? "landscape" : "portrait");
  const doc = new jsPDF({ orientation, unit: "mm", format: "a4" });
  
  // 设置中文字体（使用内置字体，中文可能显示为方块，生产环境需要添加中文字体）
  doc.setFont("helvetica");
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;
  
  // 标题
  doc.setFontSize(18);
  doc.text(report.name, pageWidth / 2, yPos, { align: "center" });
  yPos += 10;
  
  // 描述
  if (report.description) {
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(report.description, pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
  }
  
  // 报表信息
  doc.setFontSize(9);
  doc.setTextColor(80);
  const infoText = `数据源: ${report.config.datasource} | 总数: ${report.total} | 导出时间: ${new Date().toLocaleString("zh-CN")}`;
  doc.text(infoText, pageWidth / 2, yPos, { align: "center" });
  yPos += 12;
  
  // 数据表格
  const fields = report.config.fields;
  const headers = fields.map(getFieldLabel);
  const tableData = report.data.map((row) =>
    fields.map((field) => formatCellValue(row[field]))
  );
  
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPos,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [59, 130, 246], // blue-500
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    didDrawPage: (data) => {
      // 页脚
      const pageNumber = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `第 ${pageNumber} 页`,
        pageWidth / 2,
        pageHeight - 10,
        { align: "center" }
      );
    },
  });
  
  // 如果有聚合数据，添加聚合表
  if (report.aggregated && report.aggregated.length > 0) {
    doc.addPage();
    yPos = margin;
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text("聚合数据", margin, yPos);
    yPos += 10;
    
    const aggHeaders = Object.keys(report.aggregated[0]).map(getFieldLabel);
    const aggData = report.aggregated.map((row) =>
      Object.values(row).map((value) => formatCellValue(value))
    );
    
    autoTable(doc, {
      head: [aggHeaders],
      body: aggData,
      startY: yPos,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [34, 197, 94], // green-500
        textColor: 255,
        fontStyle: "bold",
      },
    });
  }
  
  return doc.output("blob");
}

/**
 * 下载文件
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 导出报表（统一入口）
 */
export async function exportReport(
  report: ReportData,
  format: "excel" | "pdf" | "csv",
  options: ExportOptions = {}
): Promise<void> {
  const filename = options.filename || `${report.name}_${new Date().toISOString().split("T")[0]}`;
  
  switch (format) {
    case "excel": {
      const blob = exportToExcel(report, options);
      downloadFile(blob, `${filename}.xlsx`);
      break;
    }
    case "pdf": {
      const blob = exportToPDF(report, options);
      downloadFile(blob, `${filename}.pdf`);
      break;
    }
    case "csv": {
      const fields = report.config.fields;
      const headers = fields.map(getFieldLabel).join(",");
      const rows = report.data.map((row) =>
        fields.map((field) => {
          const value = formatCellValue(row[field]);
          // 处理包含逗号的值
          if (value.includes(",") || value.includes('"')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      );
      const csv = [headers, ...rows].join("\n");
      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
      downloadFile(blob, `${filename}.csv`);
      break;
    }
  }
}

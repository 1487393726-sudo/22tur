import jsPDF from "jspdf"
import html2canvas from "html2canvas"

/**
 * PDF 生成选项
 */
export interface PDFGeneratorOptions {
  filename?: string
  quality?: number
  scale?: number
  format?: "a4" | "letter"
  orientation?: "portrait" | "landscape"
}

/**
 * 从 HTML 元素生成 PDF
 * @param element HTML 元素
 * @param options 生成选项
 * @returns PDF Blob
 */
export async function generatePDFFromElement(
  element: HTMLElement,
  options: PDFGeneratorOptions = {}
): Promise<Blob> {
  const {
    quality = 0.95,
    scale = 2,
    format = "a4",
    orientation = "portrait",
  } = options

  try {
    // 使用 html2canvas 将 HTML 转换为 canvas
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    })

    // 获取 canvas 尺寸
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    // 创建 PDF 文档
    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    })

    // 获取 PDF 页面尺寸
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // 计算图片在 PDF 中的尺寸（保持宽高比）
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgPdfWidth = imgWidth * ratio
    const imgPdfHeight = imgHeight * ratio

    // 计算居中位置
    const x = (pdfWidth - imgPdfWidth) / 2
    const y = 0

    // 将 canvas 转换为图片并添加到 PDF
    const imgData = canvas.toDataURL("image/jpeg", quality)
    pdf.addImage(imgData, "JPEG", x, y, imgPdfWidth, imgPdfHeight)

    // 返回 PDF Blob
    return pdf.output("blob")
  } catch (error) {
    console.error("Failed to generate PDF:", error)
    throw new Error("PDF 生成失败")
  }
}

/**
 * 下载 PDF 文件
 * @param blob PDF Blob
 * @param filename 文件名
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * 从 HTML 元素生成并下载 PDF
 * @param element HTML 元素
 * @param filename 文件名
 * @param options 生成选项
 */
export async function generateAndDownloadPDF(
  element: HTMLElement,
  filename: string,
  options: PDFGeneratorOptions = {}
): Promise<void> {
  try {
    const blob = await generatePDFFromElement(element, options)
    downloadPDF(blob, filename)
  } catch (error) {
    console.error("Failed to generate and download PDF:", error)
    throw error
  }
}

/**
 * 将 PDF Blob 上传到服务器
 * @param blob PDF Blob
 * @param invoiceId 发票 ID
 * @returns 上传结果
 */
export async function uploadPDFToServer(
  blob: Blob,
  invoiceId: string
): Promise<{ success: boolean; filePath?: string; error?: string }> {
  try {
    const formData = new FormData()
    formData.append("pdf", blob, `invoice-${invoiceId}.pdf`)
    formData.append("invoiceId", invoiceId)

    const response = await fetch("/api/invoices/upload-pdf", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const result = await response.json()
    return { success: true, filePath: result.filePath }
  } catch (error) {
    console.error("Failed to upload PDF:", error)
    return { success: false, error: "上传失败" }
  }
}

/**
 * 生成发票 PDF（完整流程）
 * @param element HTML 元素
 * @param invoiceNumber 发票号
 * @param options 生成选项
 * @returns PDF Blob
 */
export async function generateInvoicePDF(
  element: HTMLElement,
  invoiceNumber: string,
  options: PDFGeneratorOptions = {}
): Promise<Blob> {
  const defaultOptions: PDFGeneratorOptions = {
    filename: `invoice-${invoiceNumber}.pdf`,
    quality: 0.95,
    scale: 2,
    format: "a4",
    orientation: "portrait",
    ...options,
  }

  return generatePDFFromElement(element, defaultOptions)
}

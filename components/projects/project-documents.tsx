"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FileUploader } from "@/components/files/file-uploader"
import { FilePreview } from "@/components/files/file-preview"
import {
  FileText,
  Download,
  Eye,
  Upload,
  File,
  Image,
  FileVideo,
  FileAudio,
  Archive,
} from "lucide-react"
import { format } from "date-fns"
import { zhCN } from "date-fns/locale"
import { toast } from "sonner"

interface Document {
  id: string
  title: string
  type: string
  size: string
  uploadDate: string
  filePath: string
  category?: string
  author?: {
    id: string
    firstName: string
    lastName: string
  }
}

interface ProjectDocumentsProps {
  projectId: string
  documents: Document[]
  onUpdate: () => void
}

export function ProjectDocuments({ projectId, documents, onUpdate }: ProjectDocumentsProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<Document | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  // 获取文件图标
  const getFileIcon = (type: string) => {
    const lowerType = type.toLowerCase()
    if (lowerType.includes("image") || ["jpg", "jpeg", "png", "gif", "webp"].includes(lowerType)) {
      return <Image className="h-5 w-5 text-blue-400" />
    }
    if (lowerType.includes("video") || ["mp4", "avi", "mov", "wmv"].includes(lowerType)) {
      return <FileVideo className="h-5 w-5 text-white400" />
    }
    if (lowerType.includes("audio") || ["mp3", "wav", "ogg"].includes(lowerType)) {
      return <FileAudio className="h-5 w-5 text-green-400" />
    }
    if (["zip", "rar", "7z", "tar", "gz"].includes(lowerType)) {
      return <Archive className="h-5 w-5 text-yellow-400" />
    }
    if (lowerType === "pdf") {
      return <FileText className="h-5 w-5 text-red-400" />
    }
    return <File className="h-5 w-5 text-gray-400" />
  }

  // 获取文件类型徽章
  const getTypeBadge = (type: string) => {
    const typeMap: Record<string, { text: string; variant: any }> = {
      pdf: { text: "PDF", variant: "destructive" },
      doc: { text: "Word", variant: "default" },
      docx: { text: "Word", variant: "default" },
      xls: { text: "Excel", variant: "success" },
      xlsx: { text: "Excel", variant: "success" },
      ppt: { text: "PPT", variant: "warning" },
      pptx: { text: "PPT", variant: "warning" },
      jpg: { text: "图片", variant: "secondary" },
      jpeg: { text: "图片", variant: "secondary" },
      png: { text: "图片", variant: "secondary" },
      gif: { text: "图片", variant: "secondary" },
      mp4: { text: "视频", variant: "default" },
      mp3: { text: "音频", variant: "default" },
      zip: { text: "压缩", variant: "outline" },
    }
    const config = typeMap[type.toLowerCase()] || { text: type.toUpperCase(), variant: "outline" }
    return <Badge variant={config.variant as any}>{config.text}</Badge>
  }

  // 下载文件
  const handleDownload = (doc: Document) => {
    const link = document.createElement("a")
    link.href = doc.filePath
    link.download = doc.title
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("开始下载")
  }

  // 预览文件
  const handlePreview = (doc: Document) => {
    setPreviewFile(doc)
    setIsPreviewOpen(true)
  }

  // 上传成功回调
  const handleUploadSuccess = () => {
    setIsUploadDialogOpen(false)
    toast.success("文件上传成功")
    onUpdate()
  }

  // 按类型分组文档
  const documentsByCategory = documents.reduce((acc, doc) => {
    const category = doc.category || "其他"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(doc)
    return acc
  }, {} as Record<string, Document[]>)

  const categories = Object.keys(documentsByCategory)

  return (
    <div className="space-y-6">
      {/* 头部操作栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">项目文档</h3>
          <p className="text-sm text-white200">共 {documents.length} 个文档</p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-white/20 hover:bg-white/30 text-white">
              <Upload className="h-4 w-4 mr-2" />
              上传文档
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-white/20 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white">上传项目文档</DialogTitle>
              <DialogDescription className="text-white200">
                上传文档到项目，支持多种文件格式
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <FileUploader
                projectId={projectId}
                onUploadSuccess={handleUploadSuccess}
                maxFiles={10}
                maxSize={50 * 1024 * 1024} // 50MB
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">总文档</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-white300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">分类</p>
                <p className="text-2xl font-bold text-white">{categories.length}</p>
              </div>
              <Archive className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">总大小</p>
                <p className="text-2xl font-bold text-white">
                  {documents
                    .reduce((sum, doc) => {
                      const size = parseFloat(doc.size.replace(/[^0-9.]/g, ""))
                      return sum + (doc.size.includes("MB") ? size : size / 1024)
                    }, 0)
                    .toFixed(1)}
                  MB
                </p>
              </div>
              <Download className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white200">最近上传</p>
                <p className="text-sm font-medium text-white">
                  {documents.length > 0
                    ? format(
                        new Date(
                          Math.max(...documents.map((d) => new Date(d.uploadDate).getTime()))
                        ),
                        "MM-dd",
                        { locale: zhCN }
                      )
                    : "-"}
                </p>
              </div>
              <Upload className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 文档列表 */}
      {categories.length > 0 ? (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Archive className="h-4 w-4" />
                {category}
                <span className="text-sm text-white200">
                  ({documentsByCategory[category].length})
                </span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documentsByCategory[category].map((doc) => (
                  <Card
                    key={doc.id}
                    className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {getFileIcon(doc.type)}
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white font-medium truncate">{doc.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              {getTypeBadge(doc.type)}
                              <span className="text-xs text-white200">{doc.size}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-white200">
                          上传于 {format(new Date(doc.uploadDate), "yyyy-MM-dd", { locale: zhCN })}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePreview(doc)}
                            className="flex-1 text-white border-white/20 hover:bg-white/10"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            预览
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(doc)}
                            className="flex-1 text-white border-white/20 hover:bg-white/10"
                          >
                            <Download className="h-3 w-3 mr-1" />
                            下载
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-white300 mx-auto mb-4" />
            <p className="text-white mb-2">暂无文档</p>
            <p className="text-white200 text-sm mb-4">点击上方按钮上传文档</p>
          </CardContent>
        </Card>
      )}

      {/* 文件预览对话框 */}
      {previewFile && (
        <FilePreview
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false)
            setPreviewFile(null)
          }}
          file={{
            id: previewFile.id,
            name: previewFile.title,
            type: previewFile.type,
            url: previewFile.filePath,
            size: typeof previewFile.size === 'string' ? parseInt(previewFile.size) || 0 : previewFile.size,
          }}
        />
      )}
    </div>
  )
}

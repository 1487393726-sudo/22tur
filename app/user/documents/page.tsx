"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  MoreHorizontal,
  File,
  FileText,
  Image,
  Video,
  Archive,
  Download,
  Share,
  Trash2,
  Eye,
  Calendar,
  User,
  Sparkles,
  Plus,
  Grid,
  List,
  Clock,
} from "lucide-react";

// 导入用户端样式
import "@/styles/user-pages.css";

interface Document {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image" | "video" | "archive" | "other";
  size: string;
  uploadDate: string;
  uploadedBy: string;
  category: string;
  isShared: boolean;
  downloads: number;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "项目需求文档.pdf",
    type: "pdf",
    size: "2.4 MB",
    uploadDate: "2026-01-08",
    uploadedBy: "张三",
    category: "项目文档",
    isShared: true,
    downloads: 12,
  },
  {
    id: "2",
    name: "设计稿_v2.0.zip",
    type: "archive",
    size: "15.8 MB",
    uploadDate: "2026-01-07",
    uploadedBy: "李四",
    category: "设计文件",
    isShared: false,
    downloads: 5,
  },
  {
    id: "3",
    name: "会议记录_20260105.docx",
    type: "doc",
    size: "1.2 MB",
    uploadDate: "2026-01-05",
    uploadedBy: "王五",
    category: "会议记录",
    isShared: true,
    downloads: 8,
  },
  {
    id: "4",
    name: "产品演示视频.mp4",
    type: "video",
    size: "45.6 MB",
    uploadDate: "2026-01-03",
    uploadedBy: "赵六",
    category: "演示文件",
    isShared: true,
    downloads: 23,
  },
  {
    id: "5",
    name: "品牌设计规范.pdf",
    type: "pdf",
    size: "8.2 MB",
    uploadDate: "2026-01-02",
    uploadedBy: "张三",
    category: "设计文件",
    isShared: true,
    downloads: 15,
  },
  {
    id: "6",
    name: "产品截图合集.zip",
    type: "archive",
    size: "32.5 MB",
    uploadDate: "2026-01-01",
    uploadedBy: "李四",
    category: "演示文件",
    isShared: false,
    downloads: 3,
  },
];

const typeConfig: Record<string, { icon: typeof File; bg: string; text: string }> = {
  pdf: { icon: FileText, bg: "rgba(239, 68, 68, 0.2)", text: "#f87171" },
  doc: { icon: FileText, bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
  image: { icon: Image, bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
  video: { icon: Video, bg: "rgba(168, 85, 247, 0.2)", text: "#c4b5fd" },
  archive: { icon: Archive, bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
  other: { icon: File, bg: "rgba(107, 114, 128, 0.2)", text: "#9ca3af" },
};

const categories = ["全部", "项目文档", "设计文件", "会议记录", "演示文件", "其他"];

export default function DocumentsPage() {
  const [documents] = useState<Document[]>(mockDocuments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const stats = [
    { label: "总文档数", value: "156", icon: File, color: "blue" },
    { label: "存储空间", value: "2.4 GB", icon: Archive, color: "green" },
    { label: "共享文档", value: "89", icon: Share, color: "purple" },
    { label: "本月上传", value: "24", icon: Upload, color: "yellow" },
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "全部" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="文档管理"
        description="管理和组织您的所有文档文件"
        icon={FolderOpen}
        badge={`${documents.length}`}
        stats={stats.map(s => ({ ...s, color: `bg-${s.color}-500` }))}
        actions={
          <div className="flex gap-3">
            <button className="user-button user-button-secondary user-button-sm">
              <Filter className="w-4 h-4" />
              <span>筛选</span>
            </button>
            <button className="user-button user-button-primary user-button-sm">
              <Upload className="w-4 h-4" />
              <span>上传文档</span>
            </button>
          </div>
        }
      />

      {/* 统计卡片 - 玻璃态风格 */}
      <div className="user-page-stats-grid">
        {stats.map((stat, index) => {
          const colorMap: Record<string, { bg: string; text: string }> = {
            blue: { bg: "rgba(59, 130, 246, 0.2)", text: "#60a5fa" },
            green: { bg: "rgba(16, 185, 129, 0.2)", text: "#34d399" },
            purple: { bg: "rgba(168, 85, 247, 0.2)", text: "#c4b5fd" },
            yellow: { bg: "rgba(245, 158, 11, 0.2)", text: "#fbbf24" },
          };
          const colors = colorMap[stat.color];
          return (
            <div key={index} className="user-page-stat-card">
              <div className="user-page-stat-icon" style={{ background: colors.bg, color: colors.text }}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="user-page-stat-content">
                <span className="user-page-stat-value">{stat.value}</span>
                <span className="user-page-stat-label">{stat.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 搜索和筛选栏 - 玻璃态风格 */}
      <div className="user-search-filter-bar">
        <div className="user-search-input-wrapper">
          <Search className="user-search-icon" />
          <input
            type="text"
            placeholder="搜索文档..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="user-search-input"
          />
        </div>
        <div className="user-filter-buttons">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`user-button user-button-sm ${selectedCategory === category ? "user-button-primary" : "user-button-secondary"}`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`user-button user-button-sm ${viewMode === "grid" ? "user-button-primary" : "user-button-ghost"}`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`user-button user-button-sm ${viewMode === "list" ? "user-button-primary" : "user-button-ghost"}`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 文档网格 - 玻璃态风格 */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDocuments.map((doc) => (
            <GlassDocumentCard key={doc.id} document={doc} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <GlassDocumentListItem key={doc.id} document={doc} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredDocuments.length === 0 && (
        <div className="user-card">
          <div className="user-empty-state">
            <div className="user-empty-state-icon">
              <FolderOpen className="w-10 h-10" />
            </div>
            <h3 className="user-empty-state-title">没有找到匹配的文档</h3>
            <p className="user-empty-state-description">尝试调整搜索条件或清除筛选</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("全部");
              }}
              className="user-button user-button-secondary user-button-sm"
            >
              清除筛选条件
            </button>
          </div>
        </div>
      )}

      {/* 最近活动 - 玻璃态风格 */}
      <div className="user-card">
        <div className="user-card-header">
          <div className="user-card-header-icon" style={{ background: "rgba(59, 130, 246, 0.2)" }}>
            <Clock className="w-5 h-5" style={{ color: "#60a5fa" }} />
          </div>
          <div>
            <h3 className="user-card-title">最近活动</h3>
            <p className="user-card-description">文档操作记录</p>
          </div>
        </div>
        <div className="user-card-content">
          <div className="space-y-3">
            {[
              { action: "上传", file: "项目需求文档.pdf", user: "张三", time: "2小时前", color: "#34d399" },
              { action: "下载", file: "设计稿_v2.0.zip", user: "李四", time: "4小时前", color: "#60a5fa" },
              { action: "共享", file: "会议记录_20260105.docx", user: "王五", time: "6小时前", color: "#c4b5fd" },
              { action: "删除", file: "旧版本设计稿.psd", user: "赵六", time: "8小时前", color: "#f87171" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3"
                style={{ borderBottom: index < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: activity.color }}
                  />
                  <div>
                    <p style={{ color: "white", fontSize: "14px" }}>
                      <span style={{ fontWeight: 500 }}>{activity.user}</span>
                      <span style={{ color: "rgba(255,255,255,0.5)" }}> {activity.action}了 </span>
                      <span style={{ fontWeight: 500 }}>{activity.file}</span>
                    </p>
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 玻璃态文档卡片组件
function GlassDocumentCard({ document: doc }: { document: Document }) {
  const config = typeConfig[doc.type] || typeConfig.other;
  const TypeIcon = config.icon;

  return (
    <div className="user-card group" style={{ cursor: "pointer" }}>
      <div style={{ padding: "20px" }}>
        <div className="flex items-start justify-between mb-4">
          <div
            style={{
              width: "48px",
              height: "48px",
              background: config.bg,
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TypeIcon className="w-6 h-6" style={{ color: config.text }} />
          </div>
          <button
            className="user-button user-button-ghost user-button-sm"
            style={{ opacity: 0, transition: "opacity 0.3s" }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-3">
          <h3
            style={{
              color: "white",
              fontWeight: 500,
              fontSize: "14px",
              marginBottom: "4px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {doc.name}
          </h3>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>{doc.size}</p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Badge
            style={{
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.1)",
              fontSize: "11px",
            }}
          >
            {doc.category}
          </Badge>
          {doc.isShared && (
            <Badge
              style={{
                background: "rgba(16, 185, 129, 0.2)",
                color: "#34d399",
                border: "none",
                fontSize: "11px",
              }}
            >
              已共享
            </Badge>
          )}
        </div>

        <div className="space-y-2 mb-4" style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>{doc.uploadedBy}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span>{new Date(doc.uploadDate).toLocaleDateString("zh-CN")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="w-3 h-3" />
            <span>{doc.downloads} 次下载</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="user-button user-button-secondary user-button-sm" style={{ flex: 1, fontSize: "12px" }}>
            <Eye className="w-3 h-3" />
            <span>预览</span>
          </button>
          <button className="user-button user-button-secondary user-button-sm" style={{ flex: 1, fontSize: "12px" }}>
            <Download className="w-3 h-3" />
            <span>下载</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// 玻璃态文档列表项组件
function GlassDocumentListItem({ document: doc }: { document: Document }) {
  const config = typeConfig[doc.type] || typeConfig.other;
  const TypeIcon = config.icon;

  return (
    <div className="user-list-item">
      <div
        className="user-list-item-icon"
        style={{ background: config.bg, color: config.text }}
      >
        <TypeIcon className="w-5 h-5" />
      </div>
      <div className="user-list-item-content">
        <div className="user-list-item-header">
          <span className="user-list-item-title">{doc.name}</span>
          <div className="flex items-center gap-2">
            <Badge
              style={{
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.1)",
                fontSize: "11px",
              }}
            >
              {doc.category}
            </Badge>
            {doc.isShared && (
              <Badge
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  color: "#34d399",
                  border: "none",
                  fontSize: "11px",
                }}
              >
                已共享
              </Badge>
            )}
          </div>
        </div>
        <div className="user-list-item-meta">
          <span className="flex items-center gap-1">
            <Archive className="w-3 h-3" />
            {doc.size}
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {doc.uploadedBy}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(doc.uploadDate).toLocaleDateString("zh-CN")}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {doc.downloads} 次下载
          </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="user-button user-button-ghost user-button-sm">
          <Eye className="w-4 h-4" />
        </button>
        <button className="user-button user-button-ghost user-button-sm">
          <Download className="w-4 h-4" />
        </button>
        <button className="user-button user-button-ghost user-button-sm">
          <Share className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

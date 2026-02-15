"use client";

import {
  Calendar,
  User,
  FileText,
  Lock,
  Globe,
  Folder,
  Download,
  Eye,
  FileImage,
  FileVideo,
  FileAudio,
  Archive,
  Building2,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type DocumentType = 'CONTRACT' | 'REPORT' | 'PROPOSAL' | 'DESIGN' | 'TECHNICAL' | 'OTHER';
type DocumentPermission = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';

interface DocumentWithRelations {
  id: string;
  title: string;
  description?: string | null;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  size: string;
  type: string;
  category: string;
  version: string;
  status: string;
  downloadCount: number;
  uploadDate: Date;
  thumbnailPath?: string | null;
  authorId: string;
  projectId?: string | null;
  isPublic: boolean;
  tags?: string | null;
  permission?: DocumentPermission;
  uploadedBy?: {
    name: string;
    email: string;
  };
  client?: {
    name: string;
  };
  project?: {
    name: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface ViewDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: DocumentWithRelations | null;
  onDownload?: (documentId: string, fileName: string) => void;
}

export function ViewDocumentModal({
  open,
  onOpenChange,
  document,
  onDownload,
}: ViewDocumentModalProps) {
  if (!document) return null;

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return (
        <FileImage className="w-6 h-6 text-green-500" data-oid="6je15e1" />
      );
    if (mimeType.startsWith("video/"))
      return <FileVideo className="w-6 h-6 text-blue-500" data-oid="784ppk9" />;
    if (mimeType.startsWith("audio/"))
      return (
        <FileAudio className="w-6 h-6 text-white500" data-oid="ufrt5:a" />
      );
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      mimeType.includes("7z")
    )
      return <Archive className="w-6 h-6 text-orange-500" data-oid="kxy04:k" />;
    return <FileText className="w-6 h-6 text-gray-500" data-oid="a07yioy" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; className: string }> = {
      CONTRACT: { label: "合同", className: "bg-red-100 text-red-800" },
      REPORT: { label: "报告", className: "bg-blue-100 text-blue-800" },
      PROPOSAL: { label: "提案", className: "bg-purple-100 text-white800" },
      DESIGN: { label: "设计", className: "bg-green-100 text-green-800" },
      TECHNICAL: { label: "技术", className: "bg-yellow-100 text-yellow-800" },
      OTHER: { label: "其他", className: "bg-gray-100 text-gray-800" },
    };

    const config = typeConfig[type] || typeConfig.OTHER;
    return (
      <BadgeComponent className={config.className} data-oid="re5c7c9">
        {config.label}
      </BadgeComponent>
    );
  };

  const getPermissionBadge = (permission?: string) => {
    const permissionConfig: Record<string, {
      label: string;
      className: string;
      icon: React.ReactNode;
    }> = {
      PRIVATE: {
        label: "私有",
        className: "bg-red-100 text-red-800",
        icon: <Lock className="w-3 h-3" data-oid="lhb3g51" />,
      },
      INTERNAL: {
        label: "内部",
        className: "bg-yellow-100 text-yellow-800",
        icon: <Folder className="w-3 h-3" data-oid="o.1norx" />,
      },
      PUBLIC: {
        label: "公开",
        className: "bg-green-100 text-green-800",
        icon: <Globe className="w-3 h-3" data-oid="3f1yfl-" />,
      },
    };

    const config = permissionConfig[permission || 'PRIVATE'];
    return (
      <BadgeComponent className={config.className} data-oid="sl13mxp">
        {config.icon}
        <span className="ml-1" data-oid="p2xej.7">
          {config.label}
        </span>
      </BadgeComponent>
    );
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(document.id, document.fileName);
    }
  };

  const getPreviewUrl = () => {
    // 这里可以根据文档类型生成预览URL
    // 例如：如果是图片，可以返回图片URL
    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="3xpxusz">
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        data-oid=".c:hc_t"
      >
        <DialogHeader data-oid="i9c__6f">
          <DialogTitle className="flex items-center gap-2" data-oid="he0e18e">
            <FileText className="w-5 h-5" data-oid="rkosjih" />
            {document.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" data-oid="c4nuucx">
          {/* 文档预览 */}
          {document.fileName && (
            <Card data-oid=".7l:n_a">
              <CardHeader data-oid="j53ay6.">
                <CardTitle
                  className="text-lg flex items-center justify-between"
                  data-oid="ab6mm-:"
                >
                  <div className="flex items-center gap-2" data-oid="g3qacly">
                    {getFileIcon(document.mimeType)}
                    <span data-oid="0ckyuv4">文件信息</span>
                  </div>
                  <Button onClick={handleDownload} size="sm" data-oid="me50gle">
                    <Download className="w-4 h-4 mr-2" data-oid="nn93fbx" />
                    下载
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="xys5:pc">
                <div
                  className="flex items-center justify-center p-8 bg-gray-50 rounded-lg"
                  data-oid="-x-ycs:"
                >
                  {getFileIcon(document.mimeType)}
                  <div className="ml-4" data-oid="g4pg.4t">
                    <p className="font-medium" data-oid="f5nqrkb">
                      {document.fileName}
                    </p>
                    <p className="text-sm text-gray-500" data-oid="yd9ijmi">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 基本信息 */}
          <Card data-oid="99r:a7:">
            <CardHeader data-oid="mr49-or">
              <CardTitle className="text-lg" data-oid="ye2as_a">
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="dvxhu__">
              <div
                className="flex items-center justify-between"
                data-oid="x1guh_t"
              >
                <div className="flex items-center gap-2" data-oid="k-r1h-l">
                  <span className="text-sm text-gray-600" data-oid="_56e2rt">
                    文档类型:
                  </span>
                  {getTypeBadge(document.type)}
                </div>
                <div className="flex items-center gap-2" data-oid="-zlkysq">
                  <span className="text-sm text-gray-600" data-oid="o-_1fd9">
                    访问权限:
                  </span>
                  {getPermissionBadge(document.permission)}
                </div>
              </div>

              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="5:z4njq"
              >
                <div className="flex items-center gap-2" data-oid="532ph0g">
                  <FileText
                    className="w-4 h-4 text-gray-500"
                    data-oid="h0bdto-"
                  />
                  <span className="text-sm text-gray-600" data-oid="2wwhasu">
                    分类:
                  </span>
                  <BadgeComponent variant="outline" data-oid="3re0cyp">
                    {document.category}
                  </BadgeComponent>
                </div>

                <div className="flex items-center gap-2" data-oid="quy:rj7">
                  <Eye className="w-4 h-4 text-gray-500" data-oid="0sheyok" />
                  <span className="text-sm text-gray-600" data-oid="57wbbjo">
                    文件大小:
                  </span>
                  <span className="text-sm" data-oid="kkwhraw">
                    {formatFileSize(document.fileSize)}
                  </span>
                </div>
              </div>

              {document.description && (
                <div data-oid="z6f-i4g">
                  <p className="text-sm text-gray-600 mb-2" data-oid="6ud2a20">
                    文档描述:
                  </p>
                  <p
                    className="text-sm bg-gray-50 p-3 rounded leading-relaxed"
                    data-oid="klv948s"
                  >
                    {document.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 关联信息 */}
          <Card data-oid="yc0bn_1">
            <CardHeader data-oid="eo89w0l">
              <CardTitle className="text-lg" data-oid="pfhc_48">
                关联信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" data-oid="067w7vm">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="9ao3xy0"
              >
                {document.client && (
                  <div data-oid="v8zi9zv">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="5aaa.4u"
                    >
                      关联客户:
                    </p>
                    <div className="flex items-center gap-2" data-oid="pw:04h.">
                      <Building2
                        className="w-4 h-4 text-gray-500"
                        data-oid="m:rmukm"
                      />
                      <span className="font-medium" data-oid="dwuniz9">
                        {document.client.name}
                      </span>
                    </div>
                  </div>
                )}

                {document.project && (
                  <div data-oid="km_hbj4">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="m6e0dun"
                    >
                      关联项目:
                    </p>
                    <div className="flex items-center gap-2" data-oid="vt_2pkh">
                      <FileText
                        className="w-4 h-4 text-gray-500"
                        data-oid="6.rq81c"
                      />
                      <span className="font-medium" data-oid="uknzgvf">
                        {document.project.name}
                      </span>
                    </div>
                  </div>
                )}

                {document.uploadedBy && (
                  <div data-oid="rvv-ui-">
                    <p
                      className="text-sm text-gray-600 mb-1"
                      data-oid="1x5rnmd"
                    >
                      上传者:
                    </p>
                    <div className="flex items-center gap-2" data-oid="nippknz">
                      <User
                        className="w-4 h-4 text-gray-500"
                        data-oid="dhj-n_e"
                      />
                      <div data-oid="sf2wv7i">
                        <p className="font-medium" data-oid="ssa4576">
                          {document.uploadedBy.name}
                        </p>
                        <p className="text-sm text-gray-500" data-oid="o9boldp">
                          {document.uploadedBy.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {!document.client &&
                !document.project &&
                !document.uploadedBy && (
                  <p
                    className="text-sm text-gray-500 italic"
                    data-oid="_hy:ceq"
                  >
                    无关联信息
                  </p>
                )}
            </CardContent>
          </Card>

          {/* 时间信息 */}
          <Card data-oid="924.e28">
            <CardHeader data-oid="_pgykcn">
              <CardTitle className="text-lg" data-oid="zgp6jxs">
                时间信息
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="8x-hqie">
              <div
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                data-oid="1c6crhl"
              >
                <div className="flex items-center gap-2" data-oid="b1ziuvn">
                  <Calendar
                    className="w-4 h-4 text-gray-500"
                    data-oid="e4nmvcj"
                  />
                  <span className="text-sm text-gray-600" data-oid="9i59_np">
                    上传时间:
                  </span>
                  <span className="text-sm" data-oid="-k5cqqa">
                    {new Date(document.createdAt).toLocaleString("zh-CN")}
                  </span>
                </div>

                <div className="flex items-center gap-2" data-oid="ov0r3l_">
                  <Clock className="w-4 h-4 text-gray-500" data-oid="jm3205i" />
                  <span className="text-sm text-gray-600" data-oid="r_xd:x1">
                    更新时间:
                  </span>
                  <span className="text-sm" data-oid="ppcli8.">
                    {new Date(document.updatedAt).toLocaleString("zh-CN")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

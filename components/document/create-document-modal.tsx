"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
// 本地类型定义（Prisma schema 使用 String 类型）
import { Upload, File, X } from "lucide-react";

type DocumentType = "CONTRACT" | "REPORT" | "PROPOSAL" | "DESIGN" | "TECHNICAL" | "OTHER";
type DocumentPermission = "PRIVATE" | "INTERNAL" | "PUBLIC";

// 表单验证模式
const documentSchema = z.object({
  title: z.string().min(1, "文档标题不能为空"),
  description: z.string().optional(),
  type: z.enum([
    "CONTRACT",
    "REPORT",
    "PROPOSAL",
    "DESIGN",
    "TECHNICAL",
    "OTHER",
  ]),
  category: z.string().min(1, "请选择分类"),
  permission: z.enum(["PRIVATE", "INTERNAL", "PUBLIC"]),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

type DocumentFormData = z.infer<typeof documentSchema>;

interface CreateDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

export function CreateDocumentModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      type: "OTHER",
      category: "",
      permission: "INTERNAL",
    },
  });

  const selectedPermission = watch("permission");

  useEffect(() => {
    if (open) {
      fetchData();
      reset();
    }
  }, [open, reset]);

  const fetchData = async () => {
    try {
      const [clientsResponse, projectsResponse] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/projects"),
      ]);

      if (clientsResponse.ok && projectsResponse.ok) {
        const [clientsResponseData, projectsResponseData] = await Promise.all([
          clientsResponse.json(),
          projectsResponse.json(),
        ]);

        // 处理可能的API响应格式
        const clientsData = Array.isArray(clientsResponseData)
          ? clientsResponseData
          : clientsResponseData.data || [];
        const projectsData = Array.isArray(projectsResponseData)
          ? projectsResponseData
          : projectsResponseData.data || [];

        setClients(clientsData);
        setProjects(projectsData);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();

      // 添加文本数据
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // 添加文件数据
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file, index) => {
          formData.append(`files`, file);
        });
      }

      // 创建上传进度监听器
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setSelectedFiles([]);
        setUploadProgress(100);
        onSuccess();
      } else {
        const error = await response.json();
        alert(`创建文档失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("创建文档失败:", error);
      alert("创建文档失败，请重试");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const typeOptions = [
    { value: "CONTRACT", label: "合同" },
    { value: "REPORT", label: "报告" },
    { value: "PROPOSAL", label: "提案" },
    { value: "DESIGN", label: "设计" },
    { value: "TECHNICAL", label: "技术" },
    { value: "OTHER", label: "其他" },
  ];

  const permissionOptions = [
    {
      value: "PRIVATE",
      label: "私有",
      description: "仅创建者可见",
    },
    {
      value: "INTERNAL",
      label: "内部",
      description: "公司内部人员可见",
    },
    {
      value: "PUBLIC",
      label: "公开",
      description: "所有人可见",
    },
  ];

  const categories = [
    "人力资源",
    "财务会计",
    "项目管理",
    "技术文档",
    "市场营销",
    "销售合同",
    "客户资料",
    "产品设计",
    "法务合规",
    "行政办公",
    "其他",
  ];

  const filteredProjects = selectedClient
    ? Array.isArray(projects)
      ? projects.filter((p) => p.clientId === selectedClient)
      : []
    : Array.isArray(projects)
      ? projects
      : [];

  // 文件处理函数
  // 文件处理函数
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // 文件大小和类型验证
      const validFiles = newFiles.filter((file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "text/plain",
          "image/jpeg",
          "image/png",
          "image/gif",
        ];

        if (file.size > maxSize) {
          alert(`文件 "${file.name}" 超过10MB大小限制`);
          return false;
        }

        if (!allowedTypes.includes(file.type)) {
          alert(
            `文件 "${file.name}" 格式不支持，请上传PDF、DOC、XLS、PPT、图片或文本文件`,
          );
          return false;
        }

        return true;
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // 拖拽上传相关函数
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);

      // 文件大小和类型验证
      const validFiles = newFiles.filter((file) => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/vnd.ms-powerpoint",
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "text/plain",
          "image/jpeg",
          "image/png",
          "image/gif",
        ];

        if (file.size > maxSize) {
          alert(`文件 "${file.name}" 超过10MB大小限制`);
          return false;
        }

        if (!allowedTypes.includes(file.type)) {
          alert(
            `文件 "${file.name}" 格式不支持，请上传PDF、DOC、XLS、PPT、图片或文本文件`,
          );
          return false;
        }

        return true;
      });

      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // 获取文件类型图标
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📽️";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "txt":
        return "📃";
      default:
        return "📎";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="fx.q_td">
      <DialogContent className="sm:max-w-[600px]" data-oid="5m8ru81">
        <DialogHeader data-oid="n66qwm_">
          <DialogTitle data-oid="gf3vgup">新建文档</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="8.83vit"
        >
          {/* 基本信息 */}
          <div className="space-y-2" data-oid="7pnsw1r">
            <Label htmlFor="title" data-oid="bcx_z-o">
              文档标题 *
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="请输入文档标题"
              className={errors.title ? "border-red-500" : ""}
              data-oid="953de11"
            />

            {errors.title && (
              <p className="text-sm text-red-600" data-oid="69i:t2w">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="vpgm2x:">
            <Label htmlFor="description" data-oid="10.m4u0">
              文档描述
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请输入文档描述"
              rows={3}
              data-oid="p6x-m0f"
            />
          </div>

          {/* 文件上传区域 */}
          <div className="space-y-2" data-oid="hkn0ejl">
            <Label data-oid="q73g8uv">附件上传</Label>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
              data-oid="4-p8ufc"
            >
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
                data-oid="xrf3qul"
              />

              <label
                htmlFor="file-upload"
                className="cursor-pointer"
                data-oid="h_003h4"
              >
                <Upload
                  className="mx-auto h-12 w-12 text-gray-400"
                  data-oid="rueoj44"
                />
                <div className="mt-2" data-oid="poa477:">
                  <span
                    className="text-blue-600 font-medium"
                    data-oid="d0psjaj"
                  >
                    点击上传文件
                  </span>
                  <p className="text-xs text-gray-500 mt-1" data-oid="w3c382a">
                    支持 PDF, DOC, XLS, PPT, 图片等格式
                  </p>
                </div>
              </label>
            </div>

            {/* 已选择文件列表 */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2" data-oid="wtwuw3z">
                <p className="text-sm font-medium" data-oid="fkp9lde">
                  已选择文件:
                </p>
                <div
                  className="space-y-2 max-h-32 overflow-y-auto"
                  data-oid="thc97vs"
                >
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      data-oid="h8:t9f4"
                    >
                      <div
                        className="flex items-center space-x-2"
                        data-oid=":b5xxad"
                      >
                        <File
                          className="h-4 w-4 text-gray-500"
                          data-oid="l9vker."
                        />
                        <div data-oid="l4s08sc">
                          <p className="text-sm font-medium" data-oid="qeggbn.">
                            {file.name}
                          </p>
                          <p
                            className="text-xs text-gray-500"
                            data-oid="pdy81mn"
                          >
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        data-oid="rqqw.e6"
                      >
                        <X className="h-4 w-4" data-oid="4dkw5oj" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 上传进度 */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-2" data-oid="qj3d62g">
                <div
                  className="flex justify-between text-xs mb-1"
                  data-oid="yg_tbg4"
                >
                  <span data-oid="ncyx4fg">上传中...</span>
                  <span data-oid="ecuqa:t">{uploadProgress}%</span>
                </div>
                <div
                  className="w-full bg-gray-200 rounded-full h-2"
                  data-oid="fmpk3yh"
                >
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                    data-oid="x5kc-ts"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 类型和分类 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="8mw323j"
          >
            <div className="space-y-2" data-oid="x8sey-5">
              <Label htmlFor="type" data-oid="lu81x1d">
                文档类型 *
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(value) => setValue("type", value as DocumentFormData["type"])}
                data-oid="23wis27"
              >
                <SelectTrigger data-oid="4czgzsd">
                  <SelectValue data-oid="9utmua_" />
                </SelectTrigger>
                <SelectContent data-oid=".8zmmzy">
                  {typeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-oid="l2it-2:"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="4d4k401">
              <Label htmlFor="category" data-oid="rqu4vjb">
                文档分类 *
              </Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
                data-oid="uej3-0c"
              >
                <SelectTrigger data-oid="urersv.">
                  <SelectValue placeholder="请选择分类" data-oid="p0.t.94" />
                </SelectTrigger>
                <SelectContent data-oid="mxpqja0">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      data-oid="9lkdand"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600" data-oid="90.67-q">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* 权限设置 */}
          <div className="space-y-2" data-oid="6o862cb">
            <Label htmlFor="permission" data-oid=".porw78">
              访问权限 *
            </Label>
            <Select
              value={selectedPermission}
              onValueChange={(value) =>
                setValue("permission", value as DocumentFormData["permission"])
              }
              data-oid="7gjts_9"
            >
              <SelectTrigger data-oid="_giwvlb">
                <SelectValue data-oid="gffrwhp" />
              </SelectTrigger>
              <SelectContent data-oid="772k8-j">
                {permissionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    data-oid="xo:mzf9"
                  >
                    <div data-oid="fnijp8b">
                      <div className="font-medium" data-oid="eut.vd4">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500" data-oid="8s3jop1">
                        {option.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 关联信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="wtt9wi:"
          >
            <div className="space-y-2" data-oid="1vxv7ja">
              <Label htmlFor="clientId" data-oid="q:q4w0a">
                关联客户
              </Label>
              <Select
                value={selectedClient}
                onValueChange={(value) => {
                  setSelectedClient(value);
                  setValue("clientId", value);
                  setValue("projectId", ""); // 清空项目选择
                }}
                data-oid="u1l.5x-"
              >
                <SelectTrigger data-oid="gw7flm9">
                  <SelectValue
                    placeholder="请选择客户（可选）"
                    data-oid="0lg3owy"
                  />
                </SelectTrigger>
                <SelectContent data-oid="wqy5vnb">
                  {clients &&
                    clients.length > 0 &&
                    clients.map((client) => (
                      <SelectItem
                        key={client.id}
                        value={client.id}
                        data-oid="gmdb1l8"
                      >
                        {client.name}
                      </SelectItem>
                    ))}
                  {(!clients || clients.length === 0) && (
                    <SelectItem value="no-clients" disabled data-oid="3so4gx.">
                      暂无可用客户
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="ds1gfv0">
              <Label htmlFor="projectId" data-oid="ewcs23_">
                关联项目
              </Label>
              <Select
                value={watch("projectId")}
                onValueChange={(value) => setValue("projectId", value)}
                disabled={!selectedClient && filteredProjects.length === 0}
                data-oid="68ci-je"
              >
                <SelectTrigger data-oid="h02q65k">
                  <SelectValue
                    placeholder="请选择项目（可选）"
                    data-oid="diezey6"
                  />
                </SelectTrigger>
                <SelectContent data-oid="5c:ez:6">
                  {filteredProjects &&
                    filteredProjects.length > 0 &&
                    filteredProjects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        data-oid="1wz-np5"
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  {(!filteredProjects || filteredProjects.length === 0) && (
                    <SelectItem value="no-projects" disabled data-oid="k67r67s">
                      暂无可用项目
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter data-oid="8kjpr-e">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="0nq7.26"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="0wvfxw9">
              {loading ? "创建中..." : "创建文档"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

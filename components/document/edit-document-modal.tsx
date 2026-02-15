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
type DocumentType = 'CONTRACT' | 'REPORT' | 'PROPOSAL' | 'DESIGN' | 'TECHNICAL' | 'OTHER';
type DocumentPermission = 'PRIVATE' | 'INTERNAL' | 'PUBLIC';

interface Document {
  id: string;
  title: string;
  description?: string | null;
  filePath: string;
  type: string;
  category: string;
  version: string;
  status: string;
  permission?: DocumentPermission;
  clientId?: string | null;
  projectId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

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

interface EditDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
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

export function EditDocumentModal({
  open,
  onOpenChange,
  document,
  onSuccess,
}: EditDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  });

  useEffect(() => {
    if (document && open) {
      reset({
        title: document.title || "",
        description: document.description || "",
        type: document.type as "CONTRACT" | "REPORT" | "PROPOSAL" | "DESIGN" | "TECHNICAL" | "OTHER",
        category: document.category,
        permission: document.permission as "PRIVATE" | "INTERNAL" | "PUBLIC",
        clientId: document.clientId || "",
        projectId: document.projectId || "",
      });
      setSelectedClient(document.clientId || "");
      fetchData();
    }
  }, [document, open, reset]);

  const fetchData = async () => {
    try {
      const [clientsResponse, projectsResponse] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/projects"),
      ]);

      if (clientsResponse.ok && projectsResponse.ok) {
        const [clientsData, projectsData] = await Promise.all([
          clientsResponse.json(),
          projectsResponse.json(),
        ]);
        setClients(clientsData);
        setProjects(projectsData);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    }
  };

  const onSubmit = async (data: DocumentFormData) => {
    if (!document) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/documents/${document.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`更新文档失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("更新文档失败:", error);
      alert("更新文档失败，请重试");
    } finally {
      setLoading(false);
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
    ? projects.filter((p) => p.clientId === selectedClient)
    : projects;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="o9-h.2t">
      <DialogContent className="sm:max-w-[600px]" data-oid="94-z1:n">
        <DialogHeader data-oid="ot7zpa0">
          <DialogTitle data-oid="ph-w3b8">编辑文档</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="jhizr06"
        >
          {/* 基本信息 */}
          <div className="space-y-2" data-oid="19f_6vj">
            <Label htmlFor="title" data-oid="i2v3vzi">
              文档标题 *
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="请输入文档标题"
              className={errors.title ? "border-red-500" : ""}
              data-oid="u0e3jns"
            />

            {errors.title && (
              <p className="text-sm text-red-600" data-oid="a2ythi4">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="ltzvo_m">
            <Label htmlFor="description" data-oid="tap50gs">
              文档描述
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请输入文档描述"
              rows={3}
              data-oid="djmfsk5"
            />
          </div>

          {/* 类型和分类 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid=":r9vt-r"
          >
            <div className="space-y-2" data-oid="6pt8es_">
              <Label htmlFor="type" data-oid="6.91bmc">
                文档类型 *
              </Label>
              <Select
                value={watch("type")}
                onValueChange={(value: DocumentType) => setValue("type", value)}
                data-oid="1ve4yy."
              >
                <SelectTrigger data-oid="tw7wwf4">
                  <SelectValue data-oid="8cy_m5k" />
                </SelectTrigger>
                <SelectContent data-oid="jup_lz-">
                  {typeOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-oid="eqysd30"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="rx:j8pt">
              <Label htmlFor="category" data-oid="2slrfx6">
                文档分类 *
              </Label>
              <Select
                value={watch("category")}
                onValueChange={(value) => setValue("category", value)}
                data-oid="me3qbi1"
              >
                <SelectTrigger data-oid="u4c1ha0">
                  <SelectValue placeholder="请选择分类" data-oid="45q2mzo" />
                </SelectTrigger>
                <SelectContent data-oid="d:le2yd">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      data-oid="7n4f1k6"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600" data-oid="mdxaxsj">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          {/* 权限设置 */}
          <div className="space-y-2" data-oid="lq3mmkz">
            <Label htmlFor="permission" data-oid="kayk0l3">
              访问权限 *
            </Label>
            <Select
              value={watch("permission")}
              onValueChange={(value: DocumentPermission) =>
                setValue("permission", value)
              }
              data-oid="l:148ry"
            >
              <SelectTrigger data-oid="w86w3pg">
                <SelectValue data-oid="15.ldb4" />
              </SelectTrigger>
              <SelectContent data-oid="y1w:i_1">
                {permissionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                    data-oid="pe9tsm9"
                  >
                    <div data-oid="67:9mv2">
                      <div className="font-medium" data-oid="k0a29e-">
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500" data-oid="nuw55ao">
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
            data-oid="v9q8ffo"
          >
            <div className="space-y-2" data-oid=".ou270_">
              <Label htmlFor="clientId" data-oid="go2yq78">
                关联客户
              </Label>
              <Select
                value={selectedClient}
                onValueChange={(value) => {
                  setSelectedClient(value);
                  setValue("clientId", value);
                  setValue("projectId", ""); // 清空项目选择
                }}
                data-oid="46664d_"
              >
                <SelectTrigger data-oid="abvp50d">
                  <SelectValue
                    placeholder="请选择客户（可选）"
                    data-oid="r8jtcdb"
                  />
                </SelectTrigger>
                <SelectContent data-oid="wmgnnob">
                  {clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                      data-oid="3k60q8h"
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="_s_fycl">
              <Label htmlFor="projectId" data-oid="9eirz.f">
                关联项目
              </Label>
              <Select
                value={watch("projectId")}
                onValueChange={(value) => setValue("projectId", value)}
                disabled={!selectedClient && filteredProjects.length === 0}
                data-oid="afcx-kd"
              >
                <SelectTrigger data-oid="_zrmc.j">
                  <SelectValue
                    placeholder="请选择项目（可选）"
                    data-oid="6ztu8f8"
                  />
                </SelectTrigger>
                <SelectContent data-oid="b9ghh._">
                  {filteredProjects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      data-oid="hn3a7b6"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter data-oid="56x.0-5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="h807jn0"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="jsv0d-1">
              {loading ? "更新中..." : "更新文档"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

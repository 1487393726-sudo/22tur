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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TaskStatus, TaskPriority } from "@/types";
import { useLanguage } from "@/lib/i18n/context";
import { translations } from "@/lib/i18n/translations";
import TaskTemplateModal from "./task-template-modal";

// 表单验证模式
const taskSchema = z.object({
  title: z.string().min(1, "任务标题不能为空"),
  description: z.string().min(1, "任务描述不能为空"),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  dueDate: z.date({
    required_error: "请选择截止日期",
  }),
  assigneeId: z.string().optional(),
  projectId: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

export function CreateTaskModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTaskModalProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: "TODO",
      priority: "MEDIUM",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 默认一周后截止
    },
  });

  const selectedDate = watch("dueDate");

  // 应用模板数据
  const applyTemplate = (template: any) => {
    setValue("title", template.name);
    setValue("description", template.description || "");

    // 映射优先级
    const priorityMap: Record<string, TaskPriority> = {
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      urgent: "URGENT",
    };
    setValue("priority", priorityMap[template.priority] || "MEDIUM");

    // 计算截止日期（基于预计工时）
    if (template.estimatedHours) {
      const hours = parseFloat(template.estimatedHours);
      const daysNeeded = Math.ceil(hours / 8); // 假设每天工作8小时
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysNeeded);
      setValue("dueDate", dueDate);
    }

    // 如果模板有默认分配人，设置为默认值
    if (template.defaultAssigneeId) {
      setValue("assigneeId", template.defaultAssigneeId);
    }

    // 如果模板有默认项目，设置为默认值
    if (template.defaultProjectId) {
      setValue("projectId", template.defaultProjectId);
    }
  };

  useEffect(() => {
    if (open) {
      fetchData();
      reset();
    }
  }, [open, reset]);

  const fetchData = async () => {
    try {
      const [usersResponse, projectsResponse] = await Promise.all([
        fetch("/api/users"),
        fetch("/api/projects"),
      ]);

      if (usersResponse.ok && projectsResponse.ok) {
        const [usersData, projectsData] = await Promise.all([
          usersResponse.json(),
          projectsResponse.json(),
        ]);

        // 确保数据格式正确，并且是数组
        const usersArray = Array.isArray(usersData) 
          ? usersData 
          : Array.isArray(usersData?.data) 
            ? usersData.data 
            : [];
            
        const projectsArray = Array.isArray(projectsData) 
          ? projectsData 
          : Array.isArray(projectsData?.data) 
            ? projectsData.data 
            : [];

        setUsers(usersArray);
        setProjects(projectsArray);
      } else {
        console.error(
          "获取数据失败:",
          await usersResponse.text(),
          await projectsResponse.text(),
        );
        setUsers([]);
        setProjects([]);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      setUsers([]);
      setProjects([]);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`创建任务失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("创建任务失败:", error);
      alert("创建任务失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: "TODO", label: "待办" },
    { value: "IN_PROGRESS", label: "进行中" },
    { value: "IN_REVIEW", label: "待审核" },
    { value: "DONE", label: "已完成" },
  ];

  const priorityOptions = [
    { value: "LOW", label: "低" },
    { value: "MEDIUM", label: "中" },
    { value: "HIGH", label: "高" },
    { value: "URGENT", label: "紧急" },
  ];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange} data-oid="m3.a5.w">
        <DialogContent className="sm:max-w-[600px]" data-oid="0.hdqcd">
          <DialogHeader data-oid="hgei50a">
            <div
              className="flex items-center justify-between"
              data-oid="3wcf3vl"
            >
              <DialogTitle data-oid=".sbda_-">创建任务</DialogTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-2"
                data-oid="i44rv4a"
              >
                <FileText className="w-4 h-4" data-oid=".-g4frv" />
                使用模板
              </Button>
            </div>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            data-oid="ou-0:u6"
          >
            {/* 基本信息 */}
            <div className="space-y-2" data-oid="o9_.3qq">
              <Label htmlFor="title" data-oid="v51:heg">
                任务标题 *
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="请输入任务标题"
                className={errors.title ? "border-red-500" : ""}
                data-oid="u6:raf0"
              />

              {errors.title && (
                <p className="text-sm text-red-600" data-oid="f:3o9j_">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="967grom">
              <Label htmlFor="description" data-oid="zg465ha">
                任务描述 *
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="请详细描述任务内容和要求"
                rows={4}
                className={errors.description ? "border-red-500" : ""}
                data-oid="z2yfpfw"
              />

              {errors.description && (
                <p className="text-sm text-red-600" data-oid="am38mhn">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* 状态和优先级 */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-oid="3zzqb_b"
            >
              <div className="space-y-2" data-oid="rsaywek">
                <Label htmlFor="status" data-oid="zn..qp:">
                  状态
                </Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value: TaskStatus) =>
                    setValue("status", value)
                  }
                  data-oid="mieiukd"
                >
                  <SelectTrigger data-oid="f00n:_e">
                    <SelectValue data-oid="::pqw8p" />
                  </SelectTrigger>
                  <SelectContent data-oid="h0hfbyj">
                    {statusOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        data-oid="rp583h3"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" data-oid="f:x2fg6">
                <Label htmlFor="priority" data-oid="a8z6b73">
                  优先级
                </Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value: TaskPriority) =>
                    setValue("priority", value)
                  }
                  data-oid="t2xm_l3"
                >
                  <SelectTrigger data-oid="9:.vbif">
                    <SelectValue data-oid="ndwf03a" />
                  </SelectTrigger>
                  <SelectContent data-oid="l6ex5je">
                    {priorityOptions.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        data-oid="z.vcgre"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 截止日期 */}
            <div className="space-y-2" data-oid="c.bt8uj">
              <Label htmlFor="dueDate" data-oid=":rzs9jc">
                截止日期 *
              </Label>
              <Popover data-oid="wzr6_l6">
                <PopoverTrigger asChild data-oid="00tkzct">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                    data-oid="k5fcobn"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" data-oid="ad7w:tn" />
                    {selectedDate
                      ? format(selectedDate, "PPP", { locale: zhCN })
                      : "选择截止日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" data-oid="yb5k-u6">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setValue("dueDate", date)}
                    initialFocus
                    locale={zhCN}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    data-oid="qa2rf4w"
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-600" data-oid="ftk2ug1">
                  {errors.dueDate.message}
                </p>
              )}
            </div>

            {/* 分配信息 */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              data-oid="iv.f984"
            >
              <div className="space-y-2" data-oid="1uhw549">
                <Label htmlFor="assigneeId" data-oid="_otrms8">
                  负责人
                </Label>
                <Select
                  value={watch("assigneeId")}
                  onValueChange={(value) =>
                    setValue("assigneeId", value === "none" ? undefined : value)
                  }
                  data-oid="n2z-8bl"
                >
                  <SelectTrigger data-oid="svplbgo">
                    <SelectValue
                      placeholder="请选择负责人（可选）"
                      data-oid="b5.2-8l"
                    />
                  </SelectTrigger>
                  <SelectContent data-oid="xcuk5bj">
                    <SelectItem value="none" data-oid="x1b69rf">
                      无负责人
                    </SelectItem>
                    {Array.isArray(users) && users.map((user) => (
                      <SelectItem
                        key={user.id}
                        value={user.id}
                        data-oid="_rq0euh"
                      >
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2" data-oid="3d885s:">
                <Label htmlFor="projectId" data-oid="dryhzgx">
                  关联项目
                </Label>
                <Select
                  value={watch("projectId")}
                  onValueChange={(value) =>
                    setValue("projectId", value === "none" ? undefined : value)
                  }
                  data-oid="gb9g_wr"
                >
                  <SelectTrigger data-oid="j8:m0-1">
                    <SelectValue
                      placeholder="请选择项目（可选）"
                      data-oid="m7bcbto"
                    />
                  </SelectTrigger>
                  <SelectContent data-oid="kvvm69d">
                    <SelectItem value="none" data-oid="dbynll-">
                      无关联项目
                    </SelectItem>
                    {Array.isArray(projects) && projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        data-oid="2y-ixfl"
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter data-oid="hfpo-oa">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                data-oid="w87e.m4"
              >
                取消
              </Button>
              <Button type="submit" disabled={loading} data-oid=":g0s26g">
                {loading ? "创建中..." : "创建任务"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 任务模板模态框 */}
      {showTemplateModal && (
        <TaskTemplateModal
          onClose={() => setShowTemplateModal(false)}
          onTemplateSelect={applyTemplate}
          mode="select"
          data-oid="t:-kb_c"
        />
      )}
    </>
  );
}

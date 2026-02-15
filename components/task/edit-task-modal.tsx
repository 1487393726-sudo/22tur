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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TaskStatus, TaskPriority, TaskItem } from "@/types";

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

interface EditTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: TaskItem | null;
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

export function EditTaskModal({
  open,
  onOpenChange,
  task,
  onSuccess,
}: EditTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const selectedDate = watch("dueDate");

  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title || "",
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        assigneeId: task.assigneeId || "",
        projectId: task.projectId || "",
      });
      fetchData();
    }
  }, [task, open, reset]);

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
        setUsers(usersData);
        setProjects(projectsData);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
    }
  };

  const onSubmit = async (data: TaskFormData) => {
    if (!task) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
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
        alert(`更新任务失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("更新任务失败:", error);
      alert("更新任务失败，请重试");
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
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="hwt2s9y">
      <DialogContent className="sm:max-w-[600px]" data-oid="23.jv2j">
        <DialogHeader data-oid="h5mnr9_">
          <DialogTitle data-oid="8gnx4it">编辑任务</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid=".2nc9jz"
        >
          {/* 基本信息 */}
          <div className="space-y-2" data-oid="_:keksd">
            <Label htmlFor="title" data-oid="t:6fl79">
              任务标题 *
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="请输入任务标题"
              className={errors.title ? "border-red-500" : ""}
              data-oid="vsw10hu"
            />

            {errors.title && (
              <p className="text-sm text-red-600" data-oid="3:qlwu.">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid=":092.g8">
            <Label htmlFor="description" data-oid=":8iyt5u">
              任务描述 *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请详细描述任务内容和要求"
              rows={4}
              className={errors.description ? "border-red-500" : ""}
              data-oid="grf_c33"
            />

            {errors.description && (
              <p className="text-sm text-red-600" data-oid="gg7r-hz">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* 状态和优先级 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="3bww:e."
          >
            <div className="space-y-2" data-oid="b0zi4cm">
              <Label htmlFor="status" data-oid="5fuxnsw">
                状态
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value: TaskStatus) => setValue("status", value)}
                data-oid="z15_e1l"
              >
                <SelectTrigger data-oid="j7tmzcf">
                  <SelectValue data-oid="kgg_ouu" />
                </SelectTrigger>
                <SelectContent data-oid="ni6vinq">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-oid="t741.t8"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="occ0oxj">
              <Label htmlFor="priority" data-oid="kw8z3g9">
                优先级
              </Label>
              <Select
                value={watch("priority")}
                onValueChange={(value: TaskPriority) =>
                  setValue("priority", value)
                }
                data-oid="7o1cuai"
              >
                <SelectTrigger data-oid="hh_9ogv">
                  <SelectValue data-oid="unxg-35" />
                </SelectTrigger>
                <SelectContent data-oid="daijkbm">
                  {priorityOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-oid="gyhnrct"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 截止日期 */}
          <div className="space-y-2" data-oid="zpjp:tc">
            <Label htmlFor="dueDate" data-oid="qcylkmb">
              截止日期 *
            </Label>
            <Popover data-oid="eo0d:0g">
              <PopoverTrigger asChild data-oid="a:xq3ro">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                  )}
                  data-oid="3tkszrm"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" data-oid=".:2lm2r" />
                  {selectedDate
                    ? format(selectedDate, "PPP", { locale: zhCN })
                    : "选择截止日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" data-oid="aknximz">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue("dueDate", date)}
                  initialFocus
                  locale={zhCN}
                  data-oid="i05s9zv"
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className="text-sm text-red-600" data-oid="g1-kl66">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {/* 分配信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="mbrol_7"
          >
            <div className="space-y-2" data-oid="iyaaws-">
              <Label htmlFor="assigneeId" data-oid="o2p8lb_">
                负责人
              </Label>
              <Select
                value={watch("assigneeId")}
                onValueChange={(value) => setValue("assigneeId", value)}
                data-oid="k7aqzlf"
              >
                <SelectTrigger data-oid="wcv1vai">
                  <SelectValue
                    placeholder="请选择负责人（可选）"
                    data-oid="ud6gwk0"
                  />
                </SelectTrigger>
                <SelectContent data-oid="64kzf-f">
                  {users.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      data-oid="dajb-qu"
                    >
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="detjgy7">
              <Label htmlFor="projectId" data-oid="wa35m40">
                关联项目
              </Label>
              <Select
                value={watch("projectId")}
                onValueChange={(value) => setValue("projectId", value)}
                data-oid="t:uk2q:"
              >
                <SelectTrigger data-oid="yvq..v4">
                  <SelectValue
                    placeholder="请选择项目（可选）"
                    data-oid="k5sq9gt"
                  />
                </SelectTrigger>
                <SelectContent data-oid="aptdz0g">
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      data-oid="9e8-ng6"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter data-oid=":9mwlmv">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="l_jif31"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="yo.ph9c">
              {loading ? "更新中..." : "更新任务"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

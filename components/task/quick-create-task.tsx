"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { TaskStatus, TaskPriority } from "@/types";

// 快速任务表单验证模式
const quickTaskSchema = z.object({
  title: z.string().min(1, "任务标题不能为空"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  assigneeId: z.string().optional(),
  estimatedHours: z.string().optional(),
  dueDays: z.number().min(1).max(30).default(7), // 默认7天内完成
});

type QuickTaskFormData = z.infer<typeof quickTaskSchema>;

interface QuickCreateTaskProps {
  projectId?: string;
  onTaskCreated?: (task: any) => void;
  onCancel?: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// 预设的快速任务模板
const quickTaskTemplates = [
  { title: "代码审查", priority: "HIGH", estimatedHours: "2" },
  { title: "更新文档", priority: "MEDIUM", estimatedHours: "1" },
  { title: "修复Bug", priority: "HIGH", estimatedHours: "4" },
  { title: "功能开发", priority: "MEDIUM", estimatedHours: "8" },
  { title: "测试验证", priority: "MEDIUM", estimatedHours: "2" },
  { title: "客户沟通", priority: "HIGH", estimatedHours: "1" },
];

const priorityColors = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  URGENT: "bg-red-100 text-red-800",
};

const priorityLabels = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  URGENT: "紧急",
};

export default function QuickCreateTask({
  projectId,
  onTaskCreated,
  onCancel,
}: QuickCreateTaskProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    (typeof quickTaskTemplates)[0] | null
  >(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<QuickTaskFormData>({
    resolver: zodResolver(quickTaskSchema),
    defaultValues: {
      priority: "MEDIUM",
      dueDays: 7,
    },
  });

  const selectedPriority = watch("priority");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        const users = data.data || data || [];
        setUsers(users);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };

  const applyTemplate = (template: (typeof quickTaskTemplates)[0]) => {
    setSelectedTemplate(template);
    setValue("title", template.title);
    setValue("priority", template.priority as TaskPriority);
    setValue("estimatedHours", template.estimatedHours);
  };

  const onSubmit = async (data: QuickTaskFormData) => {
    setIsSubmitting(true);

    try {
      // 构建完整任务数据
      const taskData = {
        title: data.title,
        description: selectedTemplate?.title
          ? `${data.title} - 快速创建任务`
          : data.title,
        priority: data.priority,
        status: "TODO" as TaskStatus,
        assigneeId: data.assigneeId,
        projectId: projectId,
        dueDate: new Date(
          Date.now() + data.dueDays * 24 * 60 * 60 * 1000,
        ).toISOString(),
        estimatedHours: data.estimatedHours,
      };

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const createdTask = await response.json();
        toast({
          title: "任务创建成功",
          description: `任务 "${data.title}" 已创建`,
        });

        if (onTaskCreated) {
          onTaskCreated(createdTask);
        }

        reset();
        setSelectedTemplate(null);
      } else {
        const error = await response.json();
        toast({
          title: "创建失败",
          description: error.message || "未知错误",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("创建任务失败:", error);
      toast({
        title: "创建失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearTemplate = () => {
    setSelectedTemplate(null);
    reset({
      priority: "MEDIUM",
      dueDays: 7,
    });
  };

  return (
    <Card className="w-full max-w-2xl" data-oid="37dszc1">
      <CardHeader data-oid="20rxq6:">
        <CardTitle className="flex items-center gap-2" data-oid="2v2__52">
          <Plus className="w-5 h-5" data-oid="ed.j89:" />
          快速创建任务
          {projectId && (
            <Badge variant="secondary" data-oid="pe3sho-">
              项目关联
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4" data-oid="dr6lbhp">
        {/* 快速模板选择 */}
        <div data-oid="5gep10:">
          <Label className="text-sm font-medium" data-oid="0qfe345">
            快速模板
          </Label>
          <div className="flex flex-wrap gap-2 mt-2" data-oid="699zja0">
            {quickTaskTemplates.map((template, index) => (
              <Button
                key={index}
                variant={selectedTemplate === template ? "default" : "outline"}
                size="sm"
                onClick={() => applyTemplate(template)}
                className="flex items-center gap-2"
                data-oid="0j_lz2h"
              >
                {template.title}
                <Badge
                  className={`text-xs ${priorityColors[template.priority as TaskPriority]}`}
                  variant="secondary"
                  data-oid="d673_09"
                >
                  {priorityLabels[template.priority as TaskPriority]}
                </Badge>
                {template.estimatedHours && (
                  <span className="text-xs text-gray-500" data-oid="xcukz.3">
                    {template.estimatedHours}h
                  </span>
                )}
              </Button>
            ))}
            {selectedTemplate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTemplate}
                data-oid="1lidu-5"
              >
                清除模板
              </Button>
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="f6hnn08"
        >
          {/* 任务标题 */}
          <div data-oid="uqgo80y">
            <Label htmlFor="title" data-oid="h5t4isv">
              任务标题 *
            </Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="请输入任务标题"
              className={errors.title ? "border-red-500" : ""}
              data-oid="hr_uzhe"
            />

            {errors.title && (
              <p className="text-sm text-red-600 mt-1" data-oid="ozeh1fc">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* 优先级和预计工时 */}
          <div className="grid grid-cols-2 gap-4" data-oid="p-20e_t">
            <div data-oid="uje:shn">
              <Label htmlFor="priority" data-oid="ixw9zzm">
                优先级
              </Label>
              <Select
                value={selectedPriority}
                onValueChange={(value: TaskPriority) =>
                  setValue("priority", value)
                }
                data-oid="32pq5md"
              >
                <SelectTrigger data-oid="15xqub7">
                  <SelectValue data-oid="igntp.c" />
                </SelectTrigger>
                <SelectContent data-oid="9-4m2hx">
                  <SelectItem value="LOW" data-oid="yjvgacx">
                    <div className="flex items-center gap-2" data-oid="zq5tt.i">
                      <Badge className={priorityColors.LOW} data-oid="eh2sn3a">
                        低
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="MEDIUM" data-oid=".tkf664">
                    <div className="flex items-center gap-2" data-oid="22eeg94">
                      <Badge
                        className={priorityColors.MEDIUM}
                        data-oid="y8np:.p"
                      >
                        中
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="HIGH" data-oid="unn.sui">
                    <div className="flex items-center gap-2" data-oid=".inbmmv">
                      <Badge className={priorityColors.HIGH} data-oid="y5ipr:h">
                        高
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="URGENT" data-oid="2mkbi1e">
                    <div className="flex items-center gap-2" data-oid="_sv::kk">
                      <Badge
                        className={priorityColors.URGENT}
                        data-oid="g7juuqf"
                      >
                        紧急
                      </Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div data-oid="9_2ms7n">
              <Label htmlFor="estimatedHours" data-oid="qem0o0k">
                预计工时 (小时)
              </Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.5"
                min="0.5"
                {...register("estimatedHours")}
                placeholder="预计完成时间"
                data-oid="w80ypkd"
              />
            </div>
          </div>

          {/* 截止时间和负责人 */}
          <div className="grid grid-cols-2 gap-4" data-oid="ymgzgga">
            <div data-oid="om6zcsa">
              <Label htmlFor="dueDays" data-oid="o.7pbji">
                截止时间
              </Label>
              <Select
                value={watch("dueDays")?.toString()}
                onValueChange={(value) => setValue("dueDays", parseInt(value))}
                data-oid="b637vh7"
              >
                <SelectTrigger data-oid="_rjha1y">
                  <SelectValue data-oid="kqwitao" />
                </SelectTrigger>
                <SelectContent data-oid="a_u7t0z">
                  <SelectItem value="1" data-oid="v3e06ha">
                    1天内
                  </SelectItem>
                  <SelectItem value="3" data-oid="b0cvw15">
                    3天内
                  </SelectItem>
                  <SelectItem value="7" data-oid="j2h_5vg">
                    一周内
                  </SelectItem>
                  <SelectItem value="14" data-oid="f_3ah9o">
                    两周内
                  </SelectItem>
                  <SelectItem value="30" data-oid="f7.6fhl">
                    一个月内
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div data-oid="khjkfsa">
              <Label htmlFor="assigneeId" data-oid="y7giep8">
                负责人
              </Label>
              <Select
                value={watch("assigneeId")}
                onValueChange={(value) =>
                  setValue("assigneeId", value === "none" ? "" : value)
                }
                data-oid="umck1c-"
              >
                <SelectTrigger data-oid="d_-hcpu">
                  <SelectValue
                    placeholder="选择负责人 (可选)"
                    data-oid="jzbkx3p"
                  />
                </SelectTrigger>
                <SelectContent data-oid="xd4dgjg">
                  <SelectItem value="none" data-oid="4wuot3z">
                    暂不分配
                  </SelectItem>
                  {users.map((user) => (
                    <SelectItem
                      key={user.id}
                      value={user.id}
                      data-oid="76i-5sf"
                    >
                      <div
                        className="flex items-center gap-2"
                        data-oid="i7lpbgy"
                      >
                        <User className="w-4 h-4" data-oid="n3p5ruz" />
                        {user.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 当前设置摘要 */}
          <div className="bg-gray-50 p-3 rounded-lg" data-oid="hwpvvf6">
            <div
              className="flex items-center gap-2 text-sm text-gray-600 mb-2"
              data-oid="k.0gqh_"
            >
              <AlertCircle className="w-4 h-4" data-oid="owq812g" />
              任务设置摘要
            </div>
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm"
              data-oid="6zwj1e3"
            >
              <div className="flex items-center gap-1" data-oid="a_to-h3">
                <Badge
                  className={priorityColors[selectedPriority]}
                  data-oid="xvf2kxd"
                >
                  {priorityLabels[selectedPriority]}
                </Badge>
              </div>
              {watch("estimatedHours") && (
                <div className="flex items-center gap-1" data-oid=".eemd4s">
                  <Clock className="w-4 h-4" data-oid="h_cm3x1" />
                  {watch("estimatedHours")}小时
                </div>
              )}
              <div className="flex items-center gap-1" data-oid="60ne.8p">
                <Calendar className="w-4 h-4" data-oid="6bzae:e" />
                {watch("dueDays")}天内完成
              </div>
              {watch("assigneeId") && (
                <div className="flex items-center gap-1" data-oid="1z1f8m7">
                  <User className="w-4 h-4" data-oid="vlo8_vf" />
                  {users.find((u) => u.id === watch("assigneeId"))?.name ||
                    "未知用户"}
                </div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 pt-2" data-oid="u-zftj5">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-oid="r9mqsnt"
              >
                取消
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
              data-oid="yefa9w:"
            >
              {isSubmitting ? (
                <>
                  <div
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                    data-oid="h5frf02"
                  />
                  创建中...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" data-oid="1pepsyo" />
                  创建任务
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

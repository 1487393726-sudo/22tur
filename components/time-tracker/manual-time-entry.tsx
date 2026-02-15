"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const timeEntrySchema = z.object({
  taskId: z.string().min(1, "请选择任务"),
  date: z.string().min(1, "请选择日期"),
  hours: z.number().min(0, "小时不能为负数").max(24, "小时不能超过24"),
  minutes: z.number().min(0, "分钟不能为负数").max(59, "分钟不能超过59"),
  description: z.string().optional(),
});

type TimeEntryForm = z.infer<typeof timeEntrySchema>;

interface ManualTimeEntryProps {
  tasks?: Array<{ id: string; title: string }>;
  onSave?: (data: TimeEntryForm) => Promise<void>;
  onCancel?: () => void;
}

export function ManualTimeEntry({ tasks = [], onSave, onCancel }: ManualTimeEntryProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
      hours: 0,
      minutes: 0,
    },
  });

  const onSubmit = async (data: TimeEntryForm) => {
    // 验证总时长
    const totalMinutes = data.hours * 60 + data.minutes;
    if (totalMinutes === 0) {
      toast.error("时长不能为0");
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(data);
        reset();
        toast.success("时间记录已添加");
      }
    } catch (error) {
      console.error("添加时间记录失败:", error);
      toast.error("添加失败");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
      <h3 className="text-white font-medium mb-4">手动添加时间</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* 任务选择 */}
        <div>
          <label htmlFor="task-select" className="text-sm text-white/80 mb-2 block">
            任务 <span className="text-red-400">*</span>
          </label>
          <select
            id="task-select"
            {...register("taskId")}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          >
            <option value="">选择任务</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
          {errors.taskId && (
            <p className="text-red-400 text-sm mt-1">{errors.taskId.message}</p>
          )}
        </div>

        {/* 日期 */}
        <div>
          <label htmlFor="date-input" className="text-sm text-white/80 mb-2 block">
            日期 <span className="text-red-400">*</span>
          </label>
          <input
            id="date-input"
            type="date"
            {...register("date")}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
          />
          {errors.date && (
            <p className="text-red-400 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* 时长 */}
        <div>
          <label className="text-sm text-white/80 mb-2 block">
            时长 <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                {...register("hours", { valueAsNumber: true })}
                placeholder="小时"
                min="0"
                max="24"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
              {errors.hours && (
                <p className="text-red-400 text-sm mt-1">{errors.hours.message}</p>
              )}
            </div>
            <div>
              <input
                type="number"
                {...register("minutes", { valueAsNumber: true })}
                placeholder="分钟"
                min="0"
                max="59"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
              {errors.minutes && (
                <p className="text-red-400 text-sm mt-1">{errors.minutes.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* 工作说明 */}
        <div>
          <label htmlFor="description-input" className="text-sm text-white/80 mb-2 block">
            工作说明（可选）
          </label>
          <textarea
            id="description-input"
            {...register("description")}
            placeholder="描述你做了什么..."
            className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-white/40 resize-none"
            rows={3}
          />
        </div>

        {/* 按钮 */}
        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isSubmitting ? "添加中..." : "添加记录"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-white/20 text-white hover:bg-white/10"
            >
              取消
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// 表单验证 schema
const investmentFormSchema = z.object({
  amount: z
    .number()
    .min(0.01, "投资金额必须大于 0")
    .refine((val) => !isNaN(val), "投资金额必须是有效的数字"),
  duration: z.string().min(1, "请选择投资期限"),
  riskConfirmed: z.boolean().refine((val) => val === true, "必须确认风险"),
  termsAccepted: z.boolean().refine((val) => val === true, "必须同意投资条款"),
});

type InvestmentFormData = z.infer<typeof investmentFormSchema>;

interface InvestmentFormProps {
  projectId: string;
  projectTitle: string;
  minInvestment: number;
  maxInvestment?: number;
  expectedReturn: number;
  duration: number;
  riskLevel: string;
  onSubmit: (data: InvestmentFormData) => Promise<void>;
  loading?: boolean;
}

export function InvestmentForm({
  projectId,
  projectTitle,
  minInvestment,
  maxInvestment,
  expectedReturn,
  duration,
  riskLevel,
  onSubmit,
  loading = false,
}: InvestmentFormProps) {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<InvestmentFormData>({
    resolver: zodResolver(investmentFormSchema),
    defaultValues: {
      amount: minInvestment,
      duration: duration.toString(),
      riskConfirmed: false,
      termsAccepted: false,
    },
  });

  const handleSubmit = async (data: InvestmentFormData) => {
    try {
      await onSubmit(data);
      setSubmitted(true);
      toast.success("投资成功！");

      // 3 秒后重置表单
      setTimeout(() => {
        setSubmitted(false);
        form.reset();
      }, 3000);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "投资失败，请稍后重试"
      );
    }
  };

  // 计算预期收益
  const investmentAmount = form.watch("amount");
  const expectedProfit = (investmentAmount * expectedReturn) / 100;

  // 风险等级颜色
  const riskColors: Record<string, string> = {
    LOW: "text-green-600 bg-green-50",
    MEDIUM: "text-yellow-600 bg-yellow-50",
    HIGH: "text-red-600 bg-red-50",
  };

  const riskLabels: Record<string, string> = {
    LOW: "低风险",
    MEDIUM: "中风险",
    HIGH: "高风险",
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">投资成功！</h3>
              <p className="text-sm text-green-700">
                您已成功投资 ¥{investmentAmount.toLocaleString()} 到 {projectTitle}
              </p>
              <p className="text-xs text-green-600 mt-2">
                预期年化收益: ¥{expectedProfit.toLocaleString("zh-CN", {
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>投资 {projectTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* 项目信息摘要 */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">预期年化回报</p>
                <p className="text-lg font-semibold text-green-600">
                  {expectedReturn}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">投资期限</p>
                <p className="text-lg font-semibold">{duration} 个月</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">风险等级</p>
                <p className={`text-sm font-semibold ${riskColors[riskLevel]}`}>
                  {riskLabels[riskLevel]}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">起投金额</p>
                <p className="text-lg font-semibold">
                  ¥{minInvestment.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 投资金额 */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>投资金额</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        ¥
                      </span>
                      <Input
                        type="number"
                        placeholder="请输入投资金额"
                        className="pl-8"
                        min={minInvestment}
                        max={maxInvestment}
                        step={100}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    最低投资 ¥{minInvestment.toLocaleString()}
                    {maxInvestment && ` - 最高 ¥${maxInvestment.toLocaleString()}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 预期收益显示 */}
            {investmentAmount > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-blue-700">预期年化收益</span>
                  <span className="text-lg font-semibold text-blue-600">
                    ¥
                    {expectedProfit.toLocaleString("zh-CN", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  基于 {expectedReturn}% 年化回报率计算
                </p>
              </div>
            )}

            {/* 投资期限 */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>投资期限</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择投资期限" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="3">3 个月</SelectItem>
                      <SelectItem value="6">6 个月</SelectItem>
                      <SelectItem value="12">12 个月</SelectItem>
                      <SelectItem value="24">24 个月</SelectItem>
                      <SelectItem value="36">36 个月</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    选择您的投资期限，期限越长收益可能越高
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 风险确认 */}
            <FormField
              control={form.control}
              name="riskConfirmed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border border-amber-200 bg-amber-50 rounded-lg">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        我已了解投资风险
                      </div>
                    </FormLabel>
                    <FormDescription className="text-xs">
                      投资有风险，本金可能面临损失。请确保您已充分了解该项目的风险等级和相关条款。
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 条款同意 */}
            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-medium cursor-pointer">
                      我同意投资条款和隐私政策
                    </FormLabel>
                    <FormDescription className="text-xs">
                      请阅读并同意我们的{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        投资条款
                      </a>{" "}
                      和{" "}
                      <a href="#" className="text-blue-600 hover:underline">
                        隐私政策
                      </a>
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 提交按钮 */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  立即投资 ¥{investmentAmount.toLocaleString()}
                </>
              )}
            </Button>

            {/* 免责声明 */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>免责声明:</strong>{" "}
                本投资产品由相关机构提供，投资有风险，过往表现不代表未来收益。请根据自身风险承受能力谨慎投资。
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

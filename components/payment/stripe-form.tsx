"use client";

import { useState } from "react";
import {
  useStripe,
  useElements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

// 表单验证 schema
const stripeFormSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  name: z.string().min(2, "请输入持卡人姓名"),
});

type StripeFormData = z.infer<typeof stripeFormSchema>;

interface StripeFormProps {
  amount: number;
  currency?: string;
  description?: string;
  investmentId: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
    },
  },
};

export function StripeForm({
  amount,
  currency = "cny",
  description,
  investmentId,
  onSuccess,
  onError,
}: StripeFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<StripeFormData>({
    resolver: zodResolver(stripeFormSchema),
    defaultValues: {
      email: "",
      name: "",
    },
  });

  const handleSubmit = async (data: StripeFormData) => {
    if (!stripe || !elements) {
      setError("支付系统未加载，请稍后重试");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 获取卡片元素
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("卡片信息未填写");
      }

      // 创建支付意图
      const createIntentResponse = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // 转换为分
          currency,
          description: description || `投资项目 - ${investmentId}`,
          investmentId,
          email: data.email,
          name: data.name,
        }),
      });

      if (!createIntentResponse.ok) {
        const errorData = await createIntentResponse.json();
        throw new Error(errorData.error || "创建支付意图失败");
      }

      const { clientSecret } = await createIntentResponse.json();

      // 确认支付
      const { paymentIntent, error: stripeError } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: data.name,
              email: data.email,
            },
          },
        });

      if (stripeError) {
        throw new Error(stripeError.message || "支付失败");
      }

      if (paymentIntent?.status === "succeeded") {
        setSuccess(true);
        toast.success("支付成功！");
        onSuccess?.(paymentIntent.id);

        // 3 秒后重置表单
        setTimeout(() => {
          setSuccess(false);
          form.reset();
        }, 3000);
      } else {
        throw new Error("支付未完成，请重试");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "支付失败，请稍后重试";
      setError(errorMessage);
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">支付成功！</h3>
              <p className="text-sm text-green-700">
                您已成功支付 ¥{amount.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 mt-2">
                投资记录已更新，您可以查看投资详情
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
        <CardTitle>支付信息</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* 支付金额摘要 */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-700">支付金额</span>
                <span className="text-2xl font-bold text-blue-600">
                  ¥{amount.toLocaleString()}
                </span>
              </div>
              {description && (
                <p className="text-xs text-blue-600 mt-2">{description}</p>
              )}
            </div>

            {/* 错误提示 */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 邮箱 */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="请输入邮箱地址"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    用于接收支付凭证和投资通知
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 持卡人姓名 */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>持卡人姓名</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="请输入持卡人姓名"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    必须与银行卡上的姓名一致
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 卡片信息 */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  卡号
                </label>
                <div className="p-3 border rounded-lg bg-white">
                  <CardNumberElement options={cardElementOptions} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    有效期
                  </label>
                  <div className="p-3 border rounded-lg bg-white">
                    <CardExpiryElement options={cardElementOptions} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    CVC
                  </label>
                  <div className="p-3 border rounded-lg bg-white">
                    <CardCvcElement options={cardElementOptions} />
                  </div>
                </div>
              </div>
            </div>

            {/* 安全提示 */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>🔒 安全提示:</strong>{" "}
                您的卡片信息由 Stripe 安全处理，我们不会存储您的完整卡片信息。
              </p>
            </div>

            {/* 提交按钮 */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !stripe || !elements}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  处理中...
                </>
              ) : (
                <>支付 ¥{amount.toLocaleString()}</>
              )}
            </Button>

            {/* 免责声明 */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                <strong>免责声明:</strong>{" "}
                支付完成后，投资记录将自动更新。如有问题，请联系客服。
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

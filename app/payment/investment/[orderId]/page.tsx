"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
  Wallet,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

interface InvestmentStatus {
  investment: {
    id: string;
    amount: number;
    status: string;
    transactionId: string;
    paymentMethod: string;
    paymentGateway: string;
    project: {
      id: string;
      title: string;
      shortDesc: string;
    };
  };
  paymentTransaction: {
    id: string;
    status: string;
    paymentUrl: string;
    qrCode: string;
    expiredAt: string;
  } | null;
  statusInfo: {
    label: string;
    color: string;
    description: string;
  };
  isExpired: boolean;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<InvestmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const orderId = params.orderId as string;
  const simulateResult = searchParams.get("simulate"); // 用于开发测试

  useEffect(() => {
    if (orderId) {
      fetchStatus();
    }
  }, [orderId]);

  // 轮询检查支付状态
  useEffect(() => {
    if (status?.investment.status === "PENDING" && !status.isExpired) {
      const interval = setInterval(fetchStatus, 5000); // 每5秒检查一次
      return () => clearInterval(interval);
    }
  }, [status]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/project-investments/${orderId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "获取状态失败");
      }

      setStatus(data);

      // 如果支付已完成，跳转到成功页面
      if (data.investment.status === "COMPLETED") {
        setTimeout(() => {
          router.push(`/investments/${data.investment.project.id}?payment=success`);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 模拟支付成功（仅开发环境）
  const simulatePaymentSuccess = async () => {
    if (process.env.NODE_ENV !== "development") return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/project-investments/${orderId}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SUCCESS",
          transactionId: status?.investment.transactionId,
          amount: status?.investment.amount,
          paidAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("模拟支付失败");
      }

      // 刷新状态
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 模拟支付失败（仅开发环境）
  const simulatePaymentFailure = async () => {
    if (process.env.NODE_ENV !== "development") return;

    setProcessing(true);
    try {
      const response = await fetch(`/api/project-investments/${orderId}/callback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "FAILED",
          transactionId: status?.investment.transactionId,
          amount: status?.investment.amount,
          failureReason: "用户取消支付",
        }),
      });

      if (!response.ok) {
        throw new Error("模拟失败");
      }

      // 刷新状态
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  // 取消订单
  const cancelOrder = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`/api/project-investments/${orderId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "取消失败");
      }

      router.push(`/investments/${status?.investment.project.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">加载失败</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => router.push("/investments")}>返回项目列表</Button>
      </div>
    );
  }

  if (!status) return null;

  const { investment, paymentTransaction, statusInfo, isExpired } = status;

  // 支付成功状态
  if (investment.status === "COMPLETED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">支付成功</h2>
              <p className="text-gray-500 mb-6">
                您已成功投资项目「{investment.project.title}」
              </p>
              <p className="text-3xl font-bold text-green-600 mb-6">
                ¥{investment.amount.toLocaleString()}
              </p>
              <p className="text-sm text-gray-400 mb-4">正在跳转...</p>
              <Button onClick={() => router.push(`/investments/${investment.project.id}`)}>
                查看项目详情
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 支付失败状态
  if (investment.status === "FAILED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">支付失败</h2>
              <p className="text-gray-500 mb-6">
                您对项目「{investment.project.title}」的投资支付未成功
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => router.push(`/investments/${investment.project.id}/invest`)}
                >
                  重新投资
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/investments/${investment.project.id}`)}
                >
                  返回项目详情
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 待支付状态
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => router.push(`/investments/${investment.project.id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回项目详情
          </Button>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>确认支付</CardTitle>
                <Badge variant={isExpired ? "destructive" : "secondary"}>
                  {isExpired ? "已过期" : statusInfo.label}
                </Badge>
              </div>
              <CardDescription>{investment.project.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 支付金额 */}
              <div className="text-center py-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">支付金额</p>
                <p className="text-4xl font-bold">
                  ¥{investment.amount.toLocaleString()}
                </p>
              </div>

              {/* 支付方式 */}
              <div className="flex items-center gap-3 p-4 border rounded-lg">
                {investment.paymentMethod === "ALIPAY" && (
                  <Wallet className="h-6 w-6 text-blue-500" />
                )}
                {investment.paymentMethod === "WECHAT" && (
                  <Wallet className="h-6 w-6 text-green-500" />
                )}
                {(investment.paymentMethod === "STRIPE" ||
                  investment.paymentMethod === "BANK_TRANSFER") && (
                  <CreditCard className="h-6 w-6 text-gray-500" />
                )}
                <div>
                  <p className="font-medium">
                    {investment.paymentMethod === "ALIPAY" && "支付宝"}
                    {investment.paymentMethod === "WECHAT" && "微信支付"}
                    {investment.paymentMethod === "STRIPE" && "信用卡"}
                    {investment.paymentMethod === "BANK_TRANSFER" && "银行转账"}
                  </p>
                  <p className="text-sm text-gray-500">
                    订单号: {investment.transactionId}
                  </p>
                </div>
              </div>

              {/* 过期提示 */}
              {isExpired ? (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    支付已过期，请重新创建投资订单
                  </AlertDescription>
                </Alert>
              ) : (
                paymentTransaction?.expiredAt && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>
                      请在{" "}
                      {new Date(paymentTransaction.expiredAt).toLocaleString("zh-CN")}{" "}
                      前完成支付
                    </span>
                  </div>
                )
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* 开发环境模拟按钮 */}
              {process.env.NODE_ENV === "development" && !isExpired && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800 mb-3">
                    🔧 开发环境：模拟支付结果
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={simulatePaymentSuccess}
                      disabled={processing}
                      className="flex-1"
                    >
                      {processing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "模拟成功"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={simulatePaymentFailure}
                      disabled={processing}
                      className="flex-1"
                    >
                      模拟失败
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {!isExpired && (
                <Button className="w-full" size="lg" disabled={processing}>
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  前往支付
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={cancelOrder}
                disabled={processing}
              >
                取消订单
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchStatus}
                disabled={processing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新状态
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

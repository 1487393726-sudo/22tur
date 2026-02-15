"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

// Force dynamic rendering to avoid prerender issues with useSearchParams
export const dynamic = 'force-dynamic';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  FileText,
  Download,
  CheckCircle,
  Clock,
  Loader2,
  PenTool,
} from "lucide-react";

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  content: string;
  terms: string | null;
  status: string;
  clientSignature: string | null;
  clientSignedAt: string | null;
  companySignature: string | null;
  companySignedAt: string | null;
  createdAt: string;
  order: {
    id: string;
    orderNumber: string;
    total: number;
    subtotal: number;
    discount: number;
    tax: number;
    client: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string | null;
    };
    items: Array<{
      id: string;
      quantity: number;
      unitPrice: number;
      service: {
        name: string;
        description: string | null;
      };
    }>;
  };
}

const statusMap: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "草稿", color: "bg-gray-100 text-gray-800" },
  PENDING_CLIENT: { label: "待客户签署", color: "bg-yellow-100 text-yellow-800" },
  PENDING_COMPANY: { label: "待公司签署", color: "bg-blue-100 text-blue-800" },
  SIGNED: { label: "已签署", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "已取消", color: "bg-red-100 text-red-800" },
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [signing, setSigning] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    fetchContract();
  }, [params.id]);

  useEffect(() => {
    if (searchParams.get("sign") === "true" && contract?.status === "PENDING_CLIENT") {
      setShowSignDialog(true);
    }
  }, [searchParams, contract]);

  const fetchContract = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/contracts/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setContract(data);
      }
    } catch (error) {
      console.error("获取合同详情失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 签名画布相关函数
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSign = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const signature = canvas.toDataURL("image/png");

    try {
      setSigning(true);
      const res = await fetch(`/api/contracts/${params.id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      });

      if (res.ok) {
        setShowSignDialog(false);
        fetchContract();
      } else {
        const error = await res.json();
        alert(error.error || "签署失败");
      }
    } catch (error) {
      console.error("签署失败:", error);
      alert("签署失败");
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <p className="text-muted-foreground">合同不存在</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          返回
        </Button>
      </div>
    );
  }

  const terms = contract.terms ? JSON.parse(contract.terms) : [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        返回
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="purple-gradient-title text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {contract.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                合同编号: {contract.contractNumber}
              </p>
            </div>
            <Badge className={statusMap[contract.status]?.color}>
              {statusMap[contract.status]?.label || contract.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 订单信息 */}
          <div>
            <h3 className="font-semibold mb-3">订单信息</h3>
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-4 rounded-lg">
              <div>
                <span className="text-muted-foreground">订单编号</span>
                <p className="font-medium">{contract.order.orderNumber}</p>
              </div>
              <div>
                <span className="text-muted-foreground">客户</span>
                <p className="font-medium">
                  {contract.order.client.firstName} {contract.order.client.lastName}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">邮箱</span>
                <p className="font-medium">{contract.order.client.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">合同金额</span>
                <p className="font-medium text-primary">
                  ¥{contract.order.total.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* 服务项目 */}
          <div>
            <h3 className="font-semibold mb-3">服务项目</h3>
            <div className="space-y-2">
              {contract.order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded"
                >
                  <div>
                    <p className="font-medium">{item.service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      数量: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    ¥{(item.unitPrice * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* 合同条款 */}
          {terms.length > 0 && (
            <>
              <div>
                <h3 className="font-semibold mb-3">合同条款</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {terms.map((term: string, index: number) => (
                    <li key={index}>{term}</li>
                  ))}
                </ul>
              </div>
              <Separator />
            </>
          )}

          {/* 合同正文 */}
          <div>
            <h3 className="font-semibold mb-3">合同正文</h3>
            <div className="bg-muted/30 p-4 rounded-lg whitespace-pre-wrap text-sm">
              {contract.content}
            </div>
          </div>

          <Separator />

          {/* 签署状态 */}
          <div>
            <h3 className="font-semibold mb-3">签署状态</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {contract.clientSignedAt ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium">客户签署</span>
                </div>
                {contract.clientSignedAt ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      签署时间: {new Date(contract.clientSignedAt).toLocaleString("zh-CN")}
                    </p>
                    {contract.clientSignature && (
                      <img
                        src={contract.clientSignature}
                        alt="客户签名"
                        className="mt-2 max-h-16 border rounded"
                      />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">待签署</p>
                )}
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {contract.companySignedAt ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <span className="font-medium">公司签署</span>
                </div>
                {contract.companySignedAt ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      签署时间: {new Date(contract.companySignedAt).toLocaleString("zh-CN")}
                    </p>
                    {contract.companySignature && (
                      <img
                        src={contract.companySignature}
                        alt="公司签名"
                        className="mt-2 max-h-16 border rounded"
                      />
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">待签署</p>
                )}
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-4">
            {contract.status === "PENDING_CLIENT" && (
              <Button onClick={() => setShowSignDialog(true)}>
                <PenTool className="h-4 w-4 mr-2" />
                签署合同
              </Button>
            )}
            {contract.status === "SIGNED" && (
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                下载PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 签名对话框 */}
      <Dialog open={showSignDialog} onOpenChange={setShowSignDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>电子签名</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              请在下方区域签名，确认您已阅读并同意合同条款。
            </p>
            <div className="border rounded-lg p-2 bg-white">
              <canvas
                ref={canvasRef}
                width={350}
                height={150}
                className="border rounded cursor-crosshair w-full"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <Button variant="outline" size="sm" onClick={clearSignature}>
              清除签名
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSign} disabled={signing} className="purple-gradient-button">
              {signing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              确认签署
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

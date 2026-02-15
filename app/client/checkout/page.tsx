"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Building2,
  CheckCircle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { PageHeader } from "@/components/dashboard/page-header";
import { dashboardStyles } from "@/lib/dashboard-styles";
import { formatAmount } from "@/lib/dashboard-utils";
import { toast } from "sonner";

type PaymentMethod = "alipay" | "wechat" | "bank" | "invoice";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("alipay");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    notes: "",
  });

  const { items, getTotal, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async () => {
    if (!contactInfo.name || !contactInfo.phone) {
      toast.error("请填写联系人姓名和电话");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            serviceId: item.serviceId,
            serviceName: item.serviceName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            note: item.note,
          })),
          totalAmount: getTotal(),
          paymentMethod,
          contactInfo,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        clearCart();
        toast.success("订单创建成功！");
        router.push(`/client/orders/${order.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || "创建订单失败");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("创建订单失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <PageHeader title="结算" description="确认订单信息并完成支付" icon="💳" />
        <Card className={dashboardStyles.card.base}>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <PageHeader title="结算" description="确认订单信息并完成支付" icon="💳" />
        <Card className={dashboardStyles.card.base}>
          <CardContent className="flex flex-col items-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">购物车是空的</h2>
            <p className="text-muted-foreground mb-6">请先添加商品到购物车</p>
            <Link href="/pricing">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">浏览服务</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <PageHeader
        title="结算"
        description="确认订单信息并完成支付"
        icon="💳"
        actions={
          <Link href="/client/cart">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              返回购物车
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className={dashboardStyles.card.base}>
            <CardHeader>
              <CardTitle>联系信息</CardTitle>
              <CardDescription>请填写您的联系方式，以便我们与您沟通</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">联系人姓名 *</Label>
                  <Input
                    id="name"
                    placeholder="请输入姓名"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">联系电话 *</Label>
                  <Input
                    id="phone"
                    placeholder="请输入电话号码"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">电子邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="请输入邮箱"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">公司名称</Label>
                  <Input
                    id="company"
                    placeholder="请输入公司名称（选填）"
                    value={contactInfo.company}
                    onChange={(e) => setContactInfo({ ...contactInfo, company: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">备注信息</Label>
                <Textarea
                  id="notes"
                  placeholder="如有特殊需求，请在此说明"
                  value={contactInfo.notes}
                  onChange={(e) => setContactInfo({ ...contactInfo, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className={dashboardStyles.card.base}>
            <CardHeader>
              <CardTitle>支付方式</CardTitle>
              <CardDescription>选择您偏好的支付方式</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Label
                  htmlFor="alipay"
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "alipay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="alipay" id="alipay" />
                  <Wallet className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-medium">支付宝</div>
                    <div className="text-sm text-muted-foreground">推荐使用</div>
                  </div>
                </Label>

                <Label
                  htmlFor="wechat"
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "wechat" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="wechat" id="wechat" />
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-medium">微信支付</div>
                    <div className="text-sm text-muted-foreground">扫码支付</div>
                  </div>
                </Label>

                <Label
                  htmlFor="bank"
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="bank" id="bank" />
                  <Building2 className="h-5 w-5 text-orange-500" />
                  <div>
                    <div className="font-medium">银行转账</div>
                    <div className="text-sm text-muted-foreground">对公转账</div>
                  </div>
                </Label>

                <Label
                  htmlFor="invoice"
                  className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "invoice" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  <RadioGroupItem value="invoice" id="invoice" />
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-medium">先开发票</div>
                    <div className="text-sm text-muted-foreground">企业客户</div>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className={`${dashboardStyles.card.base} sticky top-24`}>
            <CardHeader>
              <CardTitle>订单摘要</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{item.serviceName}</div>
                      <div className="text-muted-foreground">
                        {formatAmount(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">{formatAmount(item.unitPrice * item.quantity)}</div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>商品数量</span>
                  <span>{items.length} 项</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>小计</span>
                  <span>{formatAmount(getTotal())}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>应付金额</span>
                <span className="text-primary">{formatAmount(getTotal())}</span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    提交中...
                  </>
                ) : (
                  "提交订单"
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                提交订单即表示您同意我们的服务条款
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

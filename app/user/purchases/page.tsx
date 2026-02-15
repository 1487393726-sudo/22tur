"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/user/page-header";
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye,
  RefreshCw,
  Calendar,
  CreditCard,
  Package,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  DollarSign,
} from "lucide-react";

interface Purchase {
  id: string;
  orderNumber: string;
  productName: string;
  productType: "service" | "software" | "template" | "consultation";
  amount: number;
  currency: string;
  status: "completed" | "pending" | "cancelled" | "refunded";
  purchaseDate: string;
  deliveryDate?: string;
  paymentMethod: string;
  description: string;
  downloadUrl?: string;
  invoiceUrl?: string;
}

const mockPurchases: Purchase[] = [
  {
    id: "1",
    orderNumber: "ORD-2024-001",
    productName: "企业网站开发服务",
    productType: "service",
    amount: 15000,
    currency: "CNY",
    status: "completed",
    purchaseDate: "2024-01-05T10:30:00",
    deliveryDate: "2024-01-10T16:00:00",
    paymentMethod: "支付宝",
    description: "包含响应式设计、后台管理系统、SEO优化等功能",
    invoiceUrl: "/invoices/001.pdf",
  },
  {
    id: "2",
    orderNumber: "ORD-2024-002",
    productName: "UI设计模板包",
    productType: "template",
    amount: 299,
    currency: "CNY",
    status: "completed",
    purchaseDate: "2024-01-03T14:20:00",
    deliveryDate: "2024-01-03T14:25:00",
    paymentMethod: "微信支付",
    description: "包含20个现代化UI设计模板，支持Figma和Sketch格式",
    downloadUrl: "/downloads/ui-templates.zip",
    invoiceUrl: "/invoices/002.pdf",
  },
  {
    id: "3",
    orderNumber: "ORD-2024-003",
    productName: "品牌设计咨询",
    productType: "consultation",
    amount: 3000,
    currency: "CNY",
    status: "pending",
    purchaseDate: "2024-01-08T09:15:00",
    paymentMethod: "银行转账",
    description: "2小时品牌设计咨询服务，包含品牌定位和视觉识别建议",
  },
  {
    id: "4",
    orderNumber: "ORD-2024-004",
    productName: "项目管理软件",
    productType: "software",
    amount: 1200,
    currency: "CNY",
    status: "refunded",
    purchaseDate: "2023-12-28T11:45:00",
    paymentMethod: "信用卡",
    description: "年度订阅项目管理软件，支持团队协作和任务跟踪",
  },
];

const statusConfig = {
  completed: { label: "已完成", color: "bg-success", icon: CheckCircle },
  pending: { label: "处理中", color: "bg-warning", icon: Clock },
  cancelled: { label: "已取消", color: "bg-muted", icon: XCircle },
  refunded: { label: "已退款", color: "bg-destructive", icon: RefreshCw },
};

const typeConfig = {
  service: { label: "服务", color: "bg-primary" },
  software: { label: "软件", color: "bg-secondary" },
  template: { label: "模板", color: "bg-success" },
  consultation: { label: "咨询", color: "bg-info" },
};

const statusFilters = ["all", "completed", "pending", "cancelled", "refunded"];

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>(mockPurchases);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("all");

  const stats = [
    {
      label: "总订单数",
      value: purchases.length.toString(),
      icon: ShoppingCart,
      color: "bg-primary",
    },
    {
      label: "总消费金额",
      value: `¥${purchases.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}`,
      icon: DollarSign,
      color: "bg-success",
    },
    {
      label: "已完成订单",
      value: purchases.filter(p => p.status === "completed").length.toString(),
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "处理中订单",
      value: purchases.filter(p => p.status === "pending").length.toString(),
      icon: Clock,
      color: "bg-yellow-500",
    },
  ];

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purchase.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="购买记录"
        description="查看和管理您的所有购买订单"
        icon={ShoppingCart}
        badge={purchases.filter(p => p.status === "pending").length.toString()}
        stats={stats}
        actions={
          <>
            <Button variant="outline" className="border-border text-foreground hover:bg-muted">
              <Download className="w-4 h-4 mr-2" />
              导出记录
            </Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Package className="w-4 h-4 mr-2" />
              浏览商品
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="user-card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="搜索订单或产品..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-border text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex gap-2">
            {statusFilters.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={
                  statusFilter === status
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : "border-border text-foreground hover:bg-muted"
                }
              >
                {status === "all" ? "全部" : statusConfig[status as keyof typeof statusConfig]?.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Purchases List */}
      <div className="space-y-4">
        {filteredPurchases.map((purchase) => {
          const StatusIcon = statusConfig[purchase.status].icon;
          return (
            <div key={purchase.id} className="user-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-foreground font-semibold text-lg">
                      {purchase.productName}
                    </h3>
                    <Badge className={`${statusConfig[purchase.status].color} text-white`}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig[purchase.status].label}
                    </Badge>
                    <Badge className={`${typeConfig[purchase.productType].color} text-white`}>
                      {typeConfig[purchase.productType].label}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">
                    {purchase.description}
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <span>订单号:</span>
                      <span className="text-foreground font-mono">{purchase.orderNumber}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(purchase.purchaseDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CreditCard className="w-4 h-4" />
                      <span>{purchase.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {formatAmount(purchase.amount, purchase.currency)}
                  </div>
                  {purchase.deliveryDate && (
                    <div className="text-sm text-muted-foreground">
                      交付: {formatDate(purchase.deliveryDate)}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex space-x-2">
                  {purchase.downloadUrl && (
                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                      <Download className="w-4 h-4 mr-1" />
                      下载
                    </Button>
                  )}
                  {purchase.invoiceUrl && (
                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                      <Eye className="w-4 h-4 mr-1" />
                      查看发票
                    </Button>
                  )}
                  <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                    <Eye className="w-4 h-4 mr-1" />
                    订单详情
                  </Button>
                </div>
                <div className="flex space-x-2">
                  {purchase.status === "pending" && (
                    <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
                      <XCircle className="w-4 h-4 mr-1" />
                      取消订单
                    </Button>
                  )}
                  {purchase.status === "completed" && (
                    <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-muted">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      申请退款
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredPurchases.length === 0 && (
        <div className="purple-gradient-card">
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center purple-gradient-subtitle">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
              <p className="text-lg font-medium mb-2 purple-gradient-title">没有找到购买记录</p>
              <p className="text-sm mb-4">
                {searchTerm || statusFilter !== "all" ? "尝试调整搜索条件" : "您还没有任何购买记录"}
              </p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }} className="purple-gradient-button">
                {searchTerm || statusFilter !== "all" ? "清除筛选" : "浏览商品"}
              </Button>
            </div>
          </CardContent>
        </div>
      )}

      {/* Purchase Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="purple-gradient-card">
          <CardHeader>
            <CardTitle className="purple-gradient-title flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              消费统计
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(typeConfig).map(([type, config]) => {
                const typeAmount = purchases
                  .filter(p => p.productType === type)
                  .reduce((sum, p) => sum + p.amount, 0);
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${config.color}`}></div>
                      <span className="purple-gradient-text">{config.label}</span>
                    </div>
                    <span className="purple-gradient-title font-medium">
                      ¥{typeAmount.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </div>

        <div className="purple-gradient-card">
          <CardHeader>
            <CardTitle className="purple-gradient-title flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              最近订单
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.slice(0, 4).map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                  <div>
                    <p className="purple-gradient-title text-sm font-medium">{purchase.productName}</p>
                    <p className="purple-gradient-subtitle text-xs">{formatDate(purchase.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <p className="purple-gradient-title text-sm font-medium">
                      {formatAmount(purchase.amount, purchase.currency)}
                    </p>
                    <Badge className={`${statusConfig[purchase.status].color} text-white text-xs`}>
                      {statusConfig[purchase.status].label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </div>
    </div>
  );
}
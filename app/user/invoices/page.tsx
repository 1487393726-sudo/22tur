"use client";

import { PageHeader } from "@/components/user/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  FileText,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

export default function InvoicesPage() {
  const stats = [
    {
      label: "总发票数",
      value: "28",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      label: "已支付",
      value: "¥45,280",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "待支付",
      value: "¥12,500",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "逾期",
      value: "¥3,200",
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  const invoices = [
    {
      id: "INV-2024-001",
      title: "直播设备采购",
      amount: 15800,
      status: "paid",
      dueDate: "2024-01-15",
      issueDate: "2024-01-01",
      vendor: "设备供应商A",
    },
    {
      id: "INV-2024-002",
      title: "软件服务费",
      amount: 5200,
      status: "pending",
      dueDate: "2024-01-20",
      issueDate: "2024-01-05",
      vendor: "软件服务商B",
    },
    {
      id: "INV-2024-003",
      title: "办公用品采购",
      amount: 1280,
      status: "overdue",
      dueDate: "2024-01-10",
      issueDate: "2023-12-28",
      vendor: "办公用品商C",
    },
    {
      id: "INV-2024-004",
      title: "网络服务费",
      amount: 3600,
      status: "paid",
      dueDate: "2024-01-25",
      issueDate: "2024-01-08",
      vendor: "网络服务商D",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 text-white">已支付</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">待支付</Badge>;
      case "overdue":
        return <Badge className="bg-red-500 text-white">逾期</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return `¥${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="purple-gradient-hero p-6 rounded-2xl">
        <PageHeader
          title="发票管理"
          description="管理您的发票和付款记录"
          icon={CreditCard}
          stats={stats}
          actions={
            <>
              <Button variant="outline" className="purple-gradient-button border-0">
                <Filter className="w-4 h-4 mr-2" />
                筛选
              </Button>
              <Button className="purple-gradient-button">
                <Plus className="w-4 h-4 mr-2" />
                创建发票
              </Button>
            </>
          }
        />
      </div>

        {/* 搜索和筛选 */}
        <div className="purple-gradient-card">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索发票编号、供应商..."
                  className="purple-gradient-input w-full pl-10 pr-4 py-2"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  全部
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  已支付
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  待支付
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  逾期
                </Button>
              </div>
            </div>
          </CardContent>
        </div>

        {/* 发票列表 */}
        <div className="grid grid-cols-1 gap-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="purple-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="purple-gradient-title font-semibold">{invoice.id}</h3>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <p className="purple-gradient-text font-medium mb-1">{invoice.title}</p>
                    <p className="purple-gradient-subtitle text-sm mb-3">{invoice.vendor}</p>
                    <div className="flex items-center gap-4 text-sm purple-gradient-subtitle">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {formatAmount(invoice.amount)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        开票: {invoice.issueDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        到期: {invoice.dueDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                      <Download className="w-4 h-4" />
                    </Button>
                    {invoice.status === "pending" && (
                      <Button size="sm" className="purple-gradient-button">
                        支付
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {invoices.length === 0 && (
          <div className="purple-gradient-card">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center purple-gradient-subtitle">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2 purple-gradient-title">暂无发票记录</p>
                <p className="text-sm mb-4">创建您的第一张发票</p>
                <Button className="purple-gradient-button">
                  <Plus className="w-4 h-4 mr-2" />
                  创建发票
                </Button>
              </div>
            </CardContent>
          </div>
        )}
    </div>
  );
}
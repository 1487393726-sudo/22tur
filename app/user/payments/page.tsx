"use client";

import { PageHeader } from "@/components/user/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

export default function PaymentsPage() {
  const stats = [
    {
      label: "总交易额",
      value: "¥128,450",
      icon: DollarSign,
      color: "bg-blue-500",
    },
    {
      label: "成功交易",
      value: "156",
      icon: CheckCircle,
      color: "bg-green-500",
    },
    {
      label: "待处理",
      value: "8",
      icon: Clock,
      color: "bg-yellow-500",
    },
    {
      label: "失败交易",
      value: "3",
      icon: AlertCircle,
      color: "bg-red-500",
    },
  ];

  const payments = [
    {
      id: "PAY-2024-001",
      type: "outgoing",
      title: "设备采购付款",
      amount: 15800,
      status: "completed",
      date: "2024-01-08",
      method: "银行转账",
      recipient: "设备供应商A",
    },
    {
      id: "PAY-2024-002",
      type: "incoming",
      title: "项目款项收入",
      amount: 25000,
      status: "completed",
      date: "2024-01-07",
      method: "在线支付",
      recipient: "客户B公司",
    },
    {
      id: "PAY-2024-003",
      type: "outgoing",
      title: "软件服务费",
      amount: 5200,
      status: "pending",
      date: "2024-01-06",
      method: "信用卡",
      recipient: "软件服务商C",
    },
    {
      id: "PAY-2024-004",
      type: "incoming",
      title: "咨询服务收入",
      amount: 8500,
      status: "completed",
      date: "2024-01-05",
      method: "银行转账",
      recipient: "客户D公司",
    },
    {
      id: "PAY-2024-005",
      type: "outgoing",
      title: "办公租金",
      amount: 12000,
      status: "failed",
      date: "2024-01-04",
      method: "自动扣款",
      recipient: "物业管理公司",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500 text-white">已完成</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">处理中</Badge>;
      case "failed":
        return <Badge className="bg-red-500 text-white">失败</Badge>;
      default:
        return <Badge variant="outline">未知</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "incoming" ? (
      <ArrowDownLeft className="w-4 h-4 text-green-400" />
    ) : (
      <ArrowUpRight className="w-4 h-4 text-red-400" />
    );
  };

  const formatAmount = (amount: number, type: string) => {
    const prefix = type === "incoming" ? "+" : "-";
    return `${prefix}¥${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="purple-gradient-hero p-6 rounded-2xl">
        <PageHeader
          title="支付管理"
          description="管理您的支付记录和交易历史"
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
                新建支付
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
                  placeholder="搜索交易编号、收款方..."
                  className="purple-gradient-input w-full pl-10 pr-4 py-2"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  全部
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  收入
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  支出
                </Button>
                <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                  待处理
                </Button>
              </div>
            </div>
          </CardContent>
        </div>

        {/* 支付记录列表 */}
        <div className="grid grid-cols-1 gap-4">
          {payments.map((payment) => (
            <div key={payment.id} className="purple-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      {getTypeIcon(payment.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="purple-gradient-title font-semibold">{payment.id}</h3>
                        {getStatusBadge(payment.status)}
                      </div>
                      <p className="purple-gradient-text font-medium mb-1">{payment.title}</p>
                      <p className="purple-gradient-subtitle text-sm mb-3">{payment.recipient}</p>
                      <div className="flex items-center gap-4 text-sm purple-gradient-subtitle">
                        <span className="flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {payment.method}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {payment.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        payment.type === "incoming" ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatAmount(payment.amount, payment.type)}
                    </div>
                    {payment.status === "pending" && (
                      <Button size="sm" className="purple-gradient-button mt-2">
                        处理
                      </Button>
                    )}
                    {payment.status === "failed" && (
                      <Button size="sm" variant="outline" className="border-red-500 text-red-400 mt-2">
                        重试
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {payments.length === 0 && (
          <div className="purple-gradient-card">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center purple-gradient-subtitle">
                <CreditCard className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2 purple-gradient-title">暂无支付记录</p>
                <p className="text-sm mb-4">开始您的第一笔交易</p>
                <Button className="purple-gradient-button">
                  <Plus className="w-4 h-4 mr-2" />
                  新建支付
                </Button>
              </div>
            </CardContent>
          </div>
        )}
    </div>
  );
}
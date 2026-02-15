"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Wallet,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  History,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "INVESTMENT" | "RETURN";
  amount: number;
  description: string;
  date: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
}

export default function InvestmentWalletPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // 模拟钱包数据
    setTimeout(() => {
      setBalance(150000);
      setAvailableBalance(50000);
      setTransactions([
        {
          id: "1",
          type: "DEPOSIT",
          amount: 100000,
          description: "账户充值",
          date: "2024-10-01",
          status: "COMPLETED",
        },
        {
          id: "2",
          type: "INVESTMENT",
          amount: -50000,
          description: "投资项目：科技创新基金 A 轮",
          date: "2024-10-05",
          status: "COMPLETED",
        },
        {
          id: "3",
          type: "RETURN",
          amount: 5000,
          description: "投资收益：科技创新基金 A 轮",
          date: "2024-10-15",
          status: "COMPLETED",
        },
        {
          id: "4",
          type: "INVESTMENT",
          amount: -100000,
          description: "投资项目：医疗健康产业基金",
          date: "2024-10-20",
          status: "PENDING",
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN");
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case "WITHDRAW":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case "INVESTMENT":
        return <Minus className="h-4 w-4 text-blue-600" />;
      case "RETURN":
        return <Plus className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "DEPOSIT":
        return "充值";
      case "WITHDRAW":
        return "提现";
      case "INVESTMENT":
        return "投资";
      case "RETURN":
        return "收益";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen space-y-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Button>
        <h1 className="purple-gradient-title text-3xl font-bold mb-2 flex items-center gap-2">
          <Wallet className="h-8 w-8" />
          投资钱包
        </h1>
        <p className="purple-gradient-text">
          管理您的投资账户余额和交易记录
        </p>
      </div>

      {/* 余额卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="purple-gradient-card">
          <CardHeader>
            <CardTitle className="purple-gradient-text text-sm font-medium">
              账户总余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-3xl font-bold">{formatAmount(balance)}</div>
          </CardContent>
        </Card>

        <Card className="purple-gradient-card">
          <CardHeader>
            <CardTitle className="purple-gradient-text text-sm font-medium">
              可用余额
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="purple-gradient-title text-3xl font-bold text-green-500">
              {formatAmount(availableBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-4">
        <Button
          className="flex-1"
          onClick={() => router.push("/dashboard/investment/wallet/deposit")}
        >
          <Plus className="h-4 w-4 mr-2" />
          充值
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/dashboard/investment/wallet/withdraw")}
        >
          <Minus className="h-4 w-4 mr-2" />
          提现
        </Button>
      </div>

      {/* 交易记录 */}
      <Card className="purple-gradient-card">
        <CardHeader>
          <CardTitle className="purple-gradient-title flex items-center gap-2">
            <History className="h-5 w-5" />
            交易记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">全部</TabsTrigger>
              <TabsTrigger value="deposit">充值</TabsTrigger>
              <TabsTrigger value="investment">投资</TabsTrigger>
              <TabsTrigger value="return">收益</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="purple-gradient-title font-medium">{getTransactionLabel(tx.type)}</p>
                        <p className="purple-gradient-text text-sm">{tx.description}</p>
                        <p className="purple-gradient-text text-xs">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`purple-gradient-title font-semibold ${
                          tx.amount > 0 ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {tx.amount > 0 ? "+" : ""}
                        {formatAmount(tx.amount)}
                      </p>
                      <span
                        className={`text-xs ${
                          tx.status === "COMPLETED"
                            ? "text-green-500"
                            : tx.status === "PENDING"
                            ? "text-yellow-500"
                            : "text-red-500"
                        }`}
                      >
                        {tx.status === "COMPLETED"
                          ? "已完成"
                          : tx.status === "PENDING"
                          ? "处理中"
                          : "失败"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="deposit" className="mt-4">
              <div className="text-center py-8 purple-gradient-text">
                筛选功能开发中...
              </div>
            </TabsContent>
            <TabsContent value="investment" className="mt-4">
              <div className="text-center py-8 purple-gradient-text">
                筛选功能开发中...
              </div>
            </TabsContent>
            <TabsContent value="return" className="mt-4">
              <div className="text-center py-8 purple-gradient-text">
                筛选功能开发中...
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

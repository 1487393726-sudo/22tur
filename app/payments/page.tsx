"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Download,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentGateway: string;
  transactionId: string;
  description?: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

const statusLabels: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

const statusIcons: Record<string, any> = {
  PENDING: Clock,
  PROCESSING: Loader2,
  COMPLETED: CheckCircle,
  FAILED: XCircle,
};

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL("/api/payments", window.location.origin);
        if (session?.user?.id) {
          url.searchParams.append("userId", session.user.id);
        }
        if (filterStatus) {
          url.searchParams.append("status", filterStatus);
        }
        url.searchParams.append("limit", "50");

        const response = await fetch(url.toString());

        if (!response.ok) {
          throw new Error("Failed to fetch payments");
        }

        const data = await response.json();
        setPayments(data.payments || []);
      } catch (err) {
        console.error(":", err);
        setError(
          err instanceof Error ? err.message : "An error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchPayments();
    }
  }, [session?.user?.id, filterStatus]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format amount
  const formatAmount = (amount: number, currency: string) => {
    const currencySymbols: Record<string, string> = {
      cny: "¥",
      usd: "$",
      eur: "€",
    };
    return `${currencySymbols[currency.toLowerCase()] || ""}${amount.toLocaleString()}`;
  };

  // Calculate statistics
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const completedAmount = payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="purple-gradient-page purple-gradient-content min-h-screen bg-gray-50">
      {/*  */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/*  */}
        <div className="mb-8">
          <h1 className="purple-gradient-title text-3xl font-bold mb-2">Payment History</h1>
          <p className="text-gray-600">
            View and manage all your payment transactions
          </p>
        </div>

        {/*  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/*  */}
          <Card className="purple-gradient-card">
            <CardHeader className="purple-gradient-card pb-3">
              <CardTitle className="purple-gradient-title purple-gradient-card text-sm font-medium flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                
              </CardTitle>
            </CardHeader>
            <CardContent className="purple-gradient-card">
              <div className="text-2xl font-bold">
                {formatAmount(totalAmount, "cny")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {payments.length} 
              </p>
            </CardContent>
          </Card>

          {/* ?*/}
          <Card className="purple-gradient-card">
            <CardHeader className="purple-gradient-card pb-3">
              <CardTitle className="purple-gradient-title purple-gradient-card text-sm font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                
              </CardTitle>
            </CardHeader>
            <CardContent className="purple-gradient-card">
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(completedAmount, "cny")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {payments.filter((p) => p.status === "COMPLETED").length} 
              </p>
            </CardContent>
          </Card>

          {/* ?*/}
          <Card className="purple-gradient-card">
            <CardHeader className="purple-gradient-card pb-3">
              <CardTitle className="purple-gradient-title purple-gradient-card text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                
              </CardTitle>
            </CardHeader>
            <CardContent className="purple-gradient-card">
              <div className="text-2xl font-bold text-yellow-600">
                {formatAmount(pendingAmount, "cny")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {payments.filter((p) => p.status === "PENDING").length} 
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 支付记录标签页 */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">全部记录</TabsTrigger>
            <TabsTrigger value="filter">筛选</TabsTrigger>
          </TabsList>

          {/* 支付记录列表 */}
          <TabsContent value="all" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : error ? (
              <Card className="purple-gradient-card">
                <CardContent className="purple-gradient-card pt-6">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            ) : payments.length === 0 ? (
              <Card className="purple-gradient-card">
                <CardContent className="purple-gradient-card pt-6">
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4"></p>
                    <Button
                      onClick={() => router.push("/investments")}
                    >
                      
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => {
                  const StatusIcon = statusIcons[payment.status];
                  return (
                    <Card key={payment.id} className="purple-gradient-card">
                      <CardContent className="purple-gradient-card pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`p-3 rounded-lg ${
                              payment.status === "COMPLETED"
                                ? "bg-green-100"
                                : payment.status === "PENDING"
                                  ? "bg-yellow-100"
                                  : "bg-gray-100"
                            }`}>
                              <StatusIcon className={`w-6 h-6 ${
                                payment.status === "COMPLETED"
                                  ? "text-green-600"
                                  : payment.status === "PENDING"
                                    ? "text-yellow-600"
                                    : "text-gray-400"
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">
                                  {payment.description || ""}
                                </h3>
                                <Badge className={statusColors[payment.status]}>
                                  {statusLabels[payment.status]}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    
                                  </p>
                                  <p className="font-semibold">
                                    {formatAmount(payment.amount, payment.currency)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    
                                  </p>
                                  <p className="font-semibold">
                                    {payment.paymentGateway}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                     ID
                                  </p>
                                  <p className="font-mono text-xs truncate">
                                    {payment.transactionId}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">
                                    
                                  </p>
                                  <p className="text-sm">
                                    {formatDate(payment.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/*  */}
          <TabsContent value="filter" className="space-y-6">
            <Card className="purple-gradient-card">
              <CardHeader className="purple-gradient-card">
                <CardTitle className="purple-gradient-title purple-gradient-card text-base flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  
                </CardTitle>
              </CardHeader>
              <CardContent className="purple-gradient-card">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterStatus === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(null)}
                  >
                    全部
                  </Button>
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <Button
                      key={status}
                      variant={
                        filterStatus === status ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

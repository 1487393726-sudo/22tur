"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Download,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";

interface Purchase {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentId: string;
  purchaseDate: string;
  completedAt?: string;
  notes?: string;
  service: {
    id: string;
    title: string;
    description: string;
    category: string;
    duration?: string;
    deliveryTime?: string;
    features?: string;
  };
  progress?: {
    current: number;
    total: number;
    status: string;
    lastUpdate: string;
    details: Array<{
      step: string;
      completed: boolean;
      completedAt?: string;
    }>;
  };
}

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchPurchases();
    }
  }, [session]);

  const fetchPurchases = async () => {
    try {
      const response = await fetch("/api/user/purchases");
      if (response.ok) {
        const data = await response.json();
        setPurchases(data);
      }
    } catch (error) {
      console.error("获取购买记录失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" data-oid="qrrt_ar">
            待支付
          </Badge>
        );
      case "PAID":
        return (
          <Badge variant="default" data-oid="cern_vt">
            已支付
          </Badge>
        );
      case "PROCESSING":
        return (
          <Badge variant="secondary" data-oid="13zgco9">
            处理中
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500" data-oid=":6c5p4e">
            已完成
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" data-oid="z7ksteq">
            已取消
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" data-oid="1rqko5z">
            {status}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-500" data-oid=":e4xr7:" />;
      case "PAID":
        return (
          <DollarSign className="h-5 w-5 text-blue-500" data-oid="g3-_zx4" />
        );
      case "PROCESSING":
        return <Truck className="h-5 w-5 text-orange-500" data-oid="uiag2ih" />;
      case "COMPLETED":
        return (
          <CheckCircle className="h-5 w-5 text-green-500" data-oid="l2-x6o9" />
        );
      case "CANCELLED":
        return <XCircle className="h-5 w-5 text-red-500" data-oid="w94b53g" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" data-oid="axqew04" />;
    }
  };

  const filteredPurchases = purchases.filter((purchase) => {
    switch (activeTab) {
      case "active":
        return ["PAID", "PROCESSING"].includes(purchase.status);
      case "completed":
        return purchase.status === "COMPLETED";
      case "cancelled":
        return purchase.status === "CANCELLED";
      default:
        return true;
    }
  });

  if (status === "loading") {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"
        data-oid="2d:cpzz"
      >
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"
          data-oid="a0q5q7k"
        ></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      data-oid="tm8al:k"
    >
      {/* 顶部导航栏 */}
      <header
        className="bg-black/50 backdrop-blur-md border-b border-white/10 sticky top-0 z-40"
        data-oid="dj24igg"
      >
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          data-oid="jbcx-h8"
        >
          <div
            className="flex justify-between items-center h-16"
            data-oid="tde.b99"
          >
            <div className="flex items-center space-x-4" data-oid="ougrdif">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-white hover:bg-white/10"
                data-oid="ooqy2hy"
              >
                <ArrowLeft className="h-4 w-4 mr-2" data-oid="g42-2kb" />
                返回仪表板
              </Button>
              <h1
                className="text-xl font-semibold text-white"
                data-oid="lyzp_aw"
              >
                我的购买
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/services")}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              data-oid="fbw2fbk"
            >
              <ShoppingBag className="h-4 w-4 mr-2" data-oid="obr.-ti" />
              浏览服务
            </Button>
          </div>
        </div>
      </header>

      <main
        className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8"
        data-oid="14ok7zv"
      >
        <div className="px-4 py-6 sm:px-0" data-oid=":pvda2z">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            data-oid="cylvpsh"
          >
            <TabsList className="grid w-full grid-cols-3" data-oid="e6ex_95">
              <TabsTrigger value="active" data-oid="vljkkkq">
                进行中
              </TabsTrigger>
              <TabsTrigger value="completed" data-oid="y26re0z">
                已完成
              </TabsTrigger>
              <TabsTrigger value="cancelled" data-oid="clpej98">
                已取消
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6" data-oid="o:enbkd">
              {loading ? (
                <div
                  className="flex items-center justify-center h-64"
                  data-oid="k8uuk6_"
                >
                  <div
                    className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
                    data-oid="8n74wiq"
                  ></div>
                </div>
              ) : (
                <div className="space-y-6" data-oid="-7h_cvp">
                  {filteredPurchases.length === 0 ? (
                    <Card
                      className="bg-white/10 border-white/20 backdrop-blur-sm"
                      data-oid="r_awzd6"
                    >
                      <CardContent
                        className="text-center py-12"
                        data-oid="9mw83ly"
                      >
                        <ShoppingBag
                          className="h-12 w-12 text-gray-400 mx-auto mb-4"
                          data-oid="b68rlal"
                        />
                        <h3
                          className="text-lg font-medium text-white mb-2"
                          data-oid="okupqwz"
                        >
                          {activeTab === "active"
                            ? "暂无进行中的订单"
                            : activeTab === "completed"
                              ? "暂无已完成订单"
                              : "暂无已取消订单"}
                        </h3>
                        <p className="text-gray-300 mb-4" data-oid="51f83_k">
                          {activeTab === "active"
                            ? "去服务市场浏览和购买您需要的服务"
                            : activeTab === "completed"
                              ? "您已完成的服务订单会显示在这里"
                              : "您取消的订单会显示在这里"}
                        </p>
                        {activeTab === "active" && (
                          <Button
                            onClick={() => router.push("/services")}
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            data-oid=":7uczqw"
                          >
                            <ShoppingBag
                              className="h-4 w-4 mr-2"
                              data-oid="4fjgj32"
                            />
                            去购买
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ) : (
                    filteredPurchases.map((purchase) => (
                      <Card
                        key={purchase.id}
                        className="bg-white/10 border-white/20 backdrop-blur-sm"
                        data-oid="k32us9d"
                      >
                        <CardHeader data-oid="7l1d5l0">
                          <div
                            className="flex justify-between items-start"
                            data-oid="jh.tvor"
                          >
                            <div className="flex-1" data-oid="fk6:-y4">
                              <div
                                className="flex items-center space-x-3 mb-2"
                                data-oid=":t9r_vp"
                              >
                                {getStatusIcon(purchase.status)}
                                <CardTitle
                                  className="text-lg text-white"
                                  data-oid="8x18ddk"
                                >
                                  {purchase.service.title}
                                </CardTitle>
                              </div>
                              <CardDescription
                                className="line-clamp-2 text-gray-300"
                                data-oid="tscpa.u"
                              >
                                {purchase.service.description}
                              </CardDescription>
                            </div>
                            <div
                              className="flex flex-col items-end space-y-2"
                              data-oid="-m:xxb-"
                            >
                              {getStatusBadge(purchase.status)}
                              <div
                                className="text-2xl font-bold text-blue-400"
                                data-oid="ky7z:2w"
                              >
                                ¥{purchase.amount.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4" data-oid="_zywrlg">
                          {/* 服务信息 */}
                          <div
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            data-oid="x6gup95"
                          >
                            <div data-oid="q2xr:bg">
                              <div
                                className="text-sm text-gray-300"
                                data-oid="bnnt1yn"
                              >
                                服务分类
                              </div>
                              <div
                                className="font-medium text-white"
                                data-oid=".g31tp9"
                              >
                                {purchase.service.category}
                              </div>
                            </div>
                            <div data-oid="fof476d">
                              <div
                                className="text-sm text-gray-300"
                                data-oid="zzg-wqz"
                              >
                                购买时间
                              </div>
                              <div
                                className="font-medium text-white"
                                data-oid="sc0h9kf"
                              >
                                {new Date(
                                  purchase.purchaseDate,
                                ).toLocaleDateString()}
                              </div>
                            </div>
                            {purchase.service.duration && (
                              <div data-oid="brapucc">
                                <div
                                  className="text-sm text-gray-300"
                                  data-oid="x1z987-"
                                >
                                  服务时长
                                </div>
                                <div
                                  className="font-medium text-white"
                                  data-oid="4e20w3r"
                                >
                                  {purchase.service.duration}
                                </div>
                              </div>
                            )}
                            {purchase.service.deliveryTime && (
                              <div data-oid="94g6vzn">
                                <div
                                  className="text-sm text-gray-300"
                                  data-oid="wgs83c8"
                                >
                                  交付时间
                                </div>
                                <div
                                  className="font-medium text-white"
                                  data-oid="b.8bezg"
                                >
                                  {purchase.service.deliveryTime}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 服务特性 */}
                          {purchase.service.features && (
                            <div data-oid="2cm75ep">
                              <div
                                className="text-sm text-gray-300 mb-2"
                                data-oid="xecrayu"
                              >
                                服务特性
                              </div>
                              <div
                                className="text-sm bg-white/5 p-3 rounded border border-white/10"
                                data-oid="rg_2qrw"
                              >
                                {purchase.service.features}
                              </div>
                            </div>
                          )}

                          {/* 进度跟踪 */}
                          {purchase.status === "PROCESSING" &&
                            purchase.progress && (
                              <div className="border-t pt-4" data-oid="_kt7_ss">
                                <div
                                  className="flex items-center justify-between mb-2"
                                  data-oid="ins8dgm"
                                >
                                  <div
                                    className="text-sm font-medium"
                                    data-oid="2kjq6op"
                                  >
                                    服务进度
                                  </div>
                                  <div
                                    className="text-sm text-gray-600"
                                    data-oid="uab--3g"
                                  >
                                    {purchase.progress.current}/
                                    {purchase.progress.total}
                                  </div>
                                </div>
                                <Progress
                                  value={
                                    (purchase.progress.current /
                                      purchase.progress.total) *
                                    100
                                  }
                                  className="mb-3"
                                  data-oid="zpwu-0k"
                                />

                                <div
                                  className="text-xs text-gray-400"
                                  data-oid="rki694l"
                                >
                                  最后更新:{" "}
                                  {new Date(
                                    purchase.progress.lastUpdate,
                                  ).toLocaleString()}
                                </div>

                                {/* 进度步骤 */}
                                <div
                                  className="space-y-2 mt-4"
                                  data-oid="mxts50y"
                                >
                                  {purchase.progress.details.map(
                                    (detail, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-3"
                                        data-oid="np7-zyl"
                                      >
                                        <div
                                          className={`w-4 h-4 rounded-full ${
                                            detail.completed
                                              ? "bg-green-500"
                                              : "bg-gray-400"
                                          }`}
                                          data-oid="yx8et_r"
                                        >
                                          {detail.completed && (
                                            <CheckCircle
                                              className="h-3 w-3 text-white m-0.5"
                                              data-oid="h:8wxyg"
                                            />
                                          )}
                                        </div>
                                        <span
                                          className={`text-sm ${
                                            detail.completed
                                              ? "text-white"
                                              : "text-gray-400"
                                          }`}
                                          data-oid="sq7aar7"
                                        >
                                          {detail.step}
                                        </span>
                                        {detail.completedAt && (
                                          <span
                                            className="text-xs text-gray-400 ml-auto"
                                            data-oid="as-t516"
                                          >
                                            {new Date(
                                              detail.completedAt,
                                            ).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                          {/* 完成状态的操作 */}
                          {purchase.status === "COMPLETED" && (
                            <div className="border-t pt-4" data-oid="a_e:pxb">
                              <div
                                className="flex items-center justify-between"
                                data-oid="y2so_p_"
                              >
                                <div data-oid=":3k:zpb">
                                  <div
                                    className="text-sm text-green-600 font-medium"
                                    data-oid="afdmchk"
                                  >
                                    服务已完成
                                  </div>
                                  <div
                                    className="text-xs text-gray-500"
                                    data-oid="6w5bzv3"
                                  >
                                    完成时间:{" "}
                                    {purchase.completedAt
                                      ? new Date(
                                          purchase.completedAt,
                                        ).toLocaleString()
                                      : "未知"}
                                  </div>
                                </div>
                                <div
                                  className="flex space-x-2"
                                  data-oid="cvut03z"
                                >
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    data-oid="zxhhnf8"
                                  >
                                    <FileText
                                      className="h-4 w-4 mr-2"
                                      data-oid="aderfda"
                                    />
                                    查看交付文档
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    data-oid="pq.p:h0"
                                  >
                                    <Download
                                      className="h-4 w-4 mr-2"
                                      data-oid="5p44g5p"
                                    />
                                    下载文件
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* 备注 */}
                          {purchase.notes && (
                            <div
                              className="border-t pt-4 border-white/10"
                              data-oid="j9po1o0"
                            >
                              <div
                                className="text-sm text-gray-300 mb-2"
                                data-oid="znep.no"
                              >
                                备注
                              </div>
                              <div
                                className="text-sm bg-blue-500/10 p-3 rounded border border-blue-500/20"
                                data-oid="m895x5i"
                              >
                                {purchase.notes}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

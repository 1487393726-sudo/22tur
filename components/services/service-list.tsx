"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  TrendingUp,
  Search,
  Clock,
  DollarSign,
} from "lucide-react";

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  type: "SERVICE" | "INVESTMENT";
  status: string;
  imageUrl?: string;
  features?: string;
  duration?: string;
  deliveryTime?: string;
}

export function ServiceList() {
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, activeTab]);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services");
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error("获取服务列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    // 按类型过滤
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (service) => service.type.toLowerCase() === activeTab,
      );
    }

    // 按分类过滤
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (service) => service.category === selectedCategory,
      );
    }

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredServices(filtered);
  };

  const handlePurchase = async (
    serviceId: string,
    type: "SERVICE" | "INVESTMENT",
  ) => {
    try {
      const response = await fetch("/api/user/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId,
          type,
          amount: services.find((s) => s.id === serviceId)?.price,
        }),
      });

      if (response.ok) {
        alert(`${type === "SERVICE" ? "购买" : "投资"}成功！`);
      } else {
        const error = await response.json();
        alert(error.message || `${type === "SERVICE" ? "购买" : "投资"}失败`);
      }
    } catch (error) {
      console.error(`${type === "SERVICE" ? "购买" : "投资"}失败:`, error);
      alert(`${type === "SERVICE" ? "购买" : "投资"}失败，请稍后重试`);
    }
  };

  const categories = Array.from(
    new Set(services.map((service) => service.category)),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" data-oid=":atiw-4">
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          data-oid="4k742og"
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-oid="hvs2bv.">
      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4" data-oid="0ljq-cf">
        <div className="flex-1 relative" data-oid="n_jqf9.">
          <Search
            className="absolute left-3 top-3 h-4 w-4 text-gray-400"
            data-oid="-gf1h0r"
          />
          <Input
            placeholder="搜索服务..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-oid="m0:_0yb"
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          data-oid="2rh-9z."
        >
          <SelectTrigger className="w-full md:w-48" data-oid="8taqju2">
            <SelectValue placeholder="选择分类" data-oid="mc30v:y" />
          </SelectTrigger>
          <SelectContent data-oid="nwfxp0c">
            <SelectItem value="all" data-oid="1e0326t">
              所有分类
            </SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category} data-oid="a-20v0o">
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 服务类型标签 */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
        data-oid="q1fdu_l"
      >
        <TabsList className="grid w-full grid-cols-3" data-oid="jqkbgid">
          <TabsTrigger value="all" data-oid="7r_mint">
            全部
          </TabsTrigger>
          <TabsTrigger value="service" data-oid="alylzr8">
            服务
          </TabsTrigger>
          <TabsTrigger value="investment" data-oid="nxz5.k6">
            投资
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6" data-oid="jkhox8p">
          {/* 服务列表 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            data-oid="ji423zn"
          >
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow"
                data-oid="nj.uvjs"
              >
                <CardHeader data-oid="ubxvf4z">
                  <div
                    className="flex justify-between items-start"
                    data-oid="hcrpa:4"
                  >
                    <CardTitle
                      className="text-lg line-clamp-2"
                      data-oid="nzeqnhj"
                    >
                      {service.title}
                    </CardTitle>
                    <Badge
                      variant={
                        service.type === "SERVICE" ? "default" : "secondary"
                      }
                      data-oid="o4cs8k:"
                    >
                      {service.type === "SERVICE" ? "服务" : "投资"}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3" data-oid="_w6o7:f">
                    {service.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3" data-oid="n471o:j">
                  <div
                    className="flex items-center justify-between"
                    data-oid="zv.rwqe"
                  >
                    <span
                      className="text-2xl font-bold text-blue-600"
                      data-oid="v2m07pu"
                    >
                      ¥{service.price.toLocaleString()}
                    </span>
                    <Badge variant="outline" data-oid="7avff21">
                      {service.category}
                    </Badge>
                  </div>

                  {service.duration && (
                    <div
                      className="flex items-center text-sm text-gray-600"
                      data-oid="cd28v1i"
                    >
                      <Clock className="h-4 w-4 mr-2" data-oid="8llnovg" />
                      服务时长: {service.duration}
                    </div>
                  )}

                  {service.deliveryTime && (
                    <div
                      className="flex items-center text-sm text-gray-600"
                      data-oid="nc9voja"
                    >
                      <Clock className="h-4 w-4 mr-2" data-oid="w1a8h6s" />
                      交付时间: {service.deliveryTime}
                    </div>
                  )}

                  {service.features && (
                    <div className="text-sm" data-oid="l7r-_pw">
                      <div className="font-medium mb-1" data-oid="h2c4e-u">
                        特性:
                      </div>
                      <div
                        className="text-gray-600 line-clamp-2"
                        data-oid="5b_2.zc"
                      >
                        {service.features}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter data-oid="j2gamnz">
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(service.id, service.type)}
                    data-oid="n7o_43d"
                  >
                    {service.type === "SERVICE" ? (
                      <>
                        <ShoppingCart
                          className="h-4 w-4 mr-2"
                          data-oid="-ucxzix"
                        />
                        立即购买
                      </>
                    ) : (
                      <>
                        <TrendingUp
                          className="h-4 w-4 mr-2"
                          data-oid="ln..-fm"
                        />
                        立即投资
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-12" data-oid="81213lk">
              <DollarSign
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                data-oid="k_d9hco"
              />
              <h3
                className="text-lg font-medium text-gray-900 mb-2"
                data-oid="scjhjg."
              >
                暂无服务
              </h3>
              <p className="text-gray-500" data-oid="lnz0-.q">
                没有找到符合条件的服务
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

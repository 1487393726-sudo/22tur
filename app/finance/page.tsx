"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Receipt,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  Eye,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FinancialRecord {
  id: string;
  type: "INVOICE" | "RECEIPT" | "PAYMENT";
  title: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  description?: string;
  fileName?: string;
  filePath?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

const FinancialManagement = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("invoices");

  useEffect(() => {
    fetchFinancialRecords();
  }, []);

  const fetchFinancialRecords = async () => {
    try {
      // 模拟财务记录数据
      const mockRecords: FinancialRecord[] = [
        {
          id: "1",
          type: "INVOICE",
          title: "网站开发服务发票",
          amount: 50000,
          status: "COMPLETED",
          description: "企业官网开发服务费用",
          fileName: "invoice_website_dev_202411.pdf",
          filePath: "/financial/invoices/website_dev_202411.pdf",
          metadata: {
            clientName: "科技创新有限公司",
            projectName: "企业官网开发",
            taxRate: 0.06,
            taxAmount: 3000,
            netAmount: 47000,
          },
          createdAt: "2024-11-15",
          updatedAt: "2024-11-15",
        },
        {
          id: "2",
          type: "RECEIPT",
          title: "系统维护费收据",
          amount: 8000,
          status: "COMPLETED",
          description: "企业管理系统年度维护费用",
          fileName: "receipt_system_maintain_202410.pdf",
          filePath: "/financial/receipts/system_maintain_202410.pdf",
          metadata: {
            paymentMethod: "银行转账",
            transactionId: "TXN202410280001",
            payerName: "创新科技有限公司",
          },
          createdAt: "2024-10-28",
          updatedAt: "2024-10-28",
        },
        {
          id: "3",
          type: "PAYMENT",
          title: "服务器租赁费用",
          amount: 12000,
          status: "PENDING",
          description: "云服务器年度租赁费用",
          fileName: "payment_server_rental_202411.pdf",
          filePath: "/financial/payments/server_rental_202411.pdf",
          metadata: {
            paymentMethod: "支付宝",
            dueDate: "2024-12-01",
            vendorName: "阿里云",
          },
          createdAt: "2024-11-20",
          updatedAt: "2024-11-20",
        },
        {
          id: "4",
          type: "INVOICE",
          title: "APP开发项目发票",
          amount: 85000,
          status: "COMPLETED",
          description: "移动应用开发服务费用",
          fileName: "invoice_app_dev_202411.pdf",
          filePath: "/financial/invoices/app_dev_202411.pdf",
          metadata: {
            clientName: "数字科技有限公司",
            projectName: "电商APP开发",
            taxRate: 0.06,
            taxAmount: 5100,
            netAmount: 79900,
          },
          createdAt: "2024-11-10",
          updatedAt: "2024-11-10",
        },
        {
          id: "5",
          type: "RECEIPT",
          title: "咨询服务费收据",
          amount: 15000,
          status: "COMPLETED",
          description: "技术咨询与顾问服务费用",
          fileName: "receipt_consulting_202409.pdf",
          filePath: "/financial/receipts/consulting_202409.pdf",
          metadata: {
            paymentMethod: "银行转账",
            transactionId: "TXN202409150002",
            payerName: "智能技术公司",
          },
          createdAt: "2024-09-15",
          updatedAt: "2024-09-15",
        },
        {
          id: "6",
          type: "PAYMENT",
          title: "软件许可费用",
          amount: 25000,
          status: "COMPLETED",
          description: "企业软件年度许可费用",
          fileName: "payment_software_license_202410.pdf",
          filePath: "/financial/payments/software_license_202410.pdf",
          metadata: {
            paymentMethod: "对公转账",
            vendorName: "微软中国",
            licenseType: "Office 365 企业版",
          },
          createdAt: "2024-10-15",
          updatedAt: "2024-10-15",
        },
      ];

      setRecords(mockRecords);
      setLoading(false);
    } catch (error) {
      console.error("获取财务记录失败:", error);
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.description &&
        record.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = selectedType === "all" || record.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "INVOICE":
        return (
          <FileText className="h-4 w-4 text-blue-600" data-oid="3j017_i" />
        );
      case "RECEIPT":
        return (
          <Receipt className="h-4 w-4 text-green-600" data-oid="xvrr6cl" />
        );
      case "PAYMENT":
        return (
          <DollarSign className="h-4 w-4 text-red-600" data-oid="p_buerl" />
        );
      default:
        return (
          <FileText className="h-4 w-4 text-gray-600" data-oid="am8n75g" />
        );
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "INVOICE":
        return "发票";
      case "RECEIPT":
        return "收据";
      case "PAYMENT":
        return "付款";
      default:
        return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "已完成";
      case "PENDING":
        return "待处理";
      case "CANCELLED":
        return "已取消";
      default:
        return status;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount);
  };

  const handleDownload = async (recordId: string, fileName: string) => {
    try {
      console.log("下载财务文件:", fileName);
      // 这里应该调用实际的下载API
    } catch (error) {
      console.error("下载失败:", error);
    }
  };

  const handleCreateInvoice = () => {
    console.log("创建发票");
    // 这里应该打开发票创建对话框
  };

  const handleCreateReceipt = () => {
    console.log("创建收据");
    // 这里应该打开收据创建对话框
  };

  const handleCreatePayment = () => {
    console.log("创建付款记录");
    // 这里应该打开付款记录创建对话框
  };

  const FinancialCard = ({ record }: { record: FinancialRecord }) => {
    return (
      <Card
        className="group hover:shadow-lg transition-all duration-300 p-6 bg-white/10 border-white/20 backdrop-blur-sm"
        data-oid="r.x-0-g"
      >
        <div
          className="flex items-start justify-between mb-4"
          data-oid="6ka5a8n"
        >
          <div className="flex items-center gap-3" data-oid="30sr08q">
            <div
              className="p-2 bg-white/10 rounded-lg border border-white/20"
              data-oid="jprodls"
            >
              {getTypeIcon(record.type)}
            </div>
            <div data-oid="h6ar6kg">
              <h3
                className="font-semibold text-white group-hover:text-blue-300 transition-colors"
                data-oid="t:ts:hg"
              >
                {record.title}
              </h3>
              <div className="flex items-center gap-2 mt-1" data-oid="epgbrdw">
                <span className="text-sm text-gray-300" data-oid=".5rh-ux">
                  {getTypeLabel(record.type)}
                </span>
                <Badge
                  className={
                    record.status === "COMPLETED"
                      ? "bg-green-500/30 text-green-200 border-green-400/30"
                      : record.status === "PENDING"
                        ? "bg-yellow-500/30 text-yellow-200 border-yellow-400/30"
                        : "bg-red-500/30 text-red-200 border-red-400/30"
                  }
                  data-oid="dhwztty"
                >
                  {getStatusLabel(record.status)}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right" data-oid="dsylcec">
            <div className="text-2xl font-bold text-white" data-oid="6fr85lz">
              {formatAmount(record.amount)}
            </div>
          </div>
        </div>

        {record.description && (
          <p
            className="text-sm text-gray-300 mb-4 line-clamp-2"
            data-oid="ir_sgob"
          >
            {record.description}
          </p>
        )}

        <div
          className="flex items-center justify-between text-xs text-gray-400 mb-4"
          data-oid="x-:asnt"
        >
          <div className="flex items-center gap-4" data-oid="j70ci5-">
            <span data-oid="6x9jw7n">编号: {record.id}</span>
            {record.fileName && (
              <span data-oid="bh0iu-8">文件: {record.fileName}</span>
            )}
          </div>
          <div className="flex items-center gap-2" data-oid="0c933ph">
            <Calendar className="h-3 w-3" data-oid="et2_nq9" />
            <span data-oid="snk_1im">{record.createdAt}</span>
          </div>
        </div>

        <div
          className="flex items-center justify-between pt-3 border-t border-white/10"
          data-oid="uujwfb9"
        >
          <div className="text-xs text-gray-300" data-oid="hnasged">
            {record.metadata && Object.keys(record.metadata).length > 0 && (
              <div className="space-y-1" data-oid="a4_zc5g">
                {Object.entries(record.metadata)
                  .slice(0, 2)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between"
                      data-oid="35x.sv7"
                    >
                      <span className="capitalize" data-oid="9csdi70">
                        {key}:
                      </span>
                      <span className="font-medium" data-oid="39ry8xj">
                        {String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2" data-oid="mymbtka">
            {record.filePath && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/10 text-blue-300"
                onClick={() => handleDownload(record.id, record.fileName || "")}
                data-oid="p0x0i14"
              >
                <Eye className="h-4 w-4" data-oid="ezrgto8" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-white/10 text-green-300"
              onClick={() => handleDownload(record.id, record.fileName || "")}
              data-oid="vmmyd0."
            >
              <Download className="h-4 w-4" data-oid=":lsfwe9" />
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6"
        data-oid="npx13by"
      >
        <div className="max-w-7xl mx-auto" data-oid=".v3hyln">
          <div className="animate-pulse" data-oid="q9_hgar">
            <div
              className="h-8 bg-white/10 rounded w-1/3 mb-6"
              data-oid="2gbka8e"
            ></div>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              data-oid="4vo_9eh"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-white/10 rounded-xl"
                  data-oid="85mhaom"
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6"
      data-oid="4nje:oh"
    >
      <div className="max-w-7xl mx-auto space-y-6" data-oid="qyxo-vz">
        {/* 页面标题 */}
        <div className="flex items-center justify-between" data-oid="zbyr0n7">
          <div data-oid="i.uk2d5">
            <h1 className="text-3xl font-bold text-white" data-oid="9e0i-jn">
              财务管理
            </h1>
            <p className="text-gray-300 mt-2" data-oid="l55w4ll">
              发票收据管理、付款记录和财务报表
            </p>
          </div>
          <div className="flex gap-2" data-oid="de6u1:-">
            <Button
              onClick={handleCreateInvoice}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-oid=".d-jvbe"
            >
              <Plus className="h-4 w-4 mr-2" data-oid="f1duqmu" />
              创建发票
            </Button>
            <Button
              onClick={handleCreateReceipt}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-oid="l-:txcz"
            >
              <Plus className="h-4 w-4 mr-2" data-oid="u3p7flr" />
              创建收据
            </Button>
            <Button
              onClick={handleCreatePayment}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-oid="uqihvlk"
            >
              <Plus className="h-4 w-4 mr-2" data-oid="o3nng_p" />
              付款记录
            </Button>
          </div>
        </div>

        {/* 搜索和筛选 */}
        <Card
          className="p-6 bg-white/10 border-white/20 backdrop-blur-sm"
          data-oid="72le45e"
        >
          <div className="flex flex-col lg:flex-row gap-4" data-oid="pp-t5p-">
            <div className="flex-1 relative" data-oid="2o7b8-r">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300"
                data-oid="3m3i-3."
              />
              <Input
                placeholder="搜索发票、收据或付款记录..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
                data-oid="edg9r_c"
              />
            </div>

            <div className="flex gap-2" data-oid=":y:x9fy">
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
                data-oid=".0_5odk"
              >
                <SelectTrigger
                  className="w-40 bg-white/10 border-white/20 text-white"
                  data-oid="ma:r.vu"
                >
                  <SelectValue placeholder="类型筛选" data-oid="fxd8-cc" />
                </SelectTrigger>
                <SelectContent data-oid="kl8n5pe">
                  <SelectItem value="all" data-oid="zmgxji7">
                    全部类型
                  </SelectItem>
                  <SelectItem value="INVOICE" data-oid="84:3eld">
                    发票
                  </SelectItem>
                  <SelectItem value="RECEIPT" data-oid=".c10yw5">
                    收据
                  </SelectItem>
                  <SelectItem value="PAYMENT" data-oid="z9136rl">
                    付款
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
                data-oid="g4egrih"
              >
                <SelectTrigger
                  className="w-32 bg-white/10 border-white/20 text-white"
                  data-oid="ro2qge2"
                >
                  <SelectValue placeholder="状态筛选" data-oid="6p:_u8z" />
                </SelectTrigger>
                <SelectContent data-oid="yfm5a0v">
                  <SelectItem value="all" data-oid=".9k6cf1">
                    全部状态
                  </SelectItem>
                  <SelectItem value="COMPLETED" data-oid="sem12tx">
                    已完成
                  </SelectItem>
                  <SelectItem value="PENDING" data-oid="yk7.003">
                    待处理
                  </SelectItem>
                  <SelectItem value="CANCELLED" data-oid="ionx86p">
                    已取消
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* 统计卡片 */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          data-oid="3ojz.5n"
        >
          <Card
            className="p-4 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="cslcho."
          >
            <div
              className="flex items-center justify-between"
              data-oid="0w1fp-a"
            >
              <div data-oid="4p_wv29">
                <p className="text-sm text-gray-300" data-oid="pz-m84a">
                  总收入
                </p>
                <p
                  className="text-2xl font-bold text-green-300"
                  data-oid="cmwnrr3"
                >
                  {formatAmount(
                    records
                      .filter(
                        (r) => r.type === "INVOICE" && r.status === "COMPLETED",
                      )
                      .reduce((sum, r) => sum + r.amount, 0),
                  )}
                </p>
              </div>
              <TrendingUp
                className="h-8 w-8 text-green-400"
                data-oid="g6v1bg2"
              />
            </div>
          </Card>

          <Card
            className="p-4 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="8:7vq39"
          >
            <div
              className="flex items-center justify-between"
              data-oid="1i3lg6l"
            >
              <div data-oid="52wu7i2">
                <p className="text-sm text-gray-300" data-oid="6.xlwbt">
                  总支出
                </p>
                <p
                  className="text-2xl font-bold text-red-300"
                  data-oid="qecb_qi"
                >
                  {formatAmount(
                    records
                      .filter(
                        (r) => r.type === "PAYMENT" && r.status === "COMPLETED",
                      )
                      .reduce((sum, r) => sum + r.amount, 0),
                  )}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-400" data-oid="-81h1q:" />
            </div>
          </Card>

          <Card
            className="p-4 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="vluu4a7"
          >
            <div
              className="flex items-center justify-between"
              data-oid="a61-.jf"
            >
              <div data-oid="xagu.7r">
                <p className="text-sm text-gray-300" data-oid="9om82.5">
                  待处理
                </p>
                <p
                  className="text-2xl font-bold text-yellow-300"
                  data-oid="areia_z"
                >
                  {records.filter((r) => r.status === "PENDING").length}
                </p>
              </div>
              <Calendar
                className="h-8 w-8 text-yellow-400"
                data-oid="zw7-wim"
              />
            </div>
          </Card>

          <Card
            className="p-4 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="i4rfj39"
          >
            <div
              className="flex items-center justify-between"
              data-oid="ra7j5tf"
            >
              <div data-oid="x0-jz:u">
                <p className="text-sm text-gray-300" data-oid="gg6r:k7">
                  本月记录
                </p>
                <p
                  className="text-2xl font-bold text-blue-300"
                  data-oid="rvr_.9a"
                >
                  {
                    records.filter((r) => {
                      const recordDate = new Date(r.createdAt);
                      const now = new Date();
                      return (
                        recordDate.getMonth() === now.getMonth() &&
                        recordDate.getFullYear() === now.getFullYear()
                      );
                    }).length
                  }
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" data-oid="owhs_8k" />
            </div>
          </Card>
        </div>

        {/* 财务记录列表 */}
        <div className="space-y-4" data-oid="06q7kcb">
          <div className="flex items-center justify-between" data-oid="gxk6d9r">
            <h2 className="text-xl font-semibold text-white" data-oid="_yz6jtl">
              财务记录 ({filteredRecords.length} 个)
            </h2>
          </div>

          {filteredRecords.length === 0 ? (
            <Card
              className="p-12 text-center bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="y8pmm2o"
            >
              <Receipt
                className="h-12 w-12 text-gray-400 mx-auto mb-4"
                data-oid="nj4skcb"
              />
              <h3
                className="text-lg font-medium text-white mb-2"
                data-oid="ufdb936"
              >
                暂无财务记录
              </h3>
              <p className="text-gray-300 mb-6" data-oid="mcp.fv6">
                还没有创建任何发票、收据或付款记录
              </p>
              <div className="flex gap-2 justify-center" data-oid="-qd.fq3">
                <Button
                  onClick={handleCreateInvoice}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  data-oid="39jzpeo"
                >
                  <Plus className="h-4 w-4 mr-2" data-oid="momad0v" />
                  创建第一张发票
                </Button>
                <Button
                  onClick={handleCreateReceipt}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                  data-oid="xcucn_v"
                >
                  <Plus className="h-4 w-4 mr-2" data-oid="tqv90oj" />
                  创建第一张收据
                </Button>
              </div>
            </Card>
          ) : (
            <div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
              data-oid="lfb8997"
            >
              {filteredRecords.map((record) => (
                <FinancialCard
                  key={record.id}
                  record={record}
                  data-oid="s.-qz-c"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;

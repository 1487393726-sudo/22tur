"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
  Calendar,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateTransactionModal } from "@/components/finance/create-transaction-modal";
import { CreateInvoiceModal } from "@/components/finance/create-invoice-modal";
import { ViewTransactionModal } from "@/components/finance/view-transaction-modal";
import { ViewInvoiceModal } from "@/components/finance/view-invoice-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionType, InvoiceStatus } from "@/types";

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: string;
  date: Date;
  clientId?: string;
  projectId?: string;
  client?: {
    name: string;
  };
  project?: {
    name: string;
  };
  createdAt: Date;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientId: string;
  amount: number;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  client: {
    name: string;
  };
  project?: {
    name: string;
  };
  createdAt: Date;
}

export default function FinancePage() {
  const t = useTranslations("admin.finance");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createTransactionModalOpen, setCreateTransactionModalOpen] =
    useState(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState(false);
  const [viewTransactionModalOpen, setViewTransactionModalOpen] =
    useState(false);
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // 获取类型徽章样式
  const getTypeBadge = (type: TransactionType) => {
    const typeConfig = {
      INCOME: { label: t("type.income"), className: "bg-green-100 text-green-800" },
      EXPENSE: { label: t("type.expense"), className: "bg-red-100 text-red-800" },
    };

    const config = typeConfig[type];
    return (
      <Badge className={config.className} data-oid="m92que8">
        {config.label}
      </Badge>
    );
  };

  // 获取发票状态徽章样式
  const getStatusBadge = (status: InvoiceStatus) => {
    const statusConfig = {
      DRAFT: { label: t("status.draft"), className: "bg-gray-100 text-gray-800" },
      SENT: { label: t("status.sent"), className: "bg-blue-100 text-blue-800" },
      PAID: { label: t("status.paid"), className: "bg-green-100 text-green-800" },
      OVERDUE: { label: t("status.overdue"), className: "bg-red-100 text-red-800" },
      CANCELLED: { label: t("status.cancelled"), className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className} data-oid="xjfj393">
        {config.label}
      </Badge>
    );
  };

  // 获取数据
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsResponse, invoicesResponse] = await Promise.all([
        fetch("/api/finance/transactions"),
        fetch("/api/finance/invoices"),
      ]);

      if (transactionsResponse.ok && invoicesResponse.ok) {
        const [transactionsData, invoicesData] = await Promise.all([
          transactionsResponse.json(),
          invoicesResponse.json(),
        ]);

        setTransactions(transactionsData);
        setInvoices(invoicesData);
      }
    } catch (error) {
      console.error("获取财务数据失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 搜索和过滤交易记录
  useEffect(() => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.category
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.client?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.project?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === typeFilter,
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, searchTerm, typeFilter]);

  // 搜索和过滤发票
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(
        (invoice) =>
          invoice.invoiceNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.client.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          invoice.project?.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, statusFilter]);

  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setViewTransactionModalOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setViewInvoiceModalOpen(true);
  };

  const handleTransactionCreated = () => {
    fetchData();
    setCreateTransactionModalOpen(false);
  };

  const handleInvoiceCreated = () => {
    fetchData();
    setCreateInvoiceModalOpen(false);
  };

  // 计算统计数据
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i) => i.status === "PAID").length;
  const outstandingAmount = invoices
    .filter((i) => i.status !== "PAID" && i.status !== "CANCELLED")
    .reduce((sum, i) => sum + i.amount, 0);

  if (loading) {
    return (
      <div className="p-6" data-oid="-kr8-ny">
        <div className="max-w-7xl mx-auto" data-oid="hkjggwu">
          <div className="animate-pulse" data-oid="k0stz76">
            <div
              className="h-8 bg-gray-200 rounded w-64 mb-8"
              data-oid="t61xn7n"
            ></div>
            <div
              className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
              data-oid="cwebhf0"
            >
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 rounded-lg"
                  data-oid="3wbqtjr"
                ></div>
              ))}
            </div>
            <div
              className="h-96 bg-gray-100 rounded-lg"
              data-oid="-ti5gu1"
            ></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-oid="ljdzz1u">
      <div className="max-w-7xl mx-auto" data-oid="5.1o:kc">
        {/* 页面标题 */}
        <div
          className="flex justify-between items-center mb-8"
          data-oid="vzpg9hx"
        >
          <div data-oid="r1.-r.w">
            <h1 className="text-3xl font-bold text-white" data-oid="0gx6_gi">
              {t("title")}
            </h1>
            <p className="text-gray-300 mt-2" data-oid="fbaw8w4">
              {t("description")}
            </p>
          </div>
          <div className="flex gap-2" data-oid="mgui:bo">
            <Button
              onClick={() => setCreateTransactionModalOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              data-oid="thh0j33"
            >
              <Plus className="w-4 h-4 mr-2" data-oid="7.qq..2" />
              {t("addTransaction")}
            </Button>
            <Button
              onClick={() => setCreateInvoiceModalOpen(true)}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              data-oid="7ba4rbi"
            >
              <Receipt className="w-4 h-4 mr-2" data-oid="th.238-" />
              {t("addInvoice")}
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-oid="iyoi.2m"
        >
          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="uyac65r"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="c365b2j"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="2a.-vby"
              >
                {t("stats.totalIncome")}
              </CardTitle>
              <TrendingUp
                className="h-4 w-4 text-green-400"
                data-oid="wezx4mw"
              />
            </CardHeader>
            <CardContent data-oid="w5e5fv1">
              <div
                className="text-2xl font-bold text-green-400"
                data-oid="a8oya6t"
              >
                ¥{totalIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="35o8es3"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="p2-0t9r"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="s8xelen"
              >
                {t("stats.totalExpenses")}
              </CardTitle>
              <TrendingDown
                className="h-4 w-4 text-red-400"
                data-oid="f.as.wd"
              />
            </CardHeader>
            <CardContent data-oid="yji-vgy">
              <div
                className="text-2xl font-bold text-red-400"
                data-oid="im-kay-"
              >
                ¥{totalExpenses.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="tp7myo4"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="l:krbls"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="yvw:83v"
              >
                {t("stats.netIncome")}
              </CardTitle>
              <DollarSign
                className="h-4 w-4 text-gray-300"
                data-oid="0zu-nof"
              />
            </CardHeader>
            <CardContent data-oid="-ry:rpu">
              <div
                className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-400" : "text-red-400"}`}
                data-oid="obv_0rn"
              >
                ¥{netIncome.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid=".:6it66"
          >
            <CardHeader
              className="flex flex-row items-center justify-between space-y-0 pb-2"
              data-oid="42-vy85"
            >
              <CardTitle
                className="text-sm font-medium text-white"
                data-oid="_e7bj0m"
              >
                {t("stats.outstanding")}
              </CardTitle>
              <FileText
                className="h-4 w-4 text-orange-400"
                data-oid="62rbiis"
              />
            </CardHeader>
            <CardContent data-oid="0.m01r7">
              <div
                className="text-2xl font-bold text-orange-400"
                data-oid="_oz1rmo"
              >
                ¥{outstandingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-300" data-oid="r09u4x5">
                {totalInvoices > 0
                  ? Math.round((paidInvoices / totalInvoices) * 100)
                  : 0}
                % {t("stats.paid")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 搜索和过滤 */}
        <Card
          className="bg-white/10 border-white/20 backdrop-blur-sm mb-6"
          data-oid="x29:r3u"
        >
          <CardContent className="p-4" data-oid="bkt9ew9">
            <div className="flex flex-col sm:flex-row gap-4" data-oid="38u-.b8">
              <div className="flex-1" data-oid="_mvdg:x">
                <div className="relative" data-oid="3k.6t_w">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 h-4 w-4"
                    data-oid="4t-h4g4"
                  />
                  <Input
                    placeholder={t("search.placeholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-300"
                    data-oid="0215oi_"
                  />
                </div>
              </div>
              <div className="flex gap-2" data-oid="teghlr.">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white"
                  data-oid="9v3df4:"
                  aria-label="Filter by type"
                >
                  <option value="all" data-oid="wuw-9ed">
                    {t("search.allTypes")}
                  </option>
                  <option value="INCOME" data-oid="xeskwt-">
                    {t("type.income")}
                  </option>
                  <option value="EXPENSE" data-oid="6r9p71a">
                    {t("type.expense")}
                  </option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-white/20 rounded-md bg-white/10 text-white"
                  data-oid="lmwmat1"
                  aria-label="Filter by status"
                >
                  <option value="all" data-oid="czi4d:h">
                    {t("search.allStatus")}
                  </option>
                  <option value="DRAFT" data-oid=".kt0ex_">
                    {t("status.draft")}
                  </option>
                  <option value="SENT" data-oid="j_pwk0g">
                    {t("status.sent")}
                  </option>
                  <option value="PAID" data-oid="l50aw_k">
                    {t("status.paid")}
                  </option>
                  <option value="OVERDUE" data-oid=":6su-st">
                    {t("status.overdue")}
                  </option>
                  <option value="CANCELLED" data-oid="yej0e45">
                    {t("status.cancelled")}
                  </option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 数据标签页 */}
        <Tabs
          defaultValue="transactions"
          className="space-y-4"
          data-oid="44t2s7v"
        >
          <TabsList
            className="text-muted-foreground h-9 items-center justify-center rounded-lg p-[3px] grid w-full grid-cols-2 bg-white/10 border-white/20 backdrop-blur-sm"
            data-oid="uu:oyeo"
          >
            <TabsTrigger
              value="transactions"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="xjudg6p"
            >
              {t("transactions")}
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
              data-oid="x99c_yl"
            >
              {t("invoices")}
            </TabsTrigger>
          </TabsList>

          {/* 收支记录 */}
          <TabsContent value="transactions" data-oid="4scfax0">
            <Card
              className="bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="v8gfff3"
            >
              <CardHeader data-oid="ru_6eh_">
                <CardTitle className="text-white" data-oid="g3qyg9-">
                  收支记录
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="vjwdt7y">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-12" data-oid="ntgfakx">
                    <DollarSign
                      className="mx-auto h-12 w-12 text-gray-300 mb-4"
                      data-oid="1w0gqge"
                    />
                    <h3
                      className="text-lg font-medium text-white mb-2"
                      data-oid="ciy1:0w"
                    >
                      {searchTerm || typeFilter !== "all"
                        ? "没有找到匹配的记录"
                        : "暂无收支记录"}
                    </h3>
                    <p className="text-gray-300 mb-4" data-oid="mh7r.97">
                      {searchTerm || typeFilter !== "all"
                        ? "请尝试调整搜索条件或筛选器"
                        : "开始记录您的第一笔收支吧"}
                    </p>
                    {!searchTerm && typeFilter === "all" && (
                      <Button
                        onClick={() => setCreateTransactionModalOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        data-oid="dul-wgb"
                      >
                        <Plus className="w-4 h-4 mr-2" data-oid="yeoqlto" />
                        新增记录
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto" data-oid=":adga8f">
                    <Table data-oid="524ax7u">
                      <TableHeader data-oid="tl:_gdo">
                        <TableRow data-oid="aj--i3s">
                          <TableHead data-oid="xjknoof">日期</TableHead>
                          <TableHead data-oid="46qcmn-">类型</TableHead>
                          <TableHead data-oid="zwcj7qe">金额</TableHead>
                          <TableHead data-oid="393f3hy">类别</TableHead>
                          <TableHead data-oid="sp1ogx9">描述</TableHead>
                          <TableHead data-oid="q-:77i5">关联客户</TableHead>
                          <TableHead data-oid="9:chj4j">关联项目</TableHead>
                          <TableHead className="w-[100px]" data-oid="7kq5d5l">
                            操作
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody data-oid="5l4db14">
                        {filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id} data-oid="o009y8_">
                            <TableCell data-oid="g_0rx8o">
                              <div
                                className="flex items-center text-sm text-gray-500"
                                data-oid="a6k89wu"
                              >
                                <Calendar
                                  className="w-3 h-3 mr-1"
                                  data-oid="vfpdcug"
                                />
                                {new Date(transaction.date).toLocaleDateString(
                                  "zh-CN",
                                )}
                              </div>
                            </TableCell>
                            <TableCell data-oid="rel_zne">
                              {getTypeBadge(transaction.type)}
                            </TableCell>
                            <TableCell data-oid="8uplevn">
                              <span
                                className={`font-medium ${transaction.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
                                data-oid="cphqfzj"
                              >
                                {transaction.type === "INCOME" ? "+" : "-"}¥
                                {transaction.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell data-oid="smmetwm">
                              <Badge variant="outline" data-oid="7bkyt8s">
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className="max-w-xs truncate"
                              data-oid="d2:dazq"
                            >
                              {transaction.description}
                            </TableCell>
                            <TableCell data-oid="qytx2cb">
                              {transaction.client ? (
                                <span className="text-sm" data-oid="qvon7rm">
                                  {transaction.client.name}
                                </span>
                              ) : (
                                <span
                                  className="text-sm text-gray-400"
                                  data-oid="t34bwfk"
                                >
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell data-oid="y38ao.r">
                              {transaction.project ? (
                                <span className="text-sm" data-oid="ja0trx9">
                                  {transaction.project.name}
                                </span>
                              ) : (
                                <span
                                  className="text-sm text-gray-400"
                                  data-oid="ad2f0z3"
                                >
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell data-oid="t-fn:cm">
                              <DropdownMenu data-oid="w7:_otr">
                                <DropdownMenuTrigger asChild data-oid="x.cr-f4">
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    data-oid="t99lzv-"
                                  >
                                    <MoreHorizontal
                                      className="h-4 w-4"
                                      data-oid="ix65han"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  data-oid="hgjbg55"
                                >
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleViewTransaction(transaction)
                                    }
                                    data-oid="k.56brw"
                                  >
                                    <Eye
                                      className="w-4 h-4 mr-2"
                                      data-oid="0qbr3uu"
                                    />
                                    查看详情
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 发票管理 */}
          <TabsContent value="invoices" data-oid="4f0gdp8">
            <Card
              className="bg-white/10 border-white/20 backdrop-blur-sm"
              data-oid="d10pdo2"
            >
              <CardHeader data-oid="2qwh7fw">
                <CardTitle className="text-white" data-oid="a.nvajx">
                  发票管理
                </CardTitle>
              </CardHeader>
              <CardContent data-oid="j-oet5z">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-12" data-oid="w8w4hrk">
                    <Receipt
                      className="mx-auto h-12 w-12 text-gray-300 mb-4"
                      data-oid="dl-tei7"
                    />
                    <h3
                      className="text-lg font-medium text-white mb-2"
                      data-oid="425cgd."
                    >
                      {searchTerm || statusFilter !== "all"
                        ? "没有找到匹配的发票"
                        : "暂无发票记录"}
                    </h3>
                    <p className="text-gray-300 mb-4" data-oid="x4jrksf">
                      {searchTerm || statusFilter !== "all"
                        ? "请尝试调整搜索条件或筛选器"
                        : "开始开具您的第一张发票吧"}
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button
                        onClick={() => setCreateInvoiceModalOpen(true)}
                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        data-oid="12g8bqg"
                      >
                        <Plus className="w-4 h-4 mr-2" data-oid="26-yoxm" />
                        开具发票
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto" data-oid="yd93r73">
                    <Table data-oid="fm7eeqh">
                      <TableHeader data-oid="yfsncth">
                        <TableRow data-oid="dx_j6it">
                          <TableHead data-oid="vjgkuuu">发票号</TableHead>
                          <TableHead data-oid="xnlbur1">客户</TableHead>
                          <TableHead data-oid="ag-y2sd">项目</TableHead>
                          <TableHead data-oid="sknp1jo">金额</TableHead>
                          <TableHead data-oid="66b6.9b">开票日期</TableHead>
                          <TableHead data-oid="5.d1fc0">到期日期</TableHead>
                          <TableHead data-oid="9pxn_ol">状态</TableHead>
                          <TableHead className="w-[100px]" data-oid="63e-vqe">
                            操作
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody data-oid="qe55h53">
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id} data-oid=":0wk9cs">
                            <TableCell
                              className="font-medium"
                              data-oid=".jzo822"
                            >
                              {invoice.invoiceNumber}
                            </TableCell>
                            <TableCell data-oid="sfyk:96">
                              <span className="text-sm" data-oid="gvaytoe">
                                {invoice.client.name}
                              </span>
                            </TableCell>
                            <TableCell data-oid="s85wghh">
                              {invoice.project ? (
                                <span className="text-sm" data-oid="dbuc80l">
                                  {invoice.project.name}
                                </span>
                              ) : (
                                <span
                                  className="text-sm text-gray-400"
                                  data-oid="jv3aekm"
                                >
                                  -
                                </span>
                              )}
                            </TableCell>
                            <TableCell data-oid="j65-35x">
                              <span className="font-medium" data-oid="acc2p8v">
                                ¥{invoice.amount.toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell data-oid="rwlv4e7">
                              <div className="text-sm" data-oid="0.g4dtd">
                                {new Date(invoice.issueDate).toLocaleDateString(
                                  "zh-CN",
                                )}
                              </div>
                            </TableCell>
                            <TableCell data-oid="6p8-cup">
                              <div className="text-sm" data-oid="-g:jfbn">
                                {new Date(invoice.dueDate).toLocaleDateString(
                                  "zh-CN",
                                )}
                              </div>
                            </TableCell>
                            <TableCell data-oid="3:c23ha">
                              {getStatusBadge(invoice.status)}
                            </TableCell>
                            <TableCell data-oid=":wh5xlj">
                              <DropdownMenu data-oid="gdm4q2n">
                                <DropdownMenuTrigger asChild data-oid="ct.7wjg">
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    data-oid="hj2i:4q"
                                  >
                                    <MoreHorizontal
                                      className="h-4 w-4"
                                      data-oid="szwem73"
                                    />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  data-oid="exuqjfq"
                                >
                                  <DropdownMenuItem
                                    onClick={() => handleViewInvoice(invoice)}
                                    data-oid="ljmm42w"
                                  >
                                    <Eye
                                      className="w-4 h-4 mr-2"
                                      data-oid="08mwlvy"
                                    />
                                    查看详情
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 模态框 */}
        <CreateTransactionModal
          open={createTransactionModalOpen}
          onOpenChange={setCreateTransactionModalOpen}
          onSuccess={handleTransactionCreated}
          data-oid="fq3ioou"
        />

        <CreateInvoiceModal
          open={createInvoiceModalOpen}
          onOpenChange={setCreateInvoiceModalOpen}
          onSuccess={handleInvoiceCreated}
          data-oid="moa:31:"
        />

        <ViewTransactionModal
          open={viewTransactionModalOpen}
          onOpenChange={setViewTransactionModalOpen}
          transaction={selectedTransaction}
          data-oid="005dpz4"
        />

        <ViewInvoiceModal
          open={viewInvoiceModalOpen}
          onOpenChange={setViewInvoiceModalOpen}
          invoice={selectedInvoice}
          data-oid="0ie7uw9"
        />
      </div>
    </div>
  );
}

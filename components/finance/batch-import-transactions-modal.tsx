"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  Download,
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

// 财务交易数据验证模式
const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "请选择类别"),
  amount: z
    .string()
    .min(1, "请输入金额")
    .refine((val) => !isNaN(parseFloat(val)), "金额必须是数字"),
  description: z.string().min(1, "请输入描述"),
  date: z.string().min(1, "请选择日期"),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  invoiceId: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
}

export default function BatchImportTransactionsModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [transactions, setTransactions] = useState<TransactionFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMethod, setImportMethod] = useState<"manual" | "file">("manual");
  const [csvData, setCsvData] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { toast } = useToast();

  // 预设收支类别
  const incomeCategories = [
    "项目收入",
    "服务费",
    "咨询费",
    "销售收入",
    "投资收益",
    "利息收入",
    "租金收入",
    "其他收入",
  ];

  const expenseCategories = [
    "工资支出",
    "办公费用",
    "设备采购",
    "软件订阅",
    "市场推广",
    "差旅费",
    "培训费",
    "维修费",
    "水电费",
    "其他支出",
  ];

  // 手动添加单个交易表单
  const {
    register: registerSingle,
    handleSubmit: handleSingleSubmit,
    reset: resetSingleForm,
    formState: { errors: singleErrors },
    setValue: setSingleValue,
    watch: watchSingle,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const transactionType = watchSingle("type");
  const currentCategory = watchSingle("category");

  useEffect(() => {
    fetchRelatedData();
  }, []);

  const fetchRelatedData = async () => {
    try {
      const [clientsRes, projectsRes, invoicesRes] = await Promise.all([
        fetch("/api/client"),
        fetch("/api/projects"),
        fetch("/api/finance/invoices"),
      ]);

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        const clientsArray = Array.isArray(clientsData) 
          ? clientsData 
          : Array.isArray(clientsData?.data) 
            ? clientsData.data 
            : [];
        setClients(clientsArray);
      }

      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const projectsArray = Array.isArray(projectsData) 
          ? projectsData 
          : Array.isArray(projectsData?.data) 
            ? projectsData.data 
            : [];
        setProjects(projectsArray);
      }

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        const invoicesArray = Array.isArray(invoicesData) 
          ? invoicesData 
          : Array.isArray(invoicesData?.data) 
            ? invoicesData.data 
            : [];
        setInvoices(invoicesArray);
      }
    } catch (error) {
      console.error("获取关联数据失败:", error);
      setClients([]);
      setProjects([]);
      setInvoices([]);
    }
  };

  // 获取当前类型的所有类别
  const getCurrentCategories = () => {
    const baseCategories =
      transactionType === "income" ? incomeCategories : expenseCategories;
    return showCustomCategory && customCategory.trim()
      ? [...baseCategories, customCategory.trim()]
      : baseCategories;
  };

  // 添加单个交易到列表
  const addTransaction = (data: TransactionFormData) => {
    const transactionData = {
      ...data,
      amount: parseFloat(data.amount).toFixed(2),
    };
    setTransactions((prev) => [...prev, transactionData]);
    resetSingleForm();
    setSingleValue("type", transactionType);
    setSingleValue("date", format(new Date(), "yyyy-MM-dd"));
    setShowCustomCategory(false);
    setCustomCategory("");
    toast({
      title: "添加成功",
      description: `交易记录 "${data.description}" 已添加到列表`,
    });
  };

  // 删除交易
  const removeTransaction = (index: number) => {
    setTransactions((prev) => prev.filter((_, i) => i !== index));
  };

  // 处理CSV导入
  const handleCsvImport = () => {
    try {
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const newTransactions: TransactionFormData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length >= 4) {
          // 至少包含基本字段
          const transaction: TransactionFormData = {
            type: values[0] as "income" | "expense",
            category: values[1] || "",
            amount: values[2] || "",
            description: values[3] || "",
            date: values[4] || format(new Date(), "yyyy-MM-dd"),
            clientId: values[5] || "",
            projectId: values[6] || "",
            invoiceId: values[7] || "",
            tags: values[8] ? values[8].split(";") : [],
          };

          // 验证数据
          const validation = transactionSchema.safeParse(transaction);
          if (validation.success) {
            newTransactions.push(transaction);
          }
        }
      }

      setTransactions((prev) => [...prev, ...newTransactions]);
      setCsvData("");
      toast({
        title: "导入成功",
        description: `成功导入 ${newTransactions.length} 条交易记录`,
      });
    } catch (error) {
      toast({
        title: "导入失败",
        description: "CSV格式错误，请检查文件格式",
        variant: "destructive",
      });
    }
  };

  // 下载CSV模板
  const downloadTemplate = () => {
    const template =
      "类型,类别,金额,描述,日期,客户ID,项目ID,发票ID,标签\nexpense,办公费用,500.00,购买办公用品,2024-01-01,,,,日常用品\nincome,项目收入,10000.00,网站开发项目,2024-01-02,client1,project1,INV001,网站开发";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "财务交易批量导入模板.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 批量提交创建
  const handleBatchSubmit = async () => {
    if (transactions.length === 0) {
      toast({
        title: "提示",
        description: "请先添加交易数据",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 逐个创建交易
      const results = await Promise.allSettled(
        transactions.map(async (transaction) => {
          const response = await fetch("/api/finance/transactions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(transaction),
          });

          if (!response.ok) {
            throw new Error(`创建交易 "${transaction.description}" 失败`);
          }

          return response.json();
        }),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast({
          title: "批量导入完成",
          description: `成功导入 ${successful} 条交易记录${failed > 0 ? `，失败 ${failed} 条` : ""}`,
        });
      } else {
        toast({
          title: "导入失败",
          description: "所有交易记录导入都失败了",
          variant: "destructive",
        });
      }

      if (successful > 0) {
        onClose();
      }
    } catch (error) {
      console.error("批量导入失败:", error);
      toast({
        title: "批量导入失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算总计
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      data-oid="rkzbc_e"
    >
      <Card
        className="w-full max-w-5xl max-h-[90vh] overflow-auto"
        data-oid="t12bq66"
      >
        <CardHeader data-oid="neu.fwp">
          <CardTitle className="flex items-center gap-2" data-oid="l6ji1ox">
            <FileText className="w-5 h-5" data-oid="2dt_c70" />
            批量导入财务交易
          </CardTitle>
        </CardHeader>
        <CardContent data-oid="1glxu1t">
          <Tabs
            value={importMethod}
            onValueChange={(value) =>
              setImportMethod(value as "manual" | "file")
            }
            data-oid="4que530"
          >
            <TabsList
              className="grid w-full grid-cols-2 mb-4"
              data-oid="f9m:x:w"
            >
              <TabsTrigger value="manual" data-oid="i1camoz">
                手动添加
              </TabsTrigger>
              <TabsTrigger value="file" data-oid="3b0cw13">
                CSV导入
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="manual"
              className="space-y-4"
              data-oid="7fbskru"
            >
              <div
                className="border rounded-lg p-4 bg-gray-50"
                data-oid="561ouch"
              >
                <h3 className="font-medium mb-3" data-oid="mq83cro">
                  添加单笔交易
                </h3>
                <form
                  onSubmit={handleSingleSubmit(addTransaction)}
                  className="grid grid-cols-2 gap-4"
                  data-oid="6nslidg"
                >
                  <div data-oid="ot0ak:5">
                    <Label htmlFor="type" data-oid="9_8m_o0">
                      交易类型 *
                    </Label>
                    <Select
                      value={transactionType}
                      onValueChange={(value) => setSingleValue("type", value as "expense" | "income")}
                      data-oid="-0ml3wg"
                    >
                      <SelectTrigger data-oid="skcwu6:">
                        <SelectValue data-oid="usr7:h." />
                      </SelectTrigger>
                      <SelectContent data-oid="a9ojoa4">
                        <SelectItem value="income" data-oid="u_43:v1">
                          <div
                            className="flex items-center gap-2"
                            data-oid="1fu-35v"
                          >
                            <TrendingUp
                              className="w-4 h-4 text-green-600"
                              data-oid="x09a6aj"
                            />
                            收入
                          </div>
                        </SelectItem>
                        <SelectItem value="expense" data-oid="j2f3gxv">
                          <div
                            className="flex items-center gap-2"
                            data-oid="9.c_dtk"
                          >
                            <TrendingDown
                              className="w-4 h-4 text-red-600"
                              data-oid="yu26br4"
                            />
                            支出
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div data-oid="xkc586i">
                    <Label htmlFor="category" data-oid=".2_8pn-">
                      类别 *
                    </Label>
                    <div className="flex gap-2" data-oid="d3di4dn">
                      <Select
                        value={currentCategory}
                        onValueChange={(value) => {
                          if (value === "custom") {
                            setShowCustomCategory(true);
                          } else {
                            setSingleValue("category", value);
                            setShowCustomCategory(false);
                          }
                        }}
                        data-oid="4nhdl8n"
                      >
                        <SelectTrigger className="flex-1" data-oid="g7m8:at">
                          <SelectValue
                            placeholder="选择类别"
                            data-oid="k9di5kr"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="i_k8xiv">
                          {getCurrentCategories().map((cat) => (
                            <SelectItem
                              key={cat}
                              value={cat}
                              data-oid="-s-48sc"
                            >
                              {cat}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom" data-oid="0yjc_hj">
                            自定义类别
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {showCustomCategory && (
                      <Input
                        placeholder="输入自定义类别"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setSingleValue("category", e.target.value);
                        }}
                        className="mt-2"
                        data-oid="x1kz82-"
                      />
                    )}
                    {singleErrors.category && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="19k0kmj"
                      >
                        {singleErrors.category.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="43t86yb">
                    <Label htmlFor="amount" data-oid="28rn-uo">
                      金额 (元) *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...registerSingle("amount")}
                      placeholder="0.00"
                      data-oid="v4xa6cq"
                    />

                    {singleErrors.amount && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="3ui71ly"
                      >
                        {singleErrors.amount.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="pjh3qzw">
                    <Label htmlFor="date" data-oid="7b7:4o.">
                      交易日期 *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      {...registerSingle("date")}
                      data-oid="muhg5o3"
                    />

                    {singleErrors.date && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="mguqkj1"
                      >
                        {singleErrors.date.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="fznoldk">
                    <Label htmlFor="clientId" data-oid="v7s1yku">
                      关联客户
                    </Label>
                    <Select
                      value={watchSingle("clientId")}
                      onValueChange={(value) =>
                        setSingleValue(
                          "clientId",
                          value === "none" ? "" : value,
                        )
                      }
                      data-oid="d5he-6j"
                    >
                      <SelectTrigger data-oid="wf6zeci">
                        <SelectValue
                          placeholder="选择客户 (可选)"
                          data-oid="n4aiq6u"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="ig3bx13">
                        <SelectItem value="none" data-oid="r4u4fsf">
                          无关联
                        </SelectItem>
                        {Array.isArray(clients) && clients.map((client) => (
                          <SelectItem
                            key={client.id}
                            value={client.id}
                            data-oid="hqoat0c"
                          >
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div data-oid="ck8p_cx">
                    <Label htmlFor="projectId" data-oid="x29cnw-">
                      关联项目
                    </Label>
                    <Select
                      value={watchSingle("projectId")}
                      onValueChange={(value) =>
                        setSingleValue(
                          "projectId",
                          value === "none" ? "" : value,
                        )
                      }
                      data-oid="r:chc4f"
                    >
                      <SelectTrigger data-oid="81urt5w">
                        <SelectValue
                          placeholder="选择项目 (可选)"
                          data-oid="v.fnb-1"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="uzv20-m">
                        <SelectItem value="none" data-oid="r1n0.w4">
                          无关联
                        </SelectItem>
                        {Array.isArray(projects) && projects.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id}
                            data-oid="3z1mrxj"
                          >
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2" data-oid="06g6901">
                    <Label htmlFor="description" data-oid="6ecrz7a">
                      描述 *
                    </Label>
                    <Input
                      id="description"
                      {...registerSingle("description")}
                      placeholder="请输入交易描述"
                      data-oid="jbtakkm"
                    />

                    {singleErrors.description && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="plkeqf3"
                      >
                        {singleErrors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2" data-oid="9ngydgd">
                    <Button type="submit" className="w-full" data-oid="u2-9xa-">
                      <Plus className="w-4 h-4 mr-2" data-oid="ew5967g" />
                      添加到列表
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4" data-oid="0y8jai_">
              <div
                className="border rounded-lg p-4 bg-gray-50"
                data-oid="apg85_1"
              >
                <div
                  className="flex items-center justify-between mb-3"
                  data-oid="5_bjlna"
                >
                  <h3 className="font-medium" data-oid="nxq.pjl">
                    CSV导入
                  </h3>
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    data-oid="s7mfvbb"
                  >
                    <Download className="w-4 h-4 mr-2" data-oid="_rd7y_j" />
                    下载模板
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3" data-oid="19c7d45">
                  请按照模板格式准备CSV文件，确保包含所有必填字段
                </p>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="粘贴CSV内容，或使用下载的模板文件..."
                  className="w-full h-32 p-2 border rounded-md"
                  data-oid="jn7s.ks"
                />

                <Button
                  onClick={handleCsvImport}
                  className="mt-2"
                  disabled={!csvData.trim()}
                  data-oid="05e26sa"
                >
                  <Upload className="w-4 h-4 mr-2" data-oid="ptu0qf7" />
                  导入数据
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* 交易列表 */}
          {transactions.length > 0 && (
            <div className="mt-6" data-oid="jpslydv">
              <div
                className="flex items-center justify-between mb-3"
                data-oid="9cjfoy3"
              >
                <h3 className="font-medium" data-oid="zz0lxv3">
                  待导入交易列表 ({transactions.length})
                </h3>
                <div className="flex items-center gap-2" data-oid="mu80gw2">
                  <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                    data-oid="vx8jyfg"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" data-oid="4zjvdqn" />
                    收入: ¥{totalIncome.toFixed(2)}
                  </Badge>
                  <Badge
                    variant="default"
                    className="bg-red-100 text-red-800"
                    data-oid="0_jw0xk"
                  >
                    <TrendingDown className="w-3 h-3 mr-1" data-oid="l:xvz89" />
                    支出: ¥{totalExpense.toFixed(2)}
                  </Badge>
                  <Badge
                    variant={
                      totalIncome - totalExpense >= 0
                        ? "default"
                        : "destructive"
                    }
                    data-oid="utf.ba1"
                  >
                    <DollarSign className="w-3 h-3 mr-1" data-oid="jtqe-kw" />
                    净额: ¥{(totalIncome - totalExpense).toFixed(2)}
                  </Badge>
                </div>
              </div>

              <div
                className="border rounded-lg overflow-hidden max-h-96 overflow-auto"
                data-oid="whon6_8"
              >
                <Table data-oid="qlxq3r2">
                  <TableHeader data-oid="coandid">
                    <TableRow data-oid="-vxleev">
                      <TableHead data-oid="9048epz">类型</TableHead>
                      <TableHead data-oid="-56uxo7">类别</TableHead>
                      <TableHead data-oid="edy:ab2">金额</TableHead>
                      <TableHead data-oid="oyvma_v">描述</TableHead>
                      <TableHead data-oid="5lg6aus">日期</TableHead>
                      <TableHead data-oid="bdbgukh">关联</TableHead>
                      <TableHead data-oid="_zhha-h">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-oid="9un1:ok">
                    {transactions.map((transaction, index) => (
                      <TableRow key={index} data-oid="_f8kamo">
                        <TableCell data-oid="oau.7ep">
                          <div
                            className="flex items-center gap-1"
                            data-oid="pzf0r0j"
                          >
                            {transaction.type === "income" ? (
                              <TrendingUp
                                className="w-4 h-4 text-green-600"
                                data-oid="4eo4hja"
                              />
                            ) : (
                              <TrendingDown
                                className="w-4 h-4 text-red-600"
                                data-oid="mlzte1n"
                              />
                            )}
                            {transaction.type === "income" ? "收入" : "支出"}
                          </div>
                        </TableCell>
                        <TableCell data-oid="9n6i7.g">
                          {transaction.category}
                        </TableCell>
                        <TableCell className="font-medium" data-oid="v:ffj5_">
                          ¥{parseFloat(transaction.amount).toFixed(2)}
                        </TableCell>
                        <TableCell
                          className="max-w-xs truncate"
                          title={transaction.description}
                          data-oid="dbhy1oy"
                        >
                          {transaction.description}
                        </TableCell>
                        <TableCell data-oid="g731n6t">
                          {transaction.date}
                        </TableCell>
                        <TableCell data-oid="lwjm4v8">
                          <div className="text-xs" data-oid="jolc8ns">
                            {transaction.clientId && (
                              <div data-oid="4z.tklj">
                                客户:{" "}
                                {clients.find(
                                  (c) => c.id === transaction.clientId,
                                )?.name || "未知"}
                              </div>
                            )}
                            {transaction.projectId && (
                              <div data-oid="6r8.fr-">
                                项目:{" "}
                                {projects.find(
                                  (p) => p.id === transaction.projectId,
                                )?.name || "未知"}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell data-oid="cjtup_q">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTransaction(index)}
                            data-oid="-32bjet"
                          >
                            <Trash2 className="w-4 h-4" data-oid=":73oz05" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-2 mt-6" data-oid="h0napfy">
            <Button variant="outline" onClick={onClose} data-oid=":..4zmx">
              取消
            </Button>
            <Button
              onClick={handleBatchSubmit}
              disabled={transactions.length === 0 || isSubmitting}
              data-oid="iwxfm:m"
            >
              {isSubmitting
                ? "导入中..."
                : `批量导入 (${transactions.length} 条)`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

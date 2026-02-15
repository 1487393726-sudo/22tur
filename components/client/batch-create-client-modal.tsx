"use client";

import { useState } from "react";
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
import { Upload, Download, Plus, Trash2, Users } from "lucide-react";

// 客户数据验证模式
const clientSchema = z.object({
  name: z.string().min(2, "客户名称至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  phone: z.string().min(1, "请输入联系电话"),
  industry: z.string().min(1, "请选择行业"),
  address: z.string().optional(),
  website: z.string().url("请输入有效的网站地址").optional().or(z.literal("")),
  contactPerson: z.string().optional(),
  contactTitle: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["active", "inactive", "potential"]).default("active"),
});

type ClientFormData = z.infer<typeof clientSchema>;

// 预设行业
const industries = [
  "IT/软件",
  "金融服务",
  "制造业",
  "零售业",
  "医疗健康",
  "教育培训",
  "房地产",
  "咨询服务业",
  "媒体广告",
  "物流运输",
  "餐饮业",
  "建筑业",
  "能源化工",
  "政府机构",
  "非营利组织",
];

export default function BatchCreateClientModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [clients, setClients] = useState<ClientFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMethod, setImportMethod] = useState<"manual" | "file">("manual");
  const [csvData, setCsvData] = useState<string>("");
  const { toast } = useToast();

  // 手动添加单个客户表单
  const {
    register: registerSingle,
    handleSubmit: handleSingleSubmit,
    reset: resetSingleForm,
    formState: { errors: singleErrors },
    setValue: setSingleValue,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      status: "active",
    },
  });

  // 添加单个客户到列表
  const addClient = (data: ClientFormData) => {
    setClients((prev) => [...prev, { ...data }]);
    resetSingleForm();
    setSingleValue("status", "active");
    toast({
      title: "添加成功",
      description: `客户 ${data.name} 已添加到列表`,
    });
  };

  // 删除客户
  const removeClient = (index: number) => {
    setClients((prev) => prev.filter((_, i) => i !== index));
  };

  // 处理CSV导入
  const handleCsvImport = () => {
    try {
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const newClients: ClientFormData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length >= 4) {
          // 至少包含基本字段
          const client: ClientFormData = {
            name: values[0] || "",
            email: values[1] || "",
            phone: values[2] || "",
            industry: values[3] || "",
            address: values[4] || "",
            website: values[5] || "",
            contactPerson: values[6] || "",
            contactTitle: values[7] || "",
            notes: values[8] || "",
            status:
              (values[9] as "active" | "inactive" | "potential") || "active",
          };

          // 验证数据
          const validation = clientSchema.safeParse(client);
          if (validation.success) {
            newClients.push(client);
          }
        }
      }

      setClients((prev) => [...prev, ...newClients]);
      setCsvData("");
      toast({
        title: "导入成功",
        description: `成功导入 ${newClients.length} 个客户`,
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
      "客户名称,邮箱,电话,行业,地址,网站,联系人,职位,备注,状态\nABC科技有限公司,contact@abc.com,010-88888888,IT/软件,北京市朝阳区,www.abc.com,张经理,总经理,优质客户,active";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "客户批量导入模板.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 批量提交创建
  const handleBatchSubmit = async () => {
    if (clients.length === 0) {
      toast({
        title: "提示",
        description: "请先添加客户数据",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 逐个创建客户
      const results = await Promise.allSettled(
        clients.map(async (client) => {
          const response = await fetch("/api/client", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(client),
          });

          if (!response.ok) {
            throw new Error(`创建客户 ${client.name} 失败`);
          }

          return response.json();
        }),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast({
          title: "批量创建完成",
          description: `成功创建 ${successful} 个客户${failed > 0 ? `，失败 ${failed} 个` : ""}`,
        });
      } else {
        toast({
          title: "创建失败",
          description: "所有客户创建都失败了",
          variant: "destructive",
        });
      }

      if (successful > 0) {
        onClose();
      }
    } catch (error) {
      console.error("批量创建失败:", error);
      toast({
        title: "批量创建失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      data-oid="gh3t5lq"
    >
      <Card
        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
        data-oid="ds:hb5p"
      >
        <CardHeader data-oid="b32ntrs">
          <CardTitle className="flex items-center gap-2" data-oid="99yw15b">
            <Users className="w-5 h-5" data-oid="gvmpa97" />
            批量创建客户
          </CardTitle>
        </CardHeader>
        <CardContent data-oid="wmfaul-">
          <Tabs
            value={importMethod}
            onValueChange={(value) =>
              setImportMethod(value as "manual" | "file")
            }
            data-oid="o9x4gm_"
          >
            <TabsList
              className="grid w-full grid-cols-2 mb-4"
              data-oid="yznl13a"
            >
              <TabsTrigger value="manual" data-oid="dn54-mx">
                手动添加
              </TabsTrigger>
              <TabsTrigger value="file" data-oid="5jib07h">
                CSV导入
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="manual"
              className="space-y-4"
              data-oid="c0llefh"
            >
              <div
                className="border rounded-lg p-4 bg-gray-50"
                data-oid="7-lbgxo"
              >
                <h3 className="font-medium mb-3" data-oid="ywn:oj6">
                  添加单个客户
                </h3>
                <form
                  onSubmit={handleSingleSubmit(addClient)}
                  className="grid grid-cols-2 gap-4"
                  data-oid=".zejo5e"
                >
                  <div data-oid="n1i:n36">
                    <Label htmlFor="name" data-oid="cq1pkv8">
                      客户名称 *
                    </Label>
                    <Input
                      id="name"
                      {...registerSingle("name")}
                      placeholder="请输入客户名称"
                      data-oid="ry9iaxs"
                    />

                    {singleErrors.name && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="ehh:nw."
                      >
                        {singleErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="3xqs0qg">
                    <Label htmlFor="email" data-oid="l64r.le">
                      邮箱
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerSingle("email")}
                      placeholder="请输入邮箱（可选）"
                      data-oid="2d.tx21"
                    />

                    {singleErrors.email && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="nhmw_t2"
                      >
                        {singleErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="urhuwvb">
                    <Label htmlFor="phone" data-oid="nd9kykr">
                      联系电话 *
                    </Label>
                    <Input
                      id="phone"
                      {...registerSingle("phone")}
                      placeholder="请输入联系电话"
                      data-oid="xtk7zda"
                    />

                    {singleErrors.phone && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="pnb0_6i"
                      >
                        {singleErrors.phone.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="c31tqvf">
                    <Label htmlFor="industry" data-oid="q:w9-b4">
                      行业 *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setSingleValue("industry", value)
                      }
                      data-oid="i.l986i"
                    >
                      <SelectTrigger data-oid="bxc1hx0">
                        <SelectValue
                          placeholder="选择行业"
                          data-oid="nqzfoo_"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="h1yceyg">
                        {industries.map((industry) => (
                          <SelectItem
                            key={industry}
                            value={industry}
                            data-oid="9ahg2cu"
                          >
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {singleErrors.industry && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="svs5_22"
                      >
                        {singleErrors.industry.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="mq5xo5i">
                    <Label htmlFor="contactPerson" data-oid="qc0sjh9">
                      联系人
                    </Label>
                    <Input
                      id="contactPerson"
                      {...registerSingle("contactPerson")}
                      placeholder="请输入联系人姓名"
                      data-oid="or18.d6"
                    />
                  </div>

                  <div data-oid="n_9iuh1">
                    <Label htmlFor="contactTitle" data-oid="4yi9o73">
                      职位
                    </Label>
                    <Input
                      id="contactTitle"
                      {...registerSingle("contactTitle")}
                      placeholder="请输入联系人职位"
                      data-oid="q0q-phk"
                    />
                  </div>

                  <div data-oid="tn891a5">
                    <Label htmlFor="website" data-oid="t2ulgdn">
                      网站
                    </Label>
                    <Input
                      id="website"
                      {...registerSingle("website")}
                      placeholder="请输入网站地址"
                      data-oid="3zoakw3"
                    />

                    {singleErrors.website && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="_:xoywt"
                      >
                        {singleErrors.website.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="tl9t-0j">
                    <Label htmlFor="status" data-oid="7h4c_v3">
                      状态
                    </Label>
                    <Select
                      onValueChange={(value) => setSingleValue("status", value as "active" | "inactive" | "potential")}
                      defaultValue="active"
                      data-oid="0490_gt"
                    >
                      <SelectTrigger data-oid="uq6jlp4">
                        <SelectValue
                          placeholder="选择状态"
                          data-oid="89cu6ds"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="1ti.gqa">
                        <SelectItem value="active" data-oid="mhyejha">
                          活跃
                        </SelectItem>
                        <SelectItem value="inactive" data-oid="aowbu:o">
                          不活跃
                        </SelectItem>
                        <SelectItem value="potential" data-oid="1-r7k5p">
                          潜在客户
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2" data-oid="8dqesdv">
                    <Label htmlFor="address" data-oid=".a98jx2">
                      地址
                    </Label>
                    <Input
                      id="address"
                      {...registerSingle("address")}
                      placeholder="请输入地址"
                      data-oid="idxj-rz"
                    />
                  </div>

                  <div className="col-span-2" data-oid="hw_gtp.">
                    <Label htmlFor="notes" data-oid="lmaj8cr">
                      备注
                    </Label>
                    <Textarea
                      id="notes"
                      {...registerSingle("notes")}
                      placeholder="请输入备注信息"
                      rows={2}
                      data-oid="6-4ysez"
                    />
                  </div>

                  <div className="col-span-2" data-oid="7x-odak">
                    <Button type="submit" className="w-full" data-oid="cdv8v5t">
                      <Plus className="w-4 h-4 mr-2" data-oid="2ll92o3" />
                      添加到列表
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4" data-oid="l_pwq.9">
              <div
                className="border rounded-lg p-4 bg-gray-50"
                data-oid="_97ce._"
              >
                <div
                  className="flex items-center justify-between mb-3"
                  data-oid="ar346rj"
                >
                  <h3 className="font-medium" data-oid="v_9ggj5">
                    CSV导入
                  </h3>
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    data-oid="b37o73q"
                  >
                    <Download className="w-4 h-4 mr-2" data-oid="yckux7k" />
                    下载模板
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3" data-oid="bdhxfdf">
                  请按照模板格式准备CSV文件，确保包含所有必填字段
                </p>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="粘贴CSV内容，或使用下载的模板文件..."
                  className="w-full h-32 p-2 border rounded-md"
                  data-oid="n380u2p"
                />

                <Button
                  onClick={handleCsvImport}
                  className="mt-2"
                  disabled={!csvData.trim()}
                  data-oid="n71.s6q"
                >
                  <Upload className="w-4 h-4 mr-2" data-oid="9tmoliv" />
                  导入数据
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* 客户列表 */}
          {clients.length > 0 && (
            <div className="mt-6" data-oid=":0v33ol">
              <div
                className="flex items-center justify-between mb-3"
                data-oid="s.qn8bi"
              >
                <h3 className="font-medium" data-oid="gan.346">
                  待创建客户列表 ({clients.length})
                </h3>
                <Badge variant="secondary" data-oid="glabtjz">
                  {clients.length} 个
                </Badge>
              </div>

              <div
                className="border rounded-lg overflow-hidden"
                data-oid="v7bhpot"
              >
                <Table data-oid="i8ra-3o">
                  <TableHeader data-oid="f8gjyl:">
                    <TableRow data-oid="5_a6t63">
                      <TableHead data-oid="ymsfjnw">客户名称</TableHead>
                      <TableHead data-oid="vboaw:7">联系电话</TableHead>
                      <TableHead data-oid="wsb-rzy">行业</TableHead>
                      <TableHead data-oid="42ice23">联系人</TableHead>
                      <TableHead data-oid="abnla9h">状态</TableHead>
                      <TableHead data-oid="5uk9cvb">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-oid="7p0k45_">
                    {clients.map((client, index) => (
                      <TableRow key={index} data-oid="06fddqv">
                        <TableCell className="font-medium" data-oid="6.wwtvt">
                          {client.name}
                        </TableCell>
                        <TableCell data-oid="qcbrg09">{client.phone}</TableCell>
                        <TableCell data-oid="13dr-du">
                          {client.industry}
                        </TableCell>
                        <TableCell data-oid="-7ymie0">
                          {client.contactPerson || "-"}
                        </TableCell>
                        <TableCell data-oid="uvb4rci">
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : client.status === "inactive"
                                  ? "secondary"
                                  : "outline"
                            }
                            data-oid="oas..th"
                          >
                            {client.status === "active"
                              ? "活跃"
                              : client.status === "inactive"
                                ? "不活跃"
                                : "潜在客户"}
                          </Badge>
                        </TableCell>
                        <TableCell data-oid="2o4a9uq">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeClient(index)}
                            data-oid="fi3zc5m"
                          >
                            <Trash2 className="w-4 h-4" data-oid="x2ptuw8" />
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
          <div className="flex justify-end gap-2 mt-6" data-oid="ilw::a5">
            <Button variant="outline" onClick={onClose} data-oid="nw0f3-i">
              取消
            </Button>
            <Button
              onClick={handleBatchSubmit}
              disabled={clients.length === 0 || isSubmitting}
              data-oid="vtozobm"
            >
              {isSubmitting ? "创建中..." : `批量创建 (${clients.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

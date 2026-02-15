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
import { useToast } from "@/hooks/use-toast";
import {
  CalendarIcon,
  Upload,
  Users,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

// 员工数据验证模式
const employeeSchema = z.object({
  name: z.string().min(2, "姓名至少需要2个字符"),
  email: z.string().email("请输入有效的邮箱地址"),
  position: z.string().min(1, "请选择职位"),
  department: z.string().min(1, "请选择部门"),
  phone: z.string().optional(),
  address: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
  hireDate: z.date().default(new Date()),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

// 预设职位和部门
const positions = [
  "总经理",
  "副总经理",
  "部门经理",
  "项目经理",
  "技术主管",
  "高级工程师",
  "工程师",
  "初级工程师",
  "实习生",
  "行政专员",
  "人事专员",
  "财务专员",
  "市场专员",
  "销售经理",
  "销售代表",
];

const departments = [
  "管理层",
  "技术部",
  "市场部",
  "销售部",
  "人事部",
  "财务部",
  "行政部",
  "客服部",
  "运营部",
  "产品部",
];

export default function BatchCreateEmployeeModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [employees, setEmployees] = useState<EmployeeFormData[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importMethod, setImportMethod] = useState<"manual" | "file">("manual");
  const [csvData, setCsvData] = useState<string>("");
  const { toast } = useToast();

  // 手动添加单个员工表单
  const {
    register: registerSingle,
    handleSubmit: handleSingleSubmit,
    reset: resetSingleForm,
    formState: { errors: singleErrors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      hireDate: new Date(),
      status: "active",
    },
  });

  // 添加单个员工到列表
  const addEmployee = (data: EmployeeFormData) => {
    setEmployees((prev) => [...prev, { ...data }]);
    resetSingleForm();
    toast({
      title: "添加成功",
      description: `员工 ${data.name} 已添加到列表`,
    });
  };

  // 删除员工
  const removeEmployee = (index: number) => {
    setEmployees((prev) => prev.filter((_, i) => i !== index));
  };

  // 处理CSV导入
  const handleCsvImport = () => {
    try {
      const lines = csvData.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const newEmployees: EmployeeFormData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        if (values.length >= 4) {
          // 至少包含基本字段
          const employee: EmployeeFormData = {
            name: values[0] || "",
            email: values[1] || "",
            position: values[2] || "",
            department: values[3] || "",
            phone: values[4] || "",
            address: values[5] || "",
            salary: values[6] || "",
            status:
              (values[7] as "active" | "inactive" | "pending") || "active",
            hireDate: values[8] ? new Date(values[8]) : new Date(),
          };

          // 验证数据
          const validation = employeeSchema.safeParse(employee);
          if (validation.success) {
            newEmployees.push(employee);
          }
        }
      }

      setEmployees((prev) => [...prev, ...newEmployees]);
      setCsvData("");
      toast({
        title: "导入成功",
        description: `成功导入 ${newEmployees.length} 个员工`,
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
      "姓名,邮箱,职位,部门,电话,地址,薪资,状态,入职日期\n张三,zhangsan@example.com,工程师,技术部,13800138000,北京市朝阳区,10000,active,2024-01-01";
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "员工批量导入模板.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 批量提交创建
  const handleBatchSubmit = async () => {
    if (employees.length === 0) {
      toast({
        title: "提示",
        description: "请先添加员工数据",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 逐个创建员工
      const results = await Promise.allSettled(
        employees.map(async (employee) => {
          const response = await fetch("/api/employee", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(employee),
          });

          if (!response.ok) {
            throw new Error(`创建员工 ${employee.name} 失败`);
          }

          return response.json();
        }),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (successful > 0) {
        toast({
          title: "批量创建完成",
          description: `成功创建 ${successful} 个员工${failed > 0 ? `，失败 ${failed} 个` : ""}`,
        });
      } else {
        toast({
          title: "创建失败",
          description: "所有员工创建都失败了",
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
      data-oid="hxxjti7"
    >
      <Card
        className="w-full max-w-4xl max-h-[90vh] overflow-auto"
        data-oid="7dbp1y:"
      >
        <CardHeader data-oid="-aq_zq5">
          <CardTitle className="flex items-center gap-2" data-oid="vlq7742">
            <Users className="w-5 h-5" data-oid=".wg5vk." />
            批量创建员工
          </CardTitle>
        </CardHeader>
        <CardContent data-oid="kivesy4">
          <Tabs
            value={importMethod}
            onValueChange={(value) =>
              setImportMethod(value as "manual" | "file")
            }
            data-oid="jx7vfzd"
          >
            <TabsList
              className="grid w-full grid-cols-2 mb-4"
              data-oid="tugczst"
            >
              <TabsTrigger value="manual" data-oid="-8ls_8g">
                手动添加
              </TabsTrigger>
              <TabsTrigger value="file" data-oid="krscv_e">
                CSV导入
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="manual"
              className="space-y-4"
              data-oid="v3vfcsc"
            >
              <div
                className="border rounded-lg p-4 bg-gray-50"
                data-oid="g.nvwwz"
              >
                <h3 className="font-medium mb-3" data-oid="580fkym">
                  添加单个员工
                </h3>
                <form
                  onSubmit={handleSingleSubmit(addEmployee)}
                  className="grid grid-cols-2 gap-4"
                  data-oid="gql80ps"
                >
                  <div data-oid="pdk81qd">
                    <Label htmlFor="name" data-oid="xmv.m_a">
                      姓名 *
                    </Label>
                    <Input
                      id="name"
                      {...registerSingle("name")}
                      placeholder="请输入姓名"
                      data-oid="hf7dnr."
                    />

                    {singleErrors.name && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="at-hn9w"
                      >
                        {singleErrors.name.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="ic2m1tw">
                    <Label htmlFor="email" data-oid="86_ker5">
                      邮箱 *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerSingle("email")}
                      placeholder="请输入邮箱"
                      data-oid="de7c-rz"
                    />

                    {singleErrors.email && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="vghx9pd"
                      >
                        {singleErrors.email.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="njs0wdk">
                    <Label htmlFor="position" data-oid="1zq2an9">
                      职位 *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        registerSingle("position").onChange({
                          target: { value },
                        })
                      }
                      data-oid="47hcj5_"
                    >
                      <SelectTrigger data-oid="uxq5s6c">
                        <SelectValue
                          placeholder="选择职位"
                          data-oid=":d4hm0p"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="zxjt-id">
                        {positions.map((pos) => (
                          <SelectItem key={pos} value={pos} data-oid="9gm0qs-">
                            {pos}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {singleErrors.position && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid=".u:me-n"
                      >
                        {singleErrors.position.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="h1e-3.p">
                    <Label htmlFor="department" data-oid="969r:p5">
                      部门 *
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        registerSingle("department").onChange({
                          target: { value },
                        })
                      }
                      data-oid="e0ts_v6"
                    >
                      <SelectTrigger data-oid="f2fo4nd">
                        <SelectValue
                          placeholder="选择部门"
                          data-oid="tp7k8kk"
                        />
                      </SelectTrigger>
                      <SelectContent data-oid="3m9rw-l">
                        {departments.map((dept) => (
                          <SelectItem
                            key={dept}
                            value={dept}
                            data-oid="gc--c.d"
                          >
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {singleErrors.department && (
                      <p
                        className="text-red-500 text-sm mt-1"
                        data-oid="..9hy1h"
                      >
                        {singleErrors.department.message}
                      </p>
                    )}
                  </div>

                  <div data-oid="9fogrg2">
                    <Label htmlFor="phone" data-oid="y31ins3">
                      电话
                    </Label>
                    <Input
                      id="phone"
                      {...registerSingle("phone")}
                      placeholder="请输入电话"
                      data-oid="_qzusux"
                    />
                  </div>

                  <div data-oid="ohqkiu-">
                    <Label htmlFor="salary" data-oid="28kbb79">
                      薪资
                    </Label>
                    <Input
                      id="salary"
                      {...registerSingle("salary")}
                      placeholder="请输入薪资"
                      data-oid=":j1vuyf"
                    />
                  </div>

                  <div className="col-span-2" data-oid="eusj7dk">
                    <Button type="submit" className="w-full" data-oid="zcvvj.q">
                      <Plus className="w-4 h-4 mr-2" data-oid="68:r7px" />
                      添加到列表
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4" data-oid="x-jsv8a">
              <div
                className="border rounded-lg p-4 bg-gray-50"
                data-oid="6jqdmc2"
              >
                <div
                  className="flex items-center justify-between mb-3"
                  data-oid="pl9r9:x"
                >
                  <h3 className="font-medium" data-oid="ht2y7no">
                    CSV导入
                  </h3>
                  <Button
                    variant="outline"
                    onClick={downloadTemplate}
                    data-oid="k456uz8"
                  >
                    <Download className="w-4 h-4 mr-2" data-oid="b2iw8iw" />
                    下载模板
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mb-3" data-oid="b26mwvk">
                  请按照模板格式准备CSV文件，确保包含所有必填字段
                </p>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  placeholder="粘贴CSV内容，或使用下载的模板文件..."
                  className="w-full h-32 p-2 border rounded-md"
                  data-oid="bakyjgt"
                />

                <Button
                  onClick={handleCsvImport}
                  className="mt-2"
                  disabled={!csvData.trim()}
                  data-oid="hl90psv"
                >
                  <Upload className="w-4 h-4 mr-2" data-oid="1vl6krp" />
                  导入数据
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          {/* 员工列表 */}
          {employees.length > 0 && (
            <div className="mt-6" data-oid="nigfeq_">
              <div
                className="flex items-center justify-between mb-3"
                data-oid="_7xf7g-"
              >
                <h3 className="font-medium" data-oid="28gmlxs">
                  待创建员工列表 ({employees.length})
                </h3>
                <Badge variant="secondary" data-oid="vad1:hf">
                  {employees.length} 人
                </Badge>
              </div>

              <div
                className="border rounded-lg overflow-hidden"
                data-oid="tbekmwf"
              >
                <Table data-oid="5zzjc80">
                  <TableHeader data-oid="8s-jhbx">
                    <TableRow data-oid="702m8c.">
                      <TableHead data-oid="y365wx7">姓名</TableHead>
                      <TableHead data-oid="93qko6g">邮箱</TableHead>
                      <TableHead data-oid="s2v-io3">职位</TableHead>
                      <TableHead data-oid="8r8iq_-">部门</TableHead>
                      <TableHead data-oid="hl4n0fv">状态</TableHead>
                      <TableHead data-oid="nr61c6r">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody data-oid="fzebf42">
                    {employees.map((employee, index) => (
                      <TableRow key={index} data-oid="x9-gtij">
                        <TableCell className="font-medium" data-oid="8xf2rkm">
                          {employee.name}
                        </TableCell>
                        <TableCell data-oid="90qyqog">
                          {employee.email}
                        </TableCell>
                        <TableCell data-oid="mypyk.n">
                          {employee.position}
                        </TableCell>
                        <TableCell data-oid="7twfx67">
                          {employee.department}
                        </TableCell>
                        <TableCell data-oid=":f0p.:a">
                          <Badge
                            variant={
                              employee.status === "active"
                                ? "default"
                                : employee.status === "inactive"
                                  ? "secondary"
                                  : "outline"
                            }
                            data-oid="acy3a7."
                          >
                            {employee.status === "active"
                              ? "在职"
                              : employee.status === "inactive"
                                ? "离职"
                                : "待定"}
                          </Badge>
                        </TableCell>
                        <TableCell data-oid="buldbtz">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEmployee(index)}
                            data-oid="e3tsi8x"
                          >
                            <Trash2 className="w-4 h-4" data-oid="on8xjgf" />
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
          <div className="flex justify-end gap-2 mt-6" data-oid="gu7d.8i">
            <Button variant="outline" onClick={onClose} data-oid="c0q8hiz">
              取消
            </Button>
            <Button
              onClick={handleBatchSubmit}
              disabled={employees.length === 0 || isSubmitting}
              data-oid="5ikv749"
            >
              {isSubmitting ? "创建中..." : `批量创建 (${employees.length})`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

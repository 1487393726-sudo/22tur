"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TransactionType } from "@/types";

// 表单验证模式
const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.number().min(0.01, "金额必须大于0"),
  description: z.string().min(1, "描述不能为空"),
  category: z.string().min(1, "请选择类别"),
  date: z.date({
    required_error: "请选择日期",
  }),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface CreateTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  clientId: string;
}

export function CreateTransactionModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateTransactionModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [showCustomCategory, setShowCustomCategory] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "INCOME",
      amount: 0,
      description: "",
      category: "",
      date: new Date(),
    },
  });

  const selectedType = watch("type");
  const selectedDate = watch("date");

  useEffect(() => {
    if (open) {
      fetchData();
      reset();
    }
  }, [open, reset]);

  const fetchData = async () => {
    try {
      const [clientsResponse, projectsResponse] = await Promise.all([
        fetch("/api/clients"),
        fetch("/api/projects"),
      ]);

      if (clientsResponse.ok && projectsResponse.ok) {
        const [clientsData, projectsData] = await Promise.all([
          clientsResponse.json(),
          projectsResponse.json(),
        ]);
        
        // 确保数据格式正确，并且是数组
        const clientsArray = Array.isArray(clientsData) 
          ? clientsData 
          : Array.isArray(clientsData?.data) 
            ? clientsData.data 
            : [];
            
        const projectsArray = Array.isArray(projectsData) 
          ? projectsData 
          : Array.isArray(projectsData?.data) 
            ? projectsData.data 
            : [];
            
        setClients(clientsArray);
        setProjects(projectsArray);
      }
    } catch (error) {
      console.error("获取数据失败:", error);
      setClients([]);
      setProjects([]);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/finance/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`创建记录失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("创建记录失败:", error);
      alert("创建记录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const incomeCategories = [
    "项目收入",
    "服务收入",
    "咨询收入",
    "产品收入",
    "投资收益",
    "其他收入",
  ];

  const expenseCategories = [
    "人员工资",
    "办公租金",
    "设备采购",
    "软件订阅",
    "营销费用",
    "差旅费用",
    "水电费",
    "通讯费",
    "租赁费",
    "折旧费",
    "其他支出",
  ];

  const categories =
    selectedType === "INCOME" ? incomeCategories : expenseCategories;

  // 添加自定义类别到选项列表
  const allCategories = showCustomCategory
    ? [...categories, customCategory]
    : categories;

  const filteredProjects = Array.isArray(projects)
    ? selectedClient
      ? projects.filter((p) => p.clientId === selectedClient)
      : projects
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="9.-n2t3">
      <DialogContent className="sm:max-w-[600px]" data-oid="wu_4hst">
        <DialogHeader data-oid="8tmkp9a">
          <DialogTitle data-oid="dpgfp6s">新增收支记录</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="z_p0mgi"
        >
          {/* 基本信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid=".vclxi3"
          >
            <div className="space-y-2" data-oid="39j2lxj">
              <Label htmlFor="type" data-oid="jtim549">
                类型 *
              </Label>
              <Select
                value={selectedType}
                onValueChange={(value: TransactionType) => {
                  setValue("type", value);
                  setValue("category", "");
                }}
                data-oid=".end5jk"
              >
                <SelectTrigger data-oid="ss:ipp2">
                  <SelectValue data-oid="p4bbreq" />
                </SelectTrigger>
                <SelectContent data-oid="wi-cz7k">
                  <SelectItem value="INCOME" data-oid="6:w2ee-">
                    收入
                  </SelectItem>
                  <SelectItem value="EXPENSE" data-oid="hp..kkk">
                    支出
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="fphe:w1">
              <Label htmlFor="amount" data-oid="p.1va2:">
                金额 (¥) *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register("amount", { valueAsNumber: true })}
                placeholder="请输入金额"
                className={errors.amount ? "border-red-500" : ""}
                data-oid=":08u4ce"
              />

              {errors.amount && (
                <p className="text-sm text-red-600" data-oid="aq:mq5c">
                  {errors.amount.message}
                </p>
              )}
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="jmpsjv6"
          >
            <div className="space-y-2" data-oid="kayxt3q">
              <Label htmlFor="category" data-oid="-a6qq.q">
                类别 *
              </Label>
              <div className="flex gap-2" data-oid="v-2pte3">
                <Select
                  value={watch("category")}
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setShowCustomCategory(true);
                      setValue("category", "");
                    } else {
                      setValue("category", value);
                      setShowCustomCategory(false);
                    }
                  }}
                  data-oid="6wudwk5"
                >
                  <SelectTrigger data-oid="m4rw-xw">
                    <SelectValue placeholder="请选择类别" data-oid="-x.ehhc" />
                  </SelectTrigger>
                  <SelectContent data-oid="3n-s:dp">
                    {allCategories.map((category) => (
                      <SelectItem
                        key={category}
                        value={category}
                        data-oid="6ndyp9f"
                      >
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom" data-oid="3xc:kgu">
                      + 自定义类别
                    </SelectItem>
                  </SelectContent>
                </Select>

                {showCustomCategory && (
                  <Input
                    placeholder="输入自定义类别"
                    value={customCategory}
                    onChange={(e) => {
                      setCustomCategory(e.target.value);
                      setValue("category", e.target.value);
                    }}
                    className="flex-1"
                    data-oid="sts22s."
                  />
                )}
              </div>
              {errors.category && (
                <p className="text-sm text-red-600" data-oid="3q-0qub">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="bwd04dl">
              <Label htmlFor="date" data-oid="-1h0vqh">
                日期 *
              </Label>
              <Popover data-oid="63ie4:i">
                <PopoverTrigger asChild data-oid="pq:j91n">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                    data-oid="c8tn1xc"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" data-oid="gwd.ejz" />
                    {selectedDate
                      ? format(selectedDate, "PPP", { locale: zhCN })
                      : "选择日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" data-oid="2gn1ol9">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setValue("date", date)}
                    initialFocus
                    locale={zhCN}
                    data-oid="4e6955r"
                  />
                </PopoverContent>
              </Popover>
              {errors.date && (
                <p className="text-sm text-red-600" data-oid="qz:asxd">
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          {/* 关联信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="x_zn6ou"
          >
            <div className="space-y-2" data-oid="9bor_3g">
              <Label htmlFor="clientId" data-oid="40yv6b1">
                关联客户
              </Label>
              <Select
                value={selectedClient}
                onValueChange={(value) => {
                  setSelectedClient(value);
                  setValue("clientId", value === "none" ? undefined : value);
                  setValue("projectId", undefined); // 清空项目选择
                }}
                data-oid="s6k54qi"
              >
                <SelectTrigger data-oid="xljn1xn">
                  <SelectValue
                    placeholder="请选择客户（可选）"
                    data-oid="ri_fcj2"
                  />
                </SelectTrigger>
                <SelectContent data-oid="-cf.2l6">
                  <SelectItem value="none" data-oid="va.gsvk">
                    无关联客户
                  </SelectItem>
                  {Array.isArray(clients) && clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                      data-oid="2pv1sqc"
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="v0_00f7">
              <Label htmlFor="projectId" data-oid="wxd_s59">
                关联项目
              </Label>
              <Select
                value={watch("projectId")}
                onValueChange={(value) =>
                  setValue("projectId", value === "none" ? undefined : value)
                }
                disabled={!selectedClient && filteredProjects.length === 0}
                data-oid="at-q3kr"
              >
                <SelectTrigger data-oid="dalerdv">
                  <SelectValue
                    placeholder="请选择项目（可选）"
                    data-oid="_4mqs4o"
                  />
                </SelectTrigger>
                <SelectContent data-oid=".02oljk">
                  <SelectItem value="none" data-oid="m-np33j">
                    无关联项目
                  </SelectItem>
                  {Array.isArray(filteredProjects) && filteredProjects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      data-oid="lrngrxm"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2" data-oid="e89biha">
            <Label htmlFor="description" data-oid="d-w-xqq">
              描述 *
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请输入收支描述"
              rows={3}
              className={errors.description ? "border-red-500" : ""}
              data-oid="13j92tn"
            />

            {errors.description && (
              <p className="text-sm text-red-600" data-oid="a2_lsdq">
                {errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter data-oid="c2c8-2r">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="vqn93jv"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="-cep2-0">
              {loading ? "创建中..." : "创建记录"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

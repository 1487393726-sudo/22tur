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
import { InvoiceStatus } from "@/types";

// 表单验证模式
const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1, "发票号不能为空"),
  clientId: z.string().min(1, "请选择客户"),
  projectId: z.string().optional(),
  amount: z.number().min(0.01, "金额必须大于0"),
  status: z.enum(["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]),
  issueDate: z.date({
    required_error: "请选择开票日期",
  }),
  dueDate: z.date({
    required_error: "请选择到期日期",
  }),
  description: z.string().optional(),
  notes: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface CreateInvoiceModalProps {
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

export function CreateInvoiceModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      status: "DRAFT",
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 默认30天后到期
    },
  });

  const selectedIssueDate = watch("issueDate");
  const selectedDueDate = watch("dueDate");

  useEffect(() => {
    if (open) {
      fetchData();
      generateInvoiceNumber();
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

  const generateInvoiceNumber = async () => {
    try {
      const response = await fetch("/api/finance/invoices/generate-number");
      if (response.ok) {
        const { invoiceNumber } = await response.json();
        setValue("invoiceNumber", invoiceNumber);
      } else {
        // 如果API返回错误，使用本地生成逻辑
        generateLocalInvoiceNumber();
      }
    } catch (error) {
      // 如果网络错误，使用本地生成逻辑
      generateLocalInvoiceNumber();
    }
  };

  const generateLocalInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const timestamp = date.getTime().toString().slice(-4);
    setValue("invoiceNumber", `INV-${year}${month}${day}-${timestamp}`);
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/finance/invoices", {
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
        alert(`创建发票失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("创建发票失败:", error);
      alert("创建发票失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = Array.isArray(projects)
    ? selectedClient
      ? projects.filter((p) => p.clientId === selectedClient)
      : projects
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid=".2t_zhv">
      <DialogContent className="sm:max-w-[600px]" data-oid="yqh39vm">
        <DialogHeader data-oid="8rxvy71">
          <DialogTitle data-oid="9.vwb3d">开具发票</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="bth9-uw"
        >
          {/* 基本信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="3oltonm"
          >
            <div className="space-y-2" data-oid="lrrpg-g">
              <Label htmlFor="invoiceNumber" data-oid="ua.ds.r">
                发票号 *
              </Label>
              <Input
                id="invoiceNumber"
                {...register("invoiceNumber")}
                placeholder="请输入发票号"
                className={errors.invoiceNumber ? "border-red-500" : ""}
                data-oid="wkcundb"
              />

              {errors.invoiceNumber && (
                <p className="text-sm text-red-600" data-oid="4x-nr4u">
                  {errors.invoiceNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="vgpqdlg">
              <Label htmlFor="status" data-oid="a6rzr3j">
                状态
              </Label>
              <Select
                value={watch("status")}
                onValueChange={(value: InvoiceStatus) =>
                  setValue("status", value)
                }
                data-oid="3c5u5az"
              >
                <SelectTrigger data-oid="d9_xv:7">
                  <SelectValue data-oid="9bz7kle" />
                </SelectTrigger>
                <SelectContent data-oid="_d6o8or">
                  <SelectItem value="DRAFT" data-oid="d-t1.we">
                    草稿
                  </SelectItem>
                  <SelectItem value="SENT" data-oid="hu8_8yr">
                    已发送
                  </SelectItem>
                  <SelectItem value="PAID" data-oid="_zkpop-">
                    已支付
                  </SelectItem>
                  <SelectItem value="OVERDUE" data-oid="952i:7k">
                    逾期
                  </SelectItem>
                  <SelectItem value="CANCELLED" data-oid="a6la26s">
                    已取消
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2" data-oid="y0e7m7a">
            <Label htmlFor="amount" data-oid="v336e:m">
              金额 (¥) *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              placeholder="请输入金额"
              className={errors.amount ? "border-red-500" : ""}
              data-oid="1:b6_fa"
            />

            {errors.amount && (
              <p className="text-sm text-red-600" data-oid="gzkb2bq">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* 客户和项目 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="ob_wd:s"
          >
            <div className="space-y-2" data-oid="e-4wt63">
              <Label htmlFor="clientId" data-oid="jenk47b">
                客户 *
              </Label>
              <Select
                value={selectedClient}
                onValueChange={(value) => {
                  setSelectedClient(value);
                  setValue("clientId", value);
                  setValue("projectId", ""); // 清空项目选择
                }}
                data-oid="a2c9ir9"
              >
                <SelectTrigger data-oid="ramjm0s">
                  <SelectValue placeholder="请选择客户" data-oid="ned0cun" />
                </SelectTrigger>
                <SelectContent data-oid="y:jb_q1">
                  {Array.isArray(clients) && clients.map((client) => (
                    <SelectItem
                      key={client.id}
                      value={client.id}
                      data-oid="xw3ev.u"
                    >
                      {client.name}
                    </SelectItem>
                  ))}
                  {(!clients || clients.length === 0) && (
                    <SelectItem value="no-clients" disabled>
                      暂无可用客户
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-sm text-red-600" data-oid="ivsn7vm">
                  {errors.clientId.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="vk9.:o:">
              <Label htmlFor="projectId" data-oid="8z:ieo.">
                关联项目
              </Label>
              <Select
                value={watch("projectId")}
                onValueChange={(value) => setValue("projectId", value)}
                disabled={!selectedClient && filteredProjects.length === 0}
                data-oid="rmlc.01"
              >
                <SelectTrigger data-oid="6djkzxp">
                  <SelectValue
                    placeholder="请选择项目（可选）"
                    data-oid="su_..2l"
                  />
                </SelectTrigger>
                <SelectContent data-oid="gl0m2wb">
                  {Array.isArray(filteredProjects) && filteredProjects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      data-oid="qmy1:cv"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                  {(!filteredProjects || filteredProjects.length === 0) && (
                    <SelectItem value="no-projects" disabled>
                      暂无可用项目
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 日期 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="i..7j6f"
          >
            <div className="space-y-2" data-oid="c7yrlg3">
              <Label htmlFor="issueDate" data-oid="1b_10x1">
                开票日期 *
              </Label>
              <Popover data-oid="dmmzrx:">
                <PopoverTrigger asChild data-oid="vh5b1w8">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedIssueDate && "text-muted-foreground",
                    )}
                    data-oid=":0m0.4z"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" data-oid=".lzvmyh" />
                    {selectedIssueDate
                      ? format(selectedIssueDate, "PPP", { locale: zhCN })
                      : "选择开票日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" data-oid="xvoah7f">
                  <Calendar
                    mode="single"
                    selected={selectedIssueDate}
                    onSelect={(date) => date && setValue("issueDate", date)}
                    initialFocus
                    locale={zhCN}
                    data-oid="xxc2qt0"
                  />
                </PopoverContent>
              </Popover>
              {errors.issueDate && (
                <p className="text-sm text-red-600" data-oid="b17zizj">
                  {errors.issueDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="1ey9o6j">
              <Label htmlFor="dueDate" data-oid="quefe7f">
                到期日期 *
              </Label>
              <Popover data-oid="-4f7_59">
                <PopoverTrigger asChild data-oid="hqyjwg1">
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDueDate && "text-muted-foreground",
                    )}
                    data-oid="ph28md7"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" data-oid="c3y.mnd" />
                    {selectedDueDate
                      ? format(selectedDueDate, "PPP", { locale: zhCN })
                      : "选择到期日期"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" data-oid="s:m-28m">
                  <Calendar
                    mode="single"
                    selected={selectedDueDate}
                    onSelect={(date) => date && setValue("dueDate", date)}
                    initialFocus
                    locale={zhCN}
                    data-oid="8vhe8bk"
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-600" data-oid="6l33n75">
                  {errors.dueDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2" data-oid="6v:hi7c">
            <Label htmlFor="description" data-oid="8gli624">
              描述
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请输入发票描述"
              rows={3}
              data-oid="3wc1qux"
            />
          </div>

          <div className="space-y-2" data-oid="lcxh-bj">
            <Label htmlFor="notes" data-oid="ft-6xt_">
              备注
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="请输入备注信息"
              rows={2}
              data-oid="kwmihch"
            />
          </div>

          <DialogFooter data-oid="fdnav__">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="q2.go3d"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="7v_x6w8">
              {loading ? "创建中..." : "创建发票"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

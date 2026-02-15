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
type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  address?: string | null;
  industry?: string | null;
  status: string;
  website?: string;
  contactPerson?: string;
  position?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 表单验证模式
const clientSchema = z.object({
  name: z.string().min(1, "客户名称不能为空"),
  email: z.string().email("请输入有效的邮箱地址").optional().or(z.literal("")),
  phone: z.string().min(1, "联系电话不能为空"),
  website: z.string().url("请输入有效的网站地址").optional().or(z.literal("")),
  industry: z.string().min(1, "请选择行业"),
  status: z.enum(["ACTIVE", "INACTIVE", "PROSPECT", "CHURNED"]),
  contactPerson: z.string().optional(),
  position: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface EditClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: () => void;
}

export function EditClientModal({
  open,
  onOpenChange,
  client,
  onSuccess,
}: EditClientModalProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const selectedStatus = watch("status");

  useEffect(() => {
    if (client && open) {
      reset({
        name: client.name || "",
        email: client.email || "",
        phone: client.phone || "",
        website: client.website || "",
        industry: client.industry || "",
        status: client.status as "ACTIVE" | "INACTIVE" | "PROSPECT" | "CHURNED",
        contactPerson: client.contactPerson || "",
        position: client.position || "",
        address: client.address || "",
        description: client.description || "",
      });
    }
  }, [client, open, reset]);

  const onSubmit = async (data: ClientFormData) => {
    if (!client) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`更新客户失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("更新客户失败:", error);
      alert("更新客户失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const industries = [
    "科技",
    "金融",
    "医疗",
    "教育",
    "零售",
    "制造",
    "房地产",
    "咨询",
    "媒体",
    "娱乐",
    "餐饮",
    "旅游",
    "物流",
    "建筑",
    "能源",
    "农业",
    "其他",
  ];

  const statusOptions = [
    { value: "PROSPECT", label: "潜在客户", color: "text-yellow-600" },
    { value: "ACTIVE", label: "活跃", color: "text-green-600" },
    { value: "INACTIVE", label: "未活跃", color: "text-gray-600" },
    { value: "CHURNED", label: "已流失", color: "text-red-600" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="bl-9440">
      <DialogContent className="sm:max-w-[600px]" data-oid="7gspaiq">
        <DialogHeader data-oid="le2pp7r">
          <DialogTitle data-oid="ci6d:.u">编辑客户</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="v-4-0fc"
        >
          {/* 基本信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="s-.156v"
          >
            <div className="space-y-2" data-oid="5:c60yy">
              <Label htmlFor="name" data-oid="nwebup2">
                客户名称 *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="请输入客户名称"
                className={errors.name ? "border-red-500" : ""}
                data-oid="r6gbq5k"
              />

              {errors.name && (
                <p className="text-sm text-red-600" data-oid="j29s40i">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="d:i4yym">
              <Label htmlFor="industry" data-oid="pfqe:ff">
                行业 *
              </Label>
              <Select
                value={watch("industry")}
                onValueChange={(value) => setValue("industry", value)}
                data-oid="zksgdej"
              >
                <SelectTrigger data-oid="wb4tgaa">
                  <SelectValue placeholder="请选择行业" data-oid="kssq718" />
                </SelectTrigger>
                <SelectContent data-oid="yvy6:hj">
                  {industries.map((industry) => (
                    <SelectItem
                      key={industry}
                      value={industry}
                      data-oid="rjkd3.g"
                    >
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-600" data-oid="7a2:f8n">
                  {errors.industry.message}
                </p>
              )}
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="r:3g6dn"
          >
            <div className="space-y-2" data-oid=".wex8d:">
              <Label htmlFor="status" data-oid="vp6z4yw">
                状态
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: ClientStatus) =>
                  setValue("status", value)
                }
                data-oid="ryamdzy"
              >
                <SelectTrigger data-oid="2o0q4nz">
                  <SelectValue data-oid="oi.03jy" />
                </SelectTrigger>
                <SelectContent data-oid="dbyuq5s">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-oid="1se7n.6"
                    >
                      <span className={option.color} data-oid="maswod4">
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid="i15ygab">
              <Label htmlFor="website" data-oid=":j8l1rk">
                网站
              </Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://example.com"
                className={errors.website ? "border-red-500" : ""}
                data-oid="o3-v0x."
              />

              {errors.website && (
                <p className="text-sm text-red-600" data-oid="_:7au.g">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>

          {/* 联系信息 */}
          <div className="space-y-2" data-oid="8jhj7m_">
            <Label htmlFor="contactPerson" data-oid="7c2kyn9">
              联系人
            </Label>
            <Input
              id="contactPerson"
              {...register("contactPerson")}
              placeholder="请输入联系人姓名"
              data-oid="2963fmk"
            />
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="n288sg."
          >
            <div className="space-y-2" data-oid="j8zlqrr">
              <Label htmlFor="position" data-oid="08r:t0h">
                职位
              </Label>
              <Input
                id="position"
                {...register("position")}
                placeholder="请输入联系人职位"
                data-oid="p36w0yz"
              />
            </div>

            <div className="space-y-2" data-oid="9_e7urx">
              <Label htmlFor="phone" data-oid="4uddfzi">
                联系电话 *
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="请输入联系电话"
                className={errors.phone ? "border-red-500" : ""}
                data-oid="k0tnd-."
              />

              {errors.phone && (
                <p className="text-sm text-red-600" data-oid="ni7xq8.">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2" data-oid="o7nl9n7">
            <Label htmlFor="email" data-oid="zk:4ydx">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="请输入邮箱地址"
              className={errors.email ? "border-red-500" : ""}
              data-oid=".0ear89"
            />

            {errors.email && (
              <p className="text-sm text-red-600" data-oid="-dl36b.">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid="xkp5.pr">
            <Label htmlFor="address" data-oid="w6o08:i">
              地址
            </Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="请输入客户地址"
              rows={2}
              data-oid=".g7cl0t"
            />
          </div>

          <div className="space-y-2" data-oid=":dmlcm8">
            <Label htmlFor="description" data-oid="_0sc1b:">
              备注
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请输入客户备注信息"
              rows={3}
              data-oid="8c1k5m4"
            />
          </div>

          <DialogFooter data-oid="adusn6_">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="2p_0cmz"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="zqc6wo.">
              {loading ? "更新中..." : "更新客户"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

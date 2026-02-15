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

// 表单验证模式
const clientSchema = z.object({
  name: z.string().min(1, "客户名称不能为空"),
  email: z
    .string()
    .email("请输入有效的邮箱地址")
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || val === "" || val.includes("@"), "请输入有效的邮箱地址"),
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

interface CreateClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateClientModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateClientModalProps) {
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
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      status: "PROSPECT",
      contactPerson: "",
      position: "",
      address: "",
      description: "",
    },
  });

  const selectedStatus = watch("status");

  useEffect(() => {
    if (open) {
      reset();
    }
  }, [open, reset]);

  const onSubmit = async (data: ClientFormData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/clients", {
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
        alert(`创建客户失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("创建客户失败:", error);
      alert("创建客户失败，请重试");
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
    <Dialog open={open} onOpenChange={onOpenChange} data-oid="y:8l6ks">
      <DialogContent className="sm:max-w-[600px]" data-oid="ohvg4ri">
        <DialogHeader data-oid="2jpwj.c">
          <DialogTitle data-oid="vfzll3_">新增客户</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          data-oid="02jad-o"
        >
          {/* 基本信息 */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="76l7btq"
          >
            <div className="space-y-2" data-oid="c_9_0do">
              <Label htmlFor="name" data-oid="-04rado">
                客户名称 *
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="请输入客户名称"
                className={errors.name ? "border-red-500" : ""}
                data-oid="29inlq4"
              />

              {errors.name && (
                <p className="text-sm text-red-600" data-oid="xy93u-f">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2" data-oid="epitkq0">
              <Label htmlFor="industry" data-oid="f0g_ba3">
                行业 *
              </Label>
              <Select
                value={watch("industry")}
                onValueChange={(value) => setValue("industry", value)}
                data-oid="e:u9ft-"
              >
                <SelectTrigger data-oid=":ht07hh">
                  <SelectValue placeholder="请选择行业" data-oid="5d5_3pf" />
                </SelectTrigger>
                <SelectContent data-oid="s.0zu3x">
                  {industries.map((industry) => (
                    <SelectItem
                      key={industry}
                      value={industry}
                      data-oid="sq54-gt"
                    >
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.industry && (
                <p className="text-sm text-red-600" data-oid="diij7ki">
                  {errors.industry.message}
                </p>
              )}
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="vjr811g"
          >
            <div className="space-y-2" data-oid="05ulv21">
              <Label htmlFor="status" data-oid=":vxzge-">
                状态
              </Label>
              <Select
                value={selectedStatus}
                onValueChange={(value: ClientStatus) =>
                  setValue("status", value)
                }
                data-oid="_p21lc_"
              >
                <SelectTrigger data-oid="keg3w.y">
                  <SelectValue data-oid="vknbozl" />
                </SelectTrigger>
                <SelectContent data-oid="b.2w-2c">
                  {statusOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-oid="4-4o4:d"
                    >
                      <span className={option.color} data-oid="34tq2gc">
                        {option.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" data-oid=":if_3n3">
              <Label htmlFor="website" data-oid="eegaxf3">
                网站
              </Label>
              <Input
                id="website"
                {...register("website")}
                placeholder="https://example.com"
                className={errors.website ? "border-red-500" : ""}
                data-oid="d89q:qq"
              />

              {errors.website && (
                <p className="text-sm text-red-600" data-oid="hbbfwry">
                  {errors.website.message}
                </p>
              )}
            </div>
          </div>

          {/* 联系信息 */}
          <div className="space-y-2" data-oid="tsp5::3">
            <Label htmlFor="contactPerson" data-oid="mo6s3os">
              联系人
            </Label>
            <Input
              id="contactPerson"
              {...register("contactPerson")}
              placeholder="请输入联系人姓名"
              data-oid="zc5ntzu"
            />
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            data-oid="vis8vhu"
          >
            <div className="space-y-2" data-oid="xr8u5.7">
              <Label htmlFor="position" data-oid="60sqrzg">
                职位
              </Label>
              <Input
                id="position"
                {...register("position")}
                placeholder="请输入联系人职位"
                data-oid="t2ydh:c"
              />
            </div>

            <div className="space-y-2" data-oid="l07du1_">
              <Label htmlFor="phone" data-oid="kclr3fv">
                联系电话 *
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="请输入联系电话"
                className={errors.phone ? "border-red-500" : ""}
                data-oid="f3awyfl"
              />

              {errors.phone && (
                <p className="text-sm text-red-600" data-oid="c.755sx">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2" data-oid="fjz_ovy">
            <Label htmlFor="email" data-oid="32_:w2g">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="请输入邮箱地址"
              className={errors.email ? "border-red-500" : ""}
              data-oid="hmdril:"
            />

            {errors.email && (
              <p className="text-sm text-red-600" data-oid="jn_q78i">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2" data-oid=":mfpvte">
            <Label htmlFor="address" data-oid="2j96i:.">
              地址
            </Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="请输入客户地址"
              rows={2}
              data-oid="zj_z3wh"
            />
          </div>

          <div className="space-y-2" data-oid=":n9eidy">
            <Label htmlFor="description" data-oid=".3b44j5">
              备注
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="请输入客户备注信息"
              rows={3}
              data-oid="l5h2zz3"
            />
          </div>

          <DialogFooter data-oid="zxvujr5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              data-oid="3ocfkdw"
            >
              取消
            </Button>
            <Button type="submit" disabled={loading} data-oid="5f82okh">
              {loading ? "创建中..." : "创建客户"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

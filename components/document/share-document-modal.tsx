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
import { Badge as BadgeComponent } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Share2,
  Link,
  Mail,
  Calendar,
  Users,
  Copy,
  Trash2,
  User,
} from "lucide-react";
import { Document } from "@prisma/client";

// 表单验证模式
const shareSchema = z.object({
  shareType: z.enum(["EMAIL", "LINK", "USER"]),
  recipientEmail: z
    .string()
    .email("请输入有效的邮箱地址")
    .optional()
    .or(z.literal("")),
  userId: z.string().optional(),
  permission: z.enum(["VIEW", "EDIT", "ADMIN"]),
  expiresAt: z.string().optional(),
  message: z.string().optional(),
});

type ShareFormData = z.infer<typeof shareSchema>;

interface ShareDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface ShareLink {
  id: string;
  token: string;
  permission: string;
  expiresAt?: Date;
  createdAt: Date;
  createdBy: {
    name: string;
  };
}

export function ShareDocumentModal({
  open,
  onOpenChange,
  document,
}: ShareDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"email" | "link" | "user">(
    "email",
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ShareFormData>({
    resolver: zodResolver(shareSchema),
    defaultValues: {
      shareType: "EMAIL",
      permission: "VIEW",
    },
  });

  const selectedShareType = watch("shareType");
  const selectedPermission = watch("permission");

  useEffect(() => {
    if (open && document) {
      reset();
      setActiveTab("email");
      fetchUsers();
      fetchShareLinks();
    }
  }, [open, document, reset]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  };

  const fetchShareLinks = async () => {
    if (!document) return;

    try {
      const response = await fetch(`/api/documents/${document.id}/shares`);
      if (response.ok) {
        const data = await response.json();
        setShareLinks(data);
      }
    } catch (error) {
      console.error("获取分享链接失败:", error);
    }
  };

  const onSubmit = async (data: ShareFormData) => {
    if (!document) return;

    setLoading(true);
    try {
      let endpoint = `/api/documents/${document.id}/share`;

      if (data.shareType === "LINK") {
        endpoint = `/api/documents/${document.id}/share/link`;
      } else if (data.shareType === "USER") {
        endpoint = `/api/documents/${document.id}/share/user`;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();

        if (data.shareType === "LINK" && result.shareUrl) {
          setGeneratedLink(result.shareUrl);
          setActiveTab("link");
        } else {
          alert("分享成功！");
        }

        fetchShareLinks();
        reset();
      } else {
        const error = await response.json();
        alert(`分享失败: ${error.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("分享失败:", error);
      alert("分享失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("链接已复制到剪贴板");
  };

  const revokeShare = async (shareId: string) => {
    if (!document) return;

    try {
      const response = await fetch(
        `/api/documents/${document.id}/shares/${shareId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        fetchShareLinks();
      }
    } catch (error) {
      console.error("撤销分享失败:", error);
    }
  };

  const getPermissionBadge = (permission: string) => {
    const permissionConfig: Record<
      string,
      { label: string; className: string }
    > = {
      VIEW: { label: "查看", className: "bg-green-100 text-green-800" },
      EDIT: { label: "编辑", className: "bg-yellow-100 text-yellow-800" },
      ADMIN: { label: "管理", className: "bg-red-100 text-red-800" },
    };

    const config = permissionConfig[permission];
    return (
      <BadgeComponent className={config.className} data-oid="bcsd.af">
        {config.label}
      </BadgeComponent>
    );
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} data-oid=":hknz6i">
      <DialogContent
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        data-oid="cfss96t"
      >
        <DialogHeader data-oid="i.l2jx.">
          <DialogTitle className="flex items-center gap-2" data-oid="78v5va7">
            <Share2 className="w-5 h-5" data-oid="jly-ywe" />
            分享文档: {document.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6" data-oid="73qczz0">
          {/* 分享表单 */}
          <Card data-oid="r_j.-99">
            <CardHeader data-oid="l9rza_r">
              <CardTitle className="text-lg" data-oid="e_zzbsx">
                创建分享
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="s037bs_">
              {/* 标签页选择 */}
              <div className="flex gap-2 mb-4 border-b" data-oid="np0cdx2">
                <Button
                  variant={activeTab === "email" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("email");
                    setValue("shareType", "EMAIL");
                  }}
                  className="rounded-b-none"
                  data-oid="1dsu3h1"
                >
                  <Mail className="w-4 h-4 mr-2" data-oid="b16r7qk" />
                  邮件分享
                </Button>
                <Button
                  variant={activeTab === "link" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("link");
                    setValue("shareType", "LINK");
                  }}
                  className="rounded-b-none"
                  data-oid="hyq1ai9"
                >
                  <Link className="w-4 h-4 mr-2" data-oid="zqp0a6d" />
                  链接分享
                </Button>
                <Button
                  variant={activeTab === "user" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setActiveTab("user");
                    setValue("shareType", "USER");
                  }}
                  className="rounded-b-none"
                  data-oid="u1q7mia"
                >
                  <User className="w-4 h-4 mr-2" data-oid="jrs6514" />
                  用户分享
                </Button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                data-oid="dmtfwg-"
              >
                {/* 邮件分享 */}
                {activeTab === "email" && (
                  <div className="space-y-4" data-oid="4e1b0da">
                    <div className="space-y-2" data-oid="tyx71fo">
                      <Label htmlFor="recipientEmail" data-oid="sndqnl8">
                        收件人邮箱 *
                      </Label>
                      <Input
                        id="recipientEmail"
                        type="email"
                        {...register("recipientEmail")}
                        placeholder="请输入收件人邮箱"
                        className={
                          errors.recipientEmail ? "border-red-500" : ""
                        }
                        data-oid="tpv8-9m"
                      />

                      {errors.recipientEmail && (
                        <p className="text-sm text-red-600" data-oid="0njp49w">
                          {errors.recipientEmail.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 链接分享 */}
                {activeTab === "link" && (
                  <div className="space-y-4" data-oid="4tgf7k3">
                    <div className="space-y-2" data-oid="ftu8858">
                      <Label htmlFor="expiresAt" data-oid="0h4o5n4">
                        有效期（可选）
                      </Label>
                      <select
                        {...register("expiresAt")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                        data-oid="c2d80zc"
                      >
                        <option value="" data-oid="quotprd">
                          永不过期
                        </option>
                        <option value="1" data-oid="t_6wcqy">
                          1天
                        </option>
                        <option value="7" data-oid="1d5ebc-">
                          7天
                        </option>
                        <option value="30" data-oid="m3f6w5s">
                          30天
                        </option>
                        <option value="90" data-oid=":8hpksn">
                          90天
                        </option>
                      </select>
                    </div>
                  </div>
                )}

                {/* 用户分享 */}
                {activeTab === "user" && (
                  <div className="space-y-4" data-oid="oww.-bp">
                    <div className="space-y-2" data-oid="9x17-la">
                      <Label htmlFor="userId" data-oid="18-xt-i">
                        选择用户 *
                      </Label>
                      <Select
                        value={watch("userId")}
                        onValueChange={(value) => setValue("userId", value)}
                        data-oid="-ymqo6t"
                      >
                        <SelectTrigger data-oid="3k2rg.y">
                          <SelectValue
                            placeholder="请选择用户"
                            data-oid=".ddwv2t"
                          />
                        </SelectTrigger>
                        <SelectContent data-oid="2sipvsc">
                          {users.map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id}
                              data-oid="rew5jtu"
                            >
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.userId && (
                        <p className="text-sm text-red-600" data-oid="v4evhgi">
                          请选择用户
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 权限设置 */}
                <div className="space-y-2" data-oid="u0rxh6h">
                  <Label htmlFor="permission" data-oid="r2w_jk.">
                    访问权限 *
                  </Label>
                  <Select
                    value={selectedPermission}
                    onValueChange={(value) =>
                      setValue("permission", value as any)
                    }
                    data-oid="qt4k:i-"
                  >
                    <SelectTrigger data-oid="he_3k:1">
                      <SelectValue data-oid="y65-46:" />
                    </SelectTrigger>
                    <SelectContent data-oid="wygnh_c">
                      <SelectItem value="VIEW" data-oid="v5k6b-:">
                        查看
                      </SelectItem>
                      <SelectItem value="EDIT" data-oid="zyngso8">
                        编辑
                      </SelectItem>
                      <SelectItem value="ADMIN" data-oid="xzaingk">
                        管理
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 留言 */}
                <div className="space-y-2" data-oid=":yxe0fb">
                  <Label htmlFor="message" data-oid="c65o5.m">
                    附言（可选）
                  </Label>
                  <Textarea
                    id="message"
                    {...register("message")}
                    placeholder="请输入附言信息"
                    rows={3}
                    data-oid="fo_d5t-"
                  />
                </div>

                <Button type="submit" disabled={loading} data-oid="k2.45ue">
                  {loading ? "分享中..." : "创建分享"}
                </Button>
              </form>

              {/* 生成的链接 */}
              {generatedLink && (
                <div
                  className="mt-4 p-4 bg-green-50 rounded-lg"
                  data-oid="rw6.r61"
                >
                  <p
                    className="text-sm font-medium text-green-800 mb-2"
                    data-oid="ej57o5_"
                  >
                    分享链接已生成:
                  </p>
                  <div className="flex items-center gap-2" data-oid="4eic4hx">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="bg-white"
                      data-oid="qg0.hk2"
                    />

                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedLink)}
                      data-oid="8ga6eoz"
                    >
                      <Copy className="w-4 h-4" data-oid="xte._kh" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 现有分享链接 */}
          <Card data-oid="0jm_gz.">
            <CardHeader data-oid="q61vm47">
              <CardTitle
                className="text-lg flex items-center gap-2"
                data-oid="zny-lo:"
              >
                <Link className="w-5 h-5" data-oid="wflvj4d" />
                现有分享
              </CardTitle>
            </CardHeader>
            <CardContent data-oid="lsw5jnm">
              {shareLinks.length === 0 ? (
                <p
                  className="text-sm text-gray-500 text-center py-4"
                  data-oid="x8uuiqz"
                >
                  暂无分享链接
                </p>
              ) : (
                <div className="space-y-3" data-oid="9rmf6__">
                  {shareLinks.map((share) => (
                    <div
                      key={share.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                      data-oid="u-v3g78"
                    >
                      <div className="flex-1" data-oid="4b-xit3">
                        <div
                          className="flex items-center gap-2 mb-1"
                          data-oid="_x-m7mv"
                        >
                          {getPermissionBadge(share.permission)}
                          <span
                            className="text-sm text-gray-500"
                            data-oid="r8dl8:-"
                          >
                            由 {share.createdBy.name} 创建
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-2 text-sm"
                          data-oid="8z3z:.."
                        >
                          <Calendar className="w-3 h-3" data-oid="17m5q85" />
                          <span data-oid="-b0hld1">
                            创建于{" "}
                            {new Date(share.createdAt).toLocaleDateString(
                              "zh-CN",
                            )}
                          </span>
                          {share.expiresAt && (
                            <span
                              className="text-orange-600"
                              data-oid="j0isfxe"
                            >
                              • 过期于{" "}
                              {new Date(share.expiresAt).toLocaleDateString(
                                "zh-CN",
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2"
                        data-oid="okmeuv9"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            copyToClipboard(
                              `${window.location.origin}/shared/${share.token}`,
                            )
                          }
                          data-oid="y4zj03h"
                        >
                          <Copy className="w-4 h-4" data-oid="x03:zhz" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => revokeShare(share.id)}
                          data-oid=".70ade:"
                        >
                          <Trash2 className="w-4 h-4" data-oid="lpei196" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
  FileImage,
  User,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";

interface KYCRecord {
  id: string;
  status: string;
  idType: string;
  idNumber: string;
  realName: string;
  rejectionReason?: string;
  expiresAt?: string;
  createdAt: string;
}

const ID_TYPES = [
  { value: "ID_CARD", label: "身份证" },
  { value: "PASSPORT", label: "护照" },
  { value: "DRIVER_LICENSE", label: "驾驶证" },
  { value: "OTHER", label: "其他" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "待审核", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="w-4 h-4" /> },
  REVIEWING: { label: "审核中", color: "bg-blue-100 text-blue-800", icon: <Clock className="w-4 h-4" /> },
  APPROVED: { label: "已通过", color: "bg-green-100 text-green-800", icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED: { label: "已拒绝", color: "bg-red-100 text-red-800", icon: <XCircle className="w-4 h-4" /> },
  EXPIRED: { label: "已过期", color: "bg-gray-100 text-gray-800", icon: <AlertTriangle className="w-4 h-4" /> },
};

export default function KYCPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [kycRecord, setKycRecord] = useState<KYCRecord | null>(null);
  
  // 表单状态
  const [idType, setIdType] = useState("ID_CARD");
  const [idNumber, setIdNumber] = useState("");
  const [realName, setRealName] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  // 获取 KYC 状态
  useEffect(() => {
    if (sessionStatus === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }

    fetchKYCStatus();
  }, [session, sessionStatus, router]);

  const fetchKYCStatus = async () => {
    try {
      const response = await fetch("/api/kyc");
      const data = await response.json();
      
      if (data.success && data.data) {
        setKycRecord(data.data);
      }
    } catch (error) {
      console.error("获取 KYC 状态失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 处理文件上传
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith("image/")) {
        toast.error("请上传图片文件");
        return;
      }
      // 验证文件大小（最大 5MB）
      if (file.size > 5 * 1024 * 1024) {
        toast.error("图片大小不能超过 5MB");
        return;
      }
      setter(file);
    }
  };

  // 上传图片到服务器
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "kyc");

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("图片上传失败");
    }

    const data = await response.json();
    return data.url || data.path;
  };

  // 提交 KYC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idNumber || !realName || !frontImage) {
      toast.error("请填写完整信息并上传证件照片");
      return;
    }

    setSubmitting(true);

    try {
      // 上传图片
      const frontImageUrl = await uploadImage(frontImage);
      const backImageUrl = backImage ? await uploadImage(backImage) : undefined;
      const selfieImageUrl = selfieImage ? await uploadImage(selfieImage) : undefined;

      // 提交 KYC
      const response = await fetch("/api/kyc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idType,
          idNumber,
          realName,
          frontImage: frontImageUrl,
          backImage: backImageUrl,
          selfieImage: selfieImageUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("KYC 认证已提交");
        setKycRecord(data.data);
      } else {
        toast.error(data.error || "提交失败");
      }
    } catch (error) {
      toast.error("提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 已有 KYC 记录
  if (kycRecord) {
    const statusConfig = STATUS_CONFIG[kycRecord.status] || STATUS_CONFIG.PENDING;

    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              KYC 认证状态
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 状态显示 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {statusConfig.icon}
                <div>
                  <p className="font-medium">认证状态</p>
                  <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>提交时间</p>
                <p>{new Date(kycRecord.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* 拒绝原因 */}
            {kycRecord.status === "REJECTED" && kycRecord.rejectionReason && (
              <Alert variant="destructive">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription>
                  拒绝原因：{kycRecord.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            {/* 过期提醒 */}
            {kycRecord.status === "APPROVED" && kycRecord.expiresAt && (
              <Alert>
                <Clock className="w-4 h-4" />
                <AlertDescription>
                  认证有效期至：{new Date(kycRecord.expiresAt).toLocaleDateString()}
                </AlertDescription>
              </Alert>
            )}

            {/* 认证信息 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-500">证件类型</Label>
                  <p className="font-medium">
                    {ID_TYPES.find(t => t.value === kycRecord.idType)?.label}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">证件号码</Label>
                  <p className="font-medium">{kycRecord.idNumber}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-500">真实姓名</Label>
                <p className="font-medium">{kycRecord.realName}</p>
              </div>
            </div>

            {/* 重新提交按钮 */}
            {(kycRecord.status === "REJECTED" || kycRecord.status === "EXPIRED") && (
              <Button
                onClick={() => setKycRecord(null)}
                className="w-full"
              >
                重新提交认证
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // KYC 提交表单
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            KYC 身份认证
          </CardTitle>
          <CardDescription>
            请填写您的真实信息并上传证件照片，我们将在 1-3 个工作日内完成审核
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 证件类型 */}
            <div className="space-y-2">
              <Label htmlFor="idType">证件类型</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择证件类型" />
                </SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 真实姓名 */}
            <div className="space-y-2">
              <Label htmlFor="realName">真实姓名</Label>
              <Input
                id="realName"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="请输入证件上的姓名"
                required
              />
            </div>

            {/* 证件号码 */}
            <div className="space-y-2">
              <Label htmlFor="idNumber">证件号码</Label>
              <Input
                id="idNumber"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="请输入证件号码"
                required
              />
            </div>

            {/* 证件正面照片 */}
            <div className="space-y-2">
              <Label>证件正面照片 *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {frontImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileImage className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{frontImage.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFrontImage(null)}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">点击上传证件正面照片</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setFrontImage)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 证件背面照片 */}
            <div className="space-y-2">
              <Label>证件背面照片（可选）</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {backImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileImage className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{backImage.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setBackImage(null)}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">点击上传证件背面照片</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setBackImage)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 手持证件自拍 */}
            <div className="space-y-2">
              <Label>手持证件自拍（可选）</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                {selfieImage ? (
                  <div className="flex items-center justify-center gap-2">
                    <FileImage className="w-5 h-5 text-green-500" />
                    <span className="text-sm">{selfieImage.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelfieImage(null)}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">点击上传手持证件自拍</p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, setSelfieImage)}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* 提交按钮 */}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  提交中...
                </>
              ) : (
                "提交认证"
              )}
            </Button>

            {/* 提示信息 */}
            <p className="text-xs text-gray-500 text-center">
              您的个人信息将被加密存储，仅用于身份验证目的
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

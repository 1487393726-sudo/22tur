"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, User, Mail, Phone, Lock } from "lucide-react";

export function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validations, setValidations] = useState({
    email: { valid: false, message: "" },
    phone: { valid: false, message: "" },
    password: { valid: false, message: "" },
    confirmPassword: { valid: false, message: "" },
  });
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return { valid: false, message: "" };
    if (!emailRegex.test(email)) return { valid: false, message: "邮箱格式不正确" };
    return { valid: true, message: "邮箱格式正确" };
  };

  const validatePhone = (phone: string) => {
    if (!phone) return { valid: true, message: "" };
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) return { valid: false, message: "手机号格式不正确" };
    return { valid: true, message: "手机号格式正确" };
  };

  const validatePassword = (password: string) => {
    if (!password) return { valid: false, message: "" };
    if (password.length < 6) return { valid: false, message: "密码至少6个字符" };
    if (password.length > 50) return { valid: false, message: "密码最多50个字符" };
    return { valid: true, message: "密码强度合格" };
  };

  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) return { valid: false, message: "" };
    if (confirmPassword !== password) return { valid: false, message: "两次密码不一致" };
    return { valid: true, message: "密码确认正确" };
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    let validation = { valid: false, message: "" };
    switch (field) {
      case "email":
        validation = validateEmail(value);
        setValidations((prev) => ({ ...prev, email: validation }));
        break;
      case "phone":
        validation = validatePhone(value);
        setValidations((prev) => ({ ...prev, phone: validation }));
        break;
      case "password":
        validation = validatePassword(value);
        setValidations((prev) => ({ ...prev, password: validation }));
        if (formData.confirmPassword) {
          const confirmValidation = validateConfirmPassword(formData.confirmPassword, value);
          setValidations((prev) => ({ ...prev, confirmPassword: confirmValidation }));
        }
        break;
      case "confirmPassword":
        validation = validateConfirmPassword(value, formData.password);
        setValidations((prev) => ({ ...prev, confirmPassword: validation }));
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const emailValidation = validateEmail(formData.email);
    const phoneValidation = validatePhone(formData.phone);
    const passwordValidation = validatePassword(formData.password);
    const confirmPasswordValidation = validateConfirmPassword(formData.confirmPassword, formData.password);

    if (!emailValidation.valid || !phoneValidation.valid || !passwordValidation.valid || !confirmPasswordValidation.valid) {
      setError("请检查表单中的错误");
      setLoading(false);
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.username) {
      setError("请填写所有必填字段");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "注册失败");

      setSuccess(true);
      setTimeout(() => router.push("/admin-login"), 3000);
    } catch (error: any) {
      setError(error.message || "注册失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const getValidationIcon = (validation: { valid: boolean; message: string }) => {
    if (!validation.message) return null;
    return validation.valid ? (
      <CheckCircle2 className="h-4 w-4 text-[#00f0ff]" />
    ) : (
      <XCircle className="h-4 w-4 text-[#ff2a6d]" />
    );
  };

  if (success) {
    return (
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(0,240,255,0.15)]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#00f0ff] to-[#00c896] flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-[#00f0ff]">注册成功！</CardTitle>
          <CardDescription className="text-[#9ca3af]">您的账号已创建，3秒后自动跳转到登录页面...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(176,38,255,0.15)]">
      <CardHeader className="text-center">
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#b026ff] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#ff2a6d] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-[#b026ff] via-[#00f0ff] to-[#ff2a6d] bg-clip-text text-transparent">
          创建新账号
        </CardTitle>
        <CardDescription className="text-[#9ca3af]">填写以下信息完成注册</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-white">姓 <span className="text-[#ff2a6d]">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#b026ff]" />
                <Input id="firstName" type="text" placeholder="张" value={formData.firstName} onChange={(e) => handleChange("firstName", e.target.value)} required disabled={loading} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#b026ff]/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-white">名 <span className="text-[#ff2a6d]">*</span></Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-[#00f0ff]" />
                <Input id="lastName" type="text" placeholder="三" value={formData.lastName} onChange={(e) => handleChange("lastName", e.target.value)} required disabled={loading} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#00f0ff]/50" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">用户名 <span className="text-[#ff2a6d]">*</span></Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-[#ccff00]" />
              <Input id="username" type="text" placeholder="zhangsan" value={formData.username} onChange={(e) => handleChange("username", e.target.value)} required disabled={loading} className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#ccff00]/50" />
            </div>
            <p className="text-xs text-[#6b7280]">用于系统内部识别，不可重复</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">邮箱 <span className="text-[#ff2a6d]">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-[#b026ff]" />
              <Input id="email" type="email" placeholder="zhangsan@example.com" value={formData.email} onChange={(e) => handleChange("email", e.target.value)} required disabled={loading} className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#b026ff]/50" />
              {validations.email.message && <div className="absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon(validations.email)}</div>}
            </div>
            {validations.email.message && <p className={`text-xs ${validations.email.valid ? "text-[#00f0ff]" : "text-[#ff2a6d]"}`}>{validations.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">手机号 <span className="text-[#6b7280]">(可选)</span></Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-[#00f0ff]" />
              <Input id="phone" type="tel" placeholder="13800138000" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} disabled={loading} className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#00f0ff]/50" />
              {validations.phone.message && <div className="absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon(validations.phone)}</div>}
            </div>
            {validations.phone.message && <p className={`text-xs ${validations.phone.valid ? "text-[#00f0ff]" : "text-[#ff2a6d]"}`}>{validations.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">密码 <span className="text-[#ff2a6d]">*</span></Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#ff2a6d]" />
              <Input id="password" type="password" placeholder="至少6个字符" value={formData.password} onChange={(e) => handleChange("password", e.target.value)} required disabled={loading} className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#ff2a6d]/50" />
              {validations.password.message && <div className="absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon(validations.password)}</div>}
            </div>
            {validations.password.message && <p className={`text-xs ${validations.password.valid ? "text-[#00f0ff]" : "text-[#ff2a6d]"}`}>{validations.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white">确认密码 <span className="text-[#ff2a6d]">*</span></Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#ccff00]" />
              <Input id="confirmPassword" type="password" placeholder="再次输入密码" value={formData.confirmPassword} onChange={(e) => handleChange("confirmPassword", e.target.value)} required disabled={loading} className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#ccff00]/50" />
              {validations.confirmPassword.message && <div className="absolute right-3 top-1/2 -translate-y-1/2">{getValidationIcon(validations.confirmPassword)}</div>}
            </div>
            {validations.confirmPassword.message && <p className={`text-xs ${validations.confirmPassword.valid ? "text-[#00f0ff]" : "text-[#ff2a6d]"}`}>{validations.confirmPassword.message}</p>}
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-gradient-to-r from-[#b026ff] to-[#7c3aed] hover:shadow-[0_0_20px_rgba(176,38,255,0.5)] text-white border-0" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "注册中..." : "注册"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-[#9ca3af]">已有账号？</span>{" "}
            <a href="/admin-login" className="text-[#00f0ff] hover:text-[#00f0ff]/80 transition-colors">立即登录</a>
          </div>
        </form>

        <div className="mt-6 p-4 bg-[#b026ff]/10 border border-[#b026ff]/20 rounded-lg">
          <p className="text-sm font-medium mb-2 text-[#b026ff]">注册说明：</p>
          <ul className="text-xs text-[#9ca3af] space-y-1">
            <li>• 系统将自动为您生成唯一的用户ID</li>
            <li>• 手机号可选，但建议填写以便找回密码</li>
            <li>• 注册成功后可使用邮箱、手机号或用户ID登录</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

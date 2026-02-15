"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

/**
 * 重置密码表单组件
 */
export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validations, setValidations] = useState({
    password: { valid: false, message: "" },
    confirmPassword: { valid: false, message: "" },
  });

  // 验证密码强度
  const validatePassword = (password: string) => {
    if (!password) {
      return { valid: false, message: "" };
    }
    if (password.length < 6) {
      return { valid: false, message: "密码至少6个字符" };
    }
    if (password.length > 50) {
      return { valid: false, message: "密码最多50个字符" };
    }
    return { valid: true, message: "密码强度合格" };
  };

  // 验证确认密码
  const validateConfirmPassword = (confirmPassword: string, password: string) => {
    if (!confirmPassword) {
      return { valid: false, message: "" };
    }
    if (confirmPassword !== password) {
      return { valid: false, message: "两次密码不一致" };
    }
    return { valid: true, message: "密码确认正确" };
  };

  // 处理密码输入
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    const validation = validatePassword(value);
    setValidations((prev) => ({ ...prev, password: validation }));

    // 同时验证确认密码
    if (confirmPassword) {
      const confirmValidation = validateConfirmPassword(confirmPassword, value);
      setValidations((prev) => ({
        ...prev,
        confirmPassword: confirmValidation,
      }));
    }
  };

  // 处理确认密码输入
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    const validation = validateConfirmPassword(value, password);
    setValidations((prev) => ({ ...prev, confirmPassword: validation }));
  };

  // 获取验证图标
  const getValidationIcon = (validation: { valid: boolean; message: string }) => {
    if (!validation.message) return null;
    return validation.valid ? (
      <CheckCircle2 className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!token) {
      setError("重置令牌无效");
      setLoading(false);
      return;
    }

    // 最终验证
    const passwordValidation = validatePassword(password);
    const confirmPasswordValidation = validateConfirmPassword(
      confirmPassword,
      password
    );

    if (!passwordValidation.valid || !confirmPasswordValidation.valid) {
      setError("请检查表单中的错误");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "重置密码失败");
      }

      setSuccess(true);

      // 3秒后跳转到登录页
      setTimeout(() => {
        router.push("/admin-login");
      }, 3000);
    } catch (error: any) {
      setError(error.message || "重置密码失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-red-600">
            无效的重置链接
          </CardTitle>
          <CardDescription>
            该链接无效或已过期
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              重新申请重置密码
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            密码重置成功！
          </CardTitle>
          <CardDescription>
            您的密码已更新，3秒后自动跳转到登录页面...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          设置新密码
        </CardTitle>
        <CardDescription>
          请输入您的新密码
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 新密码 */}
          <div className="space-y-2">
            <Label htmlFor="password">
              新密码 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type="password"
                placeholder="至少6个字符"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              {validations.password.message && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getValidationIcon(validations.password)}
                </div>
              )}
            </div>
            {validations.password.message && (
              <p
                className={`text-xs ${
                  validations.password.valid ? "text-green-600" : "text-red-600"
                }`}
              >
                {validations.password.message}
              </p>
            )}
          </div>

          {/* 确认密码 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              确认密码 <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type="password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              {validations.confirmPassword.message && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getValidationIcon(validations.confirmPassword)}
                </div>
              )}
            </div>
            {validations.confirmPassword.message && (
              <p
                className={`text-xs ${
                  validations.confirmPassword.valid
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {validations.confirmPassword.message}
              </p>
            )}
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "重置中..." : "重置密码"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            记起密码了？{" "}
            <a
              href="/admin-login"
              className="text-blue-600 hover:underline"
            >
              返回登录
            </a>
          </div>
        </form>

        {/* 安全提示 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium mb-2 text-blue-900">
            安全提示：
          </p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 密码长度至少6个字符</li>
            <li>• 建议使用字母、数字组合</li>
            <li>• 不要使用过于简单的密码</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

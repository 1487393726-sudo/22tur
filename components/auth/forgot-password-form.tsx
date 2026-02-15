"use client";

import { useState, useEffect } from "react";
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
import { Loader2, Mail, Phone, User, CheckCircle2 } from "lucide-react";

/**
 * 忘记密码表单组件
 * 支持邮箱、手机号、用户ID找回密码
 */
export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [identifierType, setIdentifierType] = useState<string>("");
  const [resetLink, setResetLink] = useState("");

  // 实时识别输入类型
  useEffect(() => {
    if (!identifier) {
      setIdentifierType("");
      return;
    }

    const trimmed = identifier.trim();

    // 邮箱格式
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setIdentifierType("email");
      return;
    }

    // 手机号格式（11位数字）
    if (/^1[3-9]\d{9}$/.test(trimmed)) {
      setIdentifierType("phone");
      return;
    }

    // 用户ID格式（UID-开头）
    if (/^UID-[A-Z0-9]{7,}$/i.test(trimmed)) {
      setIdentifierType("userId");
      return;
    }

    setIdentifierType("unknown");
  }, [identifier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "发送重置链接失败");
      }

      setSuccess(true);
      
      // 开发环境下显示重置链接
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (error: any) {
      setError(error.message || "发送重置链接失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 获取输入框图标
  const getInputIcon = () => {
    switch (identifierType) {
      case "email":
        return <Mail className="h-4 w-4 text-green-600" />;
      case "phone":
        return <Phone className="h-4 w-4 text-blue-600" />;
      case "userId":
        return <User className="h-4 w-4 text-white600" />;
      default:
        return null;
    }
  };

  // 获取输入提示
  const getInputHint = () => {
    switch (identifierType) {
      case "email":
        return "将通过邮箱发送重置链接";
      case "phone":
        return "将通过短信发送重置链接";
      case "userId":
        return "将通过绑定的邮箱或手机号发送";
      case "unknown":
        return "格式不正确";
      default:
        return "";
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">
            重置链接已发送
          </CardTitle>
          <CardDescription>
            请检查您的邮箱或手机，点击链接重置密码
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetLink && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium mb-2 text-yellow-900">
                开发环境 - 重置链接：
              </p>
              <a
                href={resetLink}
                className="text-xs text-blue-600 hover:underline break-all"
                target="_blank"
                rel="noopener noreferrer"
              >
                {resetLink}
              </a>
            </div>
          )}
          <div className="mt-4 text-center">
            <a
              href="/admin-login"
              className="text-sm text-blue-600 hover:underline"
            >
              返回登录
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          忘记密码
        </CardTitle>
        <CardDescription>
          输入您的邮箱、手机号或用户ID
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier">
              账号
            </Label>
            <div className="relative">
              <Input
                id="identifier"
                type="text"
                placeholder="邮箱 / 手机号 / 用户ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                className="pr-10"
              />
              {getInputIcon() && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {getInputIcon()}
                </div>
              )}
            </div>
            {identifierType && (
              <p
                className={`text-xs ${
                  identifierType === "unknown"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {getInputHint()}
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

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {loading ? "发送中..." : "发送重置链接"}
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

        {/* 说明 */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium mb-2 text-blue-900">
            找回密码说明：
          </p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• 支持使用邮箱、手机号或用户ID找回</li>
            <li>• 重置链接有效期为1小时</li>
            <li>• 如未收到，请检查垃圾邮件箱</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

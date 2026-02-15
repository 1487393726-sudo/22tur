"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
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
import { Loader2, Mail, Phone, User } from "lucide-react";

/**
 * 增强版登录表单
 * 支持邮箱、手机号、用户ID三种方式登录
 */
export function EnhancedLoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [identifierType, setIdentifierType] = useState<string>("");
  const router = useRouter();

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
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("登录失败，请检查您的账号和密码");
      } else {
        // 检查用户角色
        const response = await fetch("/api/auth/me");
        const userData = await response.json();

        if (userData.role === "ADMIN") {
          router.push("/admin");
          router.refresh();
        } else {
          setError("您没有管理员权限");
        }
      }
    } catch (error) {
      setError("登录失败，请稍后重试");
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
        return "邮箱格式";
      case "phone":
        return "手机号格式";
      case "userId":
        return "用户ID格式";
      case "unknown":
        return "格式不正确";
      default:
        return "";
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          企业管理系统
        </CardTitle>
        <CardDescription>
          支持邮箱、手机号或用户ID登录
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

          <div className="space-y-2">
            <Label htmlFor="password">
              密码
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
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
            {loading ? "登录中..." : "登录"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            <a
              href="/forgot-password"
              className="text-blue-600 hover:underline"
            >
              忘记密码？
            </a>
          </div>
        </form>

        {/* 登录方式说明 */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm font-medium mb-2 text-gray-900">
            支持的登录方式：
          </p>
          <div className="space-y-1 text-xs text-gray-700">
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3 text-green-600" />
              <span>邮箱：admin@example.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-blue-600" />
              <span>手机号：13800138001</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-3 w-3 text-white600" />
              <span>用户ID：UID-XXXXXXX</span>
            </div>
          </div>
        </div>

        {/* 测试账户信息 */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium mb-2 text-blue-900">
            测试账户：
          </p>
          <p className="text-xs text-blue-700">
            邮箱：admin@example.com
          </p>
          <p className="text-xs text-blue-700">
            密码：admin123
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

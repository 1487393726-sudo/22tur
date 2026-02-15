"use client";

import { useState } from "react";
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
import { Loader2 } from "lucide-react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        identifier: email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
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

  return (
    <Card className="w-full max-w-md" data-oid="i97-dv2">
      <CardHeader className="text-center" data-oid="7x0f:f4">
        <CardTitle className="text-2xl font-bold" data-oid="15wgeq.">
          企业管理系统
        </CardTitle>
        <CardDescription data-oid=":jtg7xt">
          请使用管理员账户登录
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="kt01j4s">
        <form onSubmit={handleSubmit} className="space-y-4" data-oid="v16sggk">
          <div className="space-y-2" data-oid="5ln1::l">
            <Label htmlFor="email" data-oid="y:4wqv9">
              邮箱
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              data-oid="5kv1slg"
            />
          </div>
          <div className="space-y-2" data-oid="3ejr2c:">
            <Label htmlFor="password" data-oid="fp2bk21">
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
              data-oid="qwqoa09"
            />
          </div>

          {error && (
            <Alert className="bg-red-50 border-red-200" data-oid="3:ye1gh">
              <AlertDescription className="text-red-700" data-oid="dtal32_">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            data-oid="r.smurf"
          >
            {loading && (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                data-oid="9yi4pix"
              />
            )}
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        {/* 测试账户信息 */}
        <div
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          data-oid="i4i.bg4"
        >
          <p
            className="text-sm font-medium mb-2 text-blue-900"
            data-oid="iummvkf"
          >
            测试账户：
          </p>
          <p className="text-xs text-blue-700" data-oid=".l-lye1">
            邮箱：admin@example.com
          </p>
          <p className="text-xs text-blue-700" data-oid="wq:svmb">
            密码：admin123
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

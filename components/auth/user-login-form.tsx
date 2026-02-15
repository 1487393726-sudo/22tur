"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function UserLoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        identifier: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError("邮箱或密码错误");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("登录失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_40px_rgba(176,38,255,0.15)]">
      <CardHeader className="space-y-1">
        <div className="flex justify-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-[#b026ff] animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-[#ff2a6d] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-[#b026ff] via-[#00f0ff] to-[#ff2a6d] bg-clip-text text-transparent">
          用户登录
        </CardTitle>
        <CardDescription className="text-center text-[#9ca3af]">
          登录您的个人账户
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-[#b026ff]" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="请输入邮箱地址"
                value={formData.email}
                onChange={handleChange}
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-[#00f0ff]" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={formData.password}
                onChange={handleChange}
                className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-[#6b7280] focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-[#9ca3af] hover:text-[#00f0ff] transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              name="rememberMe"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  rememberMe: checked as boolean,
                }))
              }
              className="border-white/20 data-[state=checked]:bg-[#b026ff] data-[state=checked]:border-[#b026ff]"
            />
            <Label htmlFor="rememberMe" className="text-sm text-[#9ca3af]">
              记住我
            </Label>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-400">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#b026ff] to-[#7c3aed] hover:shadow-[0_0_20px_rgba(176,38,255,0.5)] text-white border-0"
            disabled={isLoading}
          >
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            登录
          </Button>

          <div className="text-center space-y-2 pt-2">
            <div>
              <p className="text-sm text-[#9ca3af]">
                还没有账户？{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="text-[#00f0ff] hover:text-[#00f0ff]/80 font-medium transition-colors"
                >
                  立即注册
                </button>
              </p>
            </div>
            <div>
              <button
                type="button"
                onClick={() => router.push("/forgot-password")}
                className="text-sm text-[#9ca3af] hover:text-[#00f0ff] transition-colors"
              >
                忘记密码？
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => router.push("/admin-login")}
                className="text-sm text-[#6b7280] hover:text-[#9ca3af] transition-colors"
              >
                管理员登录
              </button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

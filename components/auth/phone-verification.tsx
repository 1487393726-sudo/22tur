"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, Phone, RefreshCw } from "lucide-react";

interface PhoneVerificationProps {
  phone: string;
  purpose?: "REGISTER" | "RESET_PASSWORD" | "BIND_PHONE";
  onVerified?: (token: string) => void;
  onCancel?: () => void;
}

/**
 * 手机号验证组件
 * 支持发送验证码、倒计时、验证码输入
 */
export function PhoneVerification({
  phone,
  purpose = "REGISTER",
  onVerified,
  onCancel,
}: PhoneVerificationProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.waitSeconds) {
          setCountdown(data.waitSeconds);
        }
        throw new Error(data.error || "发送失败");
      }

      setCodeSent(true);
      setCountdown(60);
      
      // 开发环境自动填充验证码
      if (data.code) {
        setCode(data.code);
      }
    } catch (err: any) {
      setError(err.message || "发送验证码失败");
    } finally {
      setSending(false);
    }
  };

  // 验证验证码
  const handleVerify = async () => {
    if (code.length !== 6) {
      setError("请输入6位验证码");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/confirm-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, purpose }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "验证失败");
      }

      setSuccess(true);
      onVerified?.(data.token);
    } catch (err: any) {
      setError(err.message || "验证失败");
    } finally {
      setLoading(false);
    }
  };

  // 处理验证码输入
  const handleCodeChange = (value: string) => {
    // 只允许数字
    const numericValue = value.replace(/\D/g, "").slice(0, 6);
    setCode(numericValue);
  };

  // 处理单个数字输入框
  const handleDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newCode = code.split("");
    newCode[index] = value;
    const newCodeStr = newCode.join("").slice(0, 6);
    setCode(newCodeStr);

    // 自动跳转到下一个输入框
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // 处理退格键
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-600 mb-2">
          验证成功！
        </h3>
        <p className="text-gray-600">
          手机号 {phone} 已验证
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 手机号显示 */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
        <Phone className="h-5 w-5 text-gray-500" />
        <div>
          <p className="text-sm text-gray-500">验证手机号</p>
          <p className="font-medium">{phone}</p>
        </div>
      </div>

      {/* 发送验证码按钮 */}
      {!codeSent ? (
        <Button
          onClick={handleSendCode}
          disabled={sending || countdown > 0}
          className="w-full"
        >
          {sending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {countdown > 0 ? `${countdown}秒后重试` : "发送验证码"}
        </Button>
      ) : (
        <>
          {/* 验证码输入 */}
          <div className="space-y-2">
            <Label>输入验证码</Label>
            <div className="flex gap-2 justify-center">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <Input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={code[index] || ""}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold"
                  disabled={loading}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center">
              验证码已发送至 {phone}
            </p>
          </div>

          {/* 重新发送 */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSendCode}
              disabled={sending || countdown > 0}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${sending ? "animate-spin" : ""}`} />
              {countdown > 0 ? `${countdown}秒后可重发` : "重新发送"}
            </Button>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert className="bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3">
            {onCancel && (
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={loading}
                className="flex-1"
              >
                取消
              </Button>
            )}
            <Button
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "验证中..." : "确认验证"}
            </Button>
          </div>
        </>
      )}

      {/* 初始错误提示 */}
      {error && !codeSent && (
        <Alert className="bg-red-50 border-red-200">
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

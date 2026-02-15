"use client";

import { useEffect, useState } from "react";
import { ensureLogin, checkEnvironment } from "@/lib/cloudbase";

export function useCloudBase() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const initializeCloudBase = async () => {
      try {
        setError(null);
        
        // 检查环境配置
        if (!checkEnvironment()) {
          setError("CloudBase环境未配置，请在.env.local中设置NEXT_PUBLIC_CLOUDBASE_ENV_ID");
          return;
        }

        // 确保登录
        const loginState = await ensureLogin();
        
        setIsLoggedIn(true);
        setUser(loginState.user);
        setIsReady(true);
        
        console.log("CloudBase初始化成功", { user: loginState.user });
      } catch (err) {
        console.error("CloudBase初始化失败:", err);
        setError(err instanceof Error ? err.message : "初始化失败");
      }
    };

    initializeCloudBase();
  }, [isClient]);

  return {
    isReady: isReady && isClient,
    isLoggedIn,
    user,
    error,
    isClient,
  };
}
"use client";

import { useEffect, useState } from "react";
import { 
  supabase, 
  checkSupabaseConfig, 
  getCurrentSession, 
  onAuthStateChange 
} from "@/lib/supabase";

export function useSupabase() {
  const [isReady, setIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeSupabase = async () => {
      try {
        setError(null);
        
        // 检查配置
        if (!checkSupabaseConfig()) {
          setError("Supabase配置不完整，请在.env.local中设置NEXT_PUBLIC_SUPABASE_URL和NEXT_PUBLIC_SUPABASE_ANON_KEY");
          return;
        }

        // 检查当前会话
        const session = await getCurrentSession();
        if (session) {
          setIsLoggedIn(true);
          setUser(session.user);
        }

        // 监听认证状态变化
        const { data: { subscription } } = onAuthStateChange(
          (event, session) => {
            console.log('Supabase认证状态变化:', event, session);
            
            if (session) {
              setIsLoggedIn(true);
              setUser(session.user);
            } else {
              setIsLoggedIn(false);
              setUser(null);
            }
          }
        );

        setIsReady(true);
        
        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.error("Supabase初始化失败:", err);
        setError(err instanceof Error ? err.message : "初始化失败");
      }
    };

    initializeSupabase();
  }, []);

  return {
    isReady,
    isLoggedIn,
    user,
    error,
    supabase
  };
}
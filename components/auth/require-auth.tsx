"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface RequireAuthProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function RequireAuth({ children, adminOnly = false }: RequireAuthProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/admin-login");
      return;
    }

    // 如果需要管理员权限，检查用户角色
    if (adminOnly) {
      fetch("/api/auth/me")
        .then((res) => res.json())
        .then((data) => {
          if (data.role !== "ADMIN") {
            setLoading(false);
          } else {
            setUserData(data);
            setLoading(false);
          }
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [session, status, router, adminOnly]);

  if (status === "loading" || loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-oid="qulri-2"
      >
        <div className="text-center" data-oid="xin3jpo">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto mb-4"
            data-oid="x-i11z3"
          />
          <p className="text-muted-foreground" data-oid="lx8186_">
            正在验证权限...
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-oid="qra:7hw"
      >
        <Alert className="max-w-md" data-oid="buh4lel">
          <AlertDescription data-oid="r545tyl">
            请先登录访问此页面
            <div className="mt-4" data-oid="nvo_v_q">
              <Button asChild data-oid="t5ei-29">
                <Link href="/admin-login" data-oid="uhru24c">
                  前往登录
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (adminOnly && userData?.role !== "ADMIN") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        data-oid="_ng6j5t"
      >
        <Alert className="max-w-md" data-oid="rv8bncu">
          <AlertDescription data-oid="yh0k785">
            您没有管理员权限访问此页面
            <div className="mt-4 space-x-2" data-oid="sr0ds2g">
              <Button variant="outline" asChild data-oid="0bu6gs9">
                <Link href="/" data-oid="5y-_w_i">
                  返回首页
                </Link>
              </Button>
              <Button asChild data-oid="f17y6e7">
                <Link href="/admin-login" data-oid="pmvtf97">
                  重新登录
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}

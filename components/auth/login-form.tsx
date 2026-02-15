"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 3000);
  }

  return (
    <div className="grid gap-6" data-oid="ce1gmr5">
      <form onSubmit={onSubmit} data-oid="0w2.u8r">
        <div className="grid gap-4" data-oid="tqpjkxw">
          <div className="grid gap-2" data-oid="be.mhsm">
            <Label htmlFor="email" data-oid=".dxxj-w">
              Email
            </Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
              data-oid="4p594up"
            />
          </div>
          <div className="grid gap-2" data-oid="9slslob">
            <div
              className="flex items-center justify-between"
              data-oid="w1wnrfq"
            >
              <Label htmlFor="password" data-oid="j_6_aqo">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                data-oid="r-b-128"
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              required
              data-oid="ou6un3."
            />
          </div>
          <Button
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white border-0"
            data-oid="kz5md17"
          >
            {isLoading && (
              <Loader2
                className="mr-2 h-4 w-4 animate-spin"
                data-oid="pg-jag_"
              />
            )}
            Sign In
          </Button>
        </div>
      </form>

      <div className="relative" data-oid="t8bjakk">
        <div className="absolute inset-0 flex items-center" data-oid=".skyeqb">
          <span className="w-full border-t" data-oid=".5-kubq" />
        </div>
        <div
          className="relative flex justify-center text-xs uppercase"
          data-oid="602m-t0"
        >
          <span
            className="bg-background px-2 text-muted-foreground"
            data-oid="w2-93k3"
          >
            Or continue with
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        type="button"
        disabled={isLoading}
        data-oid="qdrgoga"
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" data-oid="7ewpc0x" />
        ) : (
          <Github className="mr-2 h-4 w-4" data-oid="17a3jl2" />
        )}
        GitHub
      </Button>
    </div>
  );
}

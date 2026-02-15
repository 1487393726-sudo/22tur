"use client";

import { SessionProvider } from "next-auth/react";

export function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider data-oid="g78u:bz">{children}</SessionProvider>;
}

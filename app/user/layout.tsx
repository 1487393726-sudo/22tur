"use client";

import { UserNavbar } from "@/components/layout/user-navbar";
import { UserSidebar } from "@/components/layout/user-sidebar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="user-page-container" data-route-type="user">
      <UserNavbar />
      <div className="flex">
        <UserSidebar />
        <main className="flex-1 ml-64 pt-16">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
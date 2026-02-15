"use client";

import { CloudBaseDemo } from "@/components/cloudbase-demo";
import { CloudBaseStatus } from "@/components/ui/cloudbase-status";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CloudBasePage() {
  return (
    <main className="min-h-screen bg-background" data-oid="z2mr0pn">
      <Navbar data-oid="xa3ihsf" />

      <div className="container mx-auto px-4 py-8" data-oid="n_3xlr4">
        <div className="max-w-4xl mx-auto" data-oid="bu1ajgy">
          <div className="text-center mb-8" data-oid="fdciq5j">
            <h1 className="text-3xl font-bold mb-4" data-oid="tcj8j93">
              CloudBase集成演示
            </h1>
            <p className="text-muted-foreground" data-oid="bu:et:m">
              这是一个CloudBase云开发的功能演示页面
            </p>
          </div>

          <div className="space-y-6" data-oid="06si9s5">
            <CloudBaseStatus data-oid="fg6h-dq" />
            <CloudBaseDemo data-oid="-jvdu:z" />
          </div>
        </div>
      </div>

      <Footer data-oid="0a2mvqy" />
    </main>
  );
}

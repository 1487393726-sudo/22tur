/**
 * 投资项目独立详情页面
 * Investment Project Detail Page
 * 
 * 显示单个投资项目的所有运营信息
 */

"use client";

import { use } from "react";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Menu, X } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { InvestmentManagementNav } from "@/components/investment/investment-management-nav";
import { UserFeedbackProvider } from "@/components/investment/user-feedback";
import { ProjectDetailPage } from "@/components/investor-operations/project-detail-page";
import { InvestmentRequiredGate } from "@/components/investment/investment-required-gate";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvestorProjectDetailPage({ params }: PageProps) {
  const { id: projectId } = use(params);
  const { locale } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <UserFeedbackProvider>
      <div className="min-h-screen purple-gradient-page purple-gradient-content">
        <Navbar />
        
        <InvestmentRequiredGate>
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <InvestmentManagementNav 
              userRole="investor"
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
          
          {/* Main content */}
          <div className="lg:ml-80 pt-16 md:pt-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-purple-600/20 backdrop-blur-sm rounded-lg text-white hover:bg-purple-600/30 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Page Content */}
            <section className="py-8 px-4">
              <div className="container mx-auto max-w-7xl">
                <ProjectDetailPage projectId={projectId} />
              </div>
            </section>
          </div>
        </InvestmentRequiredGate>
        
        <Footer />
      </div>
    </UserFeedbackProvider>
  );
}

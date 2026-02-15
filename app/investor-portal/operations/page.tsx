'use client';

/**
 * 投资者运营监控主页面
 * Investor Operations Monitoring Portal Page
 * 
 * 项目运营监控的主入口页面，提供项目概览仪表板和快速导航
 * 需求: 全系统集成
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import Link from 'next/link';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { InvestmentManagementNav } from '@/components/investment/investment-management-nav';
import { UserFeedbackProvider } from '@/components/investment/user-feedback';
import { InvestorOperationsPortal } from '@/components/investor-operations/investor-operations-portal';
import { InvestmentRequiredGate } from '@/components/investment/investment-required-gate';
import {
  Menu,
  X,
  Bell,
  RefreshCw
} from 'lucide-react';

export default function InvestorOperationsPage() {
  const { locale } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <UserFeedbackProvider>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <InvestmentRequiredGate>
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          <div className={`
            fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 lg:translate-x-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <InvestmentManagementNav 
              userRole="investor"
              onNavigate={() => setSidebarOpen(false)}
            />
          </div>
          
          <div className="lg:ml-80 pt-16 md:pt-20">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden fixed top-20 left-4 z-30 p-2 bg-primary/20 backdrop-blur-sm rounded-lg text-foreground hover:bg-primary/30 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <section className="bg-card py-12 px-4">
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">
                    {locale === 'en' ? 'Operations Monitoring' : '项目运营监控'}
                  </h1>
                  <p className="text-lg text-muted-foreground">
                    {locale === 'en' 
                      ? 'Monitor your investment projects with full transparency'
                      : '透明化监控您的投资项目运营状态'
                    }
                  </p>
                </div>
                <div className="flex gap-3 mt-4 md:mt-0">
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-transparent border border-border text-foreground px-4 py-2 rounded-lg hover:bg-muted flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {locale === 'en' ? 'Refresh' : '刷新'}
                  </button>
                  <Link 
                    href="/investor-portal/operations/alerts"
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    {locale === 'en' ? 'Alerts' : '预警'}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 px-4">
            <div className="container mx-auto max-w-7xl">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <InvestorOperationsPortal />
              )}
            </div>
          </section>
        </div>
        </InvestmentRequiredGate>
        
        <Footer />
      </div>
    </UserFeedbackProvider>
  );
}

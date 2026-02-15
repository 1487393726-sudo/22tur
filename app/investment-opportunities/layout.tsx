import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { QueryProvider } from '@/components/providers/query-provider';

export default function InvestmentOpportunitiesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <QueryProvider>
      <div className="flex h-screen text-foreground purple-gradient-page purple-gradient-content">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
            <div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </QueryProvider>
  );
}

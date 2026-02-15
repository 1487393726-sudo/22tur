'use client';

import { InvestorProvider } from '@/lib/contexts/InvestorContext';

export default function InvestmentPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InvestorProvider>{children}</InvestorProvider>;
}

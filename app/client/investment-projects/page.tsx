'use client';

import { InvestmentProjectsMenu } from '@/components/client/investment-projects-menu';

export default function ClientInvestmentProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 页面头部 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">投资项目</h1>
          <p className="text-blue-100">
            浏览我们的优质投资项目，选择适合您的投资机会
          </p>
        </div>
      </div>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-12">
        <InvestmentProjectsMenu />
      </div>
    </div>
  );
}

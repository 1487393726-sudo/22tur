'use client'

import { useState } from 'react'
import { HexHubUserManagement } from '@/components/hexhub/user-management'
import { HexHubProjectManagement } from '@/components/hexhub/project-management'
import { HexHubDatasetManagement } from '@/components/hexhub/dataset-management'

export default function HexHubDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'datasets'>('users')

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">HexHub 管理系统</h1>
          <p className="text-gray-600 mt-2">数据管理、项目管理和用户管理平台</p>
        </div>

        {/* 标签页导航 */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            用户管理
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'projects'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            项目管理
          </button>
          <button
            onClick={() => setActiveTab('datasets')}
            className={`px-4 py-3 font-medium border-b-2 transition ${
              activeTab === 'datasets'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            数据集管理
          </button>
        </div>

        {/* 内容区域 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {activeTab === 'users' && <HexHubUserManagement />}
            {activeTab === 'projects' && <HexHubProjectManagement />}
            {activeTab === 'datasets' && <HexHubDatasetManagement />}
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">系统状态</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">正常运行</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">API 版本</h3>
            <p className="text-2xl font-bold text-blue-600 mt-2">v1.0.0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">数据库</h3>
            <p className="text-2xl font-bold text-purple-600 mt-2">SQLite</p>
          </div>
        </div>
      </div>
    </div>
  )
}

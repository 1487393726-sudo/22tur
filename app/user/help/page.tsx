'use client';

import React, { useState } from 'react';
import { FAQList } from '@/components/user-portal/FAQList';
import { GuideList } from '@/components/user-portal/GuideList';
import { ContactInfo } from '@/components/user-portal/ContactInfo';
import { HelpSearch } from '@/components/user-portal/HelpSearch';
import { LiveChatWidget } from '@/components/user-portal/LiveChatWidget';
import { FAQ, Guide, ContactInfo as ContactInfoType, SearchResult, LiveChat } from '@/lib/user-portal/help-types';

type TabType = 'faq' | 'guides' | 'contact' | 'search' | 'chat';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<TabType>('faq');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Mock data
  const mockFAQs: FAQ[] = [
    {
      id: '1',
      category: '账户',
      question: '如何重置我的密码？',
      answer: '您可以在登录页面点击"忘记密码"链接，然后按照邮件中的说明重置密码。重置链接有效期为24小时。',
      views: 1250,
      helpful: 890,
      unhelpful: 45,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      category: '订单',
      question: '如何追踪我的订单？',
      answer: '登录您的账户，进入"我的订单"页面，点击相应订单可查看详细的配送信息和实时追踪。',
      views: 2100,
      helpful: 1950,
      unhelpful: 30,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10'),
    },
    {
      id: '3',
      category: '支付',
      question: '支持哪些支付方式？',
      answer: '我们支持支付宝、微信支付、银行卡和其他主流支付方式。您可以在结算页面选择您喜欢的支付方式。',
      views: 1800,
      helpful: 1650,
      unhelpful: 25,
      createdAt: new Date('2024-01-08'),
      updatedAt: new Date('2024-01-08'),
    },
    {
      id: '4',
      category: '退货',
      question: '如何申请退货？',
      answer: '进入"售后服务"页面，点击"申请退货"，填写退货原因并上传相关凭证。我们会在24小时内审核您的申请。',
      views: 950,
      helpful: 820,
      unhelpful: 35,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
    },
  ];

  const mockGuides: Guide[] = [
    {
      id: '1',
      title: '新手入门指南',
      description: '了解如何开始使用我们的平台，包括账户创建、个人信息设置等基础操作。',
      content: '这是新手入门指南的详细内容...',
      category: '基础',
      steps: [
        {
          id: '1',
          title: '创建账户',
          description: '点击注册按钮，填写邮箱和密码创建新账户。',
        },
        {
          id: '2',
          title: '完善信息',
          description: '进入个人资料页面，填写您的基本信息。',
        },
        {
          id: '3',
          title: '开始购物',
          description: '浏览商品并添加到购物车。',
        },
      ],
      estimatedTime: 10,
      difficulty: 'easy',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: '订单管理完全指南',
      description: '学习如何管理您的订单，包括查看、修改和追踪订单。',
      content: '这是订单管理指南的详细内容...',
      category: '订单',
      steps: [
        {
          id: '1',
          title: '查看订单',
          description: '进入"我的订单"页面查看所有订单。',
        },
        {
          id: '2',
          title: '追踪配送',
          description: '点击订单查看实时配送信息。',
        },
        {
          id: '3',
          title: '管理订单',
          description: '根据需要取消或修改订单。',
        },
      ],
      estimatedTime: 15,
      difficulty: 'medium',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      title: '积分系统详解',
      description: '深入了解积分系统，学习如何获取和使用积分。',
      content: '这是积分系统指南的详细内容...',
      category: '会员',
      steps: [
        {
          id: '1',
          title: '了解积分规则',
          description: '查看积分获取和使用规则。',
        },
        {
          id: '2',
          title: '获取积分',
          description: '通过购物和其他活动获取积分。',
        },
        {
          id: '3',
          title: '兑换积分',
          description: '使用积分兑换优惠券或商品。',
        },
      ],
      estimatedTime: 20,
      difficulty: 'medium',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  const mockContacts: ContactInfoType[] = [
    {
      id: '1',
      type: 'email',
      label: '客服邮箱',
      value: 'support@example.com',
      available: true,
      availableHours: '24小时内回复',
    },
    {
      id: '2',
      type: 'phone',
      label: '客服热线',
      value: '400-123-4567',
      available: true,
      availableHours: '周一至周五 9:00-18:00',
    },
    {
      id: '3',
      type: 'wechat',
      label: '微信客服',
      value: 'service_official',
      available: true,
      availableHours: '周一至周日 9:00-21:00',
    },
    {
      id: '4',
      type: 'address',
      label: '公司地址',
      value: '北京市朝阳区某某街道123号',
      available: true,
    },
  ];

  const mockChat: LiveChat = {
    id: '1',
    userId: 'USER001',
    status: 'active',
    messages: [
      {
        id: '1',
        senderId: 'AGENT001',
        senderType: 'agent',
        content: '您好，有什么我可以帮助您的吗？',
        timestamp: new Date(Date.now() - 5 * 60000),
        isRead: true,
      },
      {
        id: '2',
        senderId: 'USER001',
        senderType: 'user',
        content: '我想咨询一下退货流程',
        timestamp: new Date(Date.now() - 3 * 60000),
        isRead: true,
      },
      {
        id: '3',
        senderId: 'AGENT001',
        senderType: 'agent',
        content: '当然可以。您可以进入"售后服务"页面申请退货。需要什么帮助吗？',
        timestamp: new Date(Date.now() - 1 * 60000),
        isRead: true,
      },
    ],
    startedAt: new Date(Date.now() - 10 * 60000),
  };

  const handleSearch = (query: string) => {
    // Mock search results
    const results: SearchResult[] = [
      {
        id: '1',
        type: 'faq',
        title: '如何重置我的密码？',
        description: '您可以在登录页面点击"忘记密码"链接...',
        relevance: 0.95,
      },
      {
        id: '2',
        type: 'guide',
        title: '新手入门指南',
        description: '了解如何开始使用我们的平台...',
        relevance: 0.85,
      },
    ];
    setSearchResults(results);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 md:mb-6 lg:mb-8">
          帮助中心
        </h1>

        {/* Tabs - Responsive with horizontal scroll on mobile */}
        <div className="flex gap-1 sm:gap-2 md:gap-2 lg:gap-3 mb-6 sm:mb-8 md:mb-8 lg:mb-8 border-b border-gray-200 dark:border-slate-700 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-2 sm:px-3 md:px-4 lg:px-4 py-2 text-xs sm:text-sm md:text-sm lg:text-base font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'faq'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            常见问题
          </button>
          <button
            onClick={() => setActiveTab('guides')}
            className={`px-2 sm:px-3 md:px-4 lg:px-4 py-2 text-xs sm:text-sm md:text-sm lg:text-base font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'guides'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            使用指南
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-2 sm:px-3 md:px-4 lg:px-4 py-2 text-xs sm:text-sm md:text-sm lg:text-base font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'contact'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            联系我们
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-2 sm:px-3 md:px-4 lg:px-4 py-2 text-xs sm:text-sm md:text-sm lg:text-base font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'search'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            搜索
          </button>
          <button
            onClick={() => {
              setActiveTab('chat');
              setIsChatOpen(true);
            }}
            className={`px-2 sm:px-3 md:px-4 lg:px-4 py-2 text-xs sm:text-sm md:text-sm lg:text-base font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === 'chat'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            在线客服
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-2 sm:px-4 md:px-6 lg:px-8">
          {activeTab === 'faq' && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-4 lg:mb-6">
                常见问题
              </h2>
              <FAQList
                faqs={mockFAQs}
                onHelpful={(faqId, helpful) => console.log('FAQ helpful:', faqId, helpful)}
              />
            </div>
          )}

          {activeTab === 'guides' && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-4 lg:mb-6">
                使用指南
              </h2>
              <GuideList
                guides={mockGuides}
                onSelectGuide={(guide) => console.log('Selected guide:', guide)}
              />
            </div>
          )}

          {activeTab === 'contact' && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-4 lg:mb-6">
                联系我们
              </h2>
              <ContactInfo contacts={mockContacts} />
            </div>
          )}

          {activeTab === 'search' && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-4 lg:mb-6">
                搜索帮助
              </h2>
              <HelpSearch
                results={searchResults}
                onSearch={handleSearch}
                onSelectResult={(result) => console.log('Selected result:', result)}
              />
            </div>
          )}

          {activeTab === 'chat' && (
            <div>
              <h2 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 md:mb-4 lg:mb-6">
                在线客服
              </h2>
              <LiveChatWidget
                chat={mockChat}
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                onSendMessage={(message) => console.log('Message sent:', message)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

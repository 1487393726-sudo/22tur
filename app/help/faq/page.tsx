"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Search, MessageCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const faqCategories = [
  {
    id: "account",
    title: "账户管理",
    titleEn: "Account Management",
    icon: "👤",
  },
  {
    id: "billing",
    title: "计费和订阅",
    titleEn: "Billing & Subscriptions",
    icon: "💳",
  },
  {
    id: "features",
    title: "功能使用",
    titleEn: "Feature Usage",
    icon: "⚙️",
  },
  {
    id: "technical",
    title: "技术问题",
    titleEn: "Technical Issues",
    icon: "🔧",
  },
  {
    id: "security",
    title: "安全和隐私",
    titleEn: "Security & Privacy",
    icon: "🔒",
  },
];

const faqs = [
  {
    id: 1,
    category: "account",
    question: "如何重置我的密码？",
    questionEn: "How do I reset my password?",
    answer: "您可以在登录页面点击\"忘记密码\"链接，输入您的邮箱地址，我们会发送重置密码的链接到您的邮箱。如果您没有收到邮件，请检查垃圾邮件文件夹。",
    answerEn: "You can click the 'Forgot Password' link on the login page, enter your email address, and we'll send a password reset link to your email. If you don't receive the email, please check your spam folder.",
    helpful: 245,
    notHelpful: 12,
  },
  {
    id: 2,
    category: "account",
    question: "如何更改我的邮箱地址？",
    questionEn: "How do I change my email address?",
    answer: "登录后进入设置页面，在\"账户信息\"部分点击邮箱地址旁的\"编辑\"按钮。输入新的邮箱地址后，我们会发送验证邮件到新邮箱进行确认。",
    answerEn: "After logging in, go to the settings page and click the 'Edit' button next to your email address in the 'Account Information' section. After entering your new email address, we'll send a verification email to confirm the change.",
    helpful: 189,
    notHelpful: 8,
  },
  {
    id: 3,
    category: "billing",
    question: "如何升级我的订阅计划？",
    questionEn: "How do I upgrade my subscription plan?",
    answer: "在设置页面的\"订阅管理\"部分，您可以查看当前计划并选择升级选项。升级会立即生效，费用会按比例计算。",
    answerEn: "In the 'Subscription Management' section of the settings page, you can view your current plan and select upgrade options. Upgrades take effect immediately and charges are prorated.",
    helpful: 156,
    notHelpful: 5,
  },
  {
    id: 4,
    category: "billing",
    question: "可以申请退款吗？",
    questionEn: "Can I request a refund?",
    answer: "我们提供30天退款保证。如果您在购买后30天内不满意，可以联系客服申请全额退款。退款通常在5-7个工作日内处理完成。",
    answerEn: "We offer a 30-day money-back guarantee. If you're not satisfied within 30 days of purchase, you can contact support for a full refund. Refunds are typically processed within 5-7 business days.",
    helpful: 203,
    notHelpful: 15,
  },
  {
    id: 5,
    category: "features",
    question: "如何邀请团队成员？",
    questionEn: "How do I invite team members?",
    answer: "在项目设置中点击\"团队管理\"，然后点击\"邀请成员\"按钮。输入成员的邮箱地址并选择适当的权限级别，系统会自动发送邀请邮件。",
    answerEn: "In project settings, click 'Team Management', then click the 'Invite Members' button. Enter the member's email address and select the appropriate permission level, and the system will automatically send an invitation email.",
    helpful: 178,
    notHelpful: 9,
  },
  {
    id: 6,
    category: "features",
    question: "如何导出项目数据？",
    questionEn: "How do I export project data?",
    answer: "在项目页面点击右上角的\"更多\"菜单，选择\"导出数据\"。您可以选择导出格式（CSV、Excel、PDF）和要导出的数据范围。",
    answerEn: "Click the 'More' menu in the top right corner of the project page and select 'Export Data'. You can choose the export format (CSV, Excel, PDF) and the data range to export.",
    helpful: 134,
    notHelpful: 7,
  },
  {
    id: 7,
    category: "technical",
    question: "为什么页面加载很慢？",
    questionEn: "Why is the page loading slowly?",
    answer: "页面加载慢可能由多种原因造成：网络连接问题、浏览器缓存、或服务器负载。建议清除浏览器缓存、检查网络连接，或尝试使用不同的浏览器。",
    answerEn: "Slow page loading can be caused by various factors: network connection issues, browser cache, or server load. We recommend clearing your browser cache, checking your network connection, or trying a different browser.",
    helpful: 167,
    notHelpful: 23,
  },
  {
    id: 8,
    category: "technical",
    question: "支持哪些浏览器？",
    questionEn: "Which browsers are supported?",
    answer: "我们支持所有现代浏览器的最新版本，包括Chrome、Firefox、Safari、Edge。建议使用最新版本以获得最佳体验。",
    answerEn: "We support the latest versions of all modern browsers, including Chrome, Firefox, Safari, and Edge. We recommend using the latest version for the best experience.",
    helpful: 145,
    notHelpful: 6,
  },
  {
    id: 9,
    category: "security",
    question: "我的数据安全吗？",
    questionEn: "Is my data secure?",
    answer: "我们采用企业级安全措施保护您的数据，包括SSL加密传输、数据加密存储、定期安全审计和备份。我们符合GDPR和其他数据保护法规。",
    answerEn: "We use enterprise-grade security measures to protect your data, including SSL encrypted transmission, encrypted data storage, regular security audits, and backups. We comply with GDPR and other data protection regulations.",
    helpful: 289,
    notHelpful: 11,
  },
  {
    id: 10,
    category: "security",
    question: "如何启用两步验证？",
    questionEn: "How do I enable two-factor authentication?",
    answer: "在设置页面的\"安全\"部分，点击\"启用两步验证\"。您可以选择使用短信验证码或身份验证器应用（如Google Authenticator）。",
    answerEn: "In the 'Security' section of the settings page, click 'Enable Two-Factor Authentication'. You can choose to use SMS verification codes or an authenticator app (like Google Authenticator).",
    helpful: 198,
    notHelpful: 14,
  },
];

export default function FAQ() {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [helpfulVotes, setHelpfulVotes] = useState<{[key: number]: 'helpful' | 'not-helpful' | null}>({});

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      getContent(faq.question, faq.questionEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getContent(faq.answer, faq.answerEn).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleVote = (faqId: number, vote: 'helpful' | 'not-helpful') => {
    setHelpfulVotes(prev => ({
      ...prev,
      [faqId]: prev[faqId] === vote ? null : vote
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 md:pt-20 bg-background">
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Breadcrumb */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="container px-4 md:px-6 max-w-6xl mx-auto py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/help" className="hover:text-primary transition-colors">
              {getContent("帮助中心", "Help Center")}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">
              {getContent("常见问题", "FAQ")}
            </span>
          </nav>
        </div>
      </div>

      <div className="container px-4 md:px-6 max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getContent("常见问题解答", "Frequently Asked Questions")}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {getContent(
              "快速找到常见问题的答案，如果您没有找到需要的信息，请联系我们的客服团队。",
              "Quickly find answers to common questions. If you don't find what you're looking for, please contact our support team."
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={getContent("搜索问题...", "Search questions...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {getContent("全部", "All")}
              </button>
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <span>{category.icon}</span>
                  {getContent(category.title, category.titleEn)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-16">
          {filteredFAQs.map((faq) => (
            <div
              key={faq.id}
              className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden hover:border-primary/40 transition-all duration-300"
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors duration-300"
              >
                <h3 className="text-lg font-semibold text-foreground pr-4">
                  {getContent(faq.question, faq.questionEn)}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ${
                    expandedFAQ === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>

              {expandedFAQ === faq.id && (
                <div className="px-6 pb-6 border-t border-border/50">
                  <div className="pt-4">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {getContent(faq.answer, faq.answerEn)}
                    </p>

                    {/* Helpful Voting */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {getContent("这个回答有帮助吗？", "Was this answer helpful?")}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote(faq.id, 'helpful')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                              helpfulVotes[faq.id] === 'helpful'
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            <span>{faq.helpful}</span>
                          </button>
                          <button
                            onClick={() => handleVote(faq.id, 'not-helpful')}
                            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-all duration-300 ${
                              helpfulVotes[faq.id] === 'not-helpful'
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            <span>{faq.notHelpful}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredFAQs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {getContent("没有找到相关问题", "No questions found")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {getContent("尝试使用不同的关键词或联系客服获得帮助", "Try different keywords or contact support for help")}
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              {getContent("联系客服", "Contact Support")}
            </Link>
          </div>
        )}

        {/* Contact Support */}
        <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-8 text-center">
          <div className="inline-flex p-4 rounded-full bg-primary/20 mb-6">
            <MessageCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {getContent("还有其他问题？", "Still have questions?")}
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            {getContent(
              "如果您没有找到需要的答案，我们的客服团队随时为您提供个性化的帮助和支持。",
              "If you didn't find the answer you need, our support team is ready to provide personalized help and assistance."
            )}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 hover:scale-105 transition-all duration-300 font-semibold"
          >
            <MessageCircle className="w-4 h-4" />
            {getContent("联系客服", "Contact Support")}
          </Link>
        </div>
      </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

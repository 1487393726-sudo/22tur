"use client";

import { useState } from "react";
import { Search, Book, MessageCircle, Video, FileText, Zap, Users, Settings, ChevronRight, Star, Clock, Eye } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";


const helpCategories = [
  {
    id: "getting-started",
    icon: Zap,
    title: "快速入门",
    titleEn: "Getting Started",
    description: "新用户必读指南，快速上手使用平台",
    descriptionEn: "Essential guides for new users to get started quickly",
    articles: 12,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "user-guide",
    icon: Book,
    title: "用户指南",
    titleEn: "User Guide",
    description: "详细的功能使用说明和最佳实践",
    descriptionEn: "Detailed feature explanations and best practices",
    articles: 28,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "video-tutorials",
    icon: Video,
    title: "视频教程",
    titleEn: "Video Tutorials",
    description: "直观的视频演示和操作指导",
    descriptionEn: "Visual demonstrations and step-by-step guides",
    articles: 15,
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "api-docs",
    icon: FileText,
    title: "API文档",
    titleEn: "API Documentation",
    description: "开发者集成指南和API参考",
    descriptionEn: "Developer integration guides and API reference",
    articles: 24,
    color: "from-orange-500 to-red-500",
  },
  {
    id: "troubleshooting",
    icon: Settings,
    title: "故障排除",
    titleEn: "Troubleshooting",
    description: "常见问题解决方案和技术支持",
    descriptionEn: "Common issues solutions and technical support",
    articles: 18,
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "community",
    icon: Users,
    title: "社区支持",
    titleEn: "Community Support",
    description: "用户论坛、讨论和经验分享",
    descriptionEn: "User forums, discussions and experience sharing",
    articles: 32,
    color: "from-teal-500 to-blue-500",
  },
];

const popularArticles = [
  {
    id: 1,
    title: "如何创建第一个项目",
    titleEn: "How to Create Your First Project",
    category: "getting-started",
    views: 15420,
    rating: 4.8,
    readTime: 5,
  },
  {
    id: 2,
    title: "用户权限管理完整指南",
    titleEn: "Complete Guide to User Permission Management",
    category: "user-guide",
    views: 12350,
    rating: 4.9,
    readTime: 8,
  },
  {
    id: 3,
    title: "API集成快速开始",
    titleEn: "API Integration Quick Start",
    category: "api-docs",
    views: 9870,
    rating: 4.7,
    readTime: 12,
  },
  {
    id: 4,
    title: "常见登录问题解决",
    titleEn: "Solving Common Login Issues",
    category: "troubleshooting",
    views: 8640,
    rating: 4.6,
    readTime: 6,
  },
];

const quickActions = [
  {
    icon: MessageCircle,
    title: "联系客服",
    titleEn: "Contact Support",
    description: "获得专业技术支持",
    descriptionEn: "Get professional technical support",
    action: "chat",
    color: "bg-blue-500",
  },
  {
    icon: Video,
    title: "观看演示",
    titleEn: "Watch Demo",
    description: "产品功能视频演示",
    descriptionEn: "Product feature video demonstrations",
    action: "demo",
    color: "bg-green-500",
  },
  {
    icon: Book,
    title: "下载指南",
    titleEn: "Download Guide",
    description: "PDF格式完整指南",
    descriptionEn: "Complete guide in PDF format",
    action: "download",
    color: "bg-purple-500",
  },
];

export default function HelpCenter() {
  const { t, locale } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  const filteredCategories = selectedCategory
    ? helpCategories.filter(cat => cat.id === selectedCategory)
    : helpCategories;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-16 md:pt-20">
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <Book className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {getContent("帮助中心", "Help Center")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {getContent("我们来帮助您", "We're Here to Help")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            {getContent(
              "找到您需要的答案，学习如何充分利用我们的平台，或联系我们的专业支持团队。",
              "Find the answers you need, learn how to make the most of our platform, or contact our expert support team."
            )}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder={getContent("搜索帮助文档...", "Search help articles...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-card/60 backdrop-blur-sm border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {quickActions.map((action, index) => (
              <button
                key={index}
                className="group p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className={`inline-flex p-3 rounded-lg ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                  {getContent(action.title, action.titleEn)}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-foreground/90 transition-colors duration-300">
                  {getContent(action.description, action.descriptionEn)}
                </p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-b from-muted/10 to-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {getContent("浏览帮助分类", "Browse Help Categories")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {getContent(
                "选择您感兴趣的分类，找到相关的帮助文档和教程。",
                "Choose the category you're interested in to find relevant help articles and tutorials."
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category, index) => (
              <Link
                key={category.id}
                href={`/help/${category.id}`}
                className="group p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20"
              >
                <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${category.color} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <category.icon className="w-8 h-8 text-white" />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {getContent(category.title, category.titleEn)}
                  </h3>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </div>

                <p className="text-muted-foreground leading-relaxed mb-4 group-hover:text-foreground/90 transition-colors duration-300">
                  {getContent(category.description, category.descriptionEn)}
                </p>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>{category.articles} {getContent("篇文章", "articles")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {getContent("热门文章", "Popular Articles")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {getContent(
                "最受用户欢迎的帮助文档，解决常见问题和使用疑惑。",
                "Most popular help articles that solve common questions and usage concerns."
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {popularArticles.map((article, index) => (
              <Link
                key={article.id}
                href={`/help/article/${article.id}`}
                className="group p-6 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl hover:bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300 line-clamp-2">
                      {getContent(article.title, article.titleEn)}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{article.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{article.readTime} {getContent("分钟", "min")}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300 flex-shrink-0 ml-4" />
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/help/articles"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-semibold"
            >
              <span>{getContent("查看所有文章", "View All Articles")}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Support Section */}
      <section className="py-20 bg-gradient-to-b from-muted/10 to-background">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
          <div className="p-12 bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-8">
              <MessageCircle className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {getContent("还没找到答案？", "Still Need Help?")}
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {getContent(
                "我们的专业支持团队随时为您提供帮助。联系我们获得个性化的技术支持。",
                "Our expert support team is here to help. Contact us for personalized technical assistance."
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-semibold"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{getContent("联系客服", "Contact Support")}</span>
              </Link>

              <Link
                href="/community"
                className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-full hover:bg-muted hover:border-primary/50 transition-all duration-300 font-semibold"
              >
                <Users className="w-4 h-4" />
                <span>{getContent("社区论坛", "Community Forum")}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

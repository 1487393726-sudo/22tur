"use client";

import { useState } from "react";
import { ChevronRight, Clock, User, CheckCircle, Play, Download, ExternalLink } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const gettingStartedSteps = [
  {
    id: 1,
    title: "创建您的账户",
    titleEn: "Create Your Account",
    description: "注册并验证您的邮箱地址",
    descriptionEn: "Sign up and verify your email address",
    duration: 2,
    completed: true,
    videoUrl: "/videos/signup-tutorial.mp4",
  },
  {
    id: 2,
    title: "完善个人资料",
    titleEn: "Complete Your Profile",
    description: "添加个人信息和偏好设置",
    descriptionEn: "Add personal information and preference settings",
    duration: 5,
    completed: true,
    videoUrl: "/videos/profile-setup.mp4",
  },
  {
    id: 3,
    title: "创建第一个项目",
    titleEn: "Create Your First Project",
    description: "学习如何创建和配置项目",
    descriptionEn: "Learn how to create and configure projects",
    duration: 8,
    completed: false,
    videoUrl: "/videos/first-project.mp4",
  },
  {
    id: 4,
    title: "邀请团队成员",
    titleEn: "Invite Team Members",
    description: "添加协作者并设置权限",
    descriptionEn: "Add collaborators and set permissions",
    duration: 6,
    completed: false,
    videoUrl: "/videos/team-setup.mp4",
  },
  {
    id: 5,
    title: "探索高级功能",
    titleEn: "Explore Advanced Features",
    description: "了解平台的强大功能",
    descriptionEn: "Discover the platform's powerful features",
    duration: 15,
    completed: false,
    videoUrl: "/videos/advanced-features.mp4",
  },
];

const quickTips = [
  {
    title: "使用键盘快捷键",
    titleEn: "Use Keyboard Shortcuts",
    description: "按 Ctrl+K 快速搜索",
    descriptionEn: "Press Ctrl+K for quick search",
    icon: "⌨️",
  },
  {
    title: "自定义仪表板",
    titleEn: "Customize Dashboard",
    description: "拖拽组件重新排列",
    descriptionEn: "Drag components to rearrange",
    icon: "🎨",
  },
  {
    title: "设置通知偏好",
    titleEn: "Set Notification Preferences",
    description: "在设置中管理通知",
    descriptionEn: "Manage notifications in settings",
    icon: "🔔",
  },
  {
    title: "使用模板",
    titleEn: "Use Templates",
    description: "快速开始新项目",
    descriptionEn: "Quick start for new projects",
    icon: "📋",
  },
];

export default function GettingStarted() {
  const { t, locale } = useLanguage();
  const [currentStep, setCurrentStep] = useState(3);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  const completedSteps = gettingStartedSteps.filter(step => step.completed).length;
  const totalSteps = gettingStartedSteps.length;
  const progress = (completedSteps / totalSteps) * 100;

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
                  {getContent("快速入门", "Getting Started")}
                </span>
              </nav>
            </div>
          </div>

          <div className="container px-4 md:px-6 max-w-6xl mx-auto py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {getContent("快速入门指南", "Getting Started Guide")}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {getContent(
              "跟随这个分步指南，快速掌握平台的核心功能，开始您的第一个项目。",
              "Follow this step-by-step guide to quickly master the platform's core features and start your first project."
            )}
          </p>
        </div>

        {/* Progress Overview */}
        <div className="mb-16">
          <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {getContent("您的进度", "Your Progress")}
                </h2>
                <p className="text-muted-foreground">
                  {getContent(
                    `已完成 ${completedSteps} / ${totalSteps} 步骤`,
                    `Completed ${completedSteps} / ${totalSteps} steps`
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary mb-1">
                  {Math.round(progress)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {getContent("完成率", "Complete")}
                </div>
              </div>
            </div>
            
            <div className="w-full bg-muted rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>
                {getContent(
                  `还有 ${totalSteps - completedSteps} 个步骤即可完成`,
                  `${totalSteps - completedSteps} more steps to complete`
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-foreground mb-8">
              {getContent("入门步骤", "Getting Started Steps")}
            </h2>
            
            <div className="space-y-6">
              {gettingStartedSteps.map((step, index) => (
                <div
                  key={step.id}
                  className={`group p-6 rounded-2xl border transition-all duration-300 ${
                    step.completed
                      ? "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30"
                      : currentStep === step.id
                      ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/10"
                      : "bg-card/40 border-border/50 hover:bg-card hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      step.completed
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {step.completed ? <CheckCircle className="w-5 h-5" /> : step.id}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {getContent(step.title, step.titleEn)}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{step.duration} {getContent("分钟", "min")}</span>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-4">
                        {getContent(step.description, step.descriptionEn)}
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                          <Play className="w-4 h-4" />
                          {getContent("观看视频", "Watch Video")}
                        </button>
                        
                        {!step.completed && (
                          <button 
                            onClick={() => setCurrentStep(step.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-muted transition-colors text-sm font-medium"
                          >
                            {getContent("开始这一步", "Start This Step")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}
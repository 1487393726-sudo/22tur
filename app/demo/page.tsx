"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw, Maximize, Calendar, Users, BarChart3, Settings, Zap, Shield, Globe, Smartphone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const demoFeatures = [
  {
    id: "dashboard",
    title: "智能仪表板",
    titleEn: "Smart Dashboard",
    description: "实时数据可视化和项目概览",
    descriptionEn: "Real-time data visualization and project overview",
    icon: BarChart3,
    color: "from-blue-500 to-cyan-500",
    duration: "2:30",
    thumbnail: "/demo/dashboard-thumb.jpg",
  },
  {
    id: "project-management",
    title: "项目管理",
    titleEn: "Project Management",
    description: "完整的项目生命周期管理",
    descriptionEn: "Complete project lifecycle management",
    icon: Calendar,
    color: "from-green-500 to-emerald-500",
    duration: "3:45",
    thumbnail: "/demo/project-thumb.jpg",
  },
  {
    id: "team-collaboration",
    title: "团队协作",
    titleEn: "Team Collaboration",
    description: "实时协作和沟通工具",
    descriptionEn: "Real-time collaboration and communication tools",
    icon: Users,
    color: "from-purple-500 to-pink-500",
    duration: "2:15",
    thumbnail: "/demo/team-thumb.jpg",
  },
  {
    id: "automation",
    title: "工作流自动化",
    titleEn: "Workflow Automation",
    description: "智能自动化提升效率",
    descriptionEn: "Smart automation to boost efficiency",
    icon: Zap,
    color: "from-orange-500 to-red-500",
    duration: "4:20",
    thumbnail: "/demo/automation-thumb.jpg",
  },
  {
    id: "security",
    title: "安全管理",
    titleEn: "Security Management",
    description: "企业级安全和权限控制",
    descriptionEn: "Enterprise-grade security and access control",
    icon: Shield,
    color: "from-indigo-500 to-purple-500",
    duration: "3:10",
    thumbnail: "/demo/security-thumb.jpg",
  },
  {
    id: "integrations",
    title: "第三方集成",
    titleEn: "Third-party Integrations",
    description: "无缝连接您的工具生态",
    descriptionEn: "Seamlessly connect your tool ecosystem",
    icon: Globe,
    color: "from-teal-500 to-blue-500",
    duration: "2:50",
    thumbnail: "/demo/integrations-thumb.jpg",
  },
];

const interactiveDemo = {
  title: "交互式产品演示",
  titleEn: "Interactive Product Demo",
  description: "亲自体验我们的核心功能",
  descriptionEn: "Experience our core features hands-on",
  steps: [
    {
      title: "创建项目",
      titleEn: "Create Project",
      description: "快速创建新项目",
      descriptionEn: "Quickly create a new project",
    },
    {
      title: "添加团队",
      titleEn: "Add Team",
      description: "邀请团队成员",
      descriptionEn: "Invite team members",
    },
    {
      title: "设置任务",
      titleEn: "Set Tasks",
      description: "创建和分配任务",
      descriptionEn: "Create and assign tasks",
    },
    {
      title: "查看进度",
      titleEn: "View Progress",
      description: "实时跟踪项目进度",
      descriptionEn: "Track project progress in real-time",
    },
  ],
};

const useCases = [
  {
    title: "初创公司",
    titleEn: "Startups",
    description: "快速启动和扩展业务",
    descriptionEn: "Quickly launch and scale your business",
    icon: "🚀",
    benefits: ["快速部署", "成本效益", "灵活扩展"],
    benefitsEn: ["Quick deployment", "Cost-effective", "Flexible scaling"],
  },
  {
    title: "中小企业",
    titleEn: "SMBs",
    description: "提升运营效率和协作",
    descriptionEn: "Improve operational efficiency and collaboration",
    icon: "🏢",
    benefits: ["流程优化", "团队协作", "数据洞察"],
    benefitsEn: ["Process optimization", "Team collaboration", "Data insights"],
  },
  {
    title: "大型企业",
    titleEn: "Enterprise",
    description: "企业级安全和合规",
    descriptionEn: "Enterprise-grade security and compliance",
    icon: "🏛️",
    benefits: ["高级安全", "合规管理", "定制集成"],
    benefitsEn: ["Advanced security", "Compliance management", "Custom integrations"],
  },
];

export default function Demo() {
  const { t, locale } = useLanguage();
  const [selectedFeature, setSelectedFeature] = useState(demoFeatures[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      <div className="pt-16 md:pt-20 bg-background">
        <div className="text-foreground">
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

        <div className="relative container px-4 md:px-6 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-sm mb-8">
            <Play className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {getContent("产品演示", "Product Demo")}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              {getContent("亲身体验我们的产品", "Experience Our Product")}
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
            {getContent(
              "通过互动演示和视频教程，深入了解我们平台的强大功能，看看它如何帮助您的团队提升效率。",
              "Explore our platform's powerful features through interactive demos and video tutorials, and see how it can help your team boost productivity."
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-semibold">
              <Play className="w-4 h-4" />
              {getContent("开始演示", "Start Demo")}
            </button>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-full hover:bg-muted hover:border-primary/50 transition-all duration-300 font-semibold"
            >
              {getContent("免费试用", "Free Trial")}
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-20 bg-gradient-to-b from-muted/10 to-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {getContent(interactiveDemo.title, interactiveDemo.titleEn)}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {getContent(interactiveDemo.description, interactiveDemo.descriptionEn)}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Interface */}
            <div className="relative">
              <div className="bg-card/60 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-2xl">
                {/* Mock Interface Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {getContent("演示环境", "Demo Environment")}
                  </div>
                </div>

                {/* Mock Interface Content */}
                <div className="space-y-4">
                  {interactiveDemo.steps.map((step, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                        currentStep === index
                          ? "bg-primary/10 border-primary/30"
                          : "bg-muted/30 border-border/50 hover:bg-muted/50"
                      }`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          currentStep >= index
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">
                            {getContent(step.title, step.titleEn)}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {getContent(step.description, step.descriptionEn)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Demo Controls */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                  <button
                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                    disabled={currentStep === 0}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {getContent("上一步", "Previous")}
                  </button>
                  <div className="flex items-center gap-2">
                    <button className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                      <Maximize className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentStep(Math.min(interactiveDemo.steps.length - 1, currentStep + 1))}
                    disabled={currentStep === interactiveDemo.steps.length - 1}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {getContent("下一步", "Next")}
                  </button>
                </div>
              </div>
            </div>

            {/* Demo Description */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  {getContent("跟随引导体验", "Follow the Guided Experience")}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {getContent(
                    "我们的交互式演示将引导您完成平台的核心功能。每个步骤都经过精心设计，让您快速了解如何使用我们的工具来提升工作效率。",
                    "Our interactive demo guides you through the platform's core features. Each step is carefully designed to help you quickly understand how to use our tools to boost productivity."
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary mb-1">5分钟</div>
                  <div className="text-sm text-muted-foreground">
                    {getContent("完整演示时长", "Complete demo duration")}
                  </div>
                </div>
                <div className="p-4 bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl">
                  <div className="text-2xl font-bold text-primary mb-1">4个</div>
                  <div className="text-sm text-muted-foreground">
                    {getContent("核心功能展示", "Core features showcased")}
                  </div>
                </div>
              </div>

              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-semibold"
              >
                {getContent("立即开始免费试用", "Start Free Trial Now")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Videos Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {getContent("功能演示视频", "Feature Demo Videos")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {getContent(
                "深入了解每个功能模块，通过详细的视频演示掌握使用技巧。",
                "Dive deep into each feature module and master usage techniques through detailed video demonstrations."
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className="group cursor-pointer"
                onClick={() => setSelectedFeature(feature)}
              >
                <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20">
                  {/* Video Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20`} />
                    <div className="relative z-10 flex items-center justify-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-6 h-6 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      {feature.duration}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${feature.color}`}>
                        <feature.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                        {getContent(feature.title, feature.titleEn)}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                      {getContent(feature.description, feature.descriptionEn)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-b from-muted/10 to-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                {getContent("适用场景", "Use Cases")}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {getContent(
                "无论您是初创公司、中小企业还是大型企业，我们的平台都能满足您的需求。",
                "Whether you're a startup, SMB, or enterprise, our platform meets your needs."
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="group p-8 bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl hover:bg-card hover:border-primary/40 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/20"
              >
                <div className="text-4xl mb-6">{useCase.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                  {getContent(useCase.title, useCase.titleEn)}
                </h3>
                <p className="text-muted-foreground mb-6 leading-relaxed group-hover:text-foreground/90 transition-colors duration-300">
                  {getContent(useCase.description, useCase.descriptionEn)}
                </p>
                <div className="space-y-2">
                  {(locale === "en" ? useCase.benefitsEn : useCase.benefits).map((benefit, benefitIndex) => (
                    <div key={benefitIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
          <div className="p-12 bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl">
            <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-8">
              <Smartphone className="w-8 h-8 text-primary" />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {getContent("准备开始了吗？", "Ready to Get Started?")}
            </h2>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {getContent(
                "立即注册免费试用，体验完整功能。无需信用卡，30天免费使用。",
                "Sign up for a free trial now and experience the full features. No credit card required, 30 days free."
              )}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full hover:shadow-xl hover:shadow-primary/50 hover:scale-105 transition-all duration-300 font-semibold"
              >
                {getContent("开始免费试用", "Start Free Trial")}
              </Link>

              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-card border border-border text-foreground rounded-full hover:bg-muted hover:border-primary/50 transition-all duration-300 font-semibold"
              >
                {getContent("联系销售", "Contact Sales")}
              </Link>
            </div>
          </div>
        </div>
      </section>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

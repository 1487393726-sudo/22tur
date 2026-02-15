"use client";

import { ArrowRight, Phone, Mail, MessageCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/context";
import Link from "next/link";

export function EnhancedCTASection() {
  const { locale } = useLanguage();

  const contactMethods = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: locale === "en" ? "Call Us" : "电话咨询",
      description: locale === "en" ? "Speak directly with our team" : "直接与我们的团队交谈",
      action: "/contact",
      color: "text-blue-500"
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: locale === "en" ? "Email Us" : "邮件联系",
      description: locale === "en" ? "Send us your project details" : "发送您的项目详情",
      action: "/contact",
      color: "text-green-500"
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: locale === "en" ? "Live Chat" : "在线咨询",
      description: locale === "en" ? "Get instant answers" : "获得即时回答",
      action: "/contact",
      color: "text-white500"
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container px-4 md:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {locale === "en" ? "Ready to Start Your Project?" : "准备开始您的项目了吗？"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {locale === "en" 
              ? "Let's discuss your requirements and create something great together. We're here to help bring your ideas to life."
              : "让我们讨论您的需求，一起创造出色的作品。我们在这里帮助您实现想法。"
            }
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method, index) => (
            <Link
              key={index}
              href={method.action}
              className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <div className={`inline-flex p-3 rounded-lg bg-muted mb-4 ${method.color}`}>
                {method.icon}
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                {method.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {method.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Main CTA */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/portfolio"
              className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
            >
              {locale === "en" ? "View Our Work" : "查看我们的作品"}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-card border border-border text-foreground rounded-lg font-medium transition-all duration-300 hover:bg-muted hover:border-primary/50"
            >
              {locale === "en" ? "Get a Quote" : "获取报价"}
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-muted-foreground">
            {locale === "en" 
              ? "Free consultation • No obligation • Clear pricing"
              : "免费咨询 • 无义务 • 透明定价"
            }
          </p>
        </div>
      </div>
    </section>
  );
}
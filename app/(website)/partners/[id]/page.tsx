"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { useParams } from "next/navigation";
import { 
  Building2, 
  Users, 
  Globe, 
  Award, 
  Calendar,
  ExternalLink,
  Star,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Target,
  Briefcase
} from "lucide-react";
import Link from "next/link";

// 合作伙伴详细数据
const getPartnerData = (id: string) => {
  const partnersData: { [key: string]: any } = {
    "1": {
      id: 1,
      name: "Microsoft Corporation",
      nameZh: "微软公司",
      logo: "/logos/microsoft.svg",
      category: "Technology",
      categoryZh: "科技",
      industry: "Cloud Computing & Software",
      industryZh: "云计算与软件",
      location: "Seattle, USA",
      locationZh: "美国西雅图",
      website: "https://microsoft.com",
      email: "partnerships@microsoft.com",
      phone: "+1-425-882-8080",
      partnerSince: "2019",
      employees: "221,000+",
      revenue: "$211.9B",
      description: "Microsoft Corporation is an American multinational technology corporation headquartered in Redmond, Washington. Microsoft's best-known software products are the Windows line of operating systems, the Microsoft Office suite, and the Internet Explorer and Edge web browsers.",
      descriptionZh: "微软公司是一家总部位于华盛顿州雷德蒙德的美国跨国技术公司。微软最知名的软件产品包括Windows操作系统系列、Microsoft Office套件以及Internet Explorer和Edge网络浏览器。",
      rating: 4.9,
      status: "Active",
      featured: true,
      projects: [
        {
          name: "Azure Integration Platform",
          nameZh: "Azure集成平台",
          year: "2023",
          value: "$2.5M",
          status: "Completed",
          description: "Complete migration and integration of enterprise systems to Microsoft Azure cloud platform.",
          descriptionZh: "将企业系统完全迁移并集成到Microsoft Azure云平台。"
        },
        {
          name: "Office 365 Migration",
          nameZh: "Office 365迁移",
          year: "2022",
          value: "$1.8M",
          status: "Completed",
          description: "Large-scale migration of productivity tools to Office 365 for improved collaboration.",
          descriptionZh: "大规模迁移生产力工具到Office 365以改善协作。"
        },
        {
          name: "Teams Integration",
          nameZh: "Teams集成",
          year: "2024",
          value: "$1.2M",
          status: "In Progress",
          description: "Custom Microsoft Teams integration for enhanced communication workflows.",
          descriptionZh: "定制Microsoft Teams集成以增强通信工作流程。"
        }
      ],
      achievements: [
        {
          title: "Gold Partner Status",
          titleZh: "金牌合作伙伴地位",
          year: "2023",
          description: "Achieved Microsoft Gold Partner certification for cloud solutions."
        },
        {
          title: "Innovation Award",
          titleZh: "创新奖",
          year: "2022",
          description: "Received Microsoft Innovation Partner Award for outstanding solutions."
        }
      ],
      services: [
        "Cloud Migration",
        "Azure Development",
        "Office 365 Integration",
        "Teams Customization",
        "Power Platform Solutions"
      ],
      servicesZh: [
        "云迁移",
        "Azure开发",
        "Office 365集成",
        "Teams定制",
        "Power Platform解决方案"
      ],
      testimonial: {
        text: "Our partnership with this team has been exceptional. Their expertise in Microsoft technologies and commitment to excellence has helped us achieve remarkable results.",
        textZh: "与这个团队的合作非常出色。他们在微软技术方面的专业知识和对卓越的承诺帮助我们取得了显著的成果。",
        author: "John Smith",
        position: "CTO, Microsoft",
        positionZh: "首席技术官，微软"
      }
    }
  };

  return partnersData[id] || null;
};

export default function PartnerDetailPage() {
  const { locale } = useLanguage();
  const params = useParams();
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const partnerData = getPartnerData(params.id as string);
    setPartner(partnerData);
    setLoading(false);
  }, [params.id]);

  const getContent = (zh: string, en: string) => {
    return locale === "en" ? en : zh;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">
            {locale === "en" ? "Loading..." : "加载中..."}
          </p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {locale === "en" ? "Partner Not Found" : "未找到合作伙伴"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {locale === "en" 
              ? "The partner you're looking for doesn't exist or has been removed."
              : "您查找的合作伙伴不存在或已被删除。"
            }
          </p>
          <Link
            href="/partners"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {locale === "en" ? "Back to Partners" : "返回合作伙伴"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
        {/* 返回按钮 */}
        <div className="border-b border-border">
          <div className="container px-4 md:px-6 max-w-7xl mx-auto py-4">
            <Link
              href="/partners"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {locale === "en" ? "Back to Partners" : "返回合作伙伴"}
            </Link>
          </div>
        </div>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* 合作伙伴信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {getContent(partner.nameZh, partner.name)}
                  </h1>
                  <p className="text-lg text-muted-foreground mb-2">
                    {getContent(partner.industryZh, partner.industry)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-medium">{partner.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {locale === "en" ? "Partner since" : "合作始于"} {partner.partnerSince}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed mb-8">
                {getContent(partner.descriptionZh, partner.description)}
              </p>

              {/* 快速统计 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">{partner.projects.length}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "en" ? "Projects" : "项目"}
                  </div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">{partner.employees}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "en" ? "Employees" : "员工"}
                  </div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">{partner.revenue}</div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "en" ? "Revenue" : "营收"}
                  </div>
                </div>
                <div className="text-center p-4 bg-card rounded-lg border border-border">
                  <div className="text-2xl font-bold text-primary mb-1">
                    {new Date().getFullYear() - parseInt(partner.partnerSince)}+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {locale === "en" ? "Years" : "年"}
                  </div>
                </div>
              </div>
            </div>

            {/* 联系信息卡片 */}
            <div className="w-full md:w-80">
              <div className="p-6 bg-card rounded-xl border border-border">
                <h3 className="font-semibold mb-4">
                  {locale === "en" ? "Contact Information" : "联系信息"}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm">
                      {getContent(partner.locationZh, partner.location)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground" />
                    <a href={`mailto:${partner.email}`} className="text-sm text-primary hover:underline">
                      {partner.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <a href={`tel:${partner.phone}`} className="text-sm text-primary hover:underline">
                      {partner.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {locale === "en" ? "Visit Website" : "访问网站"}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 服务能力 */}
      <section className="py-16">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">
            {locale === "en" ? "Services & Capabilities" : "服务与能力"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(locale === "en" ? partner.services : partner.servicesZh).map((service: string, index: number) => (
              <div key={index} className="p-4 bg-card rounded-lg border border-border text-center">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <span className="text-sm font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 项目展示 */}
      <section className="py-16 bg-muted/20">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Briefcase className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">
              {locale === "en" ? "Project Portfolio" : "项目组合"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partner.projects.map((project: any, index: number) => (
              <div key={index} className="p-6 bg-card rounded-xl border border-border">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">
                      {getContent(project.nameZh, project.name)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{project.year}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {project.status === 'Completed' 
                      ? (locale === "en" ? "Completed" : "已完成")
                      : (locale === "en" ? "In Progress" : "进行中")
                    }
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {getContent(project.descriptionZh, project.description)}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-green-600">{project.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {locale === "en" ? "Enterprise" : "企业级"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 成就与奖项 */}
      <section className="py-16">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <Award className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">
              {locale === "en" ? "Achievements & Awards" : "成就与奖项"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partner.achievements.map((achievement: any, index: number) => (
              <div key={index} className="p-6 bg-card rounded-xl border border-border">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">
                      {getContent(achievement.titleZh, achievement.title)}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{achievement.year}</p>
                    <p className="text-sm">{achievement.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 客户评价 */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4 md:px-6 max-w-7xl mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">
              {locale === "en" ? "What They Say" : "客户评价"}
            </h2>
            
            <div className="p-8 bg-card rounded-2xl border border-border">
              <div className="flex justify-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-lg text-muted-foreground mb-6 italic">
                "{getContent(partner.testimonial.textZh, partner.testimonial.text)}"
              </blockquote>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{partner.testimonial.author}</div>
                  <div className="text-sm text-muted-foreground">
                    {getContent(partner.testimonial.positionZh, partner.testimonial.position)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
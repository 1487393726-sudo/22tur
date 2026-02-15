import { NextRequest, NextResponse } from "next/server";

// 详细合作伙伴数据
const getPartnerById = (id: string) => {
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
    },
    "2": {
      id: 2,
      name: "Google LLC",
      nameZh: "谷歌公司",
      logo: "/logos/google.svg",
      category: "Technology",
      categoryZh: "科技",
      industry: "Search & AI Technology",
      industryZh: "搜索与AI技术",
      location: "Mountain View, USA",
      locationZh: "美国山景城",
      website: "https://google.com",
      email: "partners@google.com",
      phone: "+1-650-253-0000",
      partnerSince: "2020",
      employees: "174,000+",
      revenue: "$307.4B",
      description: "Google LLC is an American multinational technology company focusing on search engine technology, online advertising, cloud computing, computer software, quantum computing, e-commerce, artificial intelligence, and consumer electronics.",
      descriptionZh: "谷歌有限责任公司是一家美国跨国技术公司，专注于搜索引擎技术、在线广告、云计算、计算机软件、量子计算、电子商务、人工智能和消费电子产品。",
      rating: 4.8,
      status: "Active",
      featured: true,
      projects: [
        {
          name: "Google Cloud Migration",
          nameZh: "Google云迁移",
          year: "2023",
          value: "$3.2M",
          status: "Completed",
          description: "Enterprise-wide migration to Google Cloud Platform with advanced AI integration.",
          descriptionZh: "企业级迁移到Google云平台，集成先进的AI技术。"
        },
        {
          name: "AI/ML Platform Development",
          nameZh: "AI/ML平台开发",
          year: "2024",
          value: "$2.1M",
          status: "In Progress",
          description: "Custom AI and machine learning platform using Google's advanced technologies.",
          descriptionZh: "使用Google先进技术的定制AI和机器学习平台。"
        }
      ],
      achievements: [
        {
          title: "Premier Partner Status",
          titleZh: "首席合作伙伴地位",
          year: "2023",
          description: "Achieved Google Cloud Premier Partner status for exceptional performance."
        }
      ],
      services: [
        "Google Cloud Migration",
        "AI/ML Development",
        "BigQuery Analytics",
        "Kubernetes Solutions",
        "Firebase Development"
      ],
      servicesZh: [
        "Google云迁移",
        "AI/ML开发",
        "BigQuery分析",
        "Kubernetes解决方案",
        "Firebase开发"
      ],
      testimonial: {
        text: "The collaboration has been outstanding. Their deep understanding of Google technologies has accelerated our digital transformation journey significantly.",
        textZh: "合作非常出色。他们对Google技术的深入理解显著加速了我们的数字化转型之旅。",
        author: "Sarah Johnson",
        position: "VP Engineering, Google",
        positionZh: "工程副总裁，谷歌"
      }
    }
  };

  return partnersData[id] || null;
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const partner = getPartnerById(params.id);

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Partner detail API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partner details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // 这里可以添加更新合作伙伴的逻辑
    // 实际应用中会连接到数据库
    
    return NextResponse.json({
      success: true,
      message: 'Partner updated successfully',
      data: { id: params.id, ...body }
    });
  } catch (error) {
    console.error('Update partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 这里可以添加删除合作伙伴的逻辑
    // 实际应用中会连接到数据库
    
    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Delete partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
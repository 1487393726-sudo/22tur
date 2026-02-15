import { NextRequest, NextResponse } from "next/server";

// 合作伙伴数据
const partnersData = [
  {
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
    description: "Global leader in cloud computing, productivity software, and enterprise solutions.",
    descriptionZh: "云计算、生产力软件和企业解决方案的全球领导者。",
    projects: [
      {
        name: "Azure Integration Platform",
        nameZh: "Azure集成平台",
        year: "2023",
        value: "$2.5M"
      },
      {
        name: "Office 365 Migration",
        nameZh: "Office 365迁移",
        year: "2022",
        value: "$1.8M"
      }
    ],
    rating: 4.9,
    status: "Active",
    featured: true
  },
  {
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
    description: "Leading technology company specializing in search, advertising, and cloud services.",
    descriptionZh: "专注于搜索、广告和云服务的领先技术公司。",
    projects: [
      {
        name: "Google Cloud Migration",
        nameZh: "Google云迁移",
        year: "2023",
        value: "$3.2M"
      }
    ],
    rating: 4.8,
    status: "Active",
    featured: true
  },
  {
    id: 3,
    name: "Amazon Web Services",
    nameZh: "亚马逊网络服务",
    logo: "/logos/amazon.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Cloud Computing & E-commerce",
    industryZh: "云计算与电子商务",
    location: "Seattle, USA",
    locationZh: "美国西雅图",
    website: "https://aws.amazon.com",
    email: "partners@aws.amazon.com",
    phone: "+1-206-266-1000",
    partnerSince: "2018",
    employees: "1,500,000+",
    revenue: "$514.0B",
    description: "World's most comprehensive and broadly adopted cloud platform.",
    descriptionZh: "世界上最全面、应用最广泛的云平台。",
    projects: [
      {
        name: "AWS Infrastructure Setup",
        nameZh: "AWS基础设施搭建",
        year: "2023",
        value: "$4.1M"
      }
    ],
    rating: 4.7,
    status: "Active",
    featured: false
  },
  {
    id: 4,
    name: "Apple Inc.",
    nameZh: "苹果公司",
    logo: "/logos/apple.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Consumer Electronics",
    industryZh: "消费电子产品",
    location: "Cupertino, USA",
    locationZh: "美国库比蒂诺",
    website: "https://apple.com",
    email: "partnerships@apple.com",
    phone: "+1-408-996-1010",
    partnerSince: "2021",
    employees: "164,000+",
    revenue: "$394.3B",
    description: "Innovative technology company known for premium consumer electronics.",
    descriptionZh: "以高端消费电子产品闻名的创新技术公司。",
    projects: [
      {
        name: "iOS App Development",
        nameZh: "iOS应用开发",
        year: "2023",
        value: "$1.9M"
      }
    ],
    rating: 4.9,
    status: "Active",
    featured: false
  },
  {
    id: 5,
    name: "Meta Platforms",
    nameZh: "Meta平台",
    logo: "/logos/meta.svg",
    category: "Technology",
    categoryZh: "科技",
    industry: "Social Media & VR",
    industryZh: "社交媒体与虚拟现实",
    location: "Menlo Park, USA",
    locationZh: "美国门洛帕克",
    website: "https://meta.com",
    email: "partnerships@meta.com",
    phone: "+1-650-543-4800",
    partnerSince: "2022",
    employees: "77,000+",
    revenue: "$134.9B",
    description: "Leading social technology company building the next generation of social connection.",
    descriptionZh: "构建下一代社交连接的领先社交技术公司。",
    projects: [
      {
        name: "VR Experience Platform",
        nameZh: "VR体验平台",
        year: "2023",
        value: "$2.8M"
      }
    ],
    rating: 4.6,
    status: "Active",
    featured: false
  },
  {
    id: 6,
    name: "Tesla Inc.",
    nameZh: "特斯拉公司",
    logo: "/logos/tesla.svg",
    category: "Automotive",
    categoryZh: "汽车",
    industry: "Electric Vehicles & Energy",
    industryZh: "电动汽车与能源",
    location: "Austin, USA",
    locationZh: "美国奥斯汀",
    website: "https://tesla.com",
    email: "partnerships@tesla.com",
    phone: "+1-512-516-8177",
    partnerSince: "2021",
    employees: "127,000+",
    revenue: "$96.8B",
    description: "Leading electric vehicle and clean energy company.",
    descriptionZh: "领先的电动汽车和清洁能源公司。",
    projects: [
      {
        name: "Charging Network Integration",
        nameZh: "充电网络集成",
        year: "2023",
        value: "$3.5M"
      }
    ],
    rating: 4.8,
    status: "Active",
    featured: true
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');

    let filteredPartners = [...partnersData];

    // 按类别筛选
    if (category && category !== 'all') {
      filteredPartners = filteredPartners.filter(partner => 
        partner.category === category
      );
    }

    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPartners = filteredPartners.filter(partner =>
        partner.name.toLowerCase().includes(searchLower) ||
        partner.nameZh.includes(search) ||
        partner.industry.toLowerCase().includes(searchLower) ||
        partner.industryZh.includes(search)
      );
    }

    // 按特色筛选
    if (featured === 'true') {
      filteredPartners = filteredPartners.filter(partner => partner.featured);
    }

    return NextResponse.json({
      success: true,
      data: filteredPartners,
      total: filteredPartners.length
    });
  } catch (error) {
    console.error('Partners API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 这里可以添加新合作伙伴的逻辑
    // 实际应用中会连接到数据库
    
    return NextResponse.json({
      success: true,
      message: 'Partner created successfully',
      data: { id: Date.now(), ...body }
    });
  } catch (error) {
    console.error('Create partner error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}
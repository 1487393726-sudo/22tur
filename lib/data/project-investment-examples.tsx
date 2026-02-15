import { ProjectInvestmentCard } from "@/components/sections/project-investment-card";

export const projectInvestmentExamples = [
  {
    industry: "电商平台",
    description: "基于Next.js和React的现代化电商解决方案",
    startupCost: "￥50,000 - ￥100,000",
    planningTime: "2-4周",
    buildTime: "3-6个月",
    teamSize: 5,
    positions: [
      "项目经理",
      "前端开发工程师",
      "后端开发工程师",
      "UI/UX设计师",
      "测试工程师",
    ],

    roi: "12-18个月",
    details: [
      "响应式设计，支持移动端和桌面端",
      "集成支付宝、微信支付等主流支付方式",
      "完整的商品管理、订单管理系统",
      "SEO优化，提升搜索引擎排名",
      "7x24小时技术支持和维护",
    ],
  },
  {
    industry: "在线教育平台",
    description: "功能丰富的在线学习和课程管理系统",
    startupCost: "￥80,000 - ￥150,000",
    planningTime: "4-6周",
    buildTime: "6-8个月",
    teamSize: 7,
    positions: [
      "教育产品经理",
      "前端架构师",
      "全栈开发工程师",
      "UI/UX设计师",
      "视频技术专家",
      "数据分析师",
      "测试工程师",
    ],

    roi: "18-24个月",
    details: [
      "直播授课和录播课程管理",
      "在线作业和考试系统",
      "学生学习进度跟踪",
      "多种课程收费模式",
      "师生互动和学习社区",
    ],
  },
  {
    industry: "企业管理系统",
    description: "定制化的企业资源规划和管理平台",
    startupCost: "￥120,000 - ￥300,000",
    planningTime: "6-8周",
    buildTime: "8-12个月",
    teamSize: 10,
    positions: [
      "企业解决方案架构师",
      "项目经理",
      "前端团队负责人",
      "后端团队负责人",
      "数据库管理员",
      "UI/UX设计师",
      "业务分析师",
      "开发工程师×2",
      "质量保证工程师",
    ],

    roi: "24-36个月",
    details: [
      "企业流程自动化和优化",
      "数据可视化和报表分析",
      "权限管理和安全控制",
      "多部门协同工作平台",
      "可扩展的微服务架构",
    ],
  },
  {
    industry: "社交媒体应用",
    description: "创新的移动端社交平台应用",
    startupCost: "￥60,000 - ￥120,000",
    planningTime: "3-5周",
    buildTime: "4-7个月",
    teamSize: 6,
    positions: [
      "移动产品经理",
      "iOS开发工程师",
      "Android开发工程师",
      "后端开发工程师",
      "UI/UX设计师",
      "测试工程师",
    ],

    roi: "15-20个月",
    details: [
      "原生iOS和Android应用",
      "实时消息和推送通知",
      "用户动态和内容分享",
      "好友和群组管理",
      "内容审核和安全机制",
    ],
  },
  {
    industry: "SaaS服务平台",
    description: "多租户的软件即服务平台解决方案",
    startupCost: "￥100,000 - ￥200,000",
    planningTime: "5-7周",
    buildTime: "7-10个月",
    teamSize: 8,
    positions: [
      "SaaS产品经理",
      "云架构师",
      "全栈开发工程师×2",
      "DevOps工程师",
      "UI/UX设计师",
      "数据安全专家",
      "客户成功经理",
    ],

    roi: "20-30个月",
    details: [
      "多租户架构设计",
      "订阅和计费系统",
      "自动扩展和负载均衡",
      "数据隔离和安全性",
      "API集成和第三方服务",
    ],
  },
];

export function ProjectInvestmentShowcase() {
  return (
    <div className="container mx-auto px-4 py-8" data-oid="b40ds1u">
      <div className="text-center mb-12" data-oid=":mdwcxa">
        <h1 className="text-4xl font-bold mb-4" data-oid="vtvvhbe">
          行业项目投资规划
        </h1>
        <p
          className="text-xl text-gray-600 max-w-3xl mx-auto"
          data-oid="ggx5e--"
        >
          探索不同行业数字化项目的投资规划，包括启动成本、时间规划、人力资源需求和预期回报率。
        </p>
      </div>

      <div className="space-y-8" data-oid="9iu2vq3">
        {projectInvestmentExamples.map((project, index) => (
          <ProjectInvestmentCard
            key={index}
            {...project}
            className="mx-auto"
            data-oid="r2783gn"
          />
        ))}
      </div>
    </div>
  );
}

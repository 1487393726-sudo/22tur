/**
 * 官网导航默认配置
 * 定义菜单结构、底部导航、社交链接等
 */

import type {
  NavigationConfig,
  NavMenuItem,
  BottomNavItem,
  SocialLink,
} from "@/types/navigation";

// ============ 服务菜单配置 ============
const servicesMenu: NavMenuItem = {
  id: "services",
  label: "服务",
  labelEn: "Services",
  labelUg: "مۇلازىمەتلەر",
  type: "mega-menu",
  children: [
    {
      id: "design-services",
      title: "设计服务",
      titleEn: "Design Services",
      titleUg: "لايىھەلەش مۇلازىمىتى",
      items: [
        {
          id: "brand-design",
          label: "品牌设计",
          labelEn: "Brand Design",
          labelUg: "ماركا لايىھەلەش",
          href: "/services/brand-design",
          description: "品牌标识、VI系统设计",
          descriptionEn: "Brand identity and VI system design",
          descriptionUg: "ماركا بەلگىسى ۋە VI سىستېما لايىھەلەش",
          icon: "Palette",
        },
        {
          id: "ui-ux-design",
          label: "UI/UX设计",
          labelEn: "UI/UX Design",
          labelUg: "UI/UX لايىھەلەش",
          href: "/services/ui-ux",
          description: "用户界面与体验设计",
          descriptionEn: "User interface and experience design",
          descriptionUg: "ئىشلەتكۈچى كۆرۈنمە يۈزى ۋە تەجرىبە لايىھەلەش",
          icon: "Layout",
        },
        {
          id: "visual-design",
          label: "视觉设计",
          labelEn: "Visual Design",
          labelUg: "كۆرۈنۈش لايىھەلەش",
          href: "/services/visual",
          description: "平面设计、插画、动效",
          descriptionEn: "Graphic design, illustration, motion",
          descriptionUg: "گرافىك لايىھەلەش، رەسىم، ھەرىكەت",
          icon: "Image",
        },
      ],
    },
    {
      id: "dev-services",
      title: "开发服务",
      titleEn: "Development Services",
      titleUg: "ئېچىش مۇلازىمىتى",
      items: [
        {
          id: "web-dev",
          label: "网站开发",
          labelEn: "Web Development",
          labelUg: "تور بېكەت ئېچىش",
          href: "/services/web-development",
          description: "企业官网、电商平台开发",
          descriptionEn: "Corporate websites, e-commerce platforms",
          descriptionUg: "كارخانا تور بېكىتى، ئېلېكترون سودا سۇپىسى",
          icon: "Globe",
        },
        {
          id: "mobile-app",
          label: "移动应用",
          labelEn: "Mobile Apps",
          labelUg: "يانفون ئەپلىرى",
          href: "/services/mobile-app",
          description: "iOS/Android应用开发",
          descriptionEn: "iOS/Android app development",
          descriptionUg: "iOS/Android ئەپ ئېچىش",
          icon: "Smartphone",
        },
        {
          id: "custom-system",
          label: "系统定制",
          labelEn: "Custom Systems",
          labelUg: "سىستېما خاسلاشتۇرۇش",
          href: "/services/custom-system",
          description: "企业管理系统定制开发",
          descriptionEn: "Enterprise management system development",
          descriptionUg: "كارخانا باشقۇرۇش سىستېمىسى ئېچىش",
          icon: "Server",
        },
      ],
    },
    {
      id: "shop-services",
      title: "商城",
      titleEn: "Shop",
      titleUg: "دۇكان",
      items: [
        {
          id: "livestream-equipment",
          label: "直播设备",
          labelEn: "Livestream Equipment",
          labelUg: "جانلىق يېتەكلەش ئۈسكۈنىلىرى",
          href: "/livestream-equipment",
          description: "专业直播设备套餐",
          descriptionEn: "Professional livestream equipment packages",
          descriptionUg: "كەسپىي جانلىق يېتەكلەش ئۈسكۈنە توپلىمى",
          icon: "Video",
        },
        {
          id: "marketplace",
          label: "二手市场",
          labelEn: "Marketplace",
          labelUg: "ئىككىنچى قول بازىرى",
          href: "/marketplace",
          description: "二手设备交易平台",
          descriptionEn: "Second-hand equipment marketplace",
          descriptionUg: "ئىككىنچى قول ئۈسكۈنە سودا سۇپىسى",
          icon: "ShoppingBag",
        },
      ],
    },
    {
      id: "investment-services",
      title: "投资",
      titleEn: "Investment",
      titleUg: "مايە سېلىش",
      items: [
        {
          id: "investment-opportunities",
          label: "投资机会",
          labelEn: "Investment Opportunities",
          labelUg: "مايە سېلىش پۇرسىتى",
          href: "/investment-opportunities",
          description: "探索优质投资项目",
          descriptionEn: "Explore quality investment projects",
          descriptionUg: "سۈپەتلىك مايە سېلىش تۈرلىرىنى ئىزدەش",
          icon: "TrendingUp",
          requireAuth: true,
        },
        {
          id: "investor-portal",
          label: "投资者门户",
          labelEn: "Investor Portal",
          labelUg: "مايىدار بوغۇزى",
          href: "/investor-portal",
          description: "投资管理与收益追踪",
          descriptionEn: "Investment management and returns tracking",
          descriptionUg: "مايە باشقۇرۇش ۋە پايدا ئىز قوغلاش",
          icon: "BarChart3",
          requireAuth: true,
        },
      ],
    },
    {
      id: "enterprise-services",
      title: "企业服务",
      titleEn: "Enterprise Services",
      titleUg: "كارخانا مۇلازىمىتى",
      items: [
        {
          id: "brand-consistency",
          label: "品牌一致性",
          labelEn: "Brand Consistency",
          labelUg: "ماركا بىردەكلىكى",
          href: "/brand-consistency",
          description: "企业品牌管理服务",
          descriptionEn: "Enterprise brand management services",
          descriptionUg: "كارخانا ماركا باشقۇرۇش مۇلازىمىتى",
          icon: "Shield",
        },
        {
          id: "consulting",
          label: "咨询服务",
          labelEn: "Consulting",
          labelUg: "مەسلىھەت مۇلازىمىتى",
          href: "/consulting",
          description: "数字化转型咨询",
          descriptionEn: "Digital transformation consulting",
          descriptionUg: "رەقەملىك ئۆزگەرتىش مەسلىھىتى",
          icon: "MessageSquare",
        },
      ],
    },
  ],
};

// ============ 资源菜单配置 ============
const resourcesMenu: NavMenuItem = {
  id: "resources",
  label: "资源",
  labelEn: "Resources",
  labelUg: "مەنبەلەر",
  type: "mega-menu",
  children: [
    {
      id: "learn",
      title: "学习",
      titleEn: "Learn",
      titleUg: "ئۆگىنىش",
      items: [
        {
          id: "blog",
          label: "博客",
          labelEn: "Blog",
          labelUg: "بىلوگ",
          href: "/blog",
          description: "行业资讯与技术分享",
          descriptionEn: "Industry news and tech insights",
          descriptionUg: "تارماق خەۋەرلىرى ۋە تېخنىكا ئورتاقلىشىش",
          icon: "BookOpen",
        },
        {
          id: "help-center",
          label: "帮助中心",
          labelEn: "Help Center",
          labelUg: "ياردەم مەركىزى",
          href: "/help",
          description: "常见问题与使用指南",
          descriptionEn: "FAQs and user guides",
          descriptionUg: "كۆپ سورالغان سوئاللار ۋە ئىشلىتىش قوللانمىسى",
          icon: "HelpCircle",
        },
      ],
    },
    {
      id: "business",
      title: "商务",
      titleEn: "Business",
      titleUg: "سودا",
      items: [
        {
          id: "pricing",
          label: "定价",
          labelEn: "Pricing",
          labelUg: "باھا",
          href: "/pricing",
          description: "服务套餐与价格",
          descriptionEn: "Service packages and pricing",
          descriptionUg: "مۇلازىمەت توپلىمى ۋە باھاسى",
          icon: "CreditCard",
        },
        {
          id: "partners",
          label: "合作伙伴",
          labelEn: "Partners",
          labelUg: "ھەمكارلار",
          href: "/partners",
          description: "合作伙伴计划",
          descriptionEn: "Partner program",
          descriptionUg: "ھەمكارلىق پىلانى",
          icon: "Users",
        },
      ],
    },
  ],
};

// ============ 主菜单配置 ============
export const defaultMenuItems: NavMenuItem[] = [
  {
    id: "home",
    label: "首页",
    labelEn: "Home",
    labelUg: "باش بەت",
    href: "/",
    type: "link",
  },
  servicesMenu,
  {
    id: "cases",
    label: "案例",
    labelEn: "Cases",
    labelUg: "ئەھۋاللار",
    href: "/cases",
    type: "link",
  },
  {
    id: "about",
    label: "关于",
    labelEn: "About",
    labelUg: "ھەققىدە",
    href: "/about",
    type: "link",
  },
  resourcesMenu,
  {
    id: "contact",
    label: "联系",
    labelEn: "Contact",
    labelUg: "ئالاقىلىشىش",
    href: "/contact",
    type: "link",
  },
];

// ============ 移动端底部导航配置 ============
export const defaultBottomNavItems: BottomNavItem[] = [
  {
    id: "home",
    label: "首页",
    labelEn: "Home",
    labelUg: "باش بەت",
    icon: "Home",
    href: "/",
    activePattern: "^/$",
  },
  {
    id: "services",
    label: "服务",
    labelEn: "Services",
    labelUg: "مۇلازىمەت",
    icon: "Grid3X3",
    href: "/services",
    activePattern: "^/services",
  },
  {
    id: "cases",
    label: "案例",
    labelEn: "Cases",
    labelUg: "ئەھۋال",
    icon: "Briefcase",
    href: "/cases",
    activePattern: "^/cases",
  },
  {
    id: "user",
    label: "我的",
    labelEn: "Me",
    labelUg: "مېنىڭ",
    icon: "User",
    href: "/user",
    activePattern: "^/user",
  },
  {
    id: "more",
    label: "更多",
    labelEn: "More",
    labelUg: "تېخىمۇ كۆپ",
    icon: "MoreHorizontal",
    href: "/navigation",
    activePattern: "^/navigation",
  },
];

// ============ 社交媒体链接配置 ============
export const defaultSocialLinks: SocialLink[] = [
  {
    id: "wechat",
    platform: "WeChat",
    url: "#",
    icon: "MessageCircle",
  },
  {
    id: "weibo",
    platform: "Weibo",
    url: "#",
    icon: "AtSign",
  },
  {
    id: "github",
    platform: "GitHub",
    url: "https://github.com",
    icon: "Github",
  },
];

// ============ 完整导航配置 ============
export const defaultNavigationConfig: NavigationConfig = {
  logo: {
    alt: "CREATIVE",
    altEn: "CREATIVE",
    altUg: "CREATIVE",
  },
  menuItems: defaultMenuItems,
  mobileBottomNav: defaultBottomNavItems,
  socialLinks: defaultSocialLinks,
  auth: {
    loginText: "登录",
    loginTextEn: "Login",
    loginTextUg: "كىرىش",
    loginLink: "/login",
    registerText: "注册",
    registerTextEn: "Register",
    registerTextUg: "تىزىملىتىش",
    registerLink: "/register",
  },
};

// ============ 辅助函数 ============

/**
 * 根据用户角色过滤菜单项
 */
export function filterMenuByAuth(
  items: NavMenuItem[],
  isAuthenticated: boolean,
  userRoles: string[] = []
): NavMenuItem[] {
  return items
    .filter((item) => {
      if (item.requireAuth && !isAuthenticated) return false;
      if (item.roles && item.roles.length > 0) {
        return item.roles.some((role) => userRoles.includes(role));
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: item.children.map((group) => ({
            ...group,
            items: group.items.filter((link) => {
              if (link.requireAuth && !isAuthenticated) return false;
              if (link.roles && link.roles.length > 0) {
                return link.roles.some((role) => userRoles.includes(role));
              }
              return true;
            }),
          })),
        };
      }
      return item;
    });
}

/**
 * 获取本地化文本
 */
export function getLocalizedText(
  zh: string,
  en?: string,
  ug?: string,
  language: string = "zh"
): string {
  if (language === "en" && en) return en;
  if (language === "ug" && ug) return ug;
  return zh;
}

import { NextRequest, NextResponse } from "next/server";

// 翻译项目接口
interface TranslationItem {
  key: string;
  en: string;
  zh: string;
  ug?: string;
  category: string;
  description?: string;
  lastUpdated: string;
  status: 'complete' | 'partial' | 'missing';
}

// 示例翻译数据
const translationsData: TranslationItem[] = [
  // 导航翻译
  {
    key: 'nav.about',
    en: 'About',
    zh: '关于我们',
    ug: 'بىز ھەققىمىزدا',
    category: 'nav',
    description: 'Navigation menu item for About page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.services',
    en: 'Services',
    zh: '服务',
    ug: 'مۇلازىمەتلەر',
    category: 'nav',
    description: 'Navigation menu item for Services page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.partners',
    en: 'Partners',
    zh: '合作伙伴',
    ug: 'ھەمكارلار',
    category: 'nav',
    description: 'Navigation menu item for Partners page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.portfolio',
    en: 'Portfolio',
    zh: '作品集',
    ug: 'ئەسەرلەر توپلىمى',
    category: 'nav',
    description: 'Navigation menu item for Portfolio page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.team',
    en: 'Team',
    zh: '团队',
    ug: 'گۇرۇپپا',
    category: 'nav',
    description: 'Navigation menu item for Team page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.blog',
    en: 'Blog',
    zh: '博客',
    ug: 'بلوگ',
    category: 'nav',
    description: 'Navigation menu item for Blog page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.contact',
    en: 'Contact',
    zh: '联系我们',
    ug: 'ئالاقە',
    category: 'nav',
    description: 'Navigation menu item for Contact page',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.login',
    en: 'Login',
    zh: '登录',
    ug: 'كىرىش',
    category: 'nav',
    description: 'Login link text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'nav.getStarted',
    en: 'Get Started',
    zh: '开始使用',
    ug: 'باشلاش',
    category: 'nav',
    description: 'Get started button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },

  // 页面翻译
  {
    key: 'pages.partners.title',
    en: 'Trusted Partners',
    zh: '信任的合作伙伴',
    ug: 'ئىشەنچلىك ھەمكارلار',
    category: 'pages',
    description: 'Partners page main title',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'pages.partners.subtitle',
    en: 'We collaborate with industry leaders to deliver exceptional solutions',
    zh: '我们与行业领导者合作，提供卓越的解决方案',
    ug: 'بىز كەسىپ يېتەكچىلىرى بىلەن ھەمكارلىشىپ ئالاھىدە چارىلەرنى تەمىنلەيمىز',
    category: 'pages',
    description: 'Partners page subtitle',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'pages.partners.search',
    en: 'Search partners...',
    zh: '搜索合作伙伴...',
    ug: 'ھەمكارلارنى ئىزدەش...',
    category: 'pages',
    description: 'Partners page search placeholder',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'pages.partners.featuredPartners',
    en: 'Featured Partners',
    zh: '特色合作伙伴',
    ug: 'ئالاھىدە ھەمكارلار',
    category: 'pages',
    description: 'Featured partners section title',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'pages.partners.allPartners',
    en: 'All Partners',
    zh: '所有合作伙伴',
    ug: 'بارلىق ھەمكارلار',
    category: 'pages',
    description: 'All partners section title',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },

  // 通用翻译
  {
    key: 'common.loading',
    en: 'Loading...',
    zh: '加载中...',
    ug: 'يۈكلىنىۋاتىدۇ...',
    category: 'common',
    description: 'Loading state text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'common.error',
    en: 'An error occurred',
    zh: '发生错误',
    ug: 'خاتالىق كۆرۈلدى',
    category: 'common',
    description: 'Generic error message',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'common.success',
    en: 'Success!',
    zh: '成功！',
    ug: 'مۇۋەپپەقىيەت!',
    category: 'common',
    description: 'Success message',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'common.viewMore',
    en: 'View More',
    zh: '查看更多',
    ug: 'تېخىمۇ كۆپ كۆرۈش',
    category: 'common',
    description: 'View more button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'common.learnMore',
    en: 'Learn More',
    zh: '了解更多',
    ug: 'تېخىمۇ كۆپ بىلىش',
    category: 'common',
    description: 'Learn more button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'common.contactUs',
    en: 'Contact Us',
    zh: '联系我们',
    ug: 'بىز بىلەن ئالاقىلىشىڭ',
    category: 'common',
    description: 'Contact us button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },

  // 表单翻译
  {
    key: 'forms.submit',
    en: 'Submit',
    zh: '提交',
    ug: 'تاپشۇرۇش',
    category: 'forms',
    description: 'Submit button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'forms.cancel',
    en: 'Cancel',
    zh: '取消',
    ug: 'بىكار قىلىش',
    category: 'forms',
    description: 'Cancel button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'forms.save',
    en: 'Save',
    zh: '保存',
    ug: 'ساقلاش',
    category: 'forms',
    description: 'Save button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'forms.reset',
    en: 'Reset',
    zh: '重置',
    ug: 'قايتا تەڭشەش',
    category: 'forms',
    description: 'Reset button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'forms.search',
    en: 'Search',
    zh: '搜索',
    ug: 'ئىزدەش',
    category: 'forms',
    description: 'Search button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },

  // 认证翻译
  {
    key: 'auth.login',
    en: 'Login',
    zh: '登录',
    ug: 'كىرىش',
    category: 'auth',
    description: 'Login button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'auth.register',
    en: 'Register',
    zh: '注册',
    ug: 'تىزىملىتىش',
    category: 'auth',
    description: 'Register button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'auth.logout',
    en: 'Logout',
    zh: '退出',
    ug: 'چىقىش',
    category: 'auth',
    description: 'Logout button text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'auth.forgotPassword',
    en: 'Forgot Password?',
    zh: '忘记密码？',
    ug: 'پارولنى ئۇنتۇپ قالدىڭىزمۇ؟',
    category: 'auth',
    description: 'Forgot password link text',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },

  // 操作翻译
  {
    key: 'actions.edit',
    en: 'Edit',
    zh: '编辑',
    ug: 'تەھرىرلەش',
    category: 'actions',
    description: 'Edit action button',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'actions.delete',
    en: 'Delete',
    zh: '删除',
    ug: 'ئۆچۈرۈش',
    category: 'actions',
    description: 'Delete action button',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'actions.create',
    en: 'Create',
    zh: '创建',
    ug: 'قۇرۇش',
    category: 'actions',
    description: 'Create action button',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'actions.update',
    en: 'Update',
    zh: '更新',
    ug: 'يېڭىلاش',
    category: 'actions',
    description: 'Update action button',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'actions.download',
    en: 'Download',
    zh: '下载',
    ug: 'چۈشۈرۈش',
    category: 'actions',
    description: 'Download action button',
    lastUpdated: '2026-01-06',
    status: 'complete'
  },
  {
    key: 'actions.upload',
    en: 'Upload',
    zh: '上传',
    ug: 'يۈكلەش',
    category: 'actions',
    description: 'Upload action button',
    lastUpdated: '2026-01-06',
    status: 'complete'
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let filteredTranslations = [...translationsData];

    // 按类别筛选
    if (category && category !== 'all') {
      filteredTranslations = filteredTranslations.filter(item => 
        item.category === category
      );
    }

    // 按搜索词筛选
    if (search) {
      const searchLower = search.toLowerCase();
      filteredTranslations = filteredTranslations.filter(item =>
        item.key.toLowerCase().includes(searchLower) ||
        item.en.toLowerCase().includes(searchLower) ||
        item.zh.includes(search) ||
        (item.ug && item.ug.includes(search))
      );
    }

    // 按状态筛选
    if (status) {
      filteredTranslations = filteredTranslations.filter(item => 
        item.status === status
      );
    }

    // 统计信息
    const stats = {
      total: translationsData.length,
      complete: translationsData.filter(t => t.status === 'complete').length,
      partial: translationsData.filter(t => t.status === 'partial').length,
      missing: translationsData.filter(t => t.status === 'missing').length
    };

    return NextResponse.json({
      success: true,
      data: filteredTranslations,
      stats,
      total: filteredTranslations.length
    });
  } catch (error) {
    console.error('Translations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 验证必需字段
    if (!body.key || !body.en || !body.zh) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: key, en, zh' },
        { status: 400 }
      );
    }

    // 检查键是否已存在
    const existingItem = translationsData.find(item => item.key === body.key);
    if (existingItem) {
      return NextResponse.json(
        { success: false, error: 'Translation key already exists' },
        { status: 409 }
      );
    }

    const newTranslation: TranslationItem = {
      key: body.key,
      en: body.en,
      zh: body.zh,
      ug: body.ug,
      category: body.category || 'common',
      description: body.description,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: body.ug ? 'complete' : 'partial'
    };

    // 在实际应用中，这里会保存到数据库
    translationsData.push(newTranslation);
    
    return NextResponse.json({
      success: true,
      message: 'Translation created successfully',
      data: newTranslation
    });
  } catch (error) {
    console.error('Create translation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create translation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.key) {
      return NextResponse.json(
        { success: false, error: 'Translation key is required' },
        { status: 400 }
      );
    }

    const index = translationsData.findIndex(item => item.key === body.key);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Translation not found' },
        { status: 404 }
      );
    }

    // 更新翻译项
    translationsData[index] = {
      ...translationsData[index],
      ...body,
      lastUpdated: new Date().toISOString().split('T')[0],
      status: body.ug ? 'complete' : 'partial'
    };
    
    return NextResponse.json({
      success: true,
      message: 'Translation updated successfully',
      data: translationsData[index]
    });
  } catch (error) {
    console.error('Update translation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update translation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) {
      return NextResponse.json(
        { success: false, error: 'Translation key is required' },
        { status: 400 }
      );
    }

    const index = translationsData.findIndex(item => item.key === key);
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: 'Translation not found' },
        { status: 404 }
      );
    }

    // 删除翻译项
    translationsData.splice(index, 1);
    
    return NextResponse.json({
      success: true,
      message: 'Translation deleted successfully'
    });
  } catch (error) {
    console.error('Delete translation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete translation' },
      { status: 500 }
    );
  }
}
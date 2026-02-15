export type Locale = 'zh-CN' | 'zh-TW' | 'ug' | 'en' | 'ja' | 'ko';

const common_zh = {
  language: { zh: '中文', en: 'English', ug: 'ئۇيغۇرچە' },
  nav: { home: '首页', about: '关于我们', services: '服务', portfolio: '作品集', team: '团队', blog: '博客', contact: '联系' }
};
const common_en = {
  language: { zh: 'Chinese', en: 'English', ug: 'Uyghur' },
  nav: { home: 'Home', about: 'About', services: 'Services', portfolio: 'Portfolio', team: 'Team', blog: 'Blog', contact: 'Contact' }
};
const common_ug = {
  language: { zh: 'خەنزۇچە', en: 'ئىنگلىزچە', ug: 'ئۇيغۇرچە' },
  nav: { home: 'باشبەت', about: 'بىز ھەققىمىزدا', services: 'مۇلازىمەتلەر', portfolio: 'ئەگەر', team: 'گۇرۇپپا', blog: 'بلوگ', contact: 'ئالاقە' }
};

// About
const about_zh = { /* zh/about.json */
  hero: { title: '关于我们', subtitle: '我们是一家充满创意的数字代理机构，致力于为客户创造卓越的数字体验' },
  stats: { projects: '完成项目', clients: '满意客户', members: '团队成员', experience: '行业经验' },
  story: {
    title: '我们的故事',
    p1: '成立于2019年，我们从一个小团队的梦想开始，致力于帮助企业实现数字化转型。经过多年的发展，我们已经成为行业领先的数字解决方案提供商。',
    p2: '我们的团队由经验丰富的设计师、开发者和营销专家组成，每个人都对自己的专业领域充满热情。我们相信，好的设计不仅要美观，更要实用；好的技术不仅要先进，更要可靠。',
    p3: '至今为止，我们已经为150多家企业提供了服务，涵盖了电商、教育、金融、医疗等多个行业。每一个项目都是我们专业能力的证明，也是客户信任的体现。'
  },
  values: {
    title: '核心价值', subtitle: '这些价值观指导着我们的每一个决策和行动',
    target: { title: '目标导向', desc: '始终以客户目标为核心，确保每个项目都带来实际价值' },
    quality: { title: '品质保证', desc: '严格的品质控制流程，确保交付超出预期的成果' },
    innovation: { title: '持续创新', desc: '不断学习新技术，为客户带来创新的解决方案' }
  },
  team: {
    title: '核心团队', subtitle: '遇见我们的团队成员，他们是我们成功的关键',
    zhangming: { bio: '拥有10年互联网行业经验，专注于产品战略和团队管理' },
    lihua: { bio: '全栈开发专家，精通多种编程语言和框架' },
    wangfang: { bio: '资深UI/UX设计师，擅长创造美观且易用的界面' },
    liuqiang: { bio: '敏捷项目管理专家，确保项目按时高质量交付' }
  },
  contact: {
    title: '联系我们', subtitle: '有项目想法？让我们一起讨论如何实现它',
    address: { title: '办公室地址', line1: '北京市朝阳区建国路88号', line2: 'SOHO现代城A座2808' },
    email: { title: '邮箱地址' }, phone: { title: '联系电话' }
  }
};
const about_en = {
  hero: { title: 'About Us', subtitle: 'We are a creative digital agency dedicated to crafting outstanding digital experiences for our clients' },
  stats: { projects: 'Projects Completed', clients: 'Happy Clients', members: 'Team Members', experience: 'Years Experience' },
  story: {
    title: 'Our Story',
    p1: "Founded in 2019, we started as a small team's dream to help businesses go digital. Over the years, we've grown into a leading provider of digital solutions.",
    p2: 'Our team consists of experienced designers, developers and marketers. We believe great design must be both beautiful and practical; great tech should be advanced and reliable.',
    p3: "To date, we've served 150+ clients across e‑commerce, education, finance, healthcare and more. Every project proves our expertise and our clients' trust."
  },
  values: {
    title: 'Core Values', subtitle: 'These values guide every decision and action we take',
    target: { title: 'Goal-Oriented', desc: 'Always centered on client goals to deliver real value' },
    quality: { title: 'Quality Assurance', desc: 'Strict QA processes to deliver beyond expectations' },
    innovation: { title: 'Continuous Innovation', desc: 'Constantly learning to bring innovative solutions' }
  },
  team: {
    title: 'Our Team', subtitle: 'Meet the people who make our success possible',
    zhangming: { bio: '10 years in tech, focused on product strategy and team leadership' },
    lihua: { bio: 'Full‑stack expert skilled across multiple languages and frameworks' },
    wangfang: { bio: 'Senior UI/UX designer crafting beautiful and usable interfaces' },
    liuqiang: { bio: 'Agile project manager ensuring on‑time, high‑quality delivery' }
  },
  contact: {
    title: 'Contact Us', subtitle: "Have an idea? Let's discuss how to make it happen",
    address: { title: 'Office Address', line1: 'No. 88 Jianguo Rd, Chaoyang District, Beijing', line2: 'SOHO Xiandai Cheng Tower A, Room 2808' },
    email: { title: 'Email' }, phone: { title: 'Phone' }
  }
};
const about_ug = {
  hero: { title: 'بىز ھەققىمىزدا', subtitle: 'بىز خېرىدارلارغا مول تەسىر كۆرسىتىدىغان رەقەملىك كەسپىي تەجرىبىلەرنى يارىتىдиған ئىجادى ئەگىنچە ئاگېنتلىقىمىز' },
  stats: { projects: 'تاماملانغانلەر', clients: 'مەمنۇن خېرىدارلار', members: 'گۇرۇپپا ئەزالىرى', experience: 'كەسپىي مۇددەت' },
  story: {
    title: 'قىسقىچە تارىخىمىز',
    p1: '2019-يىلى قۇرۇلغان، كارخانىلارغا رەقەملىشىشقا ياردەم بېرىش ئارزۇسىدىن باشلانغان. بۈگۈن رەقەملىك ھەڵ قىلغۇچىلار ساھەسىدە ئالدىنقى قاتاردىمىز.',
    p2: 'گۇرۇپپىمىز تەجرىبىلىك لايىھىلەۋچى، ئىجادكار ۋە بازارچىلاردىن تۈزۈلگەن. ياخشى لايىھە قىلنىڭمۇ چىرايلىق ۋە قولايلىق بولۇشى، ياخشى تېخنىكىنىڭمۇ ئىشىنىشلىك بولۇشى كېرەك دەپ قارايمىز.',
    p3: 'بۈگۈنگىچە 150+ دىن ئارتۇق كارخانىغا مۇلازىمەت كۆرسەتتۇق، سودا، مەرىپەت، مالىيە، سەھىيە قاتارلىق ساھەلەرنى ئۆز ئىچىگە ئالىدۇ. ھەر بىر لايىھە بىزنىڭ قابىلىيىتىمىزنىڭ ئىسپاتىدۇر.'
  },
  values: {
    title: 'ئاساسىي قىممەت قاراشلىرى', subtitle: 'بۇ قىممەت قاراشلار ھەرىكەتلىرىمىزگە يول كۆرسىتىدۇ',
    target: { title: 'نىشانغا قارىتىلغان', desc: 'خېرىدار نىشانىنى مەركەز قىلىپ، ھەقىقىي قىممەت يارىتىش' },
    quality: { title: 'سەپالىق كاپالەت', desc: 'قەتئىي سۈپەت كونترول پروسېسلىرى' },
    innovation: { title: 'ئۆزگىرىش دەۋاملىشىدۇ', desc: 'يېڭى تېخنىكىلاردىن ئوڭۇشلىق پايدىلىنىش' }
  },
  team: {
    title: 'گۇرۇپپamiz', subtitle: 'ئۇلار بىزنىڭ مۇۋەپپەقىيىتىمىزنىڭ ئاچقۇچى',
    zhangming: { bio: '10 يىل مەھسۇلات ستراتېگىيە ۋە گۇرۇپپا باشقۇرۇش بويىچە تەجرىبە' },
    lihua: { bio: 'تولۇق-ستەك مۇتەخەسسىسى، كۆپ تىل ۋە كاندۇقلارда ئىقتىدارلىق' },
    wangfang: { bio: 'ئۇلۇغ UI/UX لايىھىلىگۈچى، چىرايلىق ۋە قولايلىق ئىنتەرپېيس ياسايدۇ' },
    liuqiang: { bio: 'چاقچىل لايىھە باشقۇرغۇچى، ۋاقىت ۋە سۈپەت كاپالىتى' }
  },
  contact: {
    title: 'بىز بىلەن ئالاقىلىشىڭ', subtitle: 'پروژەڭىز بارمۇ؟ بىرلىكتە مۇزاكىرە قىلىيلى',
    address: { title: 'ادرىس', line1: 'بېيجىڭ شەھىرى چاوياڭ رايونى جېڭگۇئو يولى 88-نومۇر', line2: 'SOHO يەڭى زامان شەھىرى A-مۇندەرىجە 2808' },
    email: { title: 'ئېلخەت' }, phone: { title: 'تېلىفون' }
  }
};

// Services
const services_zh = {
  hero: { title: '我们的服务', subtitle: '我们提供全方位的数字解决方案，从创意设计到技术开发，帮助您的业务在数字世界脱颖而出', cta: { consult: '免费咨询', cases: '查看案例' } },
  grid: { title: '专业服务项目', subtitle: '我们团队拥有丰富的经验，为各种规模的企业提供专业的数字解决方案', popular: '热门服务', includes: '服务包含:', details: '了解详情' },
  process: { title: '我们的工作流程', subtitle: '清晰的工作流程确保项目成功交付', steps: [ { title: '需求分析', desc: '深入理解您的业务需求和目标' }, { title: '方案设计', desc: '制定详细的解决方案和时间计划' }, { title: '开发实施', desc: '敏捷开发，定期汇报进度' }, { title: '交付维护', desc: '项目交付并提供持续支持' } ] },
  cta: { title: '准备开始您的项目了吗？', subtitle: '联系我们，获取免费的项目咨询和报价', contact: '立即联系', portfolio: '查看作品' }
};
const services_en = {
  hero: { title: 'Our Services', subtitle: 'We provide end-to-end digital solutions from creative design to engineering to help your business stand out', cta: { consult: 'Free Consultation', cases: 'View Cases' } },
  grid: { title: 'Professional Services', subtitle: 'Our team has deep experience delivering solutions for companies of all sizes', popular: 'Popular', includes: 'Includes:', details: 'Learn More' },
  process: { title: 'Our Process', subtitle: 'A clear process ensures successful delivery', steps: [ { title: 'Discovery', desc: 'Understand your needs and goals' }, { title: 'Solution Design', desc: 'Plan the solution and timeline' }, { title: 'Implementation', desc: 'Agile development with regular updates' }, { title: 'Delivery & Support', desc: 'Handover and ongoing support' } ] },
  cta: { title: 'Ready to get started?', subtitle: 'Contact us for a free consultation and quote', contact: 'Contact Now', portfolio: 'View Portfolio' }
};
const services_ug = {
  hero: { title: 'مۇلازىمەتلىرىمىز', subtitle: 'ئىجادىي لايىھىلەشتىن تارتىپ تېخنىكىلىق ئەمەلگە ئاشۇرۇشقىچە توتال رەقەملىك ھەلىلەر', cta: { consult: 'ھەقسىز مەسلىھەت', cases: 'ئىش ئورۇنلىرى' } },
  grid: { title: ' كەسپىي مۇلازىمەتلەر', subtitle: 'بىز ھەرقانداق چوڭ-كىچىك كارخانىلارغا مۇناسىپ ھەل قىلغۇچىلار تەمىنләйmiz', popular: 'ئاۋات', includes: 'ئۆز ئىچىگە ئالىدۇ:', details: 'تەپسىلات' },
  process: { title: 'خىزمەت جەريانى', subtitle: 'رەئىسلەتلىك جەريان مۇۋەپپەقىيەت كاپالىتى', steps: [ { title: 'تەلەپ تەتقىقاتى', desc: 'ئىستېمالچى ئېھتىياجىنى چۈشىنىش' }, { title: 'ھەل قىلىش لايىھىسى', desc: 'پىلان ۋە ۋاقىت جەدۋىلى' }, { title: 'ئەمەلگە ئاشۇرۇش', desc: 'چاقچىل تەرەققىيات، كۈندىك يېڭىلاش' }, { title: 'تاپشۇرۇش ۋە قوللاپ', desc: 'تاپشۇرۇپ بېرىش ۋە داۋاملىق قوللاش' } ] },
  cta: { title: 'پروژەنى باشلاشقا تەييارمۇ؟', subtitle: 'ھەقسىز مەسلىھەت ۋە باھا ئېلىڭ', contact: 'ھازىر ئالاقە', portfolio: 'ئەمگىكىمىز' }
};

// Contact
const contact_zh = {
  hero: { title: '联系我们', subtitle: '有项目想法？让我们一起讨论如何实现它。我们期待与您的合作！' },
  info: {
    address: { title: '办公室地址', content1: '北京市朝阳区建国路88号', content2: 'SOHO现代城A座2808' },
    email: { title: '邮箱地址', content1: 'info@creativeagency.com', content2: 'business@creativeagency.com' },
    phone: { title: '联系电话', content1: '+86 10 8888 8888', content2: '+86 138 0000 0000' },
    hours: { title: '工作时间', content1: '周一至周五: 9:00 - 18:00', content2: '周六至周日: 休息' }
  },
  why: {
    title: '为什么选择我们', subtitle: '我们致力于为客户提供卓越的服务体验',
    items: [
      { title: '快速响应', desc: '24小时内回复您的咨询，确保项目及时启动' },
      { title: '专业团队', desc: '经验丰富的设计师和开发者，提供专业解决方案' },
      { title: '全程跟进', desc: '从需求分析到项目交付，全程专业管理' }
    ]
  },
  form: {
    title: '发送消息', subtitle: '告诉我们您的项目需求，我们会尽快与您联系',
    fields: { name: '姓名 *', email: '邮箱 *', phone: '电话', company: '公司名称', service: '服务类型', budget: '预算范围', message: '项目描述 *' },
    placeholders: { name: '请输入您的姓名', email: '请输入您的邮箱', phone: '请输入您的电话', company: '请输入您的公司名称', message: '请详细描述您的项目需求...', serviceSelect: '请选择服务类型', budgetSelect: '请选择预算范围' },
    submit: { sending: '发送中...', success: '发送成功！', send: '发送消息' }
  },
  services: ['网站开发', '移动应用开发', 'UI/UX设计', '数字营销', '品牌策略', '技术咨询', '其他'],
  budgets: ['5千 - 1万', '1万 - 5万', '5万 - 10万', '10万以上', '待商议'],
  other: {
    title: '其他联系方式',
    online: { title: '在线咨询', desc: '工作时间内实时在线解答您的问题', btn: '开始聊天' },
    email: { title: '邮件咨询', desc: '发送详细需求到邮箱，我们会在24小时内回复', btn: '发送邮件' }
  },
  faq: {
    title: '常见问题',
    q1: { q: '项目一般需要多长时间？', a: '根据项目复杂度，一般网站项目需要2-8周，移动应用需要4-16周。' },
    q2: { q: '如何开始项目？', a: '先通过本页面或邮箱联系我们，我们会安排初步沟通，然后提供详细的方案和报价。' },
    q3: { q: '支付方式有哪些？', a: '我们支持银行转账、支付宝、微信支付等多种支付方式，具体可以协商。' }
  }
};
const contact_en = {
  hero: { title: 'Contact Us', subtitle: "Have a project in mind? Let's discuss how to make it happen. We look forward to working with you!" },
  info: {
    address: { title: 'Office Address', content1: 'No. 88 Jianguo Rd, Chaoyang District, Beijing', content2: 'SOHO Xiandai Cheng Tower A, Room 2808' },
    email: { title: 'Email', content1: 'info@creativeagency.com', content2: 'business@creativeagency.com' },
    phone: { title: 'Phone', content1: '+86 10 8888 8888', content2: '+86 138 0000 0000' },
    hours: { title: 'Working Hours', content1: 'Mon–Fri: 9:00 – 18:00', content2: 'Sat–Sun: Closed' }
  },
  why: {
    title: 'Why Choose Us', subtitle: 'We are committed to delivering an outstanding service experience',
    items: [
      { title: 'Fast Response', desc: 'We reply within 24 hours to kick off your project quickly' },
      { title: 'Expert Team', desc: 'Experienced designers and developers offering professional solutions' },
      { title: 'End‑to‑End', desc: 'From discovery to delivery, we manage your project professionally' }
    ]
  },
  form: {
    title: 'Send a Message', subtitle: "Tell us about your project and we'll get back to you soon",
    fields: { name: 'Name *', email: 'Email *', phone: 'Phone', company: 'Company', service: 'Service', budget: 'Budget', message: 'Project Details *' },
    placeholders: { name: 'Enter your name', email: 'Enter your email', phone: 'Enter your phone', company: 'Enter your company', message: 'Describe your project in detail...', serviceSelect: 'Select a service', budgetSelect: 'Select a budget' },
    submit: { sending: 'Sending...', success: 'Sent!', send: 'Send Message' }
  },
  services: ['Web Development', 'Mobile App Development', 'UI/UX Design', 'Digital Marketing', 'Brand Strategy', 'Consulting', 'Other'],
  budgets: ['$5k – $10k', '$10k – $50k', '$50k – $100k', '$100k+', 'TBD'],
  other: {
    title: 'Other Contact Methods',
    online: { title: 'Live Chat', desc: 'Get instant answers during business hours', btn: 'Start Chat' },
    email: { title: 'Email Us', desc: "Send details to our email and we'll reply within 24 hours", btn: 'Send Email' }
  },
  faq: {
    title: 'FAQ',
    q1: { q: 'How long do projects take?', a: 'Depending on complexity: websites 2–8 weeks; mobile apps 4–16 weeks.' },
    q2: { q: 'How do we start?', a: "Contact us via this page or email. We'll schedule a kickoff call, then send a proposal and quote." },
    q3: { q: 'What payment methods are supported?', a: 'We support bank transfer and other methods as agreed.' }
  }
};
const contact_ug = {
  hero: { title: 'بىز بىلەن ئالاقە قىلىڭ', subtitle: 'پروژە بارمۇ؟ قايسىچە ئەمەلگە ئاشۇرىدىغانلىقىنى بىرلىكتە مۇزاكىرە قىلىيلى. سىز بىلەن خىزmətداشلىق قىلىدىغانلىغىمىزدىن خۇشالمىز!' },
  info: {
    address: { title: 'ئادرىس', content1: 'بېيجىڭ چاوياڭ رايونى جېڭگۇئو يولى 88-نومۇر', content2: 'SOHO يەڭى زامان A-تور 2808' },
    email: { title: 'ئېلخەت', content1: 'info@creativeagency.com', content2: 'business@creativeagency.com' },
    phone: { title: 'تېلىفون', content1: '+86 10 8888 8888', content2: '+86 138 0000 0000' },
    hours: { title: 'خىزمەت ۋاقتى', content1: 'دۈشەنبە–جۈمە: 9:00 – 18:00', content2: 'شەنبە–يەكشەنبە: ئىشلەشمەيدۇ' }
  },
  why: {
    title: 'نېمىشقا بىز؟', subtitle: 'بىز خېرىدارلارغا ئەلا مۇلازىمەت تەسىرى بىلەن تەمىنلەيمىز',
    items: [
      { title: 'تېز ئىنكاس', desc: '24 سائەت ئىچىدە جاۋاب قايتۇرىمىز' },
      { title: 'كەسپىي گۇرۇپپا', desc: 'تەجرىبىلىك لايىھىلىگۈچىلەر ۋە ئەندىزەچىلەر' },
      { title: 'پۈتۈنلەر بويىچە باشقۇرۇش', desc: 'تەلەپتىن تاپشۇرۇشقىچە كەسپىي باشقۇرۇش' }
    ]
  },
  form: {
    title: 'ئۇچۇر ئەۋەتىش', subtitle: 'پروژە ھەققىدە بىزگە ئېيتىڭ، بىز تېزدا ئالاقە قىلىمىز',
    fields: { name: 'ئىسمى *', email: 'ئېلخەت *', phone: 'تېلىفون', company: 'كارخانا نامى', service: 'مۇلازىمەت تۈرى', budget: 'بىسۇجەت', message: 'پروژە تەپسىلاتى *' },
    placeholders: { name: 'ئىسمىڭىزنى كىرگۈزۈڭ', email: 'ئېلخېتىڭىزنى كىرگۈزۈڭ', phone: 'تېلىفونىڭىز', company: 'كارخانا نامىڭىز', message: 'پروژە تەپسىلاتىنى چۈشەندۈرۈڭ...', serviceSelect: 'مۇلازىمەت تاللاڭ', budgetSelect: 'بىسۇجەت تاللاڭ' },
    submit: { sending: 'ئەۋەتىلىۋاتىدۇ...', success: 'ئەۋەتىلدى!', send: 'ئۇچۇر ئەۋەت' }
  },
  services: ['تور بەت ئىشلەپچىقىرىش', 'قوللانما ئىشلەپچىقىرىش', 'UI/UX لايىھىلەش', 'رەقەملىك بازارچىلىق', 'ماركا ستراتېگىيەسى', 'كەسپىي كەنەپ', 'باشقا'],
  budgets: ['¥5k – ¥10k', '¥10k – ¥50k', '¥50k – ¥100k', '¥100k+', 'كېلىشىم بويىچە'],
  other: {
    title: 'باشقا ئالاقە ئۇسۇللىرى',
    online: { title: 'توردا سوئال-جاۋاب', desc: 'خىزمەت ۋاقتىدا دەرھال جاۋاب', btn: 'سۆھبەتنى باشلا' },
    email: { title: 'ئېلخەت بىلەن', desc: 'تەپسىلاتلارنى ئېلخەتكە يوللاڭ، 24 سائەت ئىچىدە جاۋاب قايتۇرىمىز', btn: 'ئېلخەت يوللا' }
  },
  faq: {
    title: 'Köpläp Sorilidu',
    q1: { q: 'پروژە قانچە ۋاقىت كېتىدۇ؟', a: 'قىيىنلىقىغا باغلىق؛ تور 2–8 ھەپتە، قوللانما 4–16 ھەپتە.' },
    q2: { q: 'قانداق باشلاش؟', a: 'بۇ بەت ئارقىلىق ياكى ئېلخەتتە ئالاقە قىلىڭ، ئالدى بىلەن سۆھبەت قۇرۇپ، ئاندىن تەكلىپ ۋە باھا تاپشۇرىمىز.' },
    q3: { q: 'تەڭشەش ئۇسۇلى؟', a: 'بانكا ئېگىشى قاتارلىقلارنى قوللايمىز، كېلىشىم بويىچە.' }
  }
};

// Home (meta only for now)
const home_zh = { meta: { title: '创意数字代理机构 | 首页', description: '我们提供网站开发、移动应用、品牌设计与数字营销的一站式数字化解决方案。' } };
const home_en = { meta: { title: 'Creative Digital Agency | Home', description: 'We deliver end-to-end digital solutions across web, mobile, brand and marketing.' } };
const home_ug = { meta: { title: 'ئىجادىي رەقەملىك ئاگېنتلىق | باشبەت', description: 'تور، قوللانما، ماركا ۋە بازىرىچىلىقتا توتال رەقەملىك ھەلىلەر بىلەن تەمىنләйmiz.' } };

// Settings translations
const settings_zh = {
  title: "设置", description: "管理您的账户信息和偏好设置",
  tabs: { profile: "个人资料", account: "账户", billing: "账单", notifications: "通知", appearance: "外观", language: "语言" },
  userCard: { admin: "管理员", user: "用户", registeredAt: "注册于", lastLogin: "上次登录", unknown: "未知" },
  profile: { title: "个人资料", firstName: "名字", lastName: "姓氏", phone: "电话", country: "国家/地区", city: "城市", address: "详细地址", bio: "个人简介", bioPlaceholder: "介绍一下自己...", saveChanges: "保存更改", saveSuccess: "保存成功", saveFailed: "保存失败" },
  account: { changePassword: "修改密码", currentPassword: "当前密码", newPassword: "新密码", confirmPassword: "确认新密码", changePasswordBtn: "修改密码", passwordMismatch: "两次输入的密码不一致", passwordSuccess: "密码修改成功", passwordFailed: "密码修改失败", accountStatus: "账户状态", emailVerification: "邮箱验证", verified: "已验证", statusTitle: "账户状态", statusNormal: "您的账户运行正常", normal: "正常" },
  billing: { title: "账单信息", currentPlan: "当前套餐", freePlan: "免费版", freePlanDesc: "基础功能，适合个人使用", upgradePlan: "升级套餐", billingCycle: "账单周期", noPaidSubscription: "暂无付费订阅", viewHistory: "查看历史账单", paymentMethods: "支付方式", noPaymentMethod: "暂未添加支付方式", addPaymentMethod: "添加支付方式" },
  notifications: { title: "通知偏好", email: "邮件通知", emailDesc: "接收重要更新和通知邮件", push: "推送通知", pushDesc: "接收浏览器推送通知", orderUpdates: "订单更新", orderUpdatesDesc: "订单状态变更时通知", promotions: "促销活动", promotionsDesc: "接收优惠和促销信息", newsletter: "新闻通讯", newsletterDesc: "接收产品更新和行业资讯", saveSettings: "保存通知设置" },
  appearance: { title: "主题设置", description: "选择您喜欢的界面主题", light: "浅色", lightDesc: "明亮清爽", dark: "深色", darkDesc: "护眼模式", system: "跟随系统", systemDesc: "自动切换", current: "当前" },
  languageSettings: { title: "语言设置", description: "选择您的首选语言", selectLanguage: "选择语言", changeNote: "更改语言后，页面将自动刷新", regionTitle: "地区设置", timezone: "时区", dateFormat: "日期格式" }
};

const settings_en = {
  title: "Settings", description: "Manage your account information and preferences",
  tabs: { profile: "Profile", account: "Account", billing: "Billing", notifications: "Notifications", appearance: "Appearance", language: "Language" },
  userCard: { admin: "Admin", user: "User", registeredAt: "Registered on", lastLogin: "Last login", unknown: "Unknown" },
  profile: { title: "Profile", firstName: "First Name", lastName: "Last Name", phone: "Phone", country: "Country/Region", city: "City", address: "Address", bio: "Bio", bioPlaceholder: "Tell us about yourself...", saveChanges: "Save Changes", saveSuccess: "Saved successfully", saveFailed: "Save failed" },
  account: { changePassword: "Change Password", currentPassword: "Current Password", newPassword: "New Password", confirmPassword: "Confirm New Password", changePasswordBtn: "Change Password", passwordMismatch: "Passwords do not match", passwordSuccess: "Password changed successfully", passwordFailed: "Password change failed", accountStatus: "Account Status", emailVerification: "Email Verification", verified: "Verified", statusTitle: "Account Status", statusNormal: "Your account is running normally", normal: "Normal" },
  billing: { title: "Billing Information", currentPlan: "Current Plan", freePlan: "Free Plan", freePlanDesc: "Basic features, suitable for personal use", upgradePlan: "Upgrade Plan", billingCycle: "Billing Cycle", noPaidSubscription: "No paid subscription", viewHistory: "View Billing History", paymentMethods: "Payment Methods", noPaymentMethod: "No payment method added", addPaymentMethod: "Add Payment Method" },
  notifications: { title: "Notification Preferences", email: "Email Notifications", emailDesc: "Receive important updates and notifications", push: "Push Notifications", pushDesc: "Receive browser push notifications", orderUpdates: "Order Updates", orderUpdatesDesc: "Get notified when order status changes", promotions: "Promotions", promotionsDesc: "Receive offers and promotional information", newsletter: "Newsletter", newsletterDesc: "Receive product updates and industry news", saveSettings: "Save Notification Settings" },
  appearance: { title: "Theme Settings", description: "Choose your preferred interface theme", light: "Light", lightDesc: "Bright and clean", dark: "Dark", darkDesc: "Easy on the eyes", system: "System", systemDesc: "Auto switch", current: "Current" },
  languageSettings: { title: "Language Settings", description: "Choose your preferred language", selectLanguage: "Select Language", changeNote: "Page will refresh after changing language", regionTitle: "Region Settings", timezone: "Timezone", dateFormat: "Date Format" }
};

const settings_ug = {
  title: "تەڭشەكلەر", description: "ھېسابات ئۇچۇرلىرى ۋە مايىللىق تەڭشەكلىرىنى باشقۇرۇش",
  tabs: { profile: "شەخسىي ئۇچۇر", account: "ھېسابات", billing: "تۆلەم", notifications: "ئۇقتۇرۇش", appearance: "كۆرۈنۈش", language: "تىل" },
  userCard: { admin: "باشقۇرغۇچى", user: "ئىشلەتكۈچى", registeredAt: "تىزىملاتقان ۋاقتى", lastLogin: "ئاخىرقى كىرىش", unknown: "نامەلۇم" },
  profile: { title: "شەخسىي ئۇچۇر", firstName: "ئىسىم", lastName: "فامىلە", phone: "تېلېفون", country: "دۆلەت/رايون", city: "شەھەر", address: "تەپسىلىي ئادرېس", bio: "شەخسىي تونۇشتۇرۇش", bioPlaceholder: "ئۆزىڭىزنى تونۇشتۇرۇڭ...", saveChanges: "ئۆزگەرتىشلەرنى ساقلاش", saveSuccess: "ساقلاش مۇۋەپپەقىيەتلىك بولدى", saveFailed: "ساقلاش مەغلۇپ بولدى" },
  account: { changePassword: "پارولنى ئۆزگەرتىش", currentPassword: "نۆۋەتتىكى پارول", newPassword: "يېڭى پارول", confirmPassword: "يېڭى پارولنى جەزملەش", changePasswordBtn: "پارولنى ئۆزگەرتىش", passwordMismatch: "ئىككى قېتىم كىرگۈزگەن پارول ئوخشاش ئەمەس", passwordSuccess: "پارول مۇۋەپپەقىيەتلىك ئۆزگەرتىلدى", passwordFailed: "پارول ئۆزگەرتىش مەغلۇپ بولدى", accountStatus: "ھېسابات ھالىتى", emailVerification: "ئېلخەت دەلىللەش", verified: "دەلىللەندى", statusTitle: "ھېسابات ھالىتى", statusNormal: "ھېساباتىڭىز نورمال ئىشلەۋاتىدۇ", normal: "نورمال" },
  billing: { title: "تۆلەم ئۇچۇرى", currentPlan: "نۆۋەتتىكى پىلان", freePlan: "ھەقسىز نەشرى", freePlanDesc: "ئاساسىي ئىقتىدارلار، شەخسىي ئىشلىتىشكە ماس", upgradePlan: "پىلاننى يۈكسەلدۈرۈش", billingCycle: "تۆلەم دەۋرى", noPaidSubscription: "ھەقلىق مۇشتەرىلىك يوق", viewHistory: "تارىخىي تۆلەملەرنى كۆرۈش", paymentMethods: "تۆلەش ئۇسۇلى", noPaymentMethod: "تۆلەش ئۇسۇلى قوشۇلمىغان", addPaymentMethod: "تۆلەش ئۇسۇلى قوشۇش" },
  notifications: { title: "ئۇقتۇرۇش مايىللىقى", email: "ئېلخەت ئۇقتۇرۇشى", emailDesc: "مۇھىم يېڭىلاش ۋە ئۇقتۇرۇش ئېلخەتلىرىنى قوبۇل قىلىش", push: "ئىتتىرىش ئۇقتۇرۇشى", pushDesc: "توركۆرگۈ ئىتتىرىش ئۇقتۇرۇشىنى قوبۇل قىلىش", orderUpdates: "زاكاز يېڭىلىنىشى", orderUpdatesDesc: "زاكاز ھالىتى ئۆزگەرگەندە ئۇقتۇرۇش", promotions: "تەشۋىقات پائالىيىتى", promotionsDesc: "ئېتىبار ۋە تەشۋىقات ئۇچۇرلىرىنى قوبۇل قىلىش", newsletter: "خەۋەر نەشرى", newsletterDesc: "مەھسۇلات يېڭىلىنىشى ۋە كەسىپ خەۋەرلىرىنى قوبۇل قىلىش", saveSettings: "ئۇقتۇرۇش تەڭشىكىنى ساقلاش" },
  appearance: { title: "تېما تەڭشىكى", description: "ياقتۇرىدىغان كۆرۈنمە يۈزىنى تاللاڭ", light: "ئوچۇق رەڭ", lightDesc: "يورۇق ۋە پاكىز", dark: "قاراڭغۇ رەڭ", darkDesc: "كۆزنى قوغداش", system: "سىستېمىغا ئەگىشىش", systemDesc: "ئاپتوماتىك ئالماشتۇرۇش", current: "نۆۋەتتىكى" },
  languageSettings: { title: "تىل تەڭشىكى", description: "ئالدىن قويۇلغان تىلنى تاللاڭ", selectLanguage: "تىل تاللاش", changeNote: "تىلنى ئۆزگەرتكەندىن كېيىن بەت ئاپتوماتىك يېڭىلىنىدۇ", regionTitle: "رايون تەڭشىكى", timezone: "ۋاقىت رايونى", dateFormat: "چېسلا فورماتى" }
};

const settings_zhTW = {
  title: "設定", description: "管理您的帳戶資訊和偏好設定",
  tabs: { profile: "個人資料", account: "帳戶", billing: "帳單", notifications: "通知", appearance: "外觀", language: "語言" },
  userCard: { admin: "管理員", user: "使用者", registeredAt: "註冊於", lastLogin: "上次登入", unknown: "未知" },
  profile: { title: "個人資料", firstName: "名字", lastName: "姓氏", phone: "電話", country: "國家/地區", city: "城市", address: "詳細地址", bio: "個人簡介", bioPlaceholder: "介紹一下自己...", saveChanges: "儲存變更", saveSuccess: "儲存成功", saveFailed: "儲存失敗" },
  account: { changePassword: "修改密碼", currentPassword: "目前密碼", newPassword: "新密碼", confirmPassword: "確認新密碼", changePasswordBtn: "修改密碼", passwordMismatch: "兩次輸入的密碼不一致", passwordSuccess: "密碼修改成功", passwordFailed: "密碼修改失敗", accountStatus: "帳戶狀態", emailVerification: "電子郵件驗證", verified: "已驗證", statusTitle: "帳戶狀態", statusNormal: "您的帳戶運作正常", normal: "正常" },
  billing: { title: "帳單資訊", currentPlan: "目前方案", freePlan: "免費版", freePlanDesc: "基礎功能，適合個人使用", upgradePlan: "升級方案", billingCycle: "帳單週期", noPaidSubscription: "暫無付費訂閱", viewHistory: "查看歷史帳單", paymentMethods: "付款方式", noPaymentMethod: "尚未新增付款方式", addPaymentMethod: "新增付款方式" },
  notifications: { title: "通知偏好", email: "電子郵件通知", emailDesc: "接收重要更新和通知郵件", push: "推播通知", pushDesc: "接收瀏覽器推播通知", orderUpdates: "訂單更新", orderUpdatesDesc: "訂單狀態變更時通知", promotions: "促銷活動", promotionsDesc: "接收優惠和促銷資訊", newsletter: "電子報", newsletterDesc: "接收產品更新和產業資訊", saveSettings: "儲存通知設定" },
  appearance: { title: "主題設定", description: "選擇您喜歡的介面主題", light: "淺色", lightDesc: "明亮清爽", dark: "深色", darkDesc: "護眼模式", system: "跟隨系統", systemDesc: "自動切換", current: "目前" },
  languageSettings: { title: "語言設定", description: "選擇您的首選語言", selectLanguage: "選擇語言", changeNote: "變更語言後，頁面將自動重新整理", regionTitle: "地區設定", timezone: "時區", dateFormat: "日期格式" }
};

const settings_ja = {
  title: "設定", description: "アカウント情報と設定を管理",
  tabs: { profile: "プロフィール", account: "アカウント", billing: "請求", notifications: "通知", appearance: "外観", language: "言語" },
  userCard: { admin: "管理者", user: "ユーザー", registeredAt: "登録日", lastLogin: "最終ログイン", unknown: "不明" },
  profile: { title: "プロフィール", firstName: "名", lastName: "姓", phone: "電話番号", country: "国/地域", city: "都市", address: "住所", bio: "自己紹介", bioPlaceholder: "自己紹介を入力...", saveChanges: "変更を保存", saveSuccess: "保存しました", saveFailed: "保存に失敗しました" },
  account: { changePassword: "パスワード変更", currentPassword: "現在のパスワード", newPassword: "新しいパスワード", confirmPassword: "新しいパスワードを確認", changePasswordBtn: "パスワードを変更", passwordMismatch: "パスワードが一致しません", passwordSuccess: "パスワードを変更しました", passwordFailed: "パスワード変更に失敗しました", accountStatus: "アカウント状態", emailVerification: "メール認証", verified: "認証済み", statusTitle: "アカウント状態", statusNormal: "アカウントは正常に動作しています", normal: "正常" },
  billing: { title: "請求情報", currentPlan: "現在のプラン", freePlan: "無料プラン", freePlanDesc: "基本機能、個人利用に最適", upgradePlan: "プランをアップグレード", billingCycle: "請求サイクル", noPaidSubscription: "有料サブスクリプションなし", viewHistory: "請求履歴を表示", paymentMethods: "支払い方法", noPaymentMethod: "支払い方法が登録されていません", addPaymentMethod: "支払い方法を追加" },
  notifications: { title: "通知設定", email: "メール通知", emailDesc: "重要な更新と通知メールを受信", push: "プッシュ通知", pushDesc: "ブラウザプッシュ通知を受信", orderUpdates: "注文更新", orderUpdatesDesc: "注文状態が変更されたら通知", promotions: "プロモーション", promotionsDesc: "お得な情報やプロモーションを受信", newsletter: "ニュースレター", newsletterDesc: "製品アップデートと業界ニュースを受信", saveSettings: "通知設定を保存" },
  appearance: { title: "テーマ設定", description: "お好みのインターフェーステーマを選択", light: "ライト", lightDesc: "明るくクリーン", dark: "ダーク", darkDesc: "目に優しい", system: "システム", systemDesc: "自動切替", current: "現在" },
  languageSettings: { title: "言語設定", description: "お好みの言語を選択", selectLanguage: "言語を選択", changeNote: "言語を変更するとページが自動的に更新されます", regionTitle: "地域設定", timezone: "タイムゾーン", dateFormat: "日付形式" }
};

const settings_ko = {
  title: "설정", description: "계정 정보 및 환경설정 관리",
  tabs: { profile: "프로필", account: "계정", billing: "결제", notifications: "알림", appearance: "외관", language: "언어" },
  userCard: { admin: "관리자", user: "사용자", registeredAt: "가입일", lastLogin: "마지막 로그인", unknown: "알 수 없음" },
  profile: { title: "프로필", firstName: "이름", lastName: "성", phone: "전화번호", country: "국가/지역", city: "도시", address: "상세 주소", bio: "자기소개", bioPlaceholder: "자기소개를 입력하세요...", saveChanges: "변경사항 저장", saveSuccess: "저장되었습니다", saveFailed: "저장에 실패했습니다" },
  account: { changePassword: "비밀번호 변경", currentPassword: "현재 비밀번호", newPassword: "새 비밀번호", confirmPassword: "새 비밀번호 확인", changePasswordBtn: "비밀번호 변경", passwordMismatch: "비밀번호가 일치하지 않습니다", passwordSuccess: "비밀번호가 변경되었습니다", passwordFailed: "비밀번호 변경에 실패했습니다", accountStatus: "계정 상태", emailVerification: "이메일 인증", verified: "인증됨", statusTitle: "계정 상태", statusNormal: "계정이 정상적으로 운영되고 있습니다", normal: "정상" },
  billing: { title: "결제 정보", currentPlan: "현재 플랜", freePlan: "무료 플랜", freePlanDesc: "기본 기능, 개인 사용에 적합", upgradePlan: "플랜 업그레이드", billingCycle: "결제 주기", noPaidSubscription: "유료 구독 없음", viewHistory: "결제 내역 보기", paymentMethods: "결제 수단", noPaymentMethod: "등록된 결제 수단이 없습니다", addPaymentMethod: "결제 수단 추가" },
  notifications: { title: "알림 설정", email: "이메일 알림", emailDesc: "중요한 업데이트 및 알림 이메일 수신", push: "푸시 알림", pushDesc: "브라우저 푸시 알림 수신", orderUpdates: "주문 업데이트", orderUpdatesDesc: "주문 상태 변경 시 알림", promotions: "프로모션", promotionsDesc: "할인 및 프로모션 정보 수신", newsletter: "뉴스레터", newsletterDesc: "제품 업데이트 및 업계 뉴스 수신", saveSettings: "알림 설정 저장" },
  appearance: { title: "테마 설정", description: "선호하는 인터페이스 테마를 선택하세요", light: "라이트", lightDesc: "밝고 깔끔함", dark: "다크", darkDesc: "눈 보호 모드", system: "시스템", systemDesc: "자동 전환", current: "현재" },
  languageSettings: { title: "언어 설정", description: "선호하는 언어를 선택하세요", selectLanguage: "언어 선택", changeNote: "언어 변경 후 페이지가 자동으로 새로고침됩니다", regionTitle: "지역 설정", timezone: "시간대", dateFormat: "날짜 형식" }
};

export const MESSAGES: Record<Locale, any> = {
  'zh-CN': { common: common_zh, about: about_zh, services: services_zh, contact: contact_zh, home: home_zh, settings: settings_zh },
  'zh-TW': { common: common_zh, about: about_zh, services: services_zh, contact: contact_zh, home: home_zh, settings: settings_zhTW },
  en: { common: common_en, about: about_en, services: services_en, contact: contact_en, home: home_en, settings: settings_en },
  ug: { common: common_ug, about: about_ug, services: services_ug, contact: contact_ug, home: home_ug, settings: settings_ug },
  ja: { common: common_en, about: about_en, services: services_en, contact: contact_en, home: home_en, settings: settings_ja },
  ko: { common: common_en, about: about_en, services: services_en, contact: contact_en, home: home_en, settings: settings_ko }
};

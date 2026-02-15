export type Language = "en" | "zh" | "ug";

export interface Translations {
  nav: {
    about: string;
    services: string;
    portfolio: string;
    team: string;
    blog: string;
    contact: string;
    login: string;
    getStarted: string;
    admin: string;
    partners: string;
    cases: string;
    resources: string;
    help: string;
    shop: string;
    investment: string;
    marketplace: string;
  };
  hero: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    viewWork: string;
    getInTouch: string;
    stats: {
      projects: string;
      clients: string;
      awards: string;
    };
  };
  about: {
    badge: string;
    title: string;
    subtitle: string;
    storyTitle: string;
    storyParagraphs: string[];
    keyPoints: string[];
    achievements: {
      satisfaction: string;
      rating: string;
      support: string;
      delivery: string;
    };
    valuesTitle: string;
    valuesSubtitle: string;
    cta: string;
  };
  // Page-specific translations
  pages: {
    about: {
      hero: { title: string; subtitle: string };
      stats: { projects: string; clients: string; members: string; experience: string };
      story: { title: string; p1: string; p2: string; p3: string };
      team: { title: string; subtitle: string };
      values: {
        title: string;
        subtitle: string;
        target: { title: string; desc: string };
        quality: { title: string; desc: string };
        innovation: { title: string; desc: string };
      };
      contact: {
        title: string;
        subtitle: string;
        address: { title: string };
        email: { title: string };
        phone: { title: string };
      };
      members: {
        zhangming: { name: string; position: string; bio: string };
        lihua: { name: string; position: string; bio: string };
        wangfang: { name: string; position: string; bio: string };
        liuqiang: { name: string; position: string; bio: string };
      };
    };
    team: {
      title: string;
      subtitle: string;
    };
    blog: {
      title: string;
      subtitle: string;
      search: string;
      noResults: string;
      readMore: string;
      categories: { all: string; tech: string; design: string; business: string };
    };
    contact: {
      title: string;
      subtitle: string;
      form: {
        name: string;
        email: string;
        phone: string;
        subject: string;
        message: string;
        submit: string;
      };
      info: {
        address: { title: string; line1: string; line2: string };
        email: { title: string };
        phone: { title: string };
      };
      success: string;
      error: string;
      networkError: string;
    };
  };
  services: {
    badge: string;
    title: string;
    subtitle: string;
    items: {
      webDev: {
        title: string;
        description: string;
        highlight: string;
        features: string[];
      };
      mobileDev: {
        title: string;
        description: string;
        highlight: string;
        features: string[];
      };
      uiux: {
        title: string;
        description: string;
        highlight: string;
        features: string[];
      };
      branding: {
        title: string;
        description: string;
        highlight: string;
        features: string[];
      };
      strategy: {
        title: string;
        description: string;
        highlight: string;
        features: string[];
      };
      consulting: {
        title: string;
        description: string;
        highlight: string;
        features: string[];
      };
    };
  };
  portfolio: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaSubtitle: string;
    showcaseTitle: string;
    showingProjects: string;
    categories: {
      all: string;
      web: string;
      mobile: string;
      ui: string;
      branding: string;
      illustration: string;
    };
    sortOptions: {
      latest: string;
      popular: string;
      featured: string;
    };
    projectDetail: {
      backToPortfolio: string;
      share: string;
      viewLive: string;
      projectOverview: string;
      technologiesUsed: string;
      tags: string;
      projectDetails: string;
      designer: string;
      client: string;
      completed: string;
      category: string;
      likeProject: string;
      downloadAssets: string;
      relatedProjects: string;
    };
  };
  team: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    ctaSubtitle: string;
    expertTitle: string;
  };
  testimonials: {
    badge: string;
    title: string;
    subtitle: string;
    trustBadges: {
      rating: {
        title: string;
        label: string;
      };
      satisfaction: {
        title: string;
        label: string;
      };
      repeat: {
        title: string;
        label: string;
      };
    };
    cta: string;
    ctaSubtitle: string;
  };
  cta: {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
    trustIndicators: {
      available: {
        title: string;
        subtitle: string;
      };
      response: {
        title: string;
        subtitle: string;
      };
      consultation: {
        title: string;
        subtitle: string;
      };
    };
    additionalCta: {
      title: string;
      subtitle: string;
      features: string[];
    };
  };
  blog: {
    badge: string;
    title: string;
    subtitle: string;
    viewAll: string;
    readMore: string;
    author: string;
    cta: string;
    ctaSubtitle: string;
  };
  contact: {
    badge: string;
    title: string;
    subtitle: string;
    formTitle: string;
    formSubtitle: string;
    form: {
      name: string;
      email: string;
      subject: string;
      message: string;
      submit: string;
      sending: string;
      disclaimer: string;
    };
    info: {
      title: string;
      subtitle: string;
      email: {
        title: string;
        subtitle: string;
      };
      phone: {
        title: string;
        subtitle: string;
      };
      location: {
        title: string;
        subtitle: string;
      };
    };
    officeHours: {
      title: string;
      weekdays: string;
      saturday: string;
      sunday: string;
      weekdaysTime: string;
      saturdayTime: string;
      sundayTime: string;
    };
    cta: string;
    ctaSubtitle: string;
  };
  footer: {
    brand: {
      description: string;
      stayUpdated: string;
      placeholder: string;
      subscribe: string;
    };
    company: {
      title: string;
      aboutUs: string;
      ourTeam: string;
      careers: string;
      blog: string;
    };
    services: {
      title: string;
      webDevelopment: string;
      mobileApps: string;
      uiuxDesign: string;
      brandDesign: string;
    };
    contact: {
      title: string;
    };
    legal: {
      copyright: string;
      privacyPolicy: string;
      termsOfService: string;
    };
  };
  video: {
    title: string;
    subtitle: string;
    playing: string;
    videos: {
      intro: { title: string; description: string };
      services: { title: string; description: string };
      portfolio: { title: string; description: string };
      branding: { title: string; description: string };
      creative: { title: string; description: string };
      aboutUs: { title: string; description: string };
    };
  };
  investment: {
    startupCost: string;
    planningTime: string;
    buildTime: string;
    humanResources: string;
    people: string;
    projectDetails: string;
    learnMore: string;
    contactUs: string;
    badge: string;
    title: string;
    subtitle: string;
    roi: string;
    ctaTitle: string;
    ctaSubtitle: string;
    getCustomAnalysis: string;
    downloadGuide: string;
    projects: {
      ecommerce: {
        industry: string;
        description: string;
        cost: string;
        planning: string;
        build: string;
        teamSize: number;
        positions: string[];
        roi: string;
        details: string[];
      };
      education: {
        industry: string;
        description: string;
        cost: string;
        planning: string;
        build: string;
        teamSize: number;
        positions: string[];
        roi: string;
        details: string[];
      };
      enterprise: {
        industry: string;
        description: string;
        cost: string;
        planning: string;
        build: string;
        teamSize: number;
        positions: string[];
        roi: string;
        details: string[];
      };
    };
  };
  common: {
    loading: string;
    error: string;
    success: string;
    viewMore: string;
    learnMore: string;
    getStarted: string;
    contactUs: string;
  };
  auth: {
    login: {
      welcomeBack: string;
      title: string;
      subtitle: string;
      emailLabel: string;
      passwordLabel: string;
      rememberMe: string;
      forgotPassword: string;
      loginButton: string;
      noAccount: string;
      signUp: string;
    };
    register: {
      createAccount: string;
      title: string;
      subtitle: string;
      nameLabel: string;
      emailLabel: string;
      passwordLabel: string;
      confirmPasswordLabel: string;
      agreeToTerms: string;
      registerButton: string;
      haveAccount: string;
      signIn: string;
    };
  };
  modal: {
    createTask: string;
    createEmployee: string;
    createClient: string;
    createTransaction: string;
    createDocument: string;
    createProject: string;
    createInvoice: string;
    editTask: string;
    editEmployee: string;
    editClient: string;
    editTransaction: string;
    editDocument: string;
    editProject: string;
    editInvoice: string;
    viewTask: string;
    viewEmployee: string;
    viewClient: string;
    viewTransaction: string;
    viewDocument: string;
    viewProject: string;
    viewInvoice: string;
    deleteConfirm: string;
    cancel: string;
    save: string;
    create: string;
    delete: string;
    confirm: string;
    loading: string;
    saving: string;
    deleting: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    description: string;
  };
  form: {
    requiredField: string;
    invalidEmail: string;
    invalidPhone: string;
    invalidUrl: string;
    passwordTooShort: string;
    passwordsNotMatch: string;
    selectOption: string;
    enterValue: string;
    submit: string;
    reset: string;
    upload: string;
    download: string;
    search: string;
    filter: string;
    sort: string;
    clear: string;
    apply: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    finish: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    username?: string;
    phone?: string;
    role?: string;
    department?: string;
    position?: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      about: "About",
      services: "Services",
      portfolio: "Portfolio",
      team: "Team",
      blog: "Blog",
      contact: "Contact",
      login: "Login",
      getStarted: "Get Started",
      admin: "Admin",
      partners: "Partners",
      cases: "Cases",
      resources: "Resources",
      help: "Help Center",
      shop: "Shop",
      investment: "Investment",
      marketplace: "Marketplace",
    },
    hero: {
      badge: "Innovation & Excellence Since 2024",
      title1: "We Craft Digital",
      title2: "Experiences",
      subtitle:
        "Transforming visionary ideas into stunning digital realities through cutting-edge design, seamless development, and strategic innovation that drives real business results.",
      viewWork: "Explore Our Work",
      getInTouch: "Start Your Project",
      stats: {
        projects: "Projects Completed",
        clients: "Global Clients",
        awards: "Industry Awards",
      },
    },
    about: {
      badge: "About Us",
      title: "Crafting Digital Excellence",
      subtitle:
        "We're a team of passionate designers, developers, and strategists who believe that great digital experiences can transform businesses and change lives.",
      storyTitle: "Our Story",
      storyParagraphs: [
        "Founded in 2024, we started with a simple belief: technology should empower, not complicate. What began as a small team of creative minds has grown into a full-service digital agency that partners with brands worldwide.",
        "Today, we're proud to work with startups disrupting industries, established companies embracing digital transformation, and visionary leaders who aren't afraid to think differently.",
        "Our approach combines strategic thinking, creative excellence, and technical expertise to deliver solutions that don't just look good—they drive real business results.",
      ],
      keyPoints: [
        "Award-winning design team",
        "Full-stack development expertise",
        "Global client partnerships",
      ],
      achievements: {
        satisfaction: "Client Satisfaction",
        rating: "Average Rating",
        support: "Support Available",
        delivery: "On-Time Delivery",
      },
      valuesTitle: "Our Values",
      valuesSubtitle:
        "The principles that guide everything we do, from the first conversation to the final delivery.",
      cta: "Ready to work together?",
    },
    services: {
      badge: "What We Do",
      title: "Our Services",
      subtitle:
        "Comprehensive solutions that drive innovation and deliver exceptional results for your business.",
      items: {
        webDev: {
          title: "Web Development",
          description:
            "Full-stack web applications and websites built with modern frameworks, scalable architecture, and lightning-fast performance.",
          highlight: "Lightning Fast",
          features: [
            "Next.js 16 & React 19",
            "TypeScript & Node.js",
            "Cloud Deployment",
            "PWA & SEO Optimized",
            "Real-time Features",
          ],
        },
        mobileDev: {
          title: "Mobile Development",
          description:
            "Native and cross-platform mobile apps that provide seamless experiences across all devices and platforms.",
          highlight: "Cross-Platform",
          features: [
            "iOS & Android Native",
            "React Native & Flutter",
            "App Store Launch",
            "Push Notifications",
            "Offline Capabilities",
          ],
        },
        uiux: {
          title: "UI/UX Design",
          description:
            "Human-centered design that transforms complex problems into intuitive, accessible, and delightful user experiences.",
          highlight: "User-Centered",
          features: [
            "Design Systems",
            "User Journey Mapping",
            "Interactive Prototypes",
            "Accessibility (WCAG)",
            "Design Tokens",
          ],
        },
        branding: {
          title: "Brand & Identity",
          description:
            "Comprehensive brand strategies that create emotional connections and differentiate your business in the market.",
          highlight: "Memorable",
          features: [
            "Brand Strategy",
            "Logo & Visual Identity",
            "Brand Guidelines",
            "Marketing Collateral",
            "Brand Voice & Messaging",
          ],
        },
        strategy: {
          title: "Digital Strategy",
          description:
            "Data-driven digital marketing and growth strategies that amplify your reach and maximize conversion rates.",
          highlight: "Results-Driven",
          features: [
            "Growth Marketing",
            "SEO & Content Strategy",
            "Social Media Strategy",
            "Analytics & Attribution",
            "Conversion Optimization",
          ],
        },
        consulting: {
          title: "Technology Consulting",
          description:
            "Strategic technology guidance to modernize your infrastructure, optimize processes, and accelerate digital transformation.",
          highlight: "Future-Proof",
          features: [
            "Architecture Review",
            "Technology Roadmap",
            "Code Audits",
            "Team Mentoring",
            "DevOps & CI/CD",
          ],
        },
      },
    },
    portfolio: {
      badge: "Portfolio",
      title: "Featured Work",
      subtitle:
        "A showcase of our latest projects that push boundaries and deliver measurable results for forward-thinking clients.",
      cta: "Explore Full Portfolio",
      ctaSubtitle:
        "Discover more of our creative work and case studies in our complete portfolio gallery",
      showcaseTitle: "Creative Portfolio Showcase",
      showingProjects: "Showing {count} project{plural}",
      categories: {
        all: "All Works",
        web: "Web Design",
        mobile: "Mobile Apps",
        ui: "UI/UX Design",
        branding: "Brand Design",
        illustration: "Illustration",
      },
      sortOptions: {
        latest: "Latest",
        popular: "Popular",
        featured: "Featured",
      },
      projectDetail: {
        backToPortfolio: "Back to Portfolio",
        share: "Share",
        viewLive: "View Live",
        projectOverview: "Project Overview",
        technologiesUsed: "Technologies Used",
        tags: "Tags",
        projectDetails: "Project Details",
        designer: "Designer",
        client: "Client",
        completed: "Completed",
        category: "Category",
        likeProject: "Like Project",
        downloadAssets: "Download Assets",
        relatedProjects: "Related Projects",
      },
    },
    team: {
      badge: "Our Team",
      title: "Meet Our Experts",
      subtitle:
        "Talented individuals united by passion, creativity, and an unwavering commitment to delivering exceptional results.",
      cta: "Join Our Amazing Team",
      ctaSubtitle:
        "We're always looking for talented individuals to join our growing family",
      expertTitle: "Meet Our Experts",
    },
    testimonials: {
      badge: "Testimonials",
      title: "Client Success Stories",
      subtitle:
        "Don't just take our word for it. Hear what our clients say about their transformational experiences working with us.",
      trustBadges: {
        rating: {
          title: "4.9/5",
          label: "Average Rating",
        },
        satisfaction: {
          title: "100%",
          label: "Client Satisfaction",
        },
        repeat: {
          title: "95%",
          label: "Repeat Clients",
        },
      },
      cta: "Ready to be our next success story?",
      ctaSubtitle:
        "Join hundreds of satisfied clients who have transformed their business with our solutions",
    },
    cta: {
      badge: "Ready to Transform Your Vision?",
      title1: "Let's Create Something",
      title2: "Extraordinary Together",
      subtitle:
        "Join hundreds of satisfied clients who have transformed their digital presence with our innovative solutions. Your journey to digital excellence starts with a single conversation.",
      primaryButton: "Start Your Project Today",
      secondaryButton: "Explore Our Portfolio",
      trustIndicators: {
        available: {
          title: "Available Now",
          subtitle: "Ready for new projects",
        },
        response: {
          title: "Quick Response",
          subtitle: "Within 24 hours",
        },
        consultation: {
          title: "Free Consultation",
          subtitle: "Strategy session included",
        },
      },
      additionalCta: {
        title: "Ready to discuss your project?",
        subtitle:
          "Book a free 30-minute strategy session to explore how we can help bring your vision to life.",
        features: ["No commitment required", "Expert guidance included"],
      },
    },
    blog: {
      badge: "Blog & Insights",
      title: "Latest Insights",
      subtitle:
        "Discover industry trends, expert tips, and thought leadership from our creative team.",
      viewAll: "View All Articles",
      readMore: "Read More",
      author: "Author",
      cta: "Stay Updated with Our Latest Insights",
      ctaSubtitle:
        "Subscribe to our newsletter for weekly updates on design trends, development tips, and industry insights",
    },
    contact: {
      badge: "Get In Touch",
      title: "Let's Create Together",
      subtitle:
        "Have a project in mind? We'd love to hear about it. Drop us a line and let's create something extraordinary together.",
      formTitle: "Send Us a Message",
      formSubtitle:
        "Tell us about your project and we'll get back to you within 24 hours with a detailed proposal.",
      form: {
        name: "Your Name *",
        email: "Email Address *",
        subject: "Project Type *",
        message: "Project Details *",
        submit: "Send Message",
        sending: "Sending Message...",
        disclaimer:
          "By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.",
      },
      info: {
        title: "Ready to Start Your Journey?",
        subtitle:
          "Whether you have a question, want to start a project, or simply want to connect, we're here to help you bring your vision to life.",
        email: {
          title: "Email Us",
          subtitle: "We respond within 24 hours",
        },
        phone: {
          title: "Call Us",
          subtitle: "Available during business hours",
        },
        location: {
          title: "Visit Us",
          subtitle: "Open for meetings by appointment",
        },
      },
      officeHours: {
        title: "Office Hours",
        weekdays: "Monday - Friday",
        saturday: "Saturday",
        sunday: "Sunday",
        weekdaysTime: "9:00 AM - 6:00 PM",
        saturdayTime: "10:00 AM - 4:00 PM",
        sundayTime: "Closed",
      },
      cta: "Prefer to schedule a call?",
      ctaSubtitle:
        "Book a free 30-minute consultation to discuss your project in detail and get expert advice tailored to your needs.",
    },
    footer: {
      brand: {
        description:
          "Transforming ideas into digital masterpieces that inspire and deliver results.",
        stayUpdated: "Stay Updated",
        placeholder: "Your email",
        subscribe: "Subscribe",
      },
      company: {
        title: "Company",
        aboutUs: "About Us",
        ourTeam: "Our Team",
        careers: "Careers",
        blog: "Blog",
      },
      services: {
        title: "Services",
        webDevelopment: "Web Development",
        mobileApps: "Mobile Apps",
        uiuxDesign: "UI/UX Design",
        brandDesign: "Brand Design",
      },
      contact: {
        title: "Contact",
      },
      legal: {
        copyright: "Creative Agency. All rights reserved.",
        privacyPolicy: "Privacy Policy",
        termsOfService: "Terms of Service",
      },
    },
    video: {
      title: "Video Introduction",
      subtitle: "Learn more about our services and cases through video",
      playing: "Playing",
      videos: {
        intro: { title: "Company Introduction", description: "Learn about our brand story and core values" },
        services: { title: "Services Showcase", description: "Explore our professional creative services" },
        portfolio: { title: "Portfolio Highlights", description: "View our selected project cases" },
        branding: { title: "Brand VI Design Case", description: "Deep dive into our brand design philosophy" },
        creative: { title: "Creative Design Showcase", description: "Appreciate our latest creative sparks" },
        aboutUs: { title: "About Us", description: "Meet our team and culture" },
      },
    },
    investment: {
      startupCost: "Startup Cost",
      planningTime: "Planning Time",
      buildTime: "Build Time",
      humanResources: "Human Resources",
      people: "People",
      projectDetails: "Project Details",
      learnMore: "Learn More",
      contactUs: "Contact Us",
      badge: "Investment Planning",
      title: "Project Investment Planning",
      subtitle: "Explore investment requirements for digital projects across different industries, get accurate cost budgets, timelines, and team configurations",
      roi: "ROI Period",
      ctaTitle: "Need a customized investment plan?",
      ctaSubtitle: "Our professional team will create a detailed investment analysis report for you, covering cost-benefit analysis, risk assessment, and revenue forecasting",
      getCustomAnalysis: "Get Custom Investment Analysis",
      downloadGuide: "Download Investment Guide PDF",
      projects: {
        ecommerce: {
          industry: "E-commerce Platform",
          description: "Modern e-commerce solution based on Next.js and React",
          cost: "$7,000 - $14,000",
          planning: "2-4 weeks",
          build: "3-6 months",
          teamSize: 5,
          positions: ["Project Manager", "Frontend Developer", "Backend Developer", "UI/UX Designer", "QA Engineer"],
          roi: "12-18 months",
          details: ["Responsive design for mobile and desktop", "Integration with major payment gateways", "Complete product and order management", "SEO optimization for search rankings", "24/7 technical support and maintenance"],
        },
        education: {
          industry: "Online Education Platform",
          description: "Feature-rich online learning and course management system",
          cost: "$11,000 - $21,000",
          planning: "4-6 weeks",
          build: "6-8 months",
          teamSize: 7,
          positions: ["Education Product Manager", "Frontend Architect", "Full-stack Developer", "UI/UX Designer", "Video Tech Specialist", "Data Analyst", "QA Engineer"],
          roi: "18-24 months",
          details: ["Live streaming and recorded courses", "Online assignments and exam system", "Student progress tracking", "Multiple course pricing models", "Teacher-student interaction and learning community"],
        },
        enterprise: {
          industry: "Enterprise Management System",
          description: "Customized enterprise resource planning and management platform",
          cost: "$17,000 - $42,000",
          planning: "6-8 weeks",
          build: "8-12 months",
          teamSize: 10,
          positions: ["Enterprise Solution Architect", "Project Manager", "Frontend Team Lead", "Backend Team Lead", "Database Administrator", "UI/UX Designer", "Business Analyst", "Developers x2", "QA Engineer"],
          roi: "24-36 months",
          details: ["Enterprise process automation and optimization", "Data visualization and reporting", "Permission management and security controls", "Multi-department collaboration platform", "Scalable microservices architecture"],
        },
      },
    },
    common: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success!",
      viewMore: "View More",
      learnMore: "Learn More",
      getStarted: "Get Started",
      contactUs: "Contact Us",
    },
    pages: {
      about: {
        hero: { title: "About Us", subtitle: "We are a creative digital agency full of passion and innovation" },
        stats: { projects: "Projects Completed", clients: "Happy Clients", members: "Team Members", experience: "Years Experience" },
        story: {
          title: "Our Story",
          p1: "Founded in 2019, we started from a small team's dream.",
          p2: "Our team consists of experienced designers, developers, and marketing experts.",
          p3: "To date, we have served over 150 enterprises.",
        },
        team: { title: "Core Team", subtitle: "Meet our team members" },
        values: {
          title: "Core Values",
          subtitle: "These values guide every decision we make",
          target: { title: "Goal-Oriented", desc: "Always focused on client objectives" },
          quality: { title: "Quality Assurance", desc: "Strict quality control processes" },
          innovation: { title: "Continuous Innovation", desc: "Constantly learning new technologies" },
        },
        contact: {
          title: "Contact Us",
          subtitle: "Have a project idea? Let's discuss it together",
          address: { title: "Address" },
          email: { title: "Email" },
          phone: { title: "Phone" },
        },
        members: {
          zhangming: { name: "Zhang Ming", position: "Founder & CEO", bio: "10+ years of internet industry experience" },
          lihua: { name: "Li Hua", position: "CTO", bio: "Full-stack development expert" },
          wangfang: { name: "Wang Fang", position: "Design Director", bio: "Senior UI/UX designer" },
          liuqiang: { name: "Liu Qiang", position: "Project Manager", bio: "Agile project management expert" },
        },
      },
      team: {
        title: "Our Team",
        subtitle: "Meet the people behind our success",
      },
      blog: {
        title: "Blog",
        subtitle: "Sharing our insights and experiences",
        search: "Search articles...",
        noResults: "No articles found",
        readMore: "Read more",
        categories: { all: "All", tech: "Tech", design: "Design", business: "Business" },
      },
      contact: {
        title: "Contact Us",
        subtitle: "We'd love to hear from you",
        form: {
          name: "Your Name",
          email: "Email Address",
          phone: "Phone Number",
          subject: "Subject",
          message: "Your Message",
          submit: "Send Message",
        },
        info: {
          address: { title: "Address", line1: "88 Jianguo Road, Chaoyang District", line2: "SOHO Modern City A-2808, Beijing" },
          email: { title: "Email" },
          phone: { title: "Phone" },
        },
        success: "Message sent successfully!",
        error: "Failed to send message",
        networkError: "Network error",
      },
    },
    auth: {
      login: {
        welcomeBack: "Welcome back",
        title: "Sign in to your account",
        subtitle: "Enter your credentials to access your account",
        emailLabel: "Email address",
        passwordLabel: "Password",
        rememberMe: "Remember me",
        forgotPassword: "Forgot password?",
        loginButton: "Sign in",
        noAccount: "Don't have an account?",
        signUp: "Sign up",
      },
      register: {
        createAccount: "Create an account",
        title: "Start your journey",
        subtitle: "Create a new account to get started",
        nameLabel: "Full name",
        emailLabel: "Email address",
        passwordLabel: "Password",
        confirmPasswordLabel: "Confirm password",
        agreeToTerms: "I agree to the Terms of Service and Privacy Policy",
        registerButton: "Create account",
        haveAccount: "Already have an account?",
        signIn: "Sign in",
      },
    },
    modal: {
      createTask: "Create Task",
      createEmployee: "Create Employee",
      createClient: "Create Client",
      createTransaction: "Create Transaction",
      createDocument: "Create Document",
      createProject: "Create Project",
      createInvoice: "Create Invoice",
      editTask: "Edit Task",
      editEmployee: "Edit Employee",
      editClient: "Edit Client",
      editTransaction: "Edit Transaction",
      editDocument: "Edit Document",
      editProject: "Edit Project",
      editInvoice: "Edit Invoice",
      viewTask: "View Task",
      viewEmployee: "View Employee",
      viewClient: "View Client",
      viewTransaction: "View Transaction",
      viewDocument: "View Document",
      viewProject: "View Project",
      viewInvoice: "View Invoice",
      deleteConfirm: "Confirm Delete",
      cancel: "Cancel",
      save: "Save",
      create: "Create",
      delete: "Delete",
      confirm: "Confirm",
      loading: "Loading...",
      saving: "Saving...",
      deleting: "Deleting...",
      success: "Success!",
      error: "Error",
      warning: "Warning",
      info: "Info",
      description: "Fill in the basic information and login credentials will be sent automatically."
    },
    form: {
      requiredField: "This field is required",
      invalidEmail: "Invalid email address",
      invalidPhone: "Invalid phone number",
      invalidUrl: "Invalid URL",
      passwordTooShort: "Password must be at least 6 characters",
      passwordsNotMatch: "Passwords do not match",
      selectOption: "Please select an option",
      enterValue: "Please enter a value",
      submit: "Submit",
      reset: "Reset",
      upload: "Upload",
      download: "Download",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      clear: "Clear",
      apply: "Apply",
      close: "Close",
      back: "Back",
      next: "Next",
      previous: "Previous",
      finish: "Finish",
    },
  },
  zh: {
    nav: {
      about: "关于我们",
      services: "服务",
      portfolio: "作品集",
      team: "团队",
      blog: "博客",
      contact: "联系",
      login: "登录",
      getStarted: "开始合作",
      admin: "管理员",
      partners: "合作伙伴",
      cases: "案例",
      resources: "资源",
      help: "帮助中心",
      shop: "商城",
      investment: "投资",
      marketplace: "二手市场",
    },
    hero: {
      badge: "自2024年以来的创新与卓越",
      title1: "我们打造数字",
      title2: "体验",
      subtitle:
        "通过前沿设计、无缝开发和战略创新，将远见卓识的想法转化为令人惊叹的数字现实，推动真正的商业成果。",
      viewWork: "探索我们的作品",
      getInTouch: "开始您的项目",
      stats: {
        projects: "已完成项目",
        clients: "全球客户",
        awards: "行业奖项",
      },
    },
    about: {
      badge: "关于我们",
      title: "打造数字卓越",
      subtitle:
        "我们是一支充满激情的设计师、开发者和策略师团队，相信卓越的数字体验能够改变企业并影响生活。",
      storyTitle: "我们的故事",
      storyParagraphs: [
        "成立于2024年，我们始于一个简单的信念：技术应该赋能，而非复杂化。从一个创意团队的小规模开始，我们已经发展成为与全球品牌合作的全方位数字机构。",
        "今天，我们自豪地与颠覆行业的初创企业、拥抱数字化转型的知名公司，以及敢于不同凡想的远见领导者合作。",
        "我们的方法结合了战略思维、创意卓越和技术专长，提供的解决方案不仅美观，更能推动真正的商业成果。",
      ],
      keyPoints: ["屡获殊荣的设计团队", "全栈开发专业知识", "全球客户合作伙伴"],
      achievements: {
        satisfaction: "客户满意度",
        rating: "平均评分",
        support: "全天候支持",
        delivery: "准时交付",
      },
      valuesTitle: "我们的价值观",
      valuesSubtitle: "指导我们从初次对话到最终交付的每一个环节的原则。",
      cta: "准备好一起合作了吗？",
    },
    services: {
      badge: "我们的专业领域",
      title: "我们的服务",
      subtitle: "推动创新并为您的企业提供卓越成果的综合解决方案。",
      items: {
        webDev: {
          title: "网站开发",
          description:
            "使用现代框架、可扩展架构和闪电般快速性能构建的全栈网络应用程序和网站。",
          highlight: "闪电快速",
          features: [
            "Next.js 16 & React 19",
            "TypeScript & Node.js",
            "云端部署",
            "PWA & SEO优化",
            "实时功能",
          ],
        },
        mobileDev: {
          title: "移动应用开发",
          description:
            "在所有设备和平台上提供无缝体验的原生和跨平台移动应用程序。",
          highlight: "跨平台",
          features: [
            "iOS & Android 原生",
            "React Native & Flutter",
            "应用商店发布",
            "推送通知",
            "离线功能",
          ],
        },
        uiux: {
          title: "UI/UX设计",
          description:
            "以人为中心的设计，将复杂问题转化为直观、可访问且令人愉悦的用户体验。",
          highlight: "以用户为中心",
          features: [
            "设计系统",
            "用户旅程映射",
            "交互原型",
            "无障碍设计 (WCAG)",
            "设计令牌",
          ],
        },
        branding: {
          title: "品牌与身份",
          description: "创建情感连接并在市场中区别化您的企业的综合品牌策略。",
          highlight: "令人难忘",
          features: [
            "品牌策略",
            "标志与视觉识别",
            "品牌指南",
            "营销材料",
            "品牌声音与信息传达",
          ],
        },
        strategy: {
          title: "数字策略",
          description:
            "数据驱动的数字营销和增长策略，扩大您的影响力并最大化转化率。",
          highlight: "结果导向",
          features: [
            "增长营销",
            "SEO和内容策略",
            "社交媒体策略",
            "分析与归因",
            "转化优化",
          ],
        },
        consulting: {
          title: "技术咨询",
          description:
            "现代化基础设施、优化流程和加速数字化转型的战略技术指导。",
          highlight: "面向未来",
          features: [
            "架构审查",
            "技术路线图",
            "代码审核",
            "团队指导",
            "DevOps & CI/CD",
          ],
        },
      },
    },
    portfolio: {
      badge: "作品集",
      title: "精选作品",
      subtitle:
        "展示我们最新项目的精彩案例，推动界限并为前瞻性客户提供可衡量的成果。",
      cta: "探索完整作品集",
      ctaSubtitle: "在我们完整的作品集画廊中发现更多创意作品和案例研究",
      showcaseTitle: "创意作品集展示",
      showingProjects: "正在显示 {count} 个项目",
      categories: {
        all: "所有作品",
        web: "网页设计",
        mobile: "移动应用",
        ui: "UI/UX设计",
        branding: "品牌设计",
        illustration: "插画",
      },
      sortOptions: {
        latest: "最新",
        popular: "热门",
        featured: "精选",
      },
      projectDetail: {
        backToPortfolio: "返回作品集",
        share: "分享",
        viewLive: "查看在线版本",
        projectOverview: "项目概览",
        technologiesUsed: "使用技术",
        tags: "标签",
        projectDetails: "项目详情",
        designer: "设计师",
        client: "客户",
        completed: "完成时间",
        category: "类别",
        likeProject: "点赞项目",
        downloadAssets: "下载资源",
        relatedProjects: "相关项目",
      },
    },
    team: {
      badge: "我们的团队",
      title: "认识我们的专家",
      subtitle:
        "因热情、创造力和对提供卓越成果的坚定承诺而团结在一起的优秀人才。",
      cta: "加入我们的优秀团队",
      ctaSubtitle: "我们一直在寻找优秀人才加入我们不断发展的大家庭",
      expertTitle: "认识我们的专家",
    },
    testimonials: {
      badge: "客户推荐",
      title: "客户成功案例",
      subtitle:
        "不要只听我们的一面之词。听听我们的客户对与我们合作的变革性体验的评价。",
      trustBadges: {
        rating: {
          title: "4.9/5",
          label: "平均评分",
        },
        satisfaction: {
          title: "100%",
          label: "客户满意度",
        },
        repeat: {
          title: "95%",
          label: "回头客",
        },
      },
      cta: "准备成为我们的下一个成功案例吗？",
      ctaSubtitle: "加入数百位通过我们的解决方案改变业务的满意客户",
    },
    cta: {
      badge: "准备实现您的愿景了吗？",
      title1: "让我们共同创造",
      title2: "非凡成果",
      subtitle:
        "加入数百位通过我们创新解决方案改变数字形象的满意客户。您的数字卓越之旅从一次对话开始。",
      primaryButton: "今天就开始您的项目",
      secondaryButton: "探索我们的作品集",
      trustIndicators: {
        available: {
          title: "现在可用",
          subtitle: "准备承接新项目",
        },
        response: {
          title: "快速响应",
          subtitle: "24小时内回复",
        },
        consultation: {
          title: "免费咨询",
          subtitle: "包含策略会议",
        },
      },
      additionalCta: {
        title: "准备讨论您的项目了吗？",
        subtitle: "预订免费30分钟策略会议，探索我们如何帮助实现您的愿景。",
        features: ["无需承诺", "包含专家指导"],
      },
    },
    blog: {
      badge: "博客与见解",
      title: "最新见解",
      subtitle: "发现来自我们创意团队的行业趋势、专家技巧和思想领导力。",
      viewAll: "查看所有文章",
      readMore: "阅读更多",
      author: "作者",
      cta: "获取我们的最新见解",
      ctaSubtitle:
        "订阅我们的新闻通讯，获取设计趋势、开发技巧和行业见解的每周更新",
    },
    contact: {
      badge: "联系我们",
      title: "携手共创",
      subtitle:
        "有项目想法吗？我们很乐意了解。给我们留言，让我们一起创造非凡成果。",
      formTitle: "给我们留言",
      formSubtitle: "告诉我们您的项目，我们将在24小时内回复您详细的提案。",
      form: {
        name: "您的姓名 *",
        email: "电子邮箱地址 *",
        subject: "项目类型 *",
        message: "项目详情 *",
        submit: "发送消息",
        sending: "正在发送...",
        disclaimer:
          "提交此表单即表示您同意我们的隐私政策。我们绝不会与第三方分享您的信息。",
      },
      info: {
        title: "准备开始您的旅程了吗？",
        subtitle:
          "无论您有疑问、想开始项目，还是只是想联系，我们都在这里帮助您实现愿景。",
        email: {
          title: "邮箱联系",
          subtitle: "我们在24小时内回复",
        },
        phone: {
          title: "电话联系",
          subtitle: "工作时间内可用",
        },
        location: {
          title: "访问我们",
          subtitle: "预约开放会议",
        },
      },
      officeHours: {
        title: "办公时间",
        weekdays: "周一 - 周五",
        saturday: "周六",
        sunday: "周日",
        weekdaysTime: "上午9:00 - 下午6:00",
        saturdayTime: "上午10:00 - 下午4:00",
        sundayTime: "休息",
      },
      cta: "更喜欢安排通话吗？",
      ctaSubtitle:
        "预订免费30分钟咨询，详细讨论您的项目并获得量身定制的专家建议。",
    },
    footer: {
      brand: {
        description: "将想法转化为激发灵感并产生成果的数字杰作。",
        stayUpdated: "保持更新",
        placeholder: "您的邮箱",
        subscribe: "订阅",
      },
      company: {
        title: "公司",
        aboutUs: "关于我们",
        ourTeam: "我们的团队",
        careers: "招聘",
        blog: "博客",
      },
      services: {
        title: "服务",
        webDevelopment: "网站开发",
        mobileApps: "移动应用",
        uiuxDesign: "UI/UX设计",
        brandDesign: "品牌设计",
      },
      contact: {
        title: "联系方式",
      },
      legal: {
        copyright: "创意机构。保留所有权利。",
        privacyPolicy: "隐私政策",
        termsOfService: "服务条款",
      },
    },
    common: {
      loading: "加载中...",
      error: "出现错误",
      success: "成功！",
      viewMore: "查看更多",
      learnMore: "了解更多",
      getStarted: "开始使用",
      contactUs: "联系我们",
    },
    pages: {
      about: {
        hero: { title: "关于我们", subtitle: "我们是一家充满创意和激情的数字代理机构" },
        stats: { projects: "完成项目", clients: "满意客户", members: "团队成员", experience: "行业经验" },
        story: {
          title: "我们的故事",
          p1: "成立于2019年，我们从一个小团队的梦想开始。",
          p2: "我们的团队由经验丰富的设计师、开发者和营销专家组成。",
          p3: "至今为止，我们已经为150多家企业提供了服务。",
        },
        team: { title: "核心团队", subtitle: "遇见我们的团队成员" },
        values: {
          title: "核心价值",
          subtitle: "这些价值观指导着我们的每一个决策",
          target: { title: "目标导向", desc: "始终以客户目标为核心" },
          quality: { title: "品质保证", desc: "严格的品质控制流程" },
          innovation: { title: "持续创新", desc: "不断学习新技术" },
        },
        contact: {
          title: "联系我们",
          subtitle: "有项目想法？让我们一起讨论",
          address: { title: "地址" },
          email: { title: "邮箱" },
          phone: { title: "电话" },
        },
        members: {
          zhangming: { name: "张明", position: "创始人 & CEO", bio: "拥有10年互联网行业经验" },
          lihua: { name: "李华", position: "技术总监", bio: "全栈开发专家" },
          wangfang: { name: "王芳", position: "设计总监", bio: "资深UI/UX设计师" },
          liuqiang: { name: "刘强", position: "项目经理", bio: "敏捷项目管理专家" },
        },
      },
      team: {
        title: "我们的团队",
        subtitle: "遇见我们的团队成员，他们是我们成功的关键",
      },
      blog: {
        title: "博客文章",
        subtitle: "分享我们的见解、经验和行业动态",
        search: "搜索文章...",
        noResults: "没有找到匹配的文章",
        readMore: "阅读更多",
        categories: { all: "全部", tech: "技术", design: "设计", business: "商业" },
      },
      contact: {
        title: "联系我们",
        subtitle: "我们期待与您的交流",
        form: {
          name: "您的姓名",
          email: "邮箱地址",
          phone: "电话号码",
          subject: "主题",
          message: "您的留言",
          submit: "发送消息",
        },
        info: {
          address: { title: "地址", line1: "北京市朝阳区建国路88号", line2: "SOHO现代城A座2808" },
          email: { title: "邮箱" },
          phone: { title: "电话" },
        },
        success: "消息发送成功！",
        error: "发送失败，请重试",
        networkError: "网络错误",
      },
    },
    auth: {
      login: {
        welcomeBack: "欢迎回来",
        title: "登录您的账户",
        subtitle: "输入您的凭据以访问您的账户",
        emailLabel: "电子邮箱地址",
        passwordLabel: "密码",
        rememberMe: "记住我",
        forgotPassword: "忘记密码？",
        loginButton: "登录",
        noAccount: "还没有账户？",
        signUp: "注册",
      },
      register: {
        createAccount: "创建账户",
        title: "开始您的旅程",
        subtitle: "创建新账户以开始使用",
        nameLabel: "姓名",
        emailLabel: "电子邮箱地址",
        passwordLabel: "密码",
        confirmPasswordLabel: "确认密码",
        agreeToTerms: "我同意服务条款和隐私政策",
        registerButton: "创建账户",
        haveAccount: "已经有账户了？",
        signIn: "登录",
      },
    },
    video: {
      title: "视频介绍",
      subtitle: "通过视频深入了解我们的服务和案例",
      playing: "播放中",
      videos: {
        intro: { title: "公司介绍", description: "了解我们的品牌故事和核心价值观" },
        services: { title: "服务展示", description: "探索我们提供的专业创意服务" },
        portfolio: { title: "作品集锦", description: "查看我们的精选项目案例" },
        branding: { title: "品牌VI设计案例", description: "深入了解我们的品牌设计哲学" },
        creative: { title: "创意设计作品展示", description: "欣赏我们最新的创意火花" },
        aboutUs: { title: "关于我们", description: "认识我们的团队和文化" },
      },
    },
    investment: {
      startupCost: "启动成本",
      planningTime: "规划时间",
      buildTime: "建设时间",
      humanResources: "人力资源",
      people: "人",
      projectDetails: "项目详情",
      learnMore: "了解更多",
      contactUs: "联系我们",
      badge: "投资规划方案",
      title: "项目投资规划",
      subtitle: "探索不同行业数字化项目的投资需求，获得精准的成本预算、时间规划和团队配置方案",
      roi: "投资回报周期",
      ctaTitle: "需要定制化的投资方案？",
      ctaSubtitle: "我们的专业团队将为您量身定制详细的投资分析报告，涵盖成本效益分析、风险评估和收益预测",
      getCustomAnalysis: "获取定制化投资分析",
      downloadGuide: "下载投资指南PDF",
      projects: {
        ecommerce: {
          industry: "电商平台",
          description: "基于Next.js和React的现代化电商解决方案",
          cost: "￥50,000 - ￥100,000",
          planning: "2-4周",
          build: "3-6个月",
          teamSize: 5,
          positions: ["项目经理", "前端开发工程师", "后端开发工程师", "UI/UX设计师", "测试工程师"],
          roi: "12-18个月",
          details: ["响应式设计，支持移动端和桌面端", "集成支付宝、微信支付等主流支付方式", "完整的商品管理、订单管理系统", "SEO优化，提升搜索引擎排名", "7x24小时技术支持和维护"],
        },
        education: {
          industry: "在线教育平台",
          description: "功能丰富的在线学习和课程管理系统",
          cost: "￥80,000 - ￥150,000",
          planning: "4-6周",
          build: "6-8个月",
          teamSize: 7,
          positions: ["教育产品经理", "前端架构师", "全栈开发工程师", "UI/UX设计师", "视频技术专家", "数据分析师", "测试工程师"],
          roi: "18-24个月",
          details: ["直播授课和录播课程管理", "在线作业和考试系统", "学生学习进度跟踪", "多种课程收费模式", "师生互动和学习社区"],
        },
        enterprise: {
          industry: "企业管理系统",
          description: "定制化的企业资源规划和管理平台",
          cost: "￥120,000 - ￥300,000",
          planning: "6-8周",
          build: "8-12个月",
          teamSize: 10,
          positions: ["企业解决方案架构师", "项目经理", "前端团队负责人", "后端团队负责人", "数据库管理员", "UI/UX设计师", "业务分析师", "开发工程师×2", "质量保证工程师"],
          roi: "24-36个月",
          details: ["企业流程自动化和优化", "数据可视化和报表分析", "权限管理和安全控制", "多部门协同工作平台", "可扩展的微服务架构"],
        },
      },
    },
    modal: {
      createTask: "创建任务",
      createEmployee: "创建员工",
      createClient: "创建客户",
      createTransaction: "创建交易",
      createDocument: "创建文档",
      createProject: "创建项目",
      createInvoice: "创建发票",
      editTask: "编辑任务",
      editEmployee: "编辑员工",
      editClient: "编辑客户",
      editTransaction: "编辑交易",
      editDocument: "编辑文档",
      editProject: "编辑项目",
      editInvoice: "编辑发票",
      viewTask: "查看任务",
      viewEmployee: "查看员工",
      viewClient: "查看客户",
      viewTransaction: "查看交易",
      viewDocument: "查看文档",
      viewProject: "查看项目",
      viewInvoice: "查看发票",
      deleteConfirm: "确认删除",
      cancel: "取消",
      save: "保存",
      create: "创建",
      delete: "删除",
      confirm: "确认",
      loading: "加载中...",
      saving: "保存中...",
      deleting: "删除中...",
      success: "成功！",
      error: "错误",
      warning: "警告",
      info: "信息",
      description: "填写基本信息后将自动发送登录凭证。"
    },
    form: {
      requiredField: "此字段为必填项",
      invalidEmail: "无效的邮箱地址",
      invalidPhone: "无效的电话号码",
      invalidUrl: "无效的URL",
      passwordTooShort: "密码至少需要6个字符",
      passwordsNotMatch: "密码不匹配",
      selectOption: "请选择一个选项",
      enterValue: "请输入一个值",
      submit: "提交",
      reset: "重置",
      upload: "上传",
      download: "下载",
      search: "搜索",
      filter: "筛选",
      sort: "排序",
      clear: "清除",
      apply: "应用",
      close: "关闭",
      back: "返回",
      next: "下一步",
      previous: "上一步",
      finish: "完成",
    },
  },
  ug: {
    nav: {
      about: "بىز ھەققىدە",
      services: "مۇلازىمەت",
      portfolio: "ئەسەرلەر",
      team: "گۇرۇپپا",
      blog: "بىلوگ",
      contact: "ئالاقىلىشىش",
      login: "كىرىش",
      getStarted: "باشلاش",
      admin: "باشقۇرغۇچى",
      partners: "ھەمكارلار",
      cases: "ئەھۋاللار",
      resources: "مەنبەلەر",
      help: "ياردەم مەركىزى",
      shop: "دۇكان",
      investment: "مايە سېلىش",
      marketplace: "ئىككىنچى قول بازىرى",
    },
    hero: {
      badge: "2024-يىلدىن بۇيان يېڭىلىق ۋە ئالىيلىق",
      title1: "بىز رەقەملىك",
      title2: "تەجرىبە قۇرىمىز",
      subtitle:
        "ئالدىنقى قاتاردىكى لايىھەلەش، مۇكەممەل ئىجرا قىلىش ۋە ئىستراتېگىيەلىك يېڭىلىق ئارقىلىق يىراق كۆرۈشلۈك پىكىرلەرنى ھەقىقىي سودا نەتىجىلىرىنى ئېلىپ كېلىدىغان ھەيرانلىق قوزغايدىغان رەقەملىك ھەقىقەتكە ئايلاندۇرىمىز.",
      viewWork: "ئەسەرلىرىمىزنى ئىزدەڭ",
      getInTouch: "تۈرىڭىزنى باشلاڭ",
      stats: {
        projects: "تامامالنغان تۈرلەر",
        clients: "دۇنيالىق خېرىدارلار",
        awards: "كەسپىي مۇكاپاتلار",
      },
    },
    about: {
      badge: "بىز ھەققىدە",
      title: "رەقەملىك ئالىيلىقنى شەكىللەندۈرۈش",
      subtitle:
        "بىز ئالىي رەقەملىك تەجرىبىلەرنىڭ كارخانىلارنى ئۆزگەرتىپ، ھاياتنى ئۆزگەرتىشكە بولىدىغانلىقىغا ئىشىنىدىغان ئىھتىراسلىق لايىھەچىلەر، ئىجرا قىلغۇچىلار ۋە ئىستراتېگىيە مۇتەخەسسىسلىرىنىڭ گۇرۇپپىسى.",
      storyTitle: "بىزنىڭ ھىكايىمىز",
      storyParagraphs: [
        "2024-يىلى تەسىس قىلىنغان، بىز ئاددىي بىر ئىشەنچتىن باشلىدۇق: تېخنىكا كۈچەيتىدۇ، مۇرەككەپلەشمەيدۇ. كىچىك ئىجادىيە گۇرۇپپىسىدىن باشالپ، بىز ئەمدى دۇنيادىكى ماركىلار بىلەن ھەمكارلىشىدىغان تولۇق مۇلازىمەت رەقەملىك ئورگىنىغا ئۆسكەن.",
        "بۈگۈن، بىز سودا كەسىپلىرىنى بۇزىدىغان باشلانغۇچ شىركەتلەر، رەقەملىك ئۆزگىرىشنى قوبۇل قىلىدىغان داڭلىق شىركەتلەر ۋە ئوخشىمىغان ئويلاشقا جۈرئەت قىلىدىغان يىراق كۆرگۈچى رەھبەرلەر بىلەن ھەمكارلىشىدىغانلىقىمىزدىن پەخىر.",
        "بىزنىڭ ئۇسۇلىمىز ئىستراتېگىيەلىك ئويلاش، ئىجادىيە ئالىيلىقى ۋە تېخنىكىلىق تەخسۇسلۇقنى بىرلەشتۈرۈپ، چىرايلىق كۆرۈنۈشلۈك ئەمەس، بەلكى ھەقىقىي سودا نەتىجىلىرىنى ئېلىپ كېلىدىغان يېشىلىشلەرنى تەمىنلەيدۇ.",
      ],
      keyPoints: [
        "مۇكاپات قازانغان لايىھەلەش گۇرۇپپىسى",
        "تولۇق دۆڭ ئىجرا قىلىش تەخسۇسلۇقى",
        "دۇنيالىق خېرىدار ھەمكارلىرى",
      ],
      achievements: {
        satisfaction: "خېرىدار قانائەتلىنىشى",
        rating: "ئوتتۇرا باھا",
        support: "قوللاش مۇيەسسەر",
        delivery: "ۋاقتىدا يەتكۈزۈش",
      },
      valuesTitle: "بىزنىڭ قىممەتلىك قارىشىمىز",
      valuesSubtitle:
        "تۇنجى سۆھبەتتىن ئاخىرقى تەسلىم قىلىشقىچە بولغان ھەرقانداق ئىشنى يېتەكچىلىك قىلىدىغان ئەسەلەت.",
      cta: "بىللە ھەمكارلىشىشقا تەييارمۇ؟",
    },
    services: {
      badge: "مۇتەخەسسىسلىك رايونىمىز",
      title: "بىزنىڭ مۇلازىمىتىمىز",
      subtitle:
        "سىزنىڭ سودىڭىز ئۈچۈن يېڭىلىقنى ئىلگىرى سۈرىدىغان ۋە ئالىي نەتىجىلەرنى تەمىنلەيدىغان كۆپ تەرەپلىمە يېشىلىش.",
      items: {
        webDev: {
          title: "توربېت ئىجرا قىلىش",
          description:
            "زامانىۋى قۇرۇلما، كېڭەيتىشچان قۇرۇلۇش ۋە چاقماقتەك تېز ئىجرائەت بىلەن قۇرۇلغان تولۇق دۆڭ توربېت قوللىنىشچان پروگراممىلار ۋە توربېتلار.",
          highlight: "چاقماقتەك تېز",
          features: [
            "Next.js 16 ۋە React 19",
            "TypeScript ۋە Node.js",
            "بۇلۇت يايلىتىش",
            "PWA ۋە SEO ئەلالاشتۇرۇش",
            "ھازىرقى ۋاقىت ئىقتىدارلىرى",
          ],
        },
        mobileDev: {
          title: "كۆچمە ئەپ ئىجرا قىلىش",
          description:
            "بارلىق ئۈسكۈنە ۋە سۇپىلاردا ئۈزۈلۈكسىز تەجرىبە تەمىنلەيدىغان يەرلىك ۋە كۆپ سۇپا كۆچمە ئەپلەر.",
          highlight: "كۆپ سۇپا",
          features: [
            "iOS ۋە Android يەرلىك",
            "React Native ۋە Flutter",
            "ئەپ دۇكىنى تارقىتىش",
            "ئىتتىرىش ئۇقتۇرۇشى",
            "تورسىز ئىقتىدارلار",
          ],
        },
        uiux: {
          title: "UI/UX لايىھەلەش",
          description:
            "مۇرەككەپ مەسىلىلەرنى ئوڭۇدان چۈشىنىشچان، زىيارەت قىلىشچان ۋە خۇشاللىق كەلتۈرىدىغان ئىشلەتكۈچى تەجرىبىسىگە ئايلاندۇرىدىغان ئىنسان مەركىزلىك لايىھەلەش.",
          highlight: "ئىشلەتكۈچى مەركىزلىك",
          features: [
            "لايىھەلەش سىستېمىسى",
            "ئىشلەتكۈچى سەپەر خەرىتىسى",
            "ئۆز-ئارا تەسىرلىك ئۈلگىلەر",
            "زىيارەت قىلىشچانلىق (WCAG)",
            "لايىھەلەش بەلگىلەر",
          ],
        },
        branding: {
          title: "ماركا ۋە كىملىك",
          description:
            "ئېھساسات ئۇلىنىشى يارىتىدىغان ۋە بازاردا سىزنىڭ سودىڭىزنى پەرقلەندۈرىدىغان كۆپ تەرەپلىمە ماركا ئىستراتېگىيىسى.",
          highlight: "ئەسلىيالماس",
          features: [
            "ماركا ئىستراتېگىيىسى",
            "لوگو ۋە كۆرۈنۈش كىملىكى",
            "ماركا يوليورۇقى",
            "ماركېتىنگ ماتېرىياللىرى",
            "ماركا ئاۋازى ۋە ئۇچۇر يەتكۈزۈش",
          ],
        },
        strategy: {
          title: "رەقەملىك ئىستراتېگىيە",
          description:
            "سىزنىڭ تەسىرىڭىزنى كېڭەيتىدىغان ۋە ئايلاندۇرۇش نىسبىتىنى ئەڭ چوڭ قىلىدىغان سان-مەلۇمات يېتەكچىلىكىدىكى رەقەملىك ماركېتىنگ ۋە ئۆسۈش ئىستراتېگىيىسى.",
          highlight: "نەتىجە يوللىغۇچى",
          features: [
            "ئۆسۈش ماركېتىنگى",
            "SEO ۋە مەزمۇن ئىستراتېگىيىسى",
            "ئىجتىمائىي ۋاسىتە ئىستراتېگىيىسى",
            "ئانالىز ۋە نەسەبلەش",
            "ئايلاندۇرۇش ئەلالاشتۇرۇش",
          ],
        },
        consulting: {
          title: "تېخنىكا مەسلىھەت",
          description:
            "ئاساسىي قۇرۇلمىنى زامانىۋىلاشتۇرۇش، جەريانلارنى ئەلالاشتۇرۇش ۋە رەقەملىك ئۆزگىرىشنى تېزلەشتۈرۈشكە ئىستراتېگىيەلىك تېخنىكا يېتەكچىلىكى.",
          highlight: "كەلگۈسىگە تايار",
          features: [
            "قۇرۇلما تەكشۈرۈش",
            "تېخنىكا يول خەرىتىسى",
            "كود تەكشۈرۈش",
            "گۇرۇپپا يېتەكچىلىك",
            "DevOps ۋە CI/CD",
          ],
        },
      },
    },
    portfolio: {
      badge: "ئەسەرلەر",
      title: "ئالاھىدە ئەسەرلەر",
      subtitle:
        "ئالدىنقى ئويلاشچان خېرىدارلار ئۈچۈن چەكلەرنى ئىتتىرىدىغان ۋە ئۆلچىمەل نەتىجىلەرنى تەمىنلەيدىغان ئەڭ يېڭى تۈرلىرىمىزنىڭ نامايىشى.",
      cta: "تولۇق ئەسەرلەرنى ئىزدەڭ",
      ctaSubtitle:
        "تولۇق ئەسەرلەر گالېرىيەدە تېخىمۇ كۆپ ئىجادىيەت ئەسەرلەر ۋە ئەھۋال تەتقىقاتلىرىنى كەشپىيە قىلىڭ",
      showcaseTitle: "ئىجادىيەت ئەسەرلەر نامايىشى",
      showingProjects: "پروگرامما كۆرسىتىلىۋاتىدۇ",
      categories: {
        all: "بارلىق ئەسەرلەر",
        web: "توربېت لايىھەلەش",
        mobile: "كۆچمە ئەپ",
        ui: "UI/UX لايىھەلەش",
        branding: "ماركا لايىھەلەش",
        illustration: "رەسىم",
      },
      sortOptions: {
        latest: "ئەڭ يېڭى",
        popular: "ئاممىۋى",
        featured: "ئالاھىدە",
      },
      projectDetail: {
        backToPortfolio: "ئەسەرلەر يىغىنىغا قايت",
        share: "ئورتاقلىشىش",
        viewLive: "تىرىك كۆرۈش",
        projectOverview: "تۈر ئومۇمىي مەزمۇنى",
        technologiesUsed: "ئىشلىتىلگەن تېخنىكىلار",
        tags: "بەلگىلەر",
        projectDetails: "تۈر تەپسىلاتلىرى",
        designer: "لايىھەچى",
        client: "خېرىدار",
        completed: "تاماملانغان ۋاقىت",
        category: "تۈرى",
        likeProject: "تۈرنى ياقتۇرۇش",
        downloadAssets: "مەنبەلەرنى چۈشۈرۈش",
        relatedProjects: "مۇناسىۋەتلىك تۈرلەر",
      },
    },
    team: {
      badge: "بىزنىڭ گۇرۇپپىمىز",
      title: "مۇتەخەسسىسلىرىمىز بىلەن تونۇشۇڭ",
      subtitle:
        "ئىھتىراس، ئىجادىيەت ۋە ئالىي نەتىجىلەرنى تەمىنلەشكە بولغان چىڭ ۋەدىدىلىك ئۈچۈن بىرلەشكەن ئالىي تالانتلار.",
      cta: "بىزنىڭ ئالىي گۇرۇپپىمىزغا قوشۇلۇڭ",
      ctaSubtitle:
        "بىز ھەمىشە ئۆسۈپ بارىدىغان ئائىلىمىزگە قوشۇلىدىغان ئالىي تالانتلارنى ئىزدەۋاتىمىز",
      expertTitle: "مۇتەخەسسىسلىرىمىز بىلەن تونۇشۇڭ",
    },
    testimonials: {
      badge: "خېرىدار تەۋسىيەلىرى",
      title: "خېرىدار مۇۋەپپەقىيەت ھىكايىلىرى",
      subtitle:
        "پەقەت بىزنىڭ سۆزىمىزگىلا تايانماڭ. خېرىدارلىرىمىز بىز بىلەن ھەمكارلىشىپ ئېرىشكەن ئۆزگىرىش تەجرىبىلىرى توغرىسىدىكى باھالىرىنى ئاڭلاڭ.",
      trustBadges: {
        rating: {
          title: "4.9/5",
          label: "ئوتتۇرا باھا",
        },
        satisfaction: {
          title: "100%",
          label: "خېرىدار قانائەتلىنىشى",
        },
        repeat: {
          title: "95%",
          label: "قايتا كەلگۈچى خېرىدارلار",
        },
      },
      cta: "بىزنىڭ كېيىنكى مۇۋەپپەقىيەت ھىكايىمىز بولۇشقا تەييارمۇ؟",
      ctaSubtitle:
        "بىزنىڭ يېشىلىشلىرىمىز ئارقىلىق سودىسىنى ئۆزگەرتكەن يۈزلىگەن قانائەتلەنگەن خېرىدارلارغا قوشۇلۇڭ",
    },
    cta: {
      badge: "ئارزۇئىڭىزنى ئەمەلگە ئاشۇرۇشقا تەييارمۇ؟",
      title1: "بىللە ئالاھىدە",
      title2: "نەتىجىلەرنى يارىتايلى",
      subtitle:
        "بىزنىڭ يېڭىلىقچان يېشىلىشلىرىمىز ئارقىلىق رەقەملىك شەكلىنى ئۆزگەرتكەن يۈزلىگەن قانائەتلەنگەن خېرىدارلارغا قوشۇلۇڭ. سىزنىڭ رەقەملىك ئالىيلىق سەپىرىڭىز بىر سۆھبەتتىن باشلىنىدۇ.",
      primaryButton: "بۈگۈن تۈرىڭىزنى باشلاڭ",
      secondaryButton: "ئەسەرلىرىمىزنى ئىزدەڭ",
      trustIndicators: {
        available: {
          title: "ھازىر مۇيەسسەر",
          subtitle: "يېڭى تۈرلەرگە تەييار",
        },
        response: {
          title: "تېز جاۋاب",
          subtitle: "24 سائەت ئىچىدە",
        },
        consultation: {
          title: "ھەقسىز مەسلىھەت",
          subtitle: "ئىستراتېگىيە يىغىنى كىرىدۇ",
        },
      },
      additionalCta: {
        title: "تۈرىڭىزنى مۇزاكىرە قىلىشقا تەييارمۇ؟",
        subtitle:
          "ئارزۇئىڭىزنى ھاياتقا ئاشۇرۇشتا قانداق ياردەم قىلالايدىغانلىقىمىزنى تەتقىق قىلىش ئۈچۈن ھەقسىز 30 مىنۇتلۇق ئىستراتېگىيە يىغىنى تەرتىپ قىلىڭ.",
        features: ["ۋەدە تەلەپ قىلىنمايدۇ", "مۇتەخەسسىس يېتەكچىلىك كىرىدۇ"],
      },
    },
    blog: {
      badge: "بىلوگ ۋە تۈشەنچە",
      title: "ئەڭ يېڭى تۈشەنچىلەر",
      subtitle:
        "بىزنىڭ ئىجادىيە گۇرۇپپىمىزدىن كەسپىي يۆنىلىش، مۇتەخەسسىس مەسلىھەت ۋە ئوي يېتەكچىلىكىنى كەشپىيە قىلىڭ.",
      viewAll: "بارلىق ماقالىلەرنى كۆرۈش",
      readMore: "تېخىمۇ كۆپ ئوقۇش",
      author: "يازغۇچى",
      cta: "بىزنىڭ ئەڭ يېڭى تۈشەنچىلىرىمىز بىلەن باغلىنىپ تۇرۇڭ",
      ctaSubtitle:
        "لايىھەلەش يۆنىلىشى، ئىجرا مەسلىھەتلىرى ۋە كەسپىي تۈشەنچىلەرنىڭ ھەپتىلىك يېڭىلانمىلىرى ئۈچۈن خەۋەرنامىمىزگە مۇشتەرى بولۇڭ",
    },
    contact: {
      badge: "ئالاقىلىشىش",
      title: "بىللە قۇرايلى",
      subtitle:
        "تۈر ئويىڭىز بارمۇ؟ بۇنى ئاڭلاپ خۇشال بولىمىز. بىزگە خەت يېزىڭ، ئالاھىدە نەتىجىلەرنى بىللە يارىتايلى.",
      formTitle: "بىزگە خەت يوللاڭ",
      formSubtitle:
        "تۈرىڭىز توغرىسىدا بىزگە دەڭ، بىز 24 سائەت ئىچىدە تەپسىلىي تەكلىپ بىلەن جاۋاب قايتۇرىمىز.",
      form: {
        name: "ئىسمىڭىز *",
        email: "ئېلخەت ئادرېسى *",
        subject: "تۈر تىپى *",
        message: "تۈر تەپسىلاتلىرى *",
        submit: "خەت يوللاش",
        sending: "يوللاۋاتىدۇ...",
        disclaimer:
          "بۇ فورمىنى تاپشۇرۇش بىزنىڭ مەخپىيەتلىك سىياسىتىمىزگە قوشۇلىدىغانلىقىڭىزنى بىلدۈرىدۇ. بىز ھەرگىز ئۇچۇرلىرىڭىزنى ئۈچىنچى تەرەپ بىلەن ئورتاقلاشمايمىز.",
      },
      info: {
        title: "سەپىرىڭىزنى باشلاشقا تەييارمۇ؟",
        subtitle:
          "سوئالىڭىز، تۈر باشلىماقچى، ياكى ئاددىي ئالاقىلىشماقچى بولسىڭىز، بىز ئارزۇئىڭىزنى ھاياتقا ئاشۇرۇشتا ياردەم قىلىشقا تەييارمىز.",
        email: {
          title: "ئېلخەت ئارقىلىق",
          subtitle: "بىز 24 سائەت ئىچىدە جاۋاب قايتۇرىمىز",
        },
        phone: {
          title: "تېلېفون ئارقىلىق",
          subtitle: "خىزمەت ۋاقتىدا مۇيەسسەر",
        },
        location: {
          title: "زىيارەت قىلىڭ",
          subtitle: "ۋەدە ئارقىلىق يىغىن ئېچىق",
        },
      },
      officeHours: {
        title: "ئىشخانا ۋاقتى",
        weekdays: "دۈشەنبە - جۈمە",
        saturday: "شەنبە",
        sunday: "يەكشەنبە",
        weekdaysTime: "سەھەر 9:00 - كەچتە 6:00",
        saturdayTime: "سەھەر 10:00 - كەچتە 4:00",
        sundayTime: "دەم ئېلىش",
      },
      cta: "تېلېفون سۆھبىتىنى تەرتىپلەشنى ئارتۇق كۆرۈمسىز؟",
      ctaSubtitle:
        "تۈرىڭىزنى تەپسىلىي مۇزاكىرە قىلىش ۋە ئېھتىياجىڭىزغا ماس مۇتەخەسسىس مەسلىھەت ئېلىش ئۈچۈن ھەقسىز 30 مىنۇتلۇق مەسلىھەت تەرتىپ قىلىڭ.",
    },
    footer: {
      brand: {
        description:
          "ئويلارنى ئىلھاملاندۇرىدىغان ۋە نەتىجە ئېلىپ كېلىدىغان رەقەملىك شاھەسەرلەرگە ئايلاندۇرۇش.",
        stayUpdated: "يېڭىلانما ساقلاڭ",
        placeholder: "ئېلخىتىڭىز",
        subscribe: "مۇشتەرى بولۇش",
      },
      company: {
        title: "شىركەت",
        aboutUs: "بىز ھەققىدە",
        ourTeam: "بىزنىڭ گۇرۇپپىمىز",
        careers: "كەسپ پۇرسىتى",
        blog: "بىلوگ",
      },
      services: {
        title: "مۇلازىمەت",
        webDevelopment: "توربېت ئىجرا قىلىش",
        mobileApps: "كۆچمە ئەپلەر",
        uiuxDesign: "UI/UX لايىھەلەش",
        brandDesign: "ماركا لايىھەلەش",
      },
      contact: {
        title: "ئالاقە",
      },
      legal: {
        copyright: "ئىجادىيەت ئورگىنى. بارلىق ھوقۇق ساقلانغان.",
        privacyPolicy: "مەخپىيەتلىك سىياسىتى",
        termsOfService: "مۇلازىمەت شەرتلىرى",
      },
    },
    common: {
      loading: "يۈكلىنىۋاتىدۇ...",
      error: "خاتالىق كۆرۈلدى",
      success: "مۇۋەپپەقىيەتلىك!",
      viewMore: "تېخىمۇ كۆپ كۆرۈش",
      learnMore: "تېخىمۇ كۆپ ئۆگىنىش",
      getStarted: "باشلاش",
      contactUs: "بىز بىلەن ئالاقىلىشىڭ",
    },
    pages: {
      about: {
        hero: { title: "بىز ھەققىدە", subtitle: "بىز ئىجادىيەت ۋە ئىھتىراسقا تولغان رەقەملىك ئورگىن" },
        stats: { projects: "تامامالنغان تۈرلەر", clients: "قانائەتلەنگەن خېرىدارلار", members: "گۇرۇپپا ئەزالىرى", experience: "كەسپىي تەجرىبە" },
        story: {
          title: "بىزنىڭ ھىكايىمىز",
          p1: "2019-يىلى تەسىس قىلىنغان، بىز كىچىك گۇرۇپپىنىڭ ئارزۇسىدىن باشلىدۇق.",
          p2: "بىزنىڭ گۇرۇپپىمىز تەجرىبىلىك لايىھەچىلەر، ئىجرا قىلغۇچىلار ۋە ماركېتىنگ مۇتەخەسسىسلىرىدىن تەركىب تاپقان.",
          p3: "ھازىرغىچە بىز 150 دىن ئارتۇق كارخانىغا مۇلازىمەت قىلدۇق.",
        },
        team: { title: "يادرولۇق گۇرۇپپا", subtitle: "گۇرۇپپا ئەزالىرىمىز بىلەن تونۇشۇڭ" },
        values: {
          title: "يادرولۇق قىممەت",
          subtitle: "بۇ قىممەتلەر بىزنىڭ ھەر بىر قارارىمىزنى يېتەكچىلىك قىلىدۇ",
          target: { title: "نىشان يوللىغۇچى", desc: "ھەمىشە خېرىدار نىشانىنى مەركەز قىلىش" },
          quality: { title: "سۈپەت كاپالىتى", desc: "قاتتىق سۈپەت كونترول جەريانى" },
          innovation: { title: "داۋاملىق يېڭىلىق", desc: "يېڭى تېخنىكىلارنى ئۈزلۈكسىز ئۆگىنىش" },
        },
        contact: {
          title: "بىز بىلەن ئالاقىلىشىڭ",
          subtitle: "تۈر ئويىڭىز بارمۇ؟ بىللە مۇزاكىرە قىلايلى",
          address: { title: "ئادرېس" },
          email: { title: "ئېلخەت" },
          phone: { title: "تېلېفون" },
        },
        members: {
          zhangming: { name: "جاڭ مىڭ", position: "تەسىسچى ۋە باش ئىجرائىيە", bio: "10 يىلدىن ئارتۇق تور كەسپى تەجرىبىسى" },
          lihua: { name: "لى خۇا", position: "تېخنىكا مۇدىرى", bio: "تولۇق دۆڭ ئىجرا قىلىش مۇتەخەسسىسى" },
          wangfang: { name: "ۋاڭ فاڭ", position: "لايىھەلەش مۇدىرى", bio: "تەجرىبىلىك UI/UX لايىھەچى" },
          liuqiang: { name: "لىيۇ چياڭ", position: "تۈر باشقۇرغۇچى", bio: "چاققان تۈر باشقۇرۇش مۇتەخەسسىسى" },
        },
      },
      team: {
        title: "بىزنىڭ گۇرۇپپىمىز",
        subtitle: "مۇۋەپپەقىيىتىمىزنىڭ ئارقىسىدىكى كىشىلەر بىلەن تونۇشۇڭ",
      },
      blog: {
        title: "بىلوگ",
        subtitle: "تۈشەنچە ۋە تەجرىبىلىرىمىزنى ئورتاقلىشىش",
        search: "ماقالە ئىزدەش...",
        noResults: "ماقالە تېپىلمىدى",
        readMore: "تېخىمۇ كۆپ ئوقۇش",
        categories: { all: "ھەممىسى", tech: "تېخنىكا", design: "لايىھەلەش", business: "سودا" },
      },
      contact: {
        title: "بىز بىلەن ئالاقىلىشىڭ",
        subtitle: "سىزدىن خەۋەر ئاڭلاشنى خالايمىز",
        form: {
          name: "ئىسمىڭىز",
          email: "ئېلخەت ئادرېسى",
          phone: "تېلېفون نومۇرى",
          subject: "تېما",
          message: "ئۇچۇرىڭىز",
          submit: "ئۇچۇر يوللاش",
        },
        info: {
          address: { title: "ئادرېس", line1: "بېيجىڭ چاۋياڭ رايونى جياڭگۇئو يولى 88-نومۇر", line2: "SOHO زامانىۋى شەھەر A بىناسى 2808" },
          email: { title: "ئېلخەت" },
          phone: { title: "تېلېفون" },
        },
        success: "ئۇچۇر مۇۋەپپەقىيەتلىك يوللاندى!",
        error: "يوللاش مەغلۇپ بولدى، قايتا سىناڭ",
        networkError: "تور خاتالىقى",
      },
    },
    auth: {
      login: {
        welcomeBack: "قايتا كەلگىنىڭىزنى قارشى ئالىمىز",
        title: "ھېساباتىڭىزغا كىرىڭ",
        subtitle: "ھېساباتىڭىزغا كىرىش ئۈچۈن كىملىكىڭىزنى كىرگۈزۈڭ",
        emailLabel: "ئېلخەت ئادرېسى",
        passwordLabel: "پارول",
        rememberMe: "مېنى ئەستە تۇت",
        forgotPassword: "پارولنى ئۇنتۇپ قالدىڭىزمۇ؟",
        loginButton: "كىرىش",
        noAccount: "ھېساباتىڭىز يوقمۇ؟",
        signUp: "تىزىملىتىڭ",
      },
      register: {
        createAccount: "ھېسابات قۇرۇش",
        title: "سەپىرىڭىزنى باشلاڭ",
        subtitle: "باشلاش ئۈچۈن يېڭى ھېسابات قۇرۇڭ",
        nameLabel: "تولۇق ئىسىم",
        emailLabel: "ئېلخەت ئادرېسى",
        passwordLabel: "پارول",
        confirmPasswordLabel: "پارولنى جەزملەشتۈرۈڭ",
        agreeToTerms:
          "مەن مۇلازىمەت شەرتلىرى ۋە مەخپىيەتلىك سىياسىتىگە قوشۇلىمەن",
        registerButton: "ھېسابات قۇرۇش",
        haveAccount: "ھېساباتىڭىز بارمۇ؟",
        signIn: "كىرىش",
      },
    },
    video: {
      title: "ۋىدېئو تونۇشتۇرۇش",
      subtitle: "ۋىدېئو ئارقىلىق مۇلازىمەت ۋە ئەھۋاللىرىمىزنى چوڭقۇر چۈشىنىڭ",
      playing: "قويۇلۇۋاتىدۇ",
      videos: {
        intro: { title: "شىركەت تونۇشتۇرۇش", description: "ماركا ھىكايىمىز ۋە يادرولۇق قىممەت قارىشىمىزنى چۈشىنىڭ" },
        services: { title: "مۇلازىمەت نامايىشى", description: "تەمىنلىگەن كەسپىي ئىجادىيەت مۇلازىمىتىمىزنى ئىزدەڭ" },
        portfolio: { title: "ئەسەرلەر توپلىمى", description: "تاللانغان تۈر ئەھۋاللىرىمىزنى كۆرۈڭ" },
        branding: { title: "ماركا VI لايىھەلەش ئەھۋالى", description: "ماركا لايىھەلەش پەلسەپىمىزنى چوڭقۇر چۈشىنىڭ" },
        creative: { title: "ئىجادىيەت لايىھەلەش ئەسەرلىرى نامايىشى", description: "ئەڭ يېڭى ئىجادىيەت ئوتلىرىمىزنى تەقدىرلەڭ" },
        aboutUs: { title: "بىز ھەققىدە", description: "گۇرۇپپا ۋە مەدەنىيىتىمىز بىلەن تونۇشۇڭ" },
      },
    },
    investment: {
      startupCost: "باشلىنىش مەبلىغى",
      planningTime: "پىلانلاش ۋاقتى", 
      buildTime: "قۇرۇلۇش ۋاقتى",
      humanResources: "ئىشچى-خىزمەتچى بايلىقى",
      people: "ئادەم",
      projectDetails: "تۈر تەپسىلاتى",
      learnMore: "تېخىمۇ كۆپ بىلىش",
      contactUs: "بىز بىلەن ئالاقىلىشىڭ",
      badge: "مەبلەغ سېلىش پىلانى",
      title: "تۈر مەبلەغ سېلىش پىلانى",
      subtitle: "ئوخشىمىغان كەسىپلەردىكى رەقەملىك تۈرلەرنىڭ مەبلەغ سېلىش تەلىپىنى ئىزدەڭ، ئېنىق تەننەرخ مۆلچەرى، ۋاقىت پىلانى ۋە گۇرۇپپا تەڭشىكىنى ئېلىڭ",
      roi: "مەبلەغ قايتۇرۇش دەۋرى",
      ctaTitle: "خاسلاشتۇرۇلغان مەبلەغ سېلىش پىلانى كېرەكمۇ؟",
      ctaSubtitle: "بىزنىڭ كەسپىي گۇرۇپپىمىز سىز ئۈچۈن تەننەرخ-پايدا ئانالىزى، خەتەر باھالاش ۋە كىرىم مۆلچەرىنى ئۆز ئىچىگە ئالغان تەپسىلىي مەبلەغ سېلىش ئانالىز دوكلاتى تەييارلايدۇ",
      getCustomAnalysis: "خاسلاشتۇرۇلغان مەبلەغ سېلىش ئانالىزى ئېلىش",
      downloadGuide: "مەبلەغ سېلىش قوللانمىسى PDF چۈشۈرۈش",
      projects: {
        ecommerce: {
          industry: "ئېلېكترون سودا سۇپىسى",
          description: "Next.js ۋە React ئاساسىدىكى زامانىۋى ئېلېكترون سودا يېشىلىشى",
          cost: "$7,000 - $14,000",
          planning: "2-4 ھەپتە",
          build: "3-6 ئاي",
          teamSize: 5,
          positions: ["تۈر باشقۇرغۇچى", "ئالدى تەرەپ ئىجرا قىلغۇچى", "ئارقا تەرەپ ئىجرا قىلغۇچى", "UI/UX لايىھەچى", "سۈپەت مۇھەندىسى"],
          roi: "12-18 ئاي",
          details: ["كۆچمە ۋە ئۈستەل ئۈسكۈنىلەرنى قوللايدىغان ماسلىشىشچان لايىھەلەش", "ئاساسلىق تۆلەش ئۇسۇللىرى بىلەن بىرلەشتۈرۈش", "تولۇق مەھسۇلات ۋە زاكاز باشقۇرۇش", "ئىزدەش ماتورى تەرتىپىنى ئۆستۈرۈش ئۈچۈن SEO ئەلالاشتۇرۇش", "7x24 سائەت تېخنىكىلىق قوللاش ۋە ئاسراش"],
        },
        education: {
          industry: "توردا مائارىپ سۇپىسى",
          description: "ئىقتىدارى مول توردا ئۆگىنىش ۋە دەرس باشقۇرۇش سىستېمىسى",
          cost: "$11,000 - $21,000",
          planning: "4-6 ھەپتە",
          build: "6-8 ئاي",
          teamSize: 7,
          positions: ["مائارىپ مەھسۇلات باشقۇرغۇچى", "ئالدى تەرەپ قۇرۇلما مۇھەندىسى", "تولۇق دۆڭ ئىجرا قىلغۇچى", "UI/UX لايىھەچى", "ۋىدېئو تېخنىكا مۇتەخەسسىسى", "سان-مەلۇمات ئانالىزچىسى", "سۈپەت مۇھەندىسى"],
          roi: "18-24 ئاي",
          details: ["جانلىق يايىن ۋە خاتىرىلەنگەن دەرسلەر باشقۇرۇش", "توردا تاپشۇرما ۋە ئىمتىھان سىستېمىسى", "ئوقۇغۇچى ئۆگىنىش ئىلگىرىلىشىنى ئىز قوغلاش", "كۆپ خىل دەرس ھەق ئۇسۇلى", "ئوقۇتقۇچى-ئوقۇغۇچى ئۆز-ئارا تەسىر ۋە ئۆگىنىش جامائەتچىلىكى"],
        },
        enterprise: {
          industry: "كارخانا باشقۇرۇش سىستېمىسى",
          description: "خاسلاشتۇرۇلغان كارخانا بايلىق پىلانلاش ۋە باشقۇرۇش سۇپىسى",
          cost: "$17,000 - $42,000",
          planning: "6-8 ھەپتە",
          build: "8-12 ئاي",
          teamSize: 10,
          positions: ["كارخانا يېشىلىش قۇرۇلما مۇھەندىسى", "تۈر باشقۇرغۇچى", "ئالدى تەرەپ گۇرۇپپا باشلىقى", "ئارقا تەرەپ گۇرۇپپا باشلىقى", "سان-مەلۇمات ئامبىرى باشقۇرغۇچى", "UI/UX لايىھەچى", "سودا ئانالىزچىسى", "ئىجرا قىلغۇچىلار x2", "سۈپەت كاپالەت مۇھەندىسى"],
          roi: "24-36 ئاي",
          details: ["كارخانا جەريانى ئاپتوماتلاشتۇرۇش ۋە ئەلالاشتۇرۇش", "سان-مەلۇمات كۆرۈنۈشچانلىقى ۋە دوكلات ئانالىزى", "ھوقۇق باشقۇرۇش ۋە بىخەتەرلىك كونترولى", "كۆپ بۆلۈم ھەمكارلىق سۇپىسى", "كېڭەيتىشچان مىكرو مۇلازىمەت قۇرۇلمىسى"],
        },
      },
    },
    modal: {
      createTask: "ۋەزىپە قۇرۇش",
      createEmployee: "خىزمەتچى قۇرۇش",
      createClient: "خېرىدار قۇرۇش",
      createTransaction: "سودا قۇرۇش",
      createDocument: "ھۆججەت قۇرۇش",
      createProject: "تۈر قۇرۇش",
      createInvoice: "تالون قۇرۇش",
      editTask: "ۋەزىپە تەھرىرلەش",
      editEmployee: "خىزمەتچى تەھرىرلەش",
      editClient: "خېرىدار تەھرىرلەش",
      editTransaction: "سودا تەھرىرلەش",
      editDocument: "ھۆججەت تەھرىرلەش",
      editProject: "تۈر تەھرىرلەش",
      editInvoice: "تالون تەھرىرلەش",
      viewTask: "ۋەزىپە كۆرۈش",
      viewEmployee: "خىزمەتچى كۆرۈش",
      viewClient: "خېرىدار كۆرۈش",
      viewTransaction: "سودا كۆرۈش",
      viewDocument: "ھۆججەت كۆرۈش",
      viewProject: "تۈر كۆرۈش",
      viewInvoice: "تالون كۆرۈش",
      deleteConfirm: "ئۆچۈرۈشنى جەزملەشتۈرۈش",
      cancel: "بىكار قىلىش",
      save: "ساقلاش",
      create: "قۇرۇش",
      delete: "ئۆچۈرۈش",
      confirm: "جەزملەشتۈرۈش",
      loading: "يۈكلىنىۋاتىدۇ...",
      saving: "ساقلىنىۋاتىدۇ...",
      deleting: "ئۆچۈرۈلۈۋاتىدۇ...",
      success: "مۇۋەپپەقىيەتلىك!",
      error: "خاتالىق",
      warning: "ئاگاھلاندۇرۇش",
      info: "ئۇچۇر",
      description: "ئاساسى ئۇچۇرلارنى تولدۇرۇڭ، كىرىش كىملىكى ئاپتوماتىك تارقىتىلىدۇ."
    },
    form: {
      requiredField: "بۇ سۆز بۆلۈكى تەلەپ قىلىنىدۇ",
      invalidEmail: "ئىناۋەتسىز ئېلخەت ئادرېسى",
      invalidPhone: "ئىناۋەتسىز تېلېفون نومۇرى",
      invalidUrl: "ئىناۋەتسىز URL",
      passwordTooShort: "پارول كەمىدە 6 خەت بولۇشى كېرەك",
      passwordsNotMatch: "پاروللار ماس كەلمەيدۇ",
      selectOption: "تاللاشنى تاللاڭ",
      enterValue: "قىممەت كىرگۈزۈڭ",
      submit: "تاپشۇرۇش",
      reset: "يېڭىلاش",
      upload: "يۈكلەش",
      download: "چۈشۈرۈش",
      search: "ئىزدەش",
      filter: "سۈزۈش",
      sort: "تەرتىپلەش",
      clear: "تازىلاش",
      apply: "تەتبىقلاش",
      close: "تاقاش",
      back: "قايتىش",
      next: "كېيىنكى",
      previous: "ئالدىنقى",
      finish: "تاماملاش",
      firstName: "ئىسىم",
      lastName: "فامىلە",
      email: "ئېلخەت",
      password: "پارول",
      username: "ئىشلەتكۈچى ئىسمى",
      phone: "تېلېفون",
      role: "رول",
      department: "بۆلۈم",
      position: "ئورنى"
    },
  },
};
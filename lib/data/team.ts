export interface TeamMember {
  name: string
  role: string
  image: string
  bio: string
  social: {
    linkedin: string
    twitter: string
    github: string
  }
}

export const team: TeamMember[] = [
  {
    name: "Alex Morgan",
    role: "Creative Director",
    image: "/creative-director-portrait.png",
    bio: "Visionary leader with 15+ years shaping digital experiences.",
    social: {
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  },
  {
    name: "Sarah Chen",
    role: "Lead Developer",
    image: "/professional-developer-portrait.png",
    bio: "Full-stack expert passionate about clean code and innovation.",
    social: {
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  },
  {
    name: "Marcus Williams",
    role: "UI/UX Designer",
    image: "/professional-designer-portrait.png",
    bio: "Design thinking specialist creating intuitive user experiences.",
    social: {
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager",
    image: "/product-manager-portrait.png",
    bio: "Strategic thinker bridging business goals with user needs.",
    social: {
      linkedin: "#",
      twitter: "#",
      github: "#",
    },
  },
]

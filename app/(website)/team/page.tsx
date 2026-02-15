'use client';

/**
 * Team Page Component
 * 
 * Features:
 * - 3D card grid layout for team members
 * - Glass morphism effects
 * - Responsive design (mobile/tablet/desktop)
 * - Multi-language support
 * - Hover 3D effects
 * 
 * Requirements: 11.1, 11.2
 */

import { Users } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/context';
import { Card3D } from '@/components/website/3d/Card3D';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { FadeInView } from '@/components/website/animations/FadeInView';

export default function TeamPage() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';

  // Team members data
  const teamMembers = [
    {
      id: 'zhangming',
      name: isEn ? 'Zhang Ming' : '张明',
      position: isEn ? 'CEO & Founder' : '首席执行官兼创始人',
      bio: isEn ? 'With over 15 years of industry experience, Zhang leads our strategic vision and company growth.' : '拥有超过15年行业经验，张明领导我们的战略愿景和公司发展。',
      color: '#b026ff',
    },
    {
      id: 'lihua',
      name: isEn ? 'Li Hua' : '李华',
      position: isEn ? 'Creative Director' : '创意总监',
      bio: isEn ? 'Li brings creativity and innovation to every project, ensuring exceptional design quality.' : '李华为每个项目带来创意和创新，确保卓越的设计品质。',
      color: '#00f0ff',
    },
    {
      id: 'wangfang',
      name: isEn ? 'Wang Fang' : '王芳',
      position: isEn ? 'Technical Lead' : '技术负责人',
      bio: isEn ? 'Wang oversees all technical operations, driving innovation in our development processes.' : '王芳监督所有技术运营，在我们的开发流程中推动创新。',
      color: '#ff2a6d',
    },
    {
      id: 'liuqiang',
      name: isEn ? 'Liu Qiang' : '刘强',
      position: isEn ? 'Project Manager' : '项目经理',
      bio: isEn ? 'Liu ensures seamless project delivery, coordinating teams and maintaining client satisfaction.' : '刘强确保项目无缝交付，协调团队并保持客户满意度。',
      color: '#ccff00',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* Hero Section */}
      <section 
        className="relative w-full py-20 md:py-32 overflow-hidden"
      >
        {/* Neon Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(176, 38, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(176, 38, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <FadeInView delay={0.1} duration={0.6}>
            <div className="flex justify-center gap-2 mb-6">
              <div className="neon-dot" style={{ animationDelay: '0s' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.2s', background: '#b026ff' }}></div>
              <div className="neon-dot" style={{ animationDelay: '0.4s', background: '#ff2a6d' }}></div>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#b026ff] to-[#00f0ff] bg-clip-text text-transparent">
                {isEn ? 'Our Team' : '我们的团队'}
              </span>
            </h1>
          </FadeInView>
          
          <FadeInView delay={0.2} duration={0.6}>
            <p className="text-lg md:text-xl text-[#9ca3af] max-w-3xl mx-auto">
              {isEn ? 'Meet the talented individuals who make our success possible' : '认识那些让我们的成功成为可能的有才华的团队成员'}
            </p>
          </FadeInView>
        </div>
        
        {/* Decorative gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(0,240,255,0.15) 0%, transparent 50%)',
          }}
        />
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#b026ff]/50 to-transparent"></div>
      </div>

      {/* Team Members Grid Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <FadeInView delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEn ? 'Meet Our Experts' : '认识我们的专家'}
              </h2>
              <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
                {isEn ? 'Passionate professionals dedicated to excellence' : '致力于卓越的热情专业人士'}
              </p>
              <div className="neon-line max-w-md mx-auto mt-8"></div>
            </div>
          </FadeInView>
          
          <CardGrid3D
            columns={{
              mobile: 1,
              tablet: 2,
              desktop: 4,
            }}
            gap="8"
            staggerDelay={0.1}
            ariaLabel={isEn ? 'Team members grid' : '团队成员网格'}
          >
            {teamMembers.map((member) => (
              <Card3D
                key={member.id}
                intensity="medium"
                depth="medium"
                glassEffect="heavy"
                className="h-full bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-300 group overflow-hidden"
                ariaLabel={`${member.name} - ${member.position}`}
              >
                {/* Member Avatar/Icon */}
                <div 
                  className="aspect-square flex items-center justify-center relative"
                  style={{
                    background: `linear-gradient(135deg, ${member.color}20 0%, ${member.color}05 100%)`,
                  }}
                >
                  {/* Neon Glow Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${member.color}30 0%, transparent 70%)`,
                    }}
                  />
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center relative z-10 transition-transform duration-300 group-hover:scale-110"
                    style={{
                      backgroundColor: member.color,
                      boxShadow: `0 0 40px ${member.color}60`,
                    }}
                  >
                    <Users className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                {/* Member Info */}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-[#00f0ff] transition-colors">
                    {member.name}
                  </h3>
                  
                  <div 
                    className="text-sm font-medium mb-4"
                    style={{ color: member.color }}
                  >
                    {member.position}
                  </div>
                  
                  <p className="text-sm text-[#9ca3af] leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </Card3D>
            ))}
          </CardGrid3D>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        {/* Neon Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(176, 38, 255, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <FadeInView delay={0.2}>
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                {isEn ? 'Want to Join Our Team?' : '想加入我们的团队？'}
              </h2>
              <p className="text-xl text-[#9ca3af] mb-8">
                {isEn ? 'We are always looking for talented individuals' : '我们一直在寻找有才华的人才'}
              </p>
              
              <a
                href="/contact"
                className="inline-block px-8 py-4 bg-gradient-to-r from-[#b026ff] to-[#7c3aed] text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] transition-all duration-300 hover:scale-105"
              >
                {isEn ? 'Get In Touch' : '联系我们'} →
              </a>
            </div>
          </FadeInView>
        </div>
      </section>
    </main>
  );
}

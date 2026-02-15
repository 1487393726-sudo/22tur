'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/context';
import { Card3D } from '@/components/website/3d/Card3D';
import { CardGrid3D } from '@/components/website/3d/CardGrid3D';
import { FadeInView } from '@/components/website/animations/FadeInView';
import { SlideInView } from '@/components/website/animations/SlideInView';

/**
 * Contact Page Component
 * 
 * Features:
 * - Glass morphism contact form
 * - Real-time form validation
 * - 3D contact information cards
 * - Multi-language support (zh, en, ug)
 * - Responsive design
 * - Page entrance animations
 * 
 * Requirements: 13.1, 13.2, 13.3
 */

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactPage() {
  const { locale } = useLanguage();
  const isEn = locale === 'en';

  // Form state
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) {
          return isEn ? 'Name is required' : '请输入姓名';
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          return isEn ? 'Email is required' : '请输入邮箱';
        }
        if (!emailRegex.test(value)) {
          return isEn ? 'Please enter a valid email' : '请输入有效的邮箱地址';
        }
        break;
      
      case 'subject':
        if (!value.trim()) {
          return isEn ? 'Subject is required' : '请输入主题';
        }
        break;
      
      case 'message':
        if (!value.trim()) {
          return isEn ? 'Message is required' : '请输入消息';
        }
        if (value.trim().length < 10) {
          return isEn ? 'Message must be at least 10 characters' : '消息至少需要10个字符';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (touched[name]) {
      const error = validateField(name as keyof FormData, value);
      setErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name as keyof FormData, value);
    setErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach(key => {
      if (key === 'phone') return;
      
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });

    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    setErrors(newErrors);

    if (hasErrors) {
      return;
    }

    setSubmissionStatus('submitting');

    try {
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (Math.random() > 0.1) {
            resolve(true);
          } else {
            reject(new Error('Network error'));
          }
        }, 2000);
      });

      setSubmissionStatus('success');
      
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
        setTouched({});
        setErrors({});
      }, 3000);
    } catch (error) {
      setSubmissionStatus('error');
      console.error('Form submission error:', error);
    }
  };

  const resetSubmissionStatus = () => {
    setSubmissionStatus('idle');
  };

  // Contact information data
  const contactInfo = [
    {
      icon: '📧',
      title: isEn ? 'Email' : '邮箱',
      value: isEn ? 'contact@example.com' : 'contact@example.com',
      color: '#b026ff',
    },
    {
      icon: '📞',
      title: isEn ? 'Phone' : '电话',
      value: isEn ? '+86 123 4567 8900' : '+86 123 4567 8900',
      color: '#00f0ff',
    },
    {
      icon: '📍',
      title: isEn ? 'Address' : '地址',
      value: isEn ? 'Beijing, China' : '中国北京',
      color: '#ff2a6d',
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0f] artistic-theme artistic-bg">
      {/* Hero Section with Artistic Style */}
      <section className="relative w-full py-20 md:py-32 overflow-hidden">
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
                {isEn ? 'Contact Us' : '联系我们'}
              </span>
            </h1>
          </FadeInView>
          
          <FadeInView delay={0.3} duration={0.6}>
            <p className="text-xl md:text-2xl text-[#9ca3af] max-w-3xl mx-auto">
              {isEn ? 'We would love to hear from you. Get in touch with us.' : '我们期待您的来信。请与我们联系。'}
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

      {/* Contact Information Cards Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <FadeInView delay={0.1}>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {isEn ? 'Contact Information' : '联系信息'}
              </h2>
              <p className="text-lg text-[#9ca3af] max-w-2xl mx-auto">
                {isEn ? 'Here is how you can reach us' : '以下是如何联系我们的方式'}
              </p>
              <div className="neon-line max-w-md mx-auto mt-8"></div>
            </div>
          </FadeInView>
          
          {/* 3D Contact Info Cards */}
          <CardGrid3D
            columns={{ mobile: 1, tablet: 3, desktop: 3 }}
            gap="8"
            staggerDelay={0.15}
            threshold={0.2}
            ariaLabel={isEn ? 'Contact Information' : '联系信息'}
          >
            {contactInfo.map((info, index) => (
              <Card3D
                key={index}
                intensity="medium"
                depth="medium"
                glassEffect="heavy"
                className="p-8 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/50 hover:shadow-[0_0_30px_rgba(176,38,255,0.2)] transition-all duration-300 h-full text-center group"
                ariaLabel={info.title}
              >
                {/* Icon */}
                <div 
                  className="w-16 h-16 rounded-xl mb-6 flex items-center justify-center shadow-lg mx-auto transition-transform duration-300 group-hover:scale-110"
                  style={{ 
                    backgroundColor: info.color,
                    boxShadow: `0 0 30px ${info.color}80`,
                  }}
                >
                  <span className="text-white text-3xl">{info.icon}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-[#00f0ff] transition-colors">
                  {info.title}
                </h3>
                
                {/* Value */}
                <p className="text-[#9ca3af] text-lg font-medium">
                  {info.value}
                </p>
              </Card3D>
            ))}
          </CardGrid3D>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#00f0ff]/50 to-transparent"></div>
      </div>

      {/* Contact Form Section with Glass Morphism */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <SlideInView direction="up" delay={0.2}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {isEn ? 'Send Us a Message' : '给我们发送消息'}
                </h2>
                <p className="text-lg text-[#9ca3af]">
                  {isEn ? 'Fill out the form below and we will get back to you soon' : '填写以下表格，我们将尽快回复您'}
                </p>
              </div>
            </SlideInView>

            {/* Glass Morphism Form Card */}
            <SlideInView direction="up" delay={0.4}>
              <Card3D
                intensity="light"
                depth="medium"
                glassEffect="heavy"
                className="p-8 md:p-12 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/30 transition-all duration-300"
              >
                {/* Success Message */}
                {submissionStatus === 'success' && (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ccff00]/20">
                      <svg 
                        className="w-10 h-10 text-[#ccff00]" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M5 13l4 4L19 7" 
                        />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {isEn ? 'Message Sent!' : '消息已发送！'}
                    </h3>
                    
                    <p className="text-lg text-[#9ca3af] mb-8 max-w-md mx-auto">
                      {isEn ? 'Thank you for contacting us. We will get back to you soon.' : '感谢您联系我们。我们将尽快回复您。'}
                    </p>
                    
                    <button
                      onClick={resetSubmissionStatus}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#b026ff] to-[#7c3aed] text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] transition-all duration-300 hover:scale-105"
                    >
                      {isEn ? 'Send Another Message' : '发送另一条消息'}
                    </button>
                  </div>
                )}

                {/* Error Message */}
                {submissionStatus === 'error' && (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#ff2a6d]/20">
                      <svg 
                        className="w-10 h-10 text-[#ff2a6d]" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M6 18L18 6M6 6l12 12" 
                        />
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                      {isEn ? 'Something went wrong' : '出错了'}
                    </h3>
                    
                    <p className="text-lg text-[#9ca3af] mb-8 max-w-md mx-auto">
                      {isEn ? 'Please try again later.' : '请稍后再试。'}
                    </p>
                    
                    <button
                      onClick={resetSubmissionStatus}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff2a6d] to-[#b026ff] text-white font-semibold rounded-lg hover:shadow-[0_0_30px_rgba(255,42,109,0.5)] transition-all duration-300 hover:scale-105"
                    >
                      {isEn ? 'Try Again' : '重试'}
                    </button>
                  </div>
                )}

                {/* Form (hidden when success or error) */}
                {(submissionStatus === 'idle' || submissionStatus === 'submitting') && (
                  <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                    {/* Name Field */}
                    <div>
                      <label 
                        htmlFor="name" 
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        {isEn ? 'Name' : '姓名'} <span className="text-[#ff2a6d]">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={isEn ? 'Enter your name' : '输入您的姓名'}
                        className={`w-full px-4 py-3 rounded-lg border bg-white/5 backdrop-blur-sm text-white placeholder:text-[#9ca3af]/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.name && touched.name
                            ? 'border-[#ff2a6d] focus:ring-[#ff2a6d]/50'
                            : 'border-white/10 focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50'
                        }`}
                        aria-invalid={errors.name && touched.name ? 'true' : 'false'}
                        aria-describedby={errors.name && touched.name ? 'name-error' : undefined}
                      />
                      {errors.name && touched.name && (
                        <p id="name-error" className="mt-2 text-sm text-[#ff2a6d] flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{errors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Field */}
                    <div>
                      <label 
                        htmlFor="email" 
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        {isEn ? 'Email' : '邮箱'} <span className="text-[#ff2a6d]">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={isEn ? 'Enter your email' : '输入您的邮箱'}
                        className={`w-full px-4 py-3 rounded-lg border bg-white/5 backdrop-blur-sm text-white placeholder:text-[#9ca3af]/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.email && touched.email
                            ? 'border-[#ff2a6d] focus:ring-[#ff2a6d]/50'
                            : 'border-white/10 focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50'
                        }`}
                        aria-invalid={errors.email && touched.email ? 'true' : 'false'}
                        aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
                      />
                      {errors.email && touched.email && (
                        <p id="email-error" className="mt-2 text-sm text-[#ff2a6d] flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Field */}
                    <div>
                      <label 
                        htmlFor="phone" 
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        {isEn ? 'Phone (Optional)' : '电话（可选）'}
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder={isEn ? 'Enter your phone number' : '输入您的电话号码'}
                        className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm text-white placeholder:text-[#9ca3af]/50 focus:outline-none focus:ring-2 focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50 transition-all duration-300"
                      />
                    </div>

                    {/* Subject Field */}
                    <div>
                      <label 
                        htmlFor="subject" 
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        {isEn ? 'Subject' : '主题'} <span className="text-[#ff2a6d]">*</span>
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={isEn ? 'Enter message subject' : '输入消息主题'}
                        className={`w-full px-4 py-3 rounded-lg border bg-white/5 backdrop-blur-sm text-white placeholder:text-[#9ca3af]/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                          errors.subject && touched.subject
                            ? 'border-[#ff2a6d] focus:ring-[#ff2a6d]/50'
                            : 'border-white/10 focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50'
                        }`}
                        aria-invalid={errors.subject && touched.subject ? 'true' : 'false'}
                        aria-describedby={errors.subject && touched.subject ? 'subject-error' : undefined}
                      />
                      {errors.subject && touched.subject && (
                        <p id="subject-error" className="mt-2 text-sm text-[#ff2a6d] flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{errors.subject}</span>
                        </p>
                      )}
                    </div>

                    {/* Message Field */}
                    <div>
                      <label 
                        htmlFor="message" 
                        className="block text-sm font-semibold text-white mb-2"
                      >
                        {isEn ? 'Message' : '消息'} <span className="text-[#ff2a6d]">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder={isEn ? 'Enter your message' : '输入您的消息'}
                        className={`w-full px-4 py-3 rounded-lg border bg-white/5 backdrop-blur-sm text-white placeholder:text-[#9ca3af]/50 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
                          errors.message && touched.message
                            ? 'border-[#ff2a6d] focus:ring-[#ff2a6d]/50'
                            : 'border-white/10 focus:border-[#b026ff]/50 focus:ring-[#b026ff]/50'
                        }`}
                        aria-invalid={errors.message && touched.message ? 'true' : 'false'}
                        aria-describedby={errors.message && touched.message ? 'message-error' : undefined}
                      />
                      {errors.message && touched.message && (
                        <p id="message-error" className="mt-2 text-sm text-[#ff2a6d] flex items-center gap-1">
                          <span>⚠️</span>
                          <span>{errors.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={submissionStatus === 'submitting'}
                        className="w-full group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#b026ff] to-[#7c3aed] text-white font-semibold rounded-lg transition-all duration-300 hover:shadow-[0_0_30px_rgba(176,38,255,0.5)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                      >
                        {/* Loading Spinner */}
                        {submissionStatus === 'submitting' && (
                          <svg 
                            className="animate-spin h-5 w-5 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                            />
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        )}
                        
                        <span>
                          {submissionStatus === 'submitting' ? (isEn ? 'Sending...' : '发送中...') : (isEn ? 'Send Message' : '发送消息')}
                        </span>
                        
                        {submissionStatus !== 'submitting' && (
                          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </Card3D>
            </SlideInView>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#ff2a6d]/50 to-transparent"></div>
      </div>

      {/* Business Hours Section */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <FadeInView delay={0.1}>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {isEn ? 'Business Hours' : '营业时间'}
                </h2>
                <p className="text-lg text-[#9ca3af]">
                  {isEn ? 'When you can reach us' : '您可以联系我们的时间'}
                </p>
              </div>
            </FadeInView>

            <Card3D
              intensity="light"
              depth="medium"
              glassEffect="heavy"
              className="p-8 md:p-12 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[#b026ff]/30 transition-all duration-300"
            >
              <div className="space-y-4">
                {/* Weekdays */}
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-lg font-semibold text-white">
                    {isEn ? 'Monday - Friday' : '周一至周五'}
                  </span>
                  <span className="text-lg text-[#00f0ff]">
                    9:00 - 18:00
                  </span>
                </div>

                {/* Weekend */}
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-lg font-semibold text-white">
                    {isEn ? 'Saturday - Sunday' : '周六至周日'}
                  </span>
                  <span className="text-lg text-[#9ca3af]">
                    {isEn ? 'Closed' : '休息'}
                  </span>
                </div>

                {/* Response Time */}
                <div className="pt-6 text-center">
                  <p className="text-[#9ca3af]">
                    <span className="font-semibold text-[#00f0ff]">
                      {isEn ? 'Response Time: ' : '响应时间：'}
                    </span>
                    {isEn ? 'Within 24 hours' : '24小时内'}
                  </p>
                </div>
              </div>
            </Card3D>
          </div>
        </div>
      </section>
    </main>
  );
}

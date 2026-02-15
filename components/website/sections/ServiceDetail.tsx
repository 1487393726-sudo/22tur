'use client';

import React, { useState } from 'react';
import type { ServiceDetail, Testimonial, Case, FAQ } from '@/types/website';

interface ServiceDetailProps {
  service: ServiceDetail;
  relatedCases?: Case[];
  relatedTestimonials?: Testimonial[];
  onConsultationClick?: () => void;
  className?: string;
}

/**
 * Service Detail Component
 * 
 * Displays comprehensive service information including description, process,
 * deliverables, pricing, FAQs, related cases and testimonials.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * @param service - Service detail object with full information
 * @param relatedCases - Optional array of related case studies
 * @param relatedTestimonials - Optional array of related testimonials
 * @param onConsultationClick - Optional callback for consultation button
 * @param className - Optional CSS class for styling
 * @returns Rendered service detail component
 */
export function ServiceDetail({
  service,
  relatedCases = [],
  relatedTestimonials = [],
  onConsultationClick,
  className = '',
}: ServiceDetailProps): React.ReactElement {
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className={`w-full bg-white ${className}`} data-testid="service-detail">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#1E3A5F] to-[#2D5A8C] text-white py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Left: Service Info */}
            <div className="flex-1">
              <div className="inline-block bg-white/20 px-4 py-2 rounded-full mb-4">
                <span className="text-sm font-semibold">{service.category}</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">{service.name}</h1>
              <p className="text-lg text-white/90 mb-6">{service.shortDescription}</p>
              
              {/* Rating and Reviews */}
              <div className="flex items-center gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(service.rating) ? 'text-yellow-400' : 'text-white/30'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold">{service.rating.toFixed(1)}</span>
                </div>
                <span className="text-white/70">({service.reviewCount} reviews)</span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onConsultationClick}
                  className="bg-white text-[#1E3A5F] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
                  data-testid="consultation-button"
                >
                  立即咨询
                </button>
                <button
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300"
                  data-testid="learn-more-button"
                >
                  了解更多
                </button>
              </div>
            </div>

            {/* Right: Price Card */}
            <div className="w-full md:w-80 bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
              <div className="mb-6">
                <p className="text-white/70 text-sm mb-2">服务价格</p>
                <div className="text-4xl font-bold">
                  ¥{service.price.toLocaleString()}
                </div>
              </div>
              <div className="space-y-4 border-t border-white/20 pt-6">
                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-sm">专业团队服务</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-sm">质量保证</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-green-400 mt-1">✓</span>
                  <span className="text-sm">售后支持</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Full Description */}
        <section className="mb-16" data-testid="service-description">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">服务介绍</h2>
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            {service.fullDescription}
          </div>
        </section>

        {/* Process Steps */}
        {service.process && service.process.length > 0 && (
          <section className="mb-16" data-testid="service-process">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8">服务流程</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.process.map((step, index) => (
                <div key={step.id || index} className="relative">
                  {/* Connector Line */}
                  {index < service.process.length - 1 && (
                    <div className="hidden lg:block absolute top-12 left-1/2 w-full h-1 bg-gradient-to-r from-[#1E3A5F] to-transparent transform translate-x-1/2" />
                  )}
                  
                  {/* Step Card */}
                  <div className="bg-gray-50 rounded-lg p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-[#1E3A5F] text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {step.order}
                      </div>
                      <h3 className="text-lg font-semibold text-[#1E3A5F]">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">预计时间:</span> {step.duration}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Includes and Excludes */}
        <section className="mb-16" data-testid="service-includes-excludes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Includes */}
            <div>
              <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6">服务包含</h3>
              <ul className="space-y-3">
                {service.includes.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-green-500 font-bold mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Excludes */}
            <div>
              <h3 className="text-2xl font-bold text-[#1E3A5F] mb-6">服务不包含</h3>
              <ul className="space-y-3">
                {service.excludes.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-red-500 font-bold mt-1">✕</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Deliverables */}
        {service.deliverables && service.deliverables.length > 0 && (
          <section className="mb-16" data-testid="service-deliverables">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">交付物</h2>
            <div className="bg-blue-50 rounded-lg p-8 border-l-4 border-[#1E3A5F]">
              <ul className="space-y-3">
                {service.deliverables.map((deliverable, index) => (
                  <li key={index} className="flex items-center gap-3 text-gray-700">
                    <span className="w-2 h-2 bg-[#1E3A5F] rounded-full" />
                    {deliverable}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Timeline */}
        <section className="mb-16" data-testid="service-timeline">
          <h2 className="text-3xl font-bold text-[#1E3A5F] mb-6">项目周期</h2>
          <div className="bg-gradient-to-r from-[#1E3A5F]/10 to-[#2D5A8C]/10 rounded-lg p-8">
            <p className="text-lg text-gray-700">
              <span className="font-semibold">预计周期:</span> {service.timeline}
            </p>
          </div>
        </section>

        {/* FAQs */}
        {service.faqs && service.faqs.length > 0 && (
          <section className="mb-16" data-testid="service-faqs">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8">常见问题</h2>
            <div className="space-y-4">
              {service.faqs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-300 flex items-center justify-between"
                    data-testid={`faq-button-${faq.id}`}
                  >
                    <span className="font-semibold text-gray-800 text-left">{faq.question}</span>
                    <span className={`text-[#1E3A5F] transition-transform duration-300 ${expandedFAQ === faq.id ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-6 py-4 bg-white border-t border-gray-200" data-testid={`faq-answer-${faq.id}`}>
                      <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Cases */}
        {relatedCases && relatedCases.length > 0 && (
          <section className="mb-16" data-testid="related-cases">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8">相关案例</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCases.map((caseItem) => (
                <div key={caseItem.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={caseItem.thumbnail}
                    alt={caseItem.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-[#1E3A5F] mb-2">{caseItem.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{caseItem.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-blue-100 text-[#1E3A5F] px-3 py-1 rounded-full">
                        {caseItem.industry}
                      </span>
                      <a href={caseItem.link} className="text-[#1E3A5F] font-semibold hover:underline">
                        查看详情 →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related Testimonials */}
        {relatedTestimonials && relatedTestimonials.length > 0 && (
          <section className="mb-16" data-testid="related-testimonials">
            <h2 className="text-3xl font-bold text-[#1E3A5F] mb-8">客户评价</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedTestimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-800">{testimonial.author}</h4>
                      <p className="text-sm text-gray-600">{testimonial.company}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.content}"</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-[#1E3A5F] to-[#2D5A8C] text-white rounded-lg p-8 sm:p-12 text-center" data-testid="service-cta">
          <h2 className="text-3xl font-bold mb-4">准备好开始了吗?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            联系我们的专业团队，了解如何将此服务应用到您的业务中。
          </p>
          <button
            onClick={onConsultationClick}
            className="bg-white text-[#1E3A5F] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            data-testid="cta-consultation-button"
          >
            立即咨询
          </button>
        </section>
      </div>
    </div>
  );
}

export default ServiceDetail;

/**
 * TestimonialsSection Example Usage
 * 
 * Demonstrates how to use the TestimonialsSection component
 * with various configurations
 */

import React from 'react';
import { TestimonialsSection, Testimonial } from './TestimonialsSection';

// Sample testimonials data
const sampleTestimonials: Testimonial[] = [
  {
    name: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
    content: 'Working with this team has been an absolute pleasure. They delivered our project on time and exceeded all expectations with their attention to detail and innovative solutions.',
    rating: 5,
    avatar: '/images/avatars/sarah.jpg',
    companyLogo: '/images/logos/techstart.png',
  },
  {
    name: 'Michael Chen',
    role: 'Product Manager, InnovateCo',
    content: 'The level of professionalism and expertise demonstrated throughout our collaboration was outstanding. Our new platform has transformed how we engage with customers.',
    rating: 5,
    avatar: '/images/avatars/michael.jpg',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Marketing Director, BrandWorks',
    content: 'From concept to launch, the team guided us through every step. The final product not only looks amazing but performs flawlessly. Highly recommended!',
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'CTO, DataFlow Systems',
    content: 'Their technical expertise and creative problem-solving abilities are unmatched. They turned our complex requirements into an elegant, user-friendly solution.',
    rating: 4,
    avatar: '/images/avatars/david.jpg',
  },
];

/**
 * Example 1: Basic Usage
 */
export const BasicExample = () => (
  <TestimonialsSection
    title="What Our Clients Say"
    subtitle="Real feedback from satisfied clients who trust our services"
    testimonials={sampleTestimonials}
  />
);

/**
 * Example 2: With Custom Auto-play Interval
 */
export const CustomAutoPlayExample = () => (
  <TestimonialsSection
    title="Customer Reviews"
    subtitle="Hear from our happy clients"
    testimonials={sampleTestimonials}
    autoPlayInterval={7000} // 7 seconds
  />
);

/**
 * Example 3: Without Auto-play
 */
export const ManualNavigationExample = () => (
  <TestimonialsSection
    title="Client Testimonials"
    subtitle="Navigate through our client feedback"
    testimonials={sampleTestimonials}
    autoPlayInterval={0} // Disable auto-play
  />
);

/**
 * Example 4: Without Navigation Arrows
 */
export const NoPaginationExample = () => (
  <TestimonialsSection
    title="What People Say"
    testimonials={sampleTestimonials}
    showNavigation={false}
    showPagination={true}
  />
);

/**
 * Example 5: Minimal UI (No Navigation or Pagination)
 */
export const MinimalExample = () => (
  <TestimonialsSection
    testimonials={sampleTestimonials}
    showNavigation={false}
    showPagination={false}
    autoPlayInterval={4000}
  />
);

/**
 * Example 6: Custom Styling
 */
export const CustomStyledExample = () => (
  <TestimonialsSection
    title="Client Success Stories"
    subtitle="See how we've helped businesses grow"
    testimonials={sampleTestimonials}
    background="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50"
    glassIntensity="heavy"
    depth="deep"
    className="my-custom-class"
  />
);

/**
 * Example 7: Light Glass Effect
 */
export const LightGlassExample = () => (
  <TestimonialsSection
    title="Testimonials"
    testimonials={sampleTestimonials}
    glassIntensity="light"
    depth="shallow"
    background="bg-white"
  />
);

/**
 * Example 8: Single Testimonial
 */
export const SingleTestimonialExample = () => (
  <TestimonialsSection
    title="Featured Review"
    subtitle="Our most recent client feedback"
    testimonials={[sampleTestimonials[0]]}
  />
);

/**
 * Example 9: Without Title/Subtitle
 */
export const NoHeaderExample = () => (
  <TestimonialsSection
    testimonials={sampleTestimonials}
    background="bg-gray-100"
  />
);

/**
 * Example 10: Integration with i18n
 */
export const I18nExample = ({ t }: { t: (key: string) => any }) => {
  // Assuming translations are structured like:
  // {
  //   "testimonials": {
  //     "title": "...",
  //     "subtitle": "...",
  //     "items": [...]
  //   }
  // }
  
  const testimonials = t('testimonials.items') as Testimonial[];
  
  return (
    <TestimonialsSection
      title={t('testimonials.title')}
      subtitle={t('testimonials.subtitle')}
      testimonials={testimonials}
    />
  );
};

/**
 * Example 11: With Custom Testimonials
 */
export const CustomTestimonialsExample = () => {
  const customTestimonials: Testimonial[] = [
    {
      name: 'Alice Williams',
      role: 'Founder, StartupXYZ',
      content: 'Game-changing experience! The team understood our vision perfectly and brought it to life with incredible precision.',
      rating: 5,
    },
    {
      name: 'Robert Brown',
      role: 'Operations Manager, LogiCorp',
      content: 'Exceptional service from start to finish. They were responsive, professional, and delivered beyond our expectations.',
      rating: 5,
    },
  ];

  return (
    <TestimonialsSection
      title="Success Stories"
      testimonials={customTestimonials}
      autoPlayInterval={6000}
    />
  );
};

/**
 * Example 12: Full Page Section
 */
export const FullPageExample = () => (
  <div className="min-h-screen flex items-center">
    <TestimonialsSection
      title="Trusted by Industry Leaders"
      subtitle="Join hundreds of satisfied clients who have transformed their business with our solutions"
      testimonials={sampleTestimonials}
      background="bg-gradient-to-br from-indigo-50 via-white to-purple-50"
      glassIntensity="medium"
      depth="medium"
      autoPlayInterval={5000}
    />
  </div>
);

// Export all examples
export default {
  BasicExample,
  CustomAutoPlayExample,
  ManualNavigationExample,
  NoPaginationExample,
  MinimalExample,
  CustomStyledExample,
  LightGlassExample,
  SingleTestimonialExample,
  NoHeaderExample,
  I18nExample,
  CustomTestimonialsExample,
  FullPageExample,
};

/**
 * CTASection Component Examples
 * 
 * This file demonstrates various usage patterns for the CTASection component.
 */

import React from 'react';
import { CTASection } from './CTASection';

/**
 * Example 1: Basic CTA with Primary Gradient
 */
export const BasicCTAExample = () => (
  <CTASection
    title="Ready to Get Started?"
    description="Contact us and let us help you bring your ideas to life"
    buttons={[
      {
        text: "Contact Us",
        href: "/contact",
        variant: "primary",
        showArrow: true,
      },
      {
        text: "View Services",
        href: "/services",
        variant: "outline",
      },
    ]}
    gradientScheme="primary"
  />
);

/**
 * Example 2: CTA with Sunset Gradient
 */
export const SunsetGradientExample = () => (
  <CTASection
    title="Transform Your Business Today"
    description="Join hundreds of satisfied clients who have revolutionized their digital presence"
    buttons={[
      {
        text: "Get Started",
        href: "/signup",
        variant: "primary",
        showArrow: true,
      },
    ]}
    gradientScheme="sunset"
    glassIntensity="heavy"
  />
);

/**
 * Example 3: CTA with Ocean Gradient and No Sparkles
 */
export const OceanGradientExample = () => (
  <CTASection
    title="Dive Into Innovation"
    description="Explore cutting-edge solutions tailored to your needs"
    buttons={[
      {
        text: "Explore Solutions",
        href: "/solutions",
        variant: "primary",
      },
      {
        text: "Schedule Demo",
        href: "/demo",
        variant: "secondary",
      },
    ]}
    gradientScheme="ocean"
    glassIntensity="light"
    showSparkles={false}
  />
);

/**
 * Example 4: Single Button CTA
 */
export const SingleButtonExample = () => (
  <CTASection
    title="Join Our Newsletter"
    description="Stay updated with the latest trends and insights in digital innovation"
    buttons={[
      {
        text: "Subscribe Now",
        href: "/newsletter",
        variant: "primary",
        showArrow: true,
      },
    ]}
    gradientScheme="accent"
  />
);

/**
 * Example 5: CTA with Custom Click Handler
 */
export const CustomClickHandlerExample = () => (
  <CTASection
    title="Need Help?"
    description="Our team is ready to answer your questions and provide support"
    buttons={[
      {
        text: "Chat with Us",
        href: "#",
        variant: "primary",
        showArrow: true,
        onClick: () => {
          // Open chat widget
          console.log('Opening chat widget...');
        },
      },
      {
        text: "View FAQ",
        href: "/faq",
        variant: "outline",
      },
    ]}
    gradientScheme="secondary"
  />
);

/**
 * Example 6: Minimal CTA with Light Glass Effect
 */
export const MinimalCTAExample = () => (
  <CTASection
    title="Let's Build Something Amazing"
    description="Partner with us to create exceptional digital experiences"
    buttons={[
      {
        text: "Start Project",
        href: "/start",
        variant: "primary",
      },
    ]}
    gradientScheme="primary"
    glassIntensity="light"
    showSparkles={false}
  />
);

/**
 * All Examples Component
 */
export const AllCTAExamples = () => (
  <div className="space-y-8">
    <div>
      <h3 className="text-2xl font-bold mb-4">Basic CTA</h3>
      <BasicCTAExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4">Sunset Gradient</h3>
      <SunsetGradientExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4">Ocean Gradient (No Sparkles)</h3>
      <OceanGradientExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4">Single Button</h3>
      <SingleButtonExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4">Custom Click Handler</h3>
      <CustomClickHandlerExample />
    </div>
    
    <div>
      <h3 className="text-2xl font-bold mb-4">Minimal CTA</h3>
      <MinimalCTAExample />
    </div>
  </div>
);

export default AllCTAExamples;

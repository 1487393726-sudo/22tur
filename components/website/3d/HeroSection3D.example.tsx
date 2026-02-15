/**
 * HeroSection3D Component Examples
 * 
 * This file demonstrates various usage patterns for the HeroSection3D component
 * including different gradient schemes, with/without parallax, and RTL support.
 */

import React from 'react';
import { HeroSection3D } from './HeroSection3D';

/**
 * Example 1: Basic Hero Section (Blue Gradient)
 */
export const BasicHeroExample = () => {
  return (
    <HeroSection3D
      title="Welcome to Our Platform"
      subtitle="Build amazing products with our cutting-edge technology and innovative solutions"
      ctaText="Get Started"
      ctaLink="/signup"
      locale="en"
      gradientScheme="blue"
    />
  );
};

/**
 * Example 2: Purple Gradient with Background Image
 */
export const PurpleGradientExample = () => {
  return (
    <HeroSection3D
      title="Transform Your Business"
      subtitle="Leverage the power of AI and automation to scale your operations"
      ctaText="Learn More"
      ctaLink="/about"
      locale="en"
      gradientScheme="purple"
      backgroundImage="/images/hero-bg.jpg"
    />
  );
};

/**
 * Example 3: Green Gradient without Floating Elements
 */
export const GreenGradientExample = () => {
  return (
    <HeroSection3D
      title="Sustainable Solutions"
      subtitle="Join us in building a greener future with eco-friendly technology"
      ctaText="Explore"
      ctaLink="/solutions"
      locale="en"
      gradientScheme="green"
      enableFloatingElements={false}
    />
  );
};

/**
 * Example 4: Orange Gradient without Parallax
 */
export const OrangeGradientExample = () => {
  return (
    <HeroSection3D
      title="Ignite Your Creativity"
      subtitle="Unleash your potential with our powerful creative tools and resources"
      ctaText="Start Creating"
      ctaLink="/create"
      locale="en"
      gradientScheme="orange"
      enableParallax={false}
    />
  );
};

/**
 * Example 5: Chinese Language (中文)
 */
export const ChineseExample = () => {
  return (
    <HeroSection3D
      title="欢迎来到我们的平台"
      subtitle="使用我们的尖端技术和创新解决方案构建令人惊叹的产品"
      ctaText="开始使用"
      ctaLink="/signup"
      locale="zh"
      gradientScheme="blue"
    />
  );
};

/**
 * Example 6: RTL Layout (Uyghur - ئۇيغۇرچە)
 */
export const RTLExample = () => {
  return (
    <HeroSection3D
      title="پلاتفورمىمىزغا خۇش كەپسىز"
      subtitle="ئىلغار تېخنىكا ۋە يېڭىلىق ھەل قىلىش چارىلىرى بىلەن ئاجايىپ مەھسۇلاتلار ياساڭ"
      ctaText="باشلاش"
      ctaLink="/signup"
      locale="ug"
      gradientScheme="purple"
    />
  );
};

/**
 * Example 7: With Custom CTA Handler
 */
export const CustomCTAExample = () => {
  const handleCTAClick = () => {
    console.log('CTA clicked!');
    // Custom logic here (e.g., open modal, track analytics)
  };

  return (
    <HeroSection3D
      title="Ready to Get Started?"
      subtitle="Join thousands of satisfied customers who trust our platform"
      ctaText="Sign Up Now"
      ctaLink="/signup"
      locale="en"
      gradientScheme="blue"
      onCtaClick={handleCTAClick}
    />
  );
};

/**
 * Example 8: Minimal Configuration
 */
export const MinimalExample = () => {
  return (
    <HeroSection3D
      title="Simple and Powerful"
      subtitle="Everything you need, nothing you don't"
      ctaText="Try It Free"
      ctaLink="/trial"
      locale="en"
    />
  );
};

/**
 * Example 9: Full Featured with All Options
 */
export const FullFeaturedExample = () => {
  return (
    <HeroSection3D
      title="The Complete Solution"
      subtitle="Experience the full power of our platform with all features enabled"
      ctaText="Explore Features"
      ctaLink="/features"
      locale="en"
      gradientScheme="purple"
      backgroundImage="/images/hero-pattern.svg"
      enableParallax={true}
      enableFloatingElements={true}
      className="custom-hero-class"
      onCtaClick={() => console.log('Exploring features...')}
    />
  );
};

/**
 * Example 10: Mobile Optimized (Simplified Effects)
 */
export const MobileOptimizedExample = () => {
  return (
    <HeroSection3D
      title="Mobile First"
      subtitle="Optimized for the best mobile experience"
      ctaText="Download App"
      ctaLink="/download"
      locale="en"
      gradientScheme="green"
      // Floating elements automatically disabled on mobile
      // Parallax automatically simplified on mobile
    />
  );
};

/**
 * Demo Page with All Examples
 */
export const HeroSection3DExamples = () => {
  return (
    <div className="space-y-0">
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800">
        <h1 className="text-3xl font-bold mb-2">HeroSection3D Examples</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Scroll down to see different configurations and use cases
        </p>
      </div>
      
      <BasicHeroExample />
      <PurpleGradientExample />
      <GreenGradientExample />
      <OrangeGradientExample />
      <ChineseExample />
      <RTLExample />
      <CustomCTAExample />
      <MinimalExample />
      <FullFeaturedExample />
      <MobileOptimizedExample />
    </div>
  );
};

export default HeroSection3DExamples;

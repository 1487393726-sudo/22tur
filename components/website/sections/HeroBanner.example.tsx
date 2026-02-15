/**
 * Hero Banner Component - Usage Examples
 * 
 * This file demonstrates how to use the HeroBanner component
 * with different configurations and data.
 */

import { HeroBanner } from './HeroBanner';
import type { HeroBanner as HeroBannerType } from '@/types/website';

/**
 * Example 1: Basic Hero Banner with CTA buttons
 */
export function BasicHeroBannerExample() {
  const heroBannerData: HeroBannerType = {
    title: 'Welcome to Our Professional Services',
    subtitle: 'We provide expert solutions to help your business grow and succeed in the digital age',
    ctaButton: {
      text: 'Get Started Today',
      href: '/contact',
      variant: 'primary',
    },
    ctaButtonSecondary: {
      text: 'Learn More',
      href: '/about',
      variant: 'secondary',
    },
  };

  return <HeroBanner data={heroBannerData} />;
}

/**
 * Example 2: Hero Banner with background image
 */
export function HeroBannerWithImageExample() {
  const heroBannerData: HeroBannerType = {
    title: 'Transform Your Business',
    subtitle: 'Innovative solutions tailored to your unique needs',
    backgroundImage: '/images/hero-bg.jpg',
    ctaButton: {
      text: 'Schedule Consultation',
      href: '/consultation',
      variant: 'primary',
    },
    ctaButtonSecondary: {
      text: 'View Portfolio',
      href: '/cases',
      variant: 'secondary',
    },
  };

  return <HeroBanner data={heroBannerData} />;
}

/**
 * Example 3: Hero Banner with video background
 */
export function HeroBannerWithVideoExample() {
  const heroBannerData: HeroBannerType = {
    title: 'Experience Innovation',
    subtitle: 'Cutting-edge technology meets professional expertise',
    backgroundVideo: '/videos/hero-bg.mp4',
    ctaButton: {
      text: 'Start Your Journey',
      href: '/services',
      variant: 'primary',
    },
  };

  return <HeroBanner data={heroBannerData} />;
}

/**
 * Example 4: Hero Banner with single CTA button
 */
export function HeroBannerSingleCTAExample() {
  const heroBannerData: HeroBannerType = {
    title: 'Elevate Your Brand',
    subtitle: 'Professional design and development services for modern businesses',
    ctaButton: {
      text: 'Contact Us',
      href: '/contact',
      variant: 'primary',
    },
  };

  return <HeroBanner data={heroBannerData} />;
}

/**
 * Example 5: Hero Banner with custom styling
 */
export function HeroBannerCustomStyleExample() {
  const heroBannerData: HeroBannerType = {
    title: 'Premium Solutions',
    subtitle: 'Delivering excellence in every project',
    ctaButton: {
      text: 'Explore Services',
      href: '/services',
      variant: 'primary',
    },
    ctaButtonSecondary: {
      text: 'Watch Demo',
      href: '/demo',
      variant: 'secondary',
    },
  };

  return (
    <HeroBanner 
      data={heroBannerData}
      className="custom-hero-banner"
    />
  );
}

/**
 * Example 6: Hero Banner with minimal data
 */
export function HeroBannerMinimalExample() {
  const heroBannerData: HeroBannerType = {
    title: 'Welcome',
    subtitle: 'Your success is our mission',
    ctaButton: {
      text: 'Get Started',
      href: '/',
    },
  };

  return <HeroBanner data={heroBannerData} />;
}

/**
 * Usage in a page component:
 * 
 * import { HeroBanner } from '@/components/website/sections/HeroBanner';
 * import type { HeroBanner as HeroBannerType } from '@/types/website';
 * 
 * export default function HomePage() {
 *   const heroBannerData: HeroBannerType = {
 *     title: 'Welcome to Our Services',
 *     subtitle: 'Professional solutions for your business',
 *     ctaButton: {
 *       text: 'Get Started',
 *       href: '/contact',
 *     },
 *     ctaButtonSecondary: {
 *       text: 'Learn More',
 *       href: '/about',
 *     },
 *   };
 * 
 *   return (
 *     <main>
 *       <HeroBanner data={heroBannerData} />
 *       {/* Other page sections */}
 *     </main>
 *   );
 * }
 */

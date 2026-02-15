/**
 * Card3D Component Examples
 * 
 * This file demonstrates various use cases of the Card3D component
 */

import React from 'react';
import { Card3D, Card3DCustom } from './Card3D';

/**
 * Example 1: Basic Card with Default Settings
 */
export const BasicCard = () => (
  <Card3D>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Basic 3D Card</h3>
      <p className="text-gray-600">
        This card uses default settings with medium intensity hover effects
        and medium depth shadows.
      </p>
    </div>
  </Card3D>
);

/**
 * Example 2: Light Intensity Card
 */
export const LightIntensityCard = () => (
  <Card3D intensity="light" depth="shallow" glassEffect="light">
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Light Effect Card</h3>
      <p className="text-gray-600">
        Subtle 3D effects with light glass morphism and shallow shadows.
      </p>
    </div>
  </Card3D>
);

/**
 * Example 3: Heavy Intensity Card
 */
export const HeavyIntensityCard = () => (
  <Card3D intensity="heavy" depth="deep" glassEffect="heavy">
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Heavy Effect Card</h3>
      <p className="text-gray-600">
        Pronounced 3D effects with strong glass morphism and deep shadows.
      </p>
    </div>
  </Card3D>
);

/**
 * Example 4: Interactive Card with Click Handler
 */
export const InteractiveCard = () => {
  const handleClick = () => {
    alert('Card clicked!');
  };

  return (
    <Card3D
      onClick={handleClick}
      ariaLabel="Click to view details"
      className="hover:border-blue-500"
    >
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">Interactive Card</h3>
        <p className="text-gray-600">
          Click this card to trigger an action. It has proper accessibility
          support with keyboard navigation.
        </p>
      </div>
    </Card3D>
  );
};

/**
 * Example 5: Card Grid Layout
 */
export const CardGrid = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    <Card3D intensity="light">
      <div className="p-6">
        <div className="w-12 h-12 bg-blue-500 rounded-lg mb-4" />
        <h3 className="text-lg font-bold mb-2">Feature 1</h3>
        <p className="text-gray-600">Description of feature 1</p>
      </div>
    </Card3D>

    <Card3D intensity="medium">
      <div className="p-6">
        <div className="w-12 h-12 bg-green-500 rounded-lg mb-4" />
        <h3 className="text-lg font-bold mb-2">Feature 2</h3>
        <p className="text-gray-600">Description of feature 2</p>
      </div>
    </Card3D>

    <Card3D intensity="heavy">
      <div className="p-6">
        <div className="w-12 h-12 bg-purple-500 rounded-lg mb-4" />
        <h3 className="text-lg font-bold mb-2">Feature 3</h3>
        <p className="text-gray-600">Description of feature 3</p>
      </div>
    </Card3D>
  </div>
);

/**
 * Example 6: Service Card with Image
 */
export const ServiceCard = () => (
  <Card3D
    intensity="medium"
    depth="medium"
    onClick={() => console.log('Service clicked')}
  >
    <div className="overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600" />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">Web Development</h3>
        <p className="text-gray-600 mb-4">
          Professional web development services with modern technologies.
        </p>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Learn More
        </button>
      </div>
    </div>
  </Card3D>
);

/**
 * Example 7: Testimonial Card
 */
export const TestimonialCard = () => (
  <Card3D intensity="light" glassEffect="medium">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-4" />
        <div>
          <h4 className="font-bold">John Doe</h4>
          <p className="text-sm text-gray-600">CEO, Company Inc.</p>
        </div>
      </div>
      <p className="text-gray-700 italic">
        "This is an amazing product! It has completely transformed how we work."
      </p>
    </div>
  </Card3D>
);

/**
 * Example 8: Stats Card
 */
export const StatsCard = () => (
  <Card3D intensity="medium" depth="medium" glassEffect="light">
    <div className="p-6 text-center">
      <div className="text-4xl font-bold text-blue-600 mb-2">1,234</div>
      <div className="text-gray-600">Happy Customers</div>
    </div>
  </Card3D>
);

/**
 * Example 9: Card without Glass Effect
 */
export const SolidCard = () => (
  <Card3D glassEffect="none" className="bg-white border border-gray-200">
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Solid Card</h3>
      <p className="text-gray-600">
        This card has no glass effect, just a solid background.
      </p>
    </div>
  </Card3D>
);

/**
 * Example 10: Disabled 3D Effects (Fallback)
 */
export const FallbackCard = () => (
  <Card3D disable3D={true}>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Fallback Card</h3>
      <p className="text-gray-600">
        This card has 3D effects disabled, useful for low-end devices or
        accessibility preferences.
      </p>
    </div>
  </Card3D>
);

/**
 * Example 11: RTL Layout Card
 */
export const RTLCard = () => (
  <Card3D isRTL={true}>
    <div className="p-6" dir="rtl">
      <h3 className="text-xl font-bold mb-2">بطاقة RTL</h3>
      <p className="text-gray-600">
        هذه البطاقة تدعم التخطيط من اليمين إلى اليسار
      </p>
    </div>
  </Card3D>
);

/**
 * Example 12: Custom Transform Card
 */
export const CustomTransformCard = () => (
  <Card3DCustom
    transform={{
      perspective: 1500,
      rotateX: 10,
      rotateY: 15,
      rotateZ: 0,
      translateZ: 50,
      scale: 1.05,
    }}
    depth="deep"
  >
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">Custom Transform</h3>
      <p className="text-gray-600">
        This card uses a custom 3D transform configuration.
      </p>
    </div>
  </Card3DCustom>
);

/**
 * Example 13: Product Card
 */
export const ProductCard = () => (
  <Card3D
    intensity="medium"
    onClick={() => console.log('Product clicked')}
    ariaLabel="View product details"
  >
    <div className="overflow-hidden">
      <div className="h-64 bg-gradient-to-br from-pink-500 to-orange-500" />
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">Product Name</h3>
        <p className="text-gray-600 mb-4">
          High-quality product with amazing features.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">$99.99</span>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </Card3D>
);

/**
 * Example 14: Blog Post Card
 */
export const BlogPostCard = () => (
  <Card3D
    intensity="light"
    onClick={() => console.log('Blog post clicked')}
  >
    <div className="overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-green-500 to-teal-600" />
      <div className="p-6">
        <div className="text-sm text-gray-500 mb-2">March 15, 2024</div>
        <h3 className="text-xl font-bold mb-2">Blog Post Title</h3>
        <p className="text-gray-600 mb-4">
          A brief excerpt from the blog post to give readers a preview...
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>5 min read</span>
          <span className="mx-2">•</span>
          <span>Technology</span>
        </div>
      </div>
    </div>
  </Card3D>
);

/**
 * Example 15: Team Member Card
 */
export const TeamMemberCard = () => (
  <Card3D intensity="medium" depth="medium">
    <div className="text-center p-6">
      <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4" />
      <h3 className="text-xl font-bold mb-1">Jane Smith</h3>
      <p className="text-gray-600 mb-4">Senior Developer</p>
      <div className="flex justify-center space-x-4">
        <a href="#" className="text-blue-500 hover:text-blue-600">
          LinkedIn
        </a>
        <a href="#" className="text-gray-500 hover:text-gray-600">
          Twitter
        </a>
        <a href="#" className="text-purple-500 hover:text-purple-600">
          GitHub
        </a>
      </div>
    </div>
  </Card3D>
);

/**
 * All Examples Component
 */
export const AllExamples = () => (
  <div className="space-y-12 p-8">
    <section>
      <h2 className="text-2xl font-bold mb-4">Basic Examples</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BasicCard />
        <LightIntensityCard />
        <HeavyIntensityCard />
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4">Interactive Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InteractiveCard />
        <ServiceCard />
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4">Content Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TestimonialCard />
        <StatsCard />
        <ProductCard />
      </div>
    </section>

    <section>
      <h2 className="text-2xl font-bold mb-4">Special Cases</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SolidCard />
        <FallbackCard />
        <RTLCard />
      </div>
    </section>
  </div>
);

export default AllExamples;

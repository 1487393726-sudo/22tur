/**
 * CardGrid3D Component Examples
 * 
 * This file demonstrates various usage patterns for the CardGrid3D component.
 */

import React from 'react';
import { CardGrid3D, CardGrid3DCustom, createWaveStagger, createDiagonalStagger } from './CardGrid3D';
import { Card3D } from './Card3D';

/**
 * Example 1: Basic Grid with Default Configuration
 * 
 * Uses default responsive columns:
 * - Mobile: 1 column
 * - Tablet: 2 columns
 * - Desktop: 3 columns
 */
export const BasicGridExample = () => {
  const items = [
    { title: 'Service 1', description: 'Description for service 1' },
    { title: 'Service 2', description: 'Description for service 2' },
    { title: 'Service 3', description: 'Description for service 3' },
    { title: 'Service 4', description: 'Description for service 4' },
    { title: 'Service 5', description: 'Description for service 5' },
    { title: 'Service 6', description: 'Description for service 6' },
  ];

  return (
    <CardGrid3D>
      {items.map((item, index) => (
        <Card3D key={index} depth="medium" glassEffect="medium">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

/**
 * Example 2: Custom Column Configuration
 * 
 * Custom responsive columns:
 * - Mobile: 1 column
 * - Tablet: 3 columns
 * - Desktop: 4 columns
 */
export const CustomColumnsExample = () => {
  const items = Array.from({ length: 8 }, (_, i) => ({
    title: `Item ${i + 1}`,
    description: `Description for item ${i + 1}`,
  }));

  return (
    <CardGrid3D
      columns={{
        mobile: 1,
        tablet: 3,
        desktop: 4,
      }}
      gap="8"
      staggerDelay={0.15}
    >
      {items.map((item, index) => (
        <Card3D key={index} depth="shallow" glassEffect="light">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

/**
 * Example 3: Wave Stagger Animation
 * 
 * Items animate in a wave pattern across the grid
 */
export const WaveStaggerExample = () => {
  const items = Array.from({ length: 12 }, (_, i) => ({
    title: `Card ${i + 1}`,
    content: `Content for card ${i + 1}`,
  }));

  const columns = 3; // Desktop columns

  return (
    <CardGrid3DCustom
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: columns,
      }}
      getItemDelay={createWaveStagger(columns, 0.05)}
    >
      {items.map((item, index) => (
        <Card3D key={index} depth="medium" glassEffect="medium">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.content}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3DCustom>
  );
};

/**
 * Example 4: Diagonal Stagger Animation
 * 
 * Items animate diagonally across the grid
 */
export const DiagonalStaggerExample = () => {
  const items = Array.from({ length: 9 }, (_, i) => ({
    title: `Feature ${i + 1}`,
    icon: '🚀',
    description: `Feature description ${i + 1}`,
  }));

  return (
    <CardGrid3DCustom
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 3,
      }}
      gap="6"
      getItemDelay={createDiagonalStagger(3, 0.08)}
    >
      {items.map((item, index) => (
        <Card3D key={index} depth="deep" glassEffect="heavy">
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">{item.icon}</div>
            <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3DCustom>
  );
};

/**
 * Example 5: Blog Post Grid
 * 
 * Real-world example for blog posts with images
 */
export const BlogPostGridExample = () => {
  const posts = [
    {
      title: 'Getting Started with 3D Design',
      excerpt: 'Learn the basics of 3D design and how to create stunning visual effects.',
      date: '2024-01-15',
      category: 'Design',
      image: '/images/blog/post-1.jpg',
    },
    {
      title: 'Advanced Animation Techniques',
      excerpt: 'Explore advanced animation techniques for modern web applications.',
      date: '2024-01-10',
      category: 'Development',
      image: '/images/blog/post-2.jpg',
    },
    {
      title: 'Performance Optimization Tips',
      excerpt: 'Best practices for optimizing 3D effects and animations for performance.',
      date: '2024-01-05',
      category: 'Performance',
      image: '/images/blog/post-3.jpg',
    },
  ];

  return (
    <CardGrid3D
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 3,
      }}
      gap="8"
      staggerDelay={0.12}
      ariaLabel="Blog posts"
    >
      {posts.map((post, index) => (
        <Card3D
          key={index}
          depth="medium"
          glassEffect="medium"
          onClick={() => console.log(`Navigate to post: ${post.title}`)}
          ariaLabel={`Read article: ${post.title}`}
        >
          <div className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600" />
            <div className="p-6">
              <div className="text-sm text-blue-600 font-semibold mb-2">
                {post.category}
              </div>
              <h3 className="text-xl font-bold mb-2">{post.title}</h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="text-sm text-gray-500">{post.date}</div>
            </div>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

/**
 * Example 6: Service Cards with Icons
 * 
 * Service showcase with icons and hover effects
 */
export const ServiceCardsExample = () => {
  const services = [
    {
      icon: '🎨',
      title: 'Design',
      description: 'Beautiful and modern design solutions',
      features: ['UI/UX Design', 'Brand Identity', 'Prototyping'],
    },
    {
      icon: '💻',
      title: 'Development',
      description: 'Cutting-edge web development',
      features: ['React', 'Next.js', 'TypeScript'],
    },
    {
      icon: '🚀',
      title: 'Deployment',
      description: 'Fast and reliable deployment',
      features: ['CI/CD', 'Cloud Hosting', 'Monitoring'],
    },
    {
      icon: '📱',
      title: 'Mobile',
      description: 'Native and cross-platform apps',
      features: ['iOS', 'Android', 'React Native'],
    },
    {
      icon: '🔒',
      title: 'Security',
      description: 'Enterprise-grade security',
      features: ['Authentication', 'Encryption', 'Compliance'],
    },
    {
      icon: '📊',
      title: 'Analytics',
      description: 'Data-driven insights',
      features: ['Tracking', 'Reporting', 'Optimization'],
    },
  ];

  return (
    <CardGrid3D
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 3,
      }}
      gap="6"
      staggerDelay={0.1}
      threshold={0.2}
      ariaLabel="Our services"
    >
      {services.map((service, index) => (
        <Card3D
          key={index}
          depth="medium"
          glassEffect="medium"
          intensity="medium"
        >
          <div className="p-8">
            <div className="text-5xl mb-4">{service.icon}</div>
            <h3 className="text-2xl font-bold mb-3">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <ul className="space-y-2">
              {service.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-500 flex items-center">
                  <span className="mr-2">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

/**
 * Example 7: Team Member Grid
 * 
 * Team showcase with profile cards
 */
export const TeamMemberGridExample = () => {
  const team = [
    {
      name: 'John Doe',
      role: 'CEO & Founder',
      bio: 'Visionary leader with 15 years of experience',
      avatar: '/images/team/john.jpg',
    },
    {
      name: 'Jane Smith',
      role: 'CTO',
      bio: 'Tech expert passionate about innovation',
      avatar: '/images/team/jane.jpg',
    },
    {
      name: 'Mike Johnson',
      role: 'Lead Designer',
      bio: 'Creative mind behind our beautiful designs',
      avatar: '/images/team/mike.jpg',
    },
    {
      name: 'Sarah Williams',
      role: 'Marketing Director',
      bio: 'Strategic thinker driving growth',
      avatar: '/images/team/sarah.jpg',
    },
  ];

  return (
    <CardGrid3D
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 4,
      }}
      gap="6"
      staggerDelay={0.1}
    >
      {team.map((member, index) => (
        <Card3D
          key={index}
          depth="medium"
          glassEffect="light"
          intensity="light"
        >
          <div className="text-center p-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-1">{member.name}</h3>
            <p className="text-sm text-blue-600 font-semibold mb-3">{member.role}</p>
            <p className="text-sm text-gray-600">{member.bio}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

/**
 * Example 8: No Animation (Static Grid)
 * 
 * Grid without animations for performance-critical scenarios
 */
export const StaticGridExample = () => {
  const items = Array.from({ length: 6 }, (_, i) => ({
    title: `Static Item ${i + 1}`,
    content: `This item has no animation`,
  }));

  return (
    <CardGrid3D
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 3,
      }}
      disableAnimation={true}
    >
      {items.map((item, index) => (
        <Card3D key={index} depth="shallow" glassEffect="light">
          <div className="p-6">
            <h3 className="text-lg font-bold mb-2">{item.title}</h3>
            <p className="text-gray-600">{item.content}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

/**
 * Example 9: Large Gap Grid
 * 
 * Grid with larger spacing between items
 */
export const LargeGapGridExample = () => {
  const items = Array.from({ length: 4 }, (_, i) => ({
    title: `Feature ${i + 1}`,
    description: `Detailed description for feature ${i + 1}`,
  }));

  return (
    <CardGrid3D
      columns={{
        mobile: 1,
        tablet: 2,
        desktop: 2,
      }}
      gap="12"
      staggerDelay={0.2}
    >
      {items.map((item, index) => (
        <Card3D key={index} depth="deep" glassEffect="heavy">
          <div className="p-12">
            <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
            <p className="text-lg text-gray-600">{item.description}</p>
          </div>
        </Card3D>
      ))}
    </CardGrid3D>
  );
};

export default {
  BasicGridExample,
  CustomColumnsExample,
  WaveStaggerExample,
  DiagonalStaggerExample,
  BlogPostGridExample,
  ServiceCardsExample,
  TeamMemberGridExample,
  StaticGridExample,
  LargeGapGridExample,
};

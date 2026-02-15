/**
 * FadeInView Component Examples
 * Demonstrates various usage patterns for the FadeInView animation component
 */

import React from 'react';
import { FadeInView } from './FadeInView';

/**
 * Basic Usage Example
 */
export const BasicExample: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Basic Fade In</h2>
      
      <FadeInView>
        <div className="p-6 bg-blue-100 rounded-lg">
          <h3 className="text-xl font-semibold">Simple Fade In</h3>
          <p>This content fades in when it enters the viewport.</p>
        </div>
      </FadeInView>
    </div>
  );
};

/**
 * Custom Delay Example
 */
export const DelayExample: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Delayed Fade In</h2>
      
      <FadeInView delay={0.2}>
        <div className="p-6 bg-green-100 rounded-lg">
          <h3 className="text-xl font-semibold">Delayed by 0.2s</h3>
          <p>This content has a slight delay before fading in.</p>
        </div>
      </FadeInView>
      
      <FadeInView delay={0.5}>
        <div className="p-6 bg-green-100 rounded-lg">
          <h3 className="text-xl font-semibold">Delayed by 0.5s</h3>
          <p>This content has a longer delay.</p>
        </div>
      </FadeInView>
    </div>
  );
};

/**
 * Custom Duration Example
 */
export const DurationExample: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Custom Duration</h2>
      
      <FadeInView duration={0.3}>
        <div className="p-6 bg-purple-100 rounded-lg">
          <h3 className="text-xl font-semibold">Fast Fade (0.3s)</h3>
          <p>This content fades in quickly.</p>
        </div>
      </FadeInView>
      
      <FadeInView duration={1.0}>
        <div className="p-6 bg-purple-100 rounded-lg">
          <h3 className="text-xl font-semibold">Slow Fade (1.0s)</h3>
          <p>This content fades in slowly for emphasis.</p>
        </div>
      </FadeInView>
    </div>
  );
};

/**
 * Threshold Example
 */
export const ThresholdExample: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Threshold Configuration</h2>
      
      <FadeInView threshold={0}>
        <div className="p-6 bg-yellow-100 rounded-lg">
          <h3 className="text-xl font-semibold">Threshold: 0</h3>
          <p>Animates as soon as any part enters viewport.</p>
        </div>
      </FadeInView>
      
      <FadeInView threshold={0.5}>
        <div className="p-6 bg-yellow-100 rounded-lg">
          <h3 className="text-xl font-semibold">Threshold: 0.5</h3>
          <p>Animates when 50% is visible.</p>
        </div>
      </FadeInView>
      
      <FadeInView threshold={1}>
        <div className="p-6 bg-yellow-100 rounded-lg">
          <h3 className="text-xl font-semibold">Threshold: 1</h3>
          <p>Animates only when fully visible.</p>
        </div>
      </FadeInView>
    </div>
  );
};

/**
 * Repeating Animation Example
 */
export const RepeatingExample: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Repeating Animation</h2>
      
      <FadeInView once={false}>
        <div className="p-6 bg-red-100 rounded-lg">
          <h3 className="text-xl font-semibold">Repeating Animation</h3>
          <p>This animates every time it enters the viewport.</p>
          <p className="text-sm text-gray-600 mt-2">
            Scroll up and down to see the effect repeat.
          </p>
        </div>
      </FadeInView>
    </div>
  );
};

/**
 * Staggered Content Example
 */
export const StaggeredExample: React.FC = () => {
  const items = [
    { title: 'First Item', delay: 0 },
    { title: 'Second Item', delay: 0.1 },
    { title: 'Third Item', delay: 0.2 },
    { title: 'Fourth Item', delay: 0.3 },
  ];

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Staggered Fade In</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <FadeInView key={index} delay={item.delay}>
            <div className="p-6 bg-indigo-100 rounded-lg">
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <p>Delay: {item.delay}s</p>
            </div>
          </FadeInView>
        ))}
      </div>
    </div>
  );
};

/**
 * Card Grid Example
 */
export const CardGridExample: React.FC = () => {
  const cards = Array.from({ length: 6 }, (_, i) => ({
    id: i + 1,
    title: `Card ${i + 1}`,
    description: 'This card fades in when scrolled into view.',
  }));

  return (
    <div className="space-y-8 p-8">
      <h2 className="text-2xl font-bold">Card Grid with Fade In</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <FadeInView key={card.id} delay={index * 0.1}>
            <div className="p-6 bg-white rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-600">{card.description}</p>
            </div>
          </FadeInView>
        ))}
      </div>
    </div>
  );
};

/**
 * Hero Section Example
 */
export const HeroExample: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="text-center text-white space-y-6">
        <FadeInView duration={0.8}>
          <h1 className="text-5xl md:text-7xl font-bold">
            Welcome to Our Site
          </h1>
        </FadeInView>
        
        <FadeInView delay={0.3} duration={0.8}>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            Experience smooth animations and modern design
          </p>
        </FadeInView>
        
        <FadeInView delay={0.6} duration={0.8}>
          <button className="px-8 py-4 bg-white text-blue-600 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors">
            Get Started
          </button>
        </FadeInView>
      </div>
    </div>
  );
};

/**
 * All Examples Combined
 */
export const AllExamples: React.FC = () => {
  return (
    <div className="space-y-16">
      <BasicExample />
      <DelayExample />
      <DurationExample />
      <ThresholdExample />
      <RepeatingExample />
      <StaggeredExample />
      <CardGridExample />
      <HeroExample />
    </div>
  );
};

export default AllExamples;

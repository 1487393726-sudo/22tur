'use client';

/**
 * FlipCard3D Component Examples
 * 
 * Demonstrates various usage patterns for the FlipCard3D component
 */

import React, { useState } from 'react';
import { FlipCard3D, FlipCard3DCustom } from './FlipCard3D';

/**
 * Example 1: Basic Click-to-Flip Card
 */
export const BasicFlipCardExample = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Basic Click-to-Flip Card</h2>
      <FlipCard3D
        frontContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-blue-500 to-purple-600">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">Front Side</h3>
              <p>Click to flip</p>
            </div>
          </div>
        }
        backContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-purple-600 to-pink-500">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">Back Side</h3>
              <p>Click again to flip back</p>
            </div>
          </div>
        }
        width={300}
        height={200}
        glassEffect="medium"
        depth="medium"
      />
    </div>
  );
};

/**
 * Example 2: Hover-to-Flip Card
 */
export const HoverFlipCardExample = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Hover-to-Flip Card</h2>
      <FlipCard3D
        flipTrigger="hover"
        frontContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-green-500 to-teal-600">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">Service Title</h3>
              <p>Hover to see details</p>
            </div>
          </div>
        }
        backContent={
          <div className="flex flex-col justify-center h-full p-6 bg-gradient-to-br from-teal-600 to-blue-500">
            <div className="text-white">
              <h3 className="text-lg font-bold mb-3">Service Details</h3>
              <ul className="space-y-2 text-sm">
                <li>✓ Feature 1</li>
                <li>✓ Feature 2</li>
                <li>✓ Feature 3</li>
              </ul>
            </div>
          </div>
        }
        width={300}
        height={250}
        glassEffect="light"
        depth="deep"
      />
    </div>
  );
};

/**
 * Example 3: Team Member Card
 */
export const TeamMemberCardExample = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Team Member Card</h2>
      <FlipCard3D
        flipTrigger="hover"
        frontContent={
          <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">John Doe</h3>
            <p className="text-gray-600">CEO & Founder</p>
          </div>
        }
        backContent={
          <div className="flex flex-col justify-center h-full p-6 bg-white">
            <h3 className="text-lg font-bold text-gray-800 mb-3">About John</h3>
            <p className="text-sm text-gray-600 mb-4">
              10+ years of experience in tech industry. Passionate about innovation and team building.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-blue-600 hover:text-blue-700">LinkedIn</a>
              <a href="#" className="text-blue-600 hover:text-blue-700">Twitter</a>
              <a href="#" className="text-blue-600 hover:text-blue-700">Email</a>
            </div>
          </div>
        }
        width={280}
        height={320}
        glassEffect="medium"
        depth="medium"
      />
    </div>
  );
};

/**
 * Example 4: Controlled Flip Card
 */
export const ControlledFlipCardExample = () => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Controlled Flip Card</h2>
      <div className="mb-4">
        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Toggle Flip (External Control)
        </button>
      </div>
      <FlipCard3D
        isFlipped={isFlipped}
        onFlipChange={setIsFlipped}
        frontContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-orange-500 to-red-600">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold">Controlled Card</h3>
              <p className="text-sm mt-2">State: Front</p>
            </div>
          </div>
        }
        backContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-red-600 to-pink-500">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold">Controlled Card</h3>
              <p className="text-sm mt-2">State: Back</p>
            </div>
          </div>
        }
        width={300}
        height={200}
      />
    </div>
  );
};

/**
 * Example 5: Custom Animation Card
 */
export const CustomAnimationCardExample = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Custom Animation Card</h2>
      <FlipCard3DCustom
        flipDuration={1.2}
        flipEasing={[0.68, -0.55, 0.265, 1.55]} // Bounce easing
        frontContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-indigo-500 to-purple-600">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">Slow Bounce</h3>
              <p>Custom animation timing</p>
            </div>
          </div>
        }
        backContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-purple-600 to-pink-500">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">Back Side</h3>
              <p>With bounce effect</p>
            </div>
          </div>
        }
        width={300}
        height={200}
      />
    </div>
  );
};

/**
 * Example 6: Grid of Flip Cards
 */
export const FlipCardGridExample = () => {
  const services = [
    {
      title: 'Web Development',
      icon: '🌐',
      features: ['React', 'Next.js', 'TypeScript'],
    },
    {
      title: 'Mobile Apps',
      icon: '📱',
      features: ['iOS', 'Android', 'React Native'],
    },
    {
      title: 'UI/UX Design',
      icon: '🎨',
      features: ['Figma', 'Adobe XD', 'Prototyping'],
    },
    {
      title: 'Cloud Services',
      icon: '☁️',
      features: ['AWS', 'Azure', 'Google Cloud'],
    },
  ];
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Services Grid</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <FlipCard3D
            key={index}
            flipTrigger="hover"
            frontContent={
              <div className="flex flex-col items-center justify-center h-full p-6 bg-white">
                <div className="text-6xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 text-center">
                  {service.title}
                </h3>
              </div>
            }
            backContent={
              <div className="flex flex-col justify-center h-full p-6 bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-3">
                  {service.title}
                </h3>
                <ul className="space-y-2">
                  {service.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
              </div>
            }
            height={220}
            glassEffect="light"
            depth="medium"
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Example 7: RTL Support
 */
export const RTLFlipCardExample = () => {
  return (
    <div className="p-8" dir="rtl">
      <h2 className="text-2xl font-bold mb-4">RTL Flip Card (Arabic/Uyghur)</h2>
      <FlipCard3D
        isRTL={true}
        frontContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-emerald-500 to-teal-600">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">الجانب الأمامي</h3>
              <p>انقر للقلب</p>
            </div>
          </div>
        }
        backContent={
          <div className="flex items-center justify-center h-full p-6 bg-gradient-to-br from-teal-600 to-cyan-500">
            <div className="text-center text-white">
              <h3 className="text-xl font-bold mb-2">الجانب الخلفي</h3>
              <p>انقر مرة أخرى</p>
            </div>
          </div>
        }
        width={300}
        height={200}
      />
    </div>
  );
};

/**
 * All Examples Component
 */
export const FlipCard3DExamples = () => {
  return (
    <div className="space-y-12 bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">
          FlipCard3D Component Examples
        </h1>
        
        <BasicFlipCardExample />
        <HoverFlipCardExample />
        <TeamMemberCardExample />
        <ControlledFlipCardExample />
        <CustomAnimationCardExample />
        <FlipCardGridExample />
        <RTLFlipCardExample />
      </div>
    </div>
  );
};

export default FlipCard3DExamples;

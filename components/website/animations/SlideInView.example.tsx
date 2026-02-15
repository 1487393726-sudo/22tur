/**
 * SlideInView Component Examples
 * Demonstrates various use cases of the SlideInView animation component
 */

'use client';

import React from 'react';
import { SlideInView } from './SlideInView';

export default function SlideInViewExamples() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-white mb-4">
            SlideInView Animation Examples
          </h1>
          <p className="text-gray-300">
            Scroll down to see elements slide in from different directions
          </p>
        </div>

        {/* Example 1: Slide from Left */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Slide from Left</h2>
          <SlideInView direction="left" duration={0.6}>
            <div className="glass-medium p-8 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Content sliding from the left
              </h3>
              <p className="text-gray-300">
                This card slides in from the left side of the screen with a smooth animation.
              </p>
            </div>
          </SlideInView>
        </section>

        {/* Example 2: Slide from Right */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Slide from Right</h2>
          <SlideInView direction="right" duration={0.6}>
            <div className="glass-medium p-8 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Content sliding from the right
              </h3>
              <p className="text-gray-300">
                This card slides in from the right side of the screen with a smooth animation.
              </p>
            </div>
          </SlideInView>
        </section>

        {/* Example 3: Slide from Top */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Slide from Top</h2>
          <SlideInView direction="down" duration={0.6}>
            <div className="glass-medium p-8 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Content sliding from the top
              </h3>
              <p className="text-gray-300">
                This card slides down from the top of the screen with a smooth animation.
              </p>
            </div>
          </SlideInView>
        </section>

        {/* Example 4: Slide from Bottom (Default) */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Slide from Bottom (Default)</h2>
          <SlideInView direction="up" duration={0.6}>
            <div className="glass-medium p-8 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Content sliding from the bottom
              </h3>
              <p className="text-gray-300">
                This card slides up from the bottom of the screen with a smooth animation.
              </p>
            </div>
          </SlideInView>
        </section>

        {/* Example 5: With Delay */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">With Delay</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SlideInView direction="up" delay={0}>
              <div className="glass-light p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">No Delay</h4>
                <p className="text-gray-300 text-sm">Appears immediately</p>
              </div>
            </SlideInView>
            <SlideInView direction="up" delay={0.2}>
              <div className="glass-light p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">0.2s Delay</h4>
                <p className="text-gray-300 text-sm">Appears after 0.2 seconds</p>
              </div>
            </SlideInView>
            <SlideInView direction="up" delay={0.4}>
              <div className="glass-light p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">0.4s Delay</h4>
                <p className="text-gray-300 text-sm">Appears after 0.4 seconds</p>
              </div>
            </SlideInView>
          </div>
        </section>

        {/* Example 6: Different Durations */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Different Durations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SlideInView direction="left" duration={0.3}>
              <div className="glass-light p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Fast (0.3s)</h4>
                <p className="text-gray-300 text-sm">Quick animation</p>
              </div>
            </SlideInView>
            <SlideInView direction="left" duration={0.6}>
              <div className="glass-light p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Normal (0.6s)</h4>
                <p className="text-gray-300 text-sm">Standard speed</p>
              </div>
            </SlideInView>
            <SlideInView direction="left" duration={1.0}>
              <div className="glass-light p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Slow (1.0s)</h4>
                <p className="text-gray-300 text-sm">Slower animation</p>
              </div>
            </SlideInView>
          </div>
        </section>

        {/* Example 7: Alternating Directions */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Alternating Directions</h2>
          <div className="space-y-4">
            <SlideInView direction="left" delay={0}>
              <div className="glass-light p-6 rounded-lg">
                <p className="text-white">Slide from left</p>
              </div>
            </SlideInView>
            <SlideInView direction="right" delay={0.1}>
              <div className="glass-light p-6 rounded-lg">
                <p className="text-white">Slide from right</p>
              </div>
            </SlideInView>
            <SlideInView direction="left" delay={0.2}>
              <div className="glass-light p-6 rounded-lg">
                <p className="text-white">Slide from left</p>
              </div>
            </SlideInView>
            <SlideInView direction="right" delay={0.3}>
              <div className="glass-light p-6 rounded-lg">
                <p className="text-white">Slide from right</p>
              </div>
            </SlideInView>
          </div>
        </section>

        {/* Example 8: Complex Content */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Complex Content</h2>
          <SlideInView direction="up" duration={0.7}>
            <div className="glass-medium p-8 rounded-xl">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Feature Card with Icon
                  </h3>
                  <p className="text-gray-300 mb-4">
                    This demonstrates how SlideInView works with more complex content
                    including icons, multiple text elements, and buttons.
                  </p>
                  <button className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          </SlideInView>
        </section>

        {/* Example 9: Repeating Animation */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Repeating Animation</h2>
          <p className="text-gray-300 text-sm">
            Scroll past this element and back to see it animate again
          </p>
          <SlideInView direction="up" once={false}>
            <div className="glass-medium p-8 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-2">
                Repeating Animation
              </h3>
              <p className="text-gray-300">
                This card will animate every time it enters the viewport (once=false)
              </p>
            </div>
          </SlideInView>
        </section>

        {/* Spacer for scrolling */}
        <div className="h-96"></div>
      </div>
    </div>
  );
}

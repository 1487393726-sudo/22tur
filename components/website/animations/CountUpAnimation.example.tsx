/**
 * CountUpAnimation Component Examples
 * Demonstrates various use cases of the CountUpAnimation component
 */

'use client';

import React from 'react';
import { CountUpAnimation } from './CountUpAnimation';

export default function CountUpAnimationExamples() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            CountUpAnimation Examples
          </h1>
          <p className="text-slate-300">
            Scroll down to see the counting animations trigger
          </p>
        </div>

        {/* Basic Example */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Basic Count Up
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CountUpAnimation
                end={1000}
                className="text-5xl font-bold text-white"
              />
              <p className="text-slate-300 mt-2">Simple count to 1000</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={500}
                duration={1.5}
                className="text-5xl font-bold text-blue-400"
              />
              <p className="text-slate-300 mt-2">Faster animation (1.5s)</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={2500}
                duration={3}
                className="text-5xl font-bold text-green-400"
              />
              <p className="text-slate-300 mt-2">Slower animation (3s)</p>
            </div>
          </div>
        </section>

        {/* With Prefix and Suffix */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            With Prefix & Suffix
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CountUpAnimation
                end={99}
                suffix="%"
                className="text-5xl font-bold text-yellow-400"
              />
              <p className="text-slate-300 mt-2">Percentage</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={5000}
                prefix="$"
                separator={true}
                className="text-5xl font-bold text-emerald-400"
              />
              <p className="text-slate-300 mt-2">Currency with separator</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={1000}
                suffix="+"
                separator={true}
                className="text-5xl font-bold text-purple-400"
              />
              <p className="text-slate-300 mt-2">Plus suffix</p>
            </div>
          </div>
        </section>

        {/* With Decimals */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            With Decimal Places
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CountUpAnimation
                end={99.9}
                decimals={1}
                suffix="%"
                className="text-5xl font-bold text-pink-400"
              />
              <p className="text-slate-300 mt-2">One decimal place</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={3.14159}
                decimals={2}
                className="text-5xl font-bold text-cyan-400"
              />
              <p className="text-slate-300 mt-2">Two decimal places</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={1234.567}
                decimals={3}
                separator={true}
                className="text-5xl font-bold text-orange-400"
              />
              <p className="text-slate-300 mt-2">Three decimals with separator</p>
            </div>
          </div>
        </section>

        {/* Different Easing Functions */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Different Easing Functions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <CountUpAnimation
                end={1000}
                easing="linear"
                className="text-4xl font-bold text-white"
              />
              <p className="text-slate-300 mt-2">Linear</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={1000}
                easing="easeIn"
                className="text-4xl font-bold text-blue-400"
              />
              <p className="text-slate-300 mt-2">Ease In</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={1000}
                easing="easeOut"
                className="text-4xl font-bold text-green-400"
              />
              <p className="text-slate-300 mt-2">Ease Out</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={1000}
                easing="easeInOut"
                className="text-4xl font-bold text-purple-400"
              />
              <p className="text-slate-300 mt-2">Ease In Out</p>
            </div>
          </div>
        </section>

        {/* Statistics Dashboard Example */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center">
            Statistics Dashboard Example
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-400/30">
              <div className="text-blue-400 text-sm font-medium mb-2">
                Total Users
              </div>
              <CountUpAnimation
                end={15420}
                separator={true}
                className="text-4xl font-bold text-white"
              />
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-400/30">
              <div className="text-green-400 text-sm font-medium mb-2">
                Revenue
              </div>
              <CountUpAnimation
                end={98500}
                prefix="$"
                separator={true}
                className="text-4xl font-bold text-white"
              />
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-400/30">
              <div className="text-purple-400 text-sm font-medium mb-2">
                Success Rate
              </div>
              <CountUpAnimation
                end={99.7}
                decimals={1}
                suffix="%"
                className="text-4xl font-bold text-white"
              />
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-6 border border-orange-400/30">
              <div className="text-orange-400 text-sm font-medium mb-2">
                Active Projects
              </div>
              <CountUpAnimation
                end={247}
                suffix="+"
                className="text-4xl font-bold text-white"
              />
            </div>
          </div>
        </section>

        {/* Custom Separators */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Custom Separators
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CountUpAnimation
                end={1234567}
                separator={true}
                separatorChar=" "
                className="text-4xl font-bold text-white"
              />
              <p className="text-slate-300 mt-2">Space separator</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={1234.56}
                decimals={2}
                separatorChar="."
                decimalChar=","
                separator={true}
                className="text-4xl font-bold text-blue-400"
              />
              <p className="text-slate-300 mt-2">European format</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                end={9876543}
                separator={true}
                separatorChar="_"
                className="text-4xl font-bold text-green-400"
              />
              <p className="text-slate-300 mt-2">Underscore separator</p>
            </div>
          </div>
        </section>

        {/* Starting from Non-Zero */}
        <section className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Custom Start Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <CountUpAnimation
                start={50}
                end={100}
                suffix="%"
                className="text-5xl font-bold text-yellow-400"
              />
              <p className="text-slate-300 mt-2">From 50 to 100</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                start={1000}
                end={5000}
                separator={true}
                className="text-5xl font-bold text-cyan-400"
              />
              <p className="text-slate-300 mt-2">From 1,000 to 5,000</p>
            </div>
            <div className="text-center">
              <CountUpAnimation
                start={90}
                end={99.9}
                decimals={1}
                suffix="%"
                className="text-5xl font-bold text-pink-400"
              />
              <p className="text-slate-300 mt-2">From 90 to 99.9%</p>
            </div>
          </div>
        </section>

        {/* Spacer for scrolling */}
        <div className="h-32"></div>
      </div>
    </div>
  );
}

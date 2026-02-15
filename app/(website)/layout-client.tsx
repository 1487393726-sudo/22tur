'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/lib/i18n/context';
import { pageTransition } from '@/lib/animations/variants';

/**
 * Unified Website Layout Client Component
 * 
 * Features:
 * - Integrated Navbar with glass effect
 * - Integrated Footer with glass effect
 * - Page transition animations
 * - RTL layout support for Uyghur language
 * - Locale-aware navigation
 * 
 * Requirements: 3.4, 6.5
 */
export function WebsiteLayoutClient({
  children,
}: {
  children: ReactNode;
}) {
  const { language } = useLanguage();
  const pathname = usePathname();
  
  // Apply RTL layout for Uyghur language
  const isRTL = language === 'ug';
  
  useEffect(() => {
    // Set document direction based on language
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Set lang attribute for accessibility
    document.documentElement.lang = language;
  }, [isRTL, language]);

  return (
    <div 
      className="min-h-screen bg-background text-foreground"
      data-route-type="website"
      data-theme="artistic"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Navbar with glass effect - fixed at top */}
      <Navbar />
      
      {/* Main content area with page transitions */}
      <main className="min-h-screen relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      
      {/* Footer with glass effect */}
      <Footer />
    </div>
  );
}

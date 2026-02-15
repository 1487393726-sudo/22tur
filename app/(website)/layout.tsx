import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { WebsiteLayoutClient } from './layout-client';

export const metadata: Metadata = {
  title: 'Creative - Professional Digital Solutions',
  description: 'We create innovative digital solutions that help businesses grow and succeed in the modern world.',
};

/**
 * Unified Website Layout (Server Component)
 * 
 * This is the server component wrapper that provides metadata.
 * The actual layout logic is in the client component.
 * 
 * Requirements: 3.4, 6.5
 */
export default function WebsiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <WebsiteLayoutClient>{children}</WebsiteLayoutClient>;
}

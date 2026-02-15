import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@/components/ui/json-ld";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInitializer } from "@/components/theme-initializer";
import { RouteThemeProvider } from "@/lib/theme/route-theme-provider";
import { LanguageProvider } from "@/lib/i18n/context";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { ColorInitializer } from "@/components/website/ColorInitializer";
import { Toaster } from "sonner";
import "./globals.css";
import "../styles/themes.css";
import "../styles/website-colors.css";
export const metadata: Metadata = {
  title: "Creative Agency - Digital Masterpieces & Immersive Experiences",
  description:
    "Award-winning creative agency specializing in web development, mobile apps, UI/UX design, branding, and digital marketing. Transform your ideas into reality with our expert team.",
  keywords: [
    "creative agency",
    "web development",
    "mobile apps",
    "UI/UX design",
    "branding",
    "digital marketing",
    "design agency",
  ],
  authors: [
    {
      name: "Creative Agency",
    },
  ],
  creator: "Creative Agency",
  publisher: "Creative Agency",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://creative.agency",
    title: "Creative Agency - Digital Masterpieces",
    description:
      "Transform your ideas into immersive digital experiences with our cutting-edge design and development services.",
    siteName: "Creative Agency",
  },
  twitter: {
    card: "summary_large_image",
    title: "Creative Agency - Digital Masterpieces",
    description:
      "Transform your ideas into immersive digital experiences with our cutting-edge design and development services.",
    creator: "@creativeagency",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};
export const viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#7c3aed",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#1a1225",
    },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Creative Agency",
  url: "https://creative.agency",
  logo: "https://creative.agency/icon.svg",
  description:
    "Award-winning creative agency specializing in web development, mobile apps, UI/UX design, branding, and digital marketing.",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+1-234-567-890",
    contactType: "customer service",
    email: "hello@creative.agency",
    availableLanguage: ["English"],
  },
  sameAs: [
    "https://twitter.com/creativeagency",
    "https://linkedin.com/company/creativeagency",
    "https://github.com/creativeagency",
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "123 Creative Street",
    addressLocality: "San Francisco",
    addressRegion: "CA",
    postalCode: "94102",
    addressCountry: "US",
  },
};
export default function RootLayout({ 
  children,
}: Readonly<{ 
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className="scroll-smooth"
      suppressHydrationWarning
      data-oid="pxmcjsu"
    >
      <head data-oid="ic.tn_t">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <JsonLd data={organizationSchema} data-oid="gn.y4a0" />
      </head>
      <body
        className="font-sans antialiased selection:bg-primary/20 selection:text-primary"
        data-oid="5ogk37i"
      >
        <ColorInitializer />
        <ThemeInitializer />
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          themes={["dark", "tokyo", "light", "solarized"]}
          enableSystem={false}
          data-oid="8wod-x7"
        >
          <RouteThemeProvider>
            <SessionProviderWrapper data-oid="ih_t94r">
              <LanguageProvider data-oid="vlcti5s">{children}</LanguageProvider>
            </SessionProviderWrapper>
          </RouteThemeProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
        <Analytics data-oid="7_3y33h" />
      </body>
    </html>
  );
}

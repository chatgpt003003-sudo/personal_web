import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import ChatWidget from '@/components/ChatWidget';
import './globals.css';

// Optimized font loading
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true,
});

// Enhanced metadata with SEO optimization
export const metadata: Metadata = {
  title: {
    template: '%s | Portfolio',
    default: 'Portfolio - Full Stack Developer',
  },
  description:
    'Professional portfolio showcasing full-stack development projects with modern technologies like Next.js, React, TypeScript, and AWS.',
  keywords: [
    'full stack developer',
    'web development',
    'react',
    'next.js',
    'typescript',
    'portfolio',
    'aws',
    'javascript',
  ],
  authors: [{ name: 'Your Name' }],
  creator: 'Your Name',
  publisher: 'Your Name',
  category: 'technology',
  classification: 'portfolio',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXTAUTH_URL || 'https://localhost:3000',
    siteName: 'Portfolio',
    title: 'Portfolio - Full Stack Developer',
    description:
      'Professional portfolio showcasing full-stack development projects with modern technologies.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portfolio Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yourhandle',
    creator: '@yourhandle',
    title: 'Portfolio - Full Stack Developer',
    description:
      'Professional portfolio showcasing full-stack development projects.',
    images: ['/images/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#000000' },
    ],
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: process.env.NEXTAUTH_URL || 'https://localhost:3000',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    // yandex: process.env.YANDEX_VERIFICATION,
    // yahoo: process.env.YAHOO_VERIFICATION,
  },
};

// Viewport configuration for performance
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />

        {/* DNS prefetch for likely third-party domains */}
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

        {/* Preload critical assets */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin=""
        />

        {/* Critical CSS inline for above-the-fold content */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            body { 
              margin: 0; 
              font-family: var(--font-inter), system-ui, sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .loading-spinner {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 2px solid #ffffff20;
              border-radius: 50%;
              border-top-color: #ffffff;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `,
          }}
        />

        {/* Structured data for the main site */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Your Name',
              jobTitle: 'Full Stack Developer',
              url: process.env.NEXTAUTH_URL || 'https://localhost:3000',
              sameAs: [
                'https://linkedin.com/in/yourprofile',
                'https://github.com/yourusername',
                'https://twitter.com/yourhandle',
              ],
              knowsAbout: [
                'JavaScript',
                'TypeScript',
                'React',
                'Next.js',
                'Node.js',
                'AWS',
              ],
            }),
          }}
        />

        {/* Google Analytics (if configured) */}
        {process.env.GA_TRACKING_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.GA_TRACKING_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.GA_TRACKING_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="antialiased">
        {/* Skip to main content for accessibility */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-black text-white p-2 z-50"
        >
          Skip to main content
        </a>

        <Providers>
          <main id="main" className="min-h-screen">
            {children}
          </main>
          <ChatWidget />
        </Providers>

        {/* Service Worker registration for PWA */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', () => {
                    navigator.serviceWorker.register('/sw.js')
                      .then((registration) => {
                        console.log('SW registered: ', registration);
                      })
                      .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                      });
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}

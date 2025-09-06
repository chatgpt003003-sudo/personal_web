'use client';

import { useEffect } from 'react';
import { reportWebVitals, initPerformanceMonitoring } from '@/lib/performance';

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Initialize performance monitoring
    initPerformanceMonitoring();

    // Set up Web Vitals reporting
    const handleWebVitals = (metric: unknown) => {
      reportWebVitals(metric as Parameters<typeof reportWebVitals>[0]);
    };

    // Import web-vitals dynamically to avoid SSR issues
    Promise.all([
      import('web-vitals').then(m => m.onCLS(handleWebVitals)),
      import('web-vitals').then(m => m.onINP(handleWebVitals)), // FID replaced by INP in v5
      import('web-vitals').then(m => m.onFCP(handleWebVitals)),
      import('web-vitals').then(m => m.onLCP(handleWebVitals)),
      import('web-vitals').then(m => m.onTTFB(handleWebVitals)),
    ]).catch(error => {
      console.warn('Failed to load web-vitals:', error);
    });

    // Monitor page visibility changes for better metrics accuracy
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being backgrounded, good time to report metrics
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'page_visibility', {
            visibility_state: 'hidden',
            timestamp: Date.now(),
          });
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Report initial page load time
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          
          console.log(`[Performance] Page load time: ${pageLoadTime}ms`);
          
          // Report to analytics
          if (typeof window.gtag === 'function') {
            window.gtag('event', 'page_load_time', {
              value: Math.round(pageLoadTime),
              event_category: 'Performance',
            });
          }
        }
      }, 0);
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Monitor route changes in Next.js
  useEffect(() => {
    const handleRouteChange = () => {
      // Small delay to ensure new page metrics are captured
      setTimeout(() => {
        // Log navigation type
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          console.log(`[Performance] Navigation type: ${navigation.type}`);
        }
      }, 100);
    };

    // Listen for Next.js route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  return null; // This component doesn't render anything
}
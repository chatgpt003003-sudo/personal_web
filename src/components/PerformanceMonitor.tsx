'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: unknown[]) => void;
  }
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Simple performance logging without external dependencies
    const logPerformance = () => {
      try {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        if (navigation) {
          const pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
          console.log(
            `[Performance] Page load time: ${Math.round(pageLoadTime)}ms`
          );
        }
      } catch (error) {
        console.warn('Performance monitoring error:', error);
      }
    };

    // Log performance after page load
    if (document.readyState === 'complete') {
      logPerformance();
    } else {
      window.addEventListener('load', logPerformance, { once: true });
    }

    return () => {
      window.removeEventListener('load', logPerformance);
    };
  }, []);

  return null; // This component doesn't render anything
}

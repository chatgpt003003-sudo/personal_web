// Core Web Vitals monitoring and reporting
export interface WebVitals {
  id: string;
  name: 'CLS' | 'INP' | 'FCP' | 'LCP' | 'TTFB' | 'LT' | 'IL' | 'SR';
  value: number;
  label: 'web-vital' | 'custom';
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// Thresholds for Core Web Vitals (based on web.dev recommendations)
const WEB_VITALS_THRESHOLDS = {
  CLS: { good: 0.1, needsImprovement: 0.25 },
  INP: { good: 200, needsImprovement: 500 }, // Interaction to Next Paint (replaces FID)
  FCP: { good: 1800, needsImprovement: 3000 },
  LCP: { good: 2500, needsImprovement: 4000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  LT: { good: 50, needsImprovement: 200 }, // Long Task
  IL: { good: 2000, needsImprovement: 4000 }, // Image Load
  SR: { good: 1000, needsImprovement: 3000 }, // Slow Resource
};

// Rate the performance based on thresholds
export const getRating = (name: WebVitals['name'], value: number): WebVitals['rating'] => {
  const thresholds = WEB_VITALS_THRESHOLDS[name];
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
};

// Report web vitals to analytics service
export const reportWebVitals = (metric: WebVitals) => {
  // Add rating to the metric
  const enhancedMetric = {
    ...metric,
    rating: getRating(metric.name, metric.value),
  };

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}:`, {
      value: metric.value,
      rating: enhancedMetric.rating,
      delta: metric.delta,
    });
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production') {
    // Google Analytics 4 example
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', metric.name, {
        custom_parameter_1: metric.value,
        custom_parameter_2: enhancedMetric.rating,
        custom_parameter_3: metric.label,
      });
    }

    // Custom analytics endpoint
    sendToAnalytics(enhancedMetric);
  }
};

// Send metrics to custom analytics endpoint
const sendToAnalytics = async (metric: WebVitals & { rating: WebVitals['rating'] }) => {
  try {
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        connection: (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown',
      }),
    });
  } catch (error) {
    console.error('Failed to send web vitals to analytics:', error);
  }
};

// Performance observer for custom metrics
export const observePerformance = () => {
  if (typeof window === 'undefined') return;

  // Observe Long Tasks (tasks over 50ms)
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            console.log(`[Long Task] Duration: ${entry.duration}ms`, entry);
            
            // Report long tasks in production
            if (process.env.NODE_ENV === 'production') {
              sendToAnalytics({
                id: `long-task-${Date.now()}`,
                name: 'LT' as WebVitals['name'],
                value: entry.duration,
                label: 'custom',
                delta: entry.duration,
                rating: entry.duration > 200 ? 'poor' : 'needs-improvement',
              });
            }
          }
        });
      });

      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (error) {
      console.error('Long task observer not supported:', error);
    }

    // Observe Layout Shifts beyond CLS
    try {
      const layoutShiftObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry & { value?: number; hadRecentInput?: boolean }) => {
          if (entry.hadRecentInput) return; // Ignore user-initiated shifts
          
          if (entry.value && entry.value > 0.1) {
            console.log(`[Layout Shift] Value: ${entry.value}`, entry);
          }
        });
      });

      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.error('Layout shift observer not supported:', error);
    }
  }
};

// Image loading performance
export const trackImageLoading = (src: string) => {
  const startTime = performance.now();
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const loadTime = performance.now() - startTime;
      console.log(`[Image Load] ${src}: ${loadTime}ms`);
      
      if (process.env.NODE_ENV === 'production' && loadTime > 2000) {
        sendToAnalytics({
          id: `image-load-${Date.now()}`,
          name: 'IL' as WebVitals['name'],
          value: loadTime,
          label: 'custom',
          delta: loadTime,
          rating: loadTime > 4000 ? 'poor' : 'needs-improvement',
        });
      }
      
      resolve(loadTime);
    };
    
    img.onerror = () => {
      const loadTime = performance.now() - startTime;
      console.error(`[Image Error] ${src}: Failed after ${loadTime}ms`);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });
};

// Resource loading performance
export const analyzeResourceTiming = () => {
  if (typeof window === 'undefined') return;
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const analysis = {
    totalResources: resources.length,
    slowResources: resources.filter(r => r.duration > 1000),
    largestResource: resources.reduce((max, r) => r.transferSize > max.transferSize ? r : max, resources[0]),
    averageLoadTime: resources.reduce((sum, r) => sum + r.duration, 0) / resources.length,
  };
  
  console.log('[Resource Analysis]', analysis);
  
  // Report slow resources in production
  if (process.env.NODE_ENV === 'production') {
    analysis.slowResources.forEach(resource => {
      sendToAnalytics({
        id: `slow-resource-${Date.now()}`,
        name: 'SR' as WebVitals['name'],
        value: resource.duration,
        label: 'custom',
        delta: resource.duration,
        rating: resource.duration > 3000 ? 'poor' : 'needs-improvement',
      });
    });
  }
  
  return analysis;
};

// Connection quality detection
export const getConnectionQuality = () => {
  if (typeof window === 'undefined') return 'unknown';
  
  const connection = (navigator as Navigator & { connection?: { effectiveType?: string; rtt?: number; downlink?: number } }).connection;
  if (!connection) return 'unknown';
  
  const { effectiveType, rtt, downlink } = connection;
  
  return {
    type: effectiveType || 'unknown',
    rtt: rtt || 0,
    downlink: downlink || 0,
    quality: getQualityRating(effectiveType || 'unknown', rtt || 0, downlink || 0),
  };
};

const getQualityRating = (effectiveType: string, rtt: number, downlink: number) => {
  if (effectiveType === '4g' && rtt < 100 && downlink > 10) return 'excellent';
  if (effectiveType === '4g' || (rtt < 300 && downlink > 1.5)) return 'good';
  if (effectiveType === '3g' || (rtt < 1000 && downlink > 0.5)) return 'fair';
  return 'poor';
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window === 'undefined') return;
  
  const criticalResources = [
    { href: '/fonts/inter.woff2', as: 'font', type: 'font/woff2' },
    { href: '/images/hero-bg.jpg', as: 'image' },
    // Add more critical resources
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    if (resource.type) link.type = resource.type;
    if (resource.as === 'font') link.crossOrigin = 'anonymous';
    
    document.head.appendChild(link);
  });
};

// Lazy loading intersection observer
export const createLazyLoadObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  if (typeof window === 'undefined') return null;
  
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
  };
  
  return new IntersectionObserver(callback, options);
};

// Performance budget monitoring
export const checkPerformanceBudget = () => {
  const budget = {
    maxLCP: 2500,
    maxFID: 100,
    maxCLS: 0.1,
    maxTotalSize: 2 * 1024 * 1024, // 2MB
    maxRequests: 50,
  };
  
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  const totalSize = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
  const totalRequests = resources.length;
  
  const violations = [];
  
  if (totalSize > budget.maxTotalSize) {
    violations.push(`Total size: ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds budget of ${budget.maxTotalSize / 1024 / 1024}MB`);
  }
  
  if (totalRequests > budget.maxRequests) {
    violations.push(`Total requests: ${totalRequests} exceeds budget of ${budget.maxRequests}`);
  }
  
  if (violations.length > 0) {
    console.warn('[Performance Budget Violations]', violations);
  }
  
  return {
    passed: violations.length === 0,
    violations,
    metrics: {
      totalSize: totalSize / 1024 / 1024, // MB
      totalRequests,
    },
  };
};

// Global performance monitoring initialization
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Start observing performance
  observePerformance();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Check performance budget after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      checkPerformanceBudget();
      analyzeResourceTiming();
    }, 1000);
  });
};
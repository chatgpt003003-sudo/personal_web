import { NextRequest, NextResponse } from 'next/server';
import { createRateLimit } from '@/lib/security';

const webVitalsRateLimit = createRateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Allow 100 requests per minute per IP
});

interface WebVitalPayload {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
  connection: string;
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = webVitalsRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    const body = await request.json() as WebVitalPayload;
    
    // Validate required fields
    if (!body.name || typeof body.value !== 'number' || !body.rating) {
      return NextResponse.json(
        { error: 'Invalid payload' },
        { status: 400 }
      );
    }

    // In production, you would typically:
    // 1. Store in database
    // 2. Send to analytics service (Google Analytics, DataDog, etc.)
    // 3. Send to monitoring service (Sentry, LogRocket, etc.)
    
    // Log web vital for development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Web Vitals API] ${body.name}:`, {
        value: body.value,
        rating: body.rating,
        url: body.url,
        timestamp: new Date(body.timestamp).toISOString(),
      });
    }
    
    // In production, store metrics
    if (process.env.NODE_ENV === 'production') {
      // Example: Store in database
      // await storeWebVital(body);
      
      // Example: Send to external analytics
      await sendToExternalAnalytics(body);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Web vitals API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example function to send to external analytics
async function sendToExternalAnalytics(data: WebVitalPayload) {
  try {
    // Example: Send to custom analytics endpoint
    if (process.env.ANALYTICS_ENDPOINT) {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
        },
        body: JSON.stringify({
          event: 'web_vital',
          properties: data,
        }),
      });
    }
    
    // Example: Send to Google Analytics Measurement Protocol
    if (process.env.GA_MEASUREMENT_ID) {
      const measurementId = process.env.GA_MEASUREMENT_ID;
      const apiSecret = process.env.GA_API_SECRET;
      
      if (apiSecret) {
        await fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
          method: 'POST',
          body: JSON.stringify({
            client_id: 'web-vitals-client',
            events: [{
              name: 'web_vital',
              params: {
                metric_name: data.name,
                metric_value: data.value,
                metric_rating: data.rating,
                page_location: data.url,
              },
            }],
          }),
        });
      }
    }
  } catch (error) {
    console.error('Failed to send to external analytics:', error);
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
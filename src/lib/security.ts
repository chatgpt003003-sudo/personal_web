import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (for production, use Redis)
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum number of requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimit(options: RateLimitOptions) {
  return (request: NextRequest) => {
    const ip = getClientIP(request);
    const now = Date.now();
    const key = ip;

    const record = rateLimitMap.get(key) || { count: 0, lastReset: now };

    // Reset the count if the window has passed
    if (now - record.lastReset > options.windowMs) {
      record.count = 0;
      record.lastReset = now;
    }

    record.count += 1;
    rateLimitMap.set(key, record);

    if (record.count > options.max) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          message: `Rate limit exceeded. Try again in ${Math.ceil(
            (options.windowMs - (now - record.lastReset)) / 1000
          )} seconds.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (options.windowMs - (now - record.lastReset)) / 1000
            ).toString(),
          },
        }
      );
    }

    return null; // No rate limit hit
  };
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback to a default IP for development
  return '127.0.0.1';
}

// Security headers
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent XSS attacks
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // HTTPS enforcement (only in production)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
  }

  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self'; " +
      "connect-src 'self' https:; " +
      "media-src 'self' https:; " +
      "frame-ancestors 'none';"
  );

  // Remove server information
  response.headers.set('Server', '');

  return response;
}

// Input sanitization
export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }

  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }

  return input;
}

// CSRF token generation and validation
const csrfTokens = new Map<string, number>();

export function generateCSRFToken(_sessionId: string): string {
  const token = generateRandomString(32);
  csrfTokens.set(token, Date.now());
  return token;
}

export function validateCSRFToken(token: string): boolean {
  const timestamp = csrfTokens.get(token);
  if (!timestamp) return false;

  // Token expires after 1 hour
  const isValid = Date.now() - timestamp < 3600000;
  if (!isValid) {
    csrfTokens.delete(token);
  }

  return isValid;
}

// Generate random string for tokens
function generateRandomString(length: number): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// File upload validation
export interface FileValidationOptions {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

export function validateFile(
  file: File,
  options: FileValidationOptions
): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > options.maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
  if (!options.allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !options.allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension .${extension} is not allowed`,
    };
  }

  return { isValid: true };
}

// SQL injection prevention helpers
export function escapeSQL(input: string): string {
  return input.replace(/'/g, "''").replace(/;/g, '');
}

// Log security events
export function logSecurityEvent(
  event: string,
  details: Record<string, unknown>,
  ip: string
): void {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    ip,
    details,
  };

  console.log('[SECURITY]', JSON.stringify(logEntry));

  // In production, send to a proper logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., CloudWatch, Datadog)
  }
}

// Validate request origin
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'https://localhost:3000',
    process.env.NEXTAUTH_URL,
  ].filter(Boolean);

  if (!origin) {
    // Allow requests without origin (direct API calls, etc.)
    return true;
  }

  return allowedOrigins.includes(origin);
}
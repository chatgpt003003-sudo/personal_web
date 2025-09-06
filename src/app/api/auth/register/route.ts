import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  createRateLimit,
  addSecurityHeaders,
  logSecurityEvent,
  validateOrigin,
} from '@/lib/security';
import {
  userRegistrationSchema,
  sanitizeAndValidate,
  ValidationResult,
} from '@/lib/validation';

// Rate limiting: 5 registration attempts per hour
const registrationRateLimit = createRateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = registrationRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Validate origin
    if (!validateOrigin(request)) {
      logSecurityEvent(
        'INVALID_ORIGIN',
        { endpoint: '/api/auth/register', method: 'POST' },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      );
    }

    // Validate and sanitize input
    const validation: ValidationResult = sanitizeAndValidate(
      body,
      userRegistrationSchema
    );

    if (!validation.isValid) {
      logSecurityEvent(
        'REGISTRATION_VALIDATION_FAILED',
        {
          error: validation.error,
          email: body.email,
        },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Validation failed', details: validation.error },
          { status: 400 }
        )
      );
    }

    const { email, password, role } = validation.data as { email: string; password: string; role?: string };

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logSecurityEvent(
        'DUPLICATE_REGISTRATION_ATTEMPT',
        { email },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        )
      );
    }

    // Additional security: Check for suspicious email patterns
    const suspiciousEmailPatterns = [
      /temp.*mail/i,
      /10.*minute.*mail/i,
      /guerrilla.*mail/i,
      /mailinator/i,
      /yopmail/i,
    ];

    if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
      logSecurityEvent(
        'SUSPICIOUS_EMAIL_REGISTRATION',
        { email },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Email provider not allowed' },
          { status: 400 }
        )
      );
    }

    // Hash password with high cost
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user with secure defaults
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: role || 'user', // Default to user, not admin
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    logSecurityEvent(
      'USER_REGISTERED',
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Registration error:', error);
    logSecurityEvent(
      'REGISTRATION_ERROR',
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
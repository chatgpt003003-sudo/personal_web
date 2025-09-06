import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createRateLimit,
  addSecurityHeaders,
  logSecurityEvent,
  validateOrigin,
} from '@/lib/security';
import {
  projectCreateSchema,
  sanitizeAndValidate,
  ValidationResult,
} from '@/lib/validation';

// Rate limiting: 100 requests per 15 minutes for GET, 20 for POST
const getProjectsRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

const createProjectRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = getProjectsRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Validate origin
    if (!validateOrigin(request)) {
      logSecurityEvent(
        'INVALID_ORIGIN',
        { endpoint: '/api/projects', method: 'GET' },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
      );
    }

    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        videoUrl: true,
        metadata: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const response = NextResponse.json(projects);
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching projects:', error);
    logSecurityEvent(
      'DATABASE_ERROR',
      { endpoint: '/api/projects', method: 'GET', error: error instanceof Error ? error.message : 'Unknown error' },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = createProjectRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Validate origin
    if (!validateOrigin(request)) {
      logSecurityEvent(
        'INVALID_ORIGIN',
        { endpoint: '/api/projects', method: 'POST' },
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
      projectCreateSchema
    );

    if (!validation.isValid) {
      logSecurityEvent(
        'VALIDATION_FAILED',
        {
          endpoint: '/api/projects',
          method: 'POST',
          error: validation.error,
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

    const { title, description, imageUrl, videoUrl, metadata, published } =
      validation.data as { title: string; description?: string; imageUrl?: string; videoUrl?: string; metadata?: unknown; published?: boolean };

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        imageUrl: imageUrl || null,
        videoUrl: videoUrl || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        published: published || false,
      },
    });

    logSecurityEvent(
      'PROJECT_CREATED',
      {
        projectId: project.id,
        title: project.title,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(project, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating project:', error);
    logSecurityEvent(
      'DATABASE_ERROR',
      {
        endpoint: '/api/projects',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
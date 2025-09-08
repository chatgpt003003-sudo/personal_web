import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  createRateLimit,
  addSecurityHeaders,
  logSecurityEvent,
  validateOrigin,
} from '@/lib/security';
import {
  blogPostCreateSchema,
  sanitizeAndValidate,
  ValidationResult,
} from '@/lib/validation';

// Rate limiting for blog operations
const getBlogPostsRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

const createBlogPostRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = getBlogPostsRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Validate origin
    if (!validateOrigin(request)) {
      logSecurityEvent(
        'INVALID_ORIGIN',
        { endpoint: '/api/admin/blog', method: 'GET' },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const blogPosts = await prisma.blogPost.findMany({
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const response = NextResponse.json(blogPosts);
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    logSecurityEvent(
      'DATABASE_ERROR',
      {
        endpoint: '/api/admin/blog',
        method: 'GET',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = createBlogPostRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    // Validate origin
    if (!validateOrigin(request)) {
      logSecurityEvent(
        'INVALID_ORIGIN',
        { endpoint: '/api/admin/blog', method: 'POST' },
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      );
      return addSecurityHeaders(
        NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      );
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        )
      );
    }

    // Validate input
    const validation: ValidationResult = sanitizeAndValidate(
      body,
      blogPostCreateSchema
    );

    if (!validation.isValid) {
      logSecurityEvent(
        'VALIDATION_FAILED',
        {
          endpoint: '/api/admin/blog',
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

    const { title, slug, content, excerpt, tags, published, featuredImage } =
      validation.data as {
        title: string;
        slug?: string;
        content: string;
        excerpt?: string;
        tags?: string[];
        published?: boolean;
        featuredImage?: string;
      };

    // Generate slug if not provided
    const blogSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug: blogSlug },
    });

    if (existingPost) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'A blog post with this slug already exists' },
          { status: 400 }
        )
      );
    }

    // Create blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title,
        slug: blogSlug,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create tag if it doesn't exist
        const tag = await prisma.tag.upsert({
          where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          },
        });

        // Link tag to blog post
        await prisma.blogPostTag.create({
          data: {
            blogPostId: blogPost.id,
            tagId: tag.id,
          },
        });
      }
    }

    logSecurityEvent(
      'BLOG_POST_CREATED',
      {
        blogPostId: blogPost.id,
        title: blogPost.title,
        published: blogPost.published,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(blogPost, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating blog post:', error);
    logSecurityEvent(
      'DATABASE_ERROR',
      {
        endpoint: '/api/admin/blog',
        method: 'POST',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

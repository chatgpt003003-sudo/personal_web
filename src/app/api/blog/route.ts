import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createRateLimit, addSecurityHeaders } from '@/lib/security';

// Rate limiting for public blog access
const blogRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // More generous for public access
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = blogRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50); // Max 50 per page
    const category = url.searchParams.get('category');
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const whereClause: Record<string, unknown> = {
      published: true,
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      whereClause.categories = {
        some: {
          category: {
            slug: category,
          },
        },
      };
    }

    if (tag) {
      whereClause.tags = {
        some: {
          tag: {
            slug: tag,
          },
        },
      };
    }

    // Get total count for pagination
    const totalCount = await prisma.blogPost.count({ where: whereClause });

    // Fetch blog posts
    const blogPosts = await prisma.blogPost.findMany({
      where: whereClause,
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(totalCount / limit);

    const response = NextResponse.json({
      posts: blogPosts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

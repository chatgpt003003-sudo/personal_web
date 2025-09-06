import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createRateLimit,
  addSecurityHeaders,
} from '@/lib/security';

// Rate limiting for individual blog posts
const blogPostRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // More generous for individual posts
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Apply rate limiting
    const rateLimitResponse = blogPostRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const { slug } = await params;

    const blogPost = await prisma.blogPost.findUnique({
      where: { 
        slug,
        published: true, // Only show published posts
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
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
                description: true,
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
    });

    if (!blogPost) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      );
    }

    // Get related posts (same categories)
    const categoryIds = blogPost.categories.map(c => c.category.id);
    
    const relatedPosts = categoryIds.length > 0 ? await prisma.blogPost.findMany({
      where: {
        published: true,
        NOT: { id: blogPost.id },
        categories: {
          some: {
            categoryId: {
              in: categoryIds,
            },
          },
        },
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
      take: 3,
    }) : [];

    const response = NextResponse.json({
      post: blogPost,
      relatedPosts,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch blog post' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
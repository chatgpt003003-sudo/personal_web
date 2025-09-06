import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  addSecurityHeaders,
  logSecurityEvent,
} from '@/lib/security';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const { id } = await params;
    const blogPost = await prisma.blogPost.findUnique({
      where: { id },
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

    if (!blogPost) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Blog post not found' }, { status: 404 })
      );
    }

    const response = NextResponse.json(blogPost);
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { title, slug, content, excerpt, tags, published, featuredImage } = body;

    // Check if slug is unique (excluding current post)
    if (slug) {
      const existingPost = await prisma.blogPost.findFirst({
        where: { 
          slug,
          NOT: { id },
        },
      });

      if (existingPost) {
        return addSecurityHeaders(
          NextResponse.json(
            { error: 'A blog post with this slug already exists' },
            { status: 400 }
          )
        );
      }
    }

    // Update blog post
    const updatedBlogPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        featuredImage: featuredImage || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
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

    // Handle tags update
    if (tags) {
      // Remove existing tag relationships
      await prisma.blogPostTag.deleteMany({
        where: { blogPostId: id },
      });

      // Add new tags
      for (const tagName of tags) {
        const tag = await prisma.tag.upsert({
          where: { slug: tagName.toLowerCase().replace(/\s+/g, '-') },
          update: {},
          create: {
            name: tagName,
            slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          },
        });

        await prisma.blogPostTag.create({
          data: {
            blogPostId: id,
            tagId: tag.id,
          },
        });
      }
    }

    logSecurityEvent(
      'BLOG_POST_UPDATED',
      {
        blogPostId: id,
        title: updatedBlogPost.title,
        published: updatedBlogPost.published,
      },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(updatedBlogPost);
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error updating blog post:', error);
    const response = NextResponse.json(
      { error: 'Failed to update blog post' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const { id } = await params;

    await prisma.blogPost.delete({
      where: { id },
    });

    logSecurityEvent(
      'BLOG_POST_DELETED',
      { blogPostId: id },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json({ message: 'Blog post deleted successfully' });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error deleting blog post:', error);
    const response = NextResponse.json(
      { error: 'Failed to delete blog post' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
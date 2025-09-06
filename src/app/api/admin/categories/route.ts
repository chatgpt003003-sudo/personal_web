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
import Joi from 'joi';

// Category validation schema
const categorySchema = Joi.object({
  name: Joi.string().required().min(1).max(100).trim(),
  description: Joi.string().allow('').max(500).trim(),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/).allow('').messages({
    'string.pattern.base': 'Color must be a valid hex color (e.g., #ff0000)',
  }),
});

// Rate limiting
const categoriesRateLimit = createRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
});

export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = categoriesRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    const response = NextResponse.json(categories);
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    const response = NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = categoriesRateLimit(request);
    if (rateLimitResponse) return addSecurityHeaders(rateLimitResponse);

    const session = await getServerSession(authOptions);

    if (!session) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const body = await request.json();
    const { error, value } = categorySchema.validate(body);

    if (error) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'Validation failed', details: error.details[0].message },
          { status: 400 }
        )
      );
    }

    const { name, description, color } = value;
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim('-');

    // Check if category with this slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'A category with this name already exists' },
          { status: 400 }
        )
      );
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description: description || null,
        color: color || null,
      },
    });

    logSecurityEvent(
      'CATEGORY_CREATED',
      { categoryId: category.id, name: category.name },
      request.headers.get('x-forwarded-for') || '127.0.0.1'
    );

    const response = NextResponse.json(category, { status: 201 });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating category:', error);
    const response = NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}